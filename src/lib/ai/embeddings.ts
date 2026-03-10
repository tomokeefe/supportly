/**
 * Embedding generation using OpenAI's text-embedding-3-small model.
 * Returns 256-dimension vectors for efficient pgvector storage.
 * Falls back gracefully when OPENAI_API_KEY is not set.
 */

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 256;

export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
        model: EMBEDDING_MODEL,
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    });

    if (!res.ok) {
      console.error("Embedding API error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data.data?.[0]?.embedding ?? null;
  } catch (err) {
    console.error("Failed to generate embedding:", err);
    return null;
  }
}

export async function generateEmbeddings(
  texts: string[]
): Promise<(number[] | null)[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return texts.map(() => null);

  try {
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
      console.error("Embedding API error:", res.status, await res.text());
      return texts.map(() => null);
    }

    const data = await res.json();
    return data.data?.map(
      (d: { embedding: number[] }) => d.embedding
    ) ?? texts.map(() => null);
  } catch (err) {
    console.error("Failed to generate embeddings:", err);
    return texts.map(() => null);
  }
}
