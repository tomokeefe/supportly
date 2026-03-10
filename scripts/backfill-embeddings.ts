/**
 * Backfill embeddings for existing knowledge items that don't have them.
 * Usage: npm run embeddings:backfill
 */
import "dotenv/config";
import { db } from "../src/lib/db";
import { knowledgeItems } from "../src/lib/db/schema";
import { isNull } from "drizzle-orm";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 256;
const BATCH_SIZE = 50;

async function generateEmbeddingsBatch(
  texts: string[]
): Promise<(number[] | null)[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is required for embedding generation");
    process.exit(1);
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: texts,
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`OpenAI API error: ${res.status} ${errText}`);
    return texts.map(() => null);
  }

  const data = await res.json();
  return data.data?.map(
    (d: { embedding: number[] }) => d.embedding
  ) ?? texts.map(() => null);
}

async function main() {
  if (!db) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  // Get all items without embeddings
  const items = await db
    .select()
    .from(knowledgeItems)
    .where(isNull(knowledgeItems.embedding));

  console.log(`Found ${items.length} items without embeddings`);

  if (items.length === 0) {
    console.log("Nothing to backfill.");
    process.exit(0);
  }

  // Process in batches
  let processed = 0;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const texts = batch.map((item) => `${item.title}\n${item.content}`);

    console.log(
      `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(items.length / BATCH_SIZE)}...`
    );

    const embeddings = await generateEmbeddingsBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const embedding = embeddings[j];
      if (embedding) {
        await db
          .update(knowledgeItems)
          .set({ embedding })
          .where(isNull(knowledgeItems.embedding));
        processed++;
      }
    }

    console.log(`  Processed ${processed}/${items.length}`);
  }

  console.log(`Done! Backfilled ${processed} embeddings.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
