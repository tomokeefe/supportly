import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { knowledgeItems, organizations } = await import("../src/lib/db/schema");
  const { demoKnowledge } = await import("../src/lib/demo-data");
  const { eq } = await import("drizzle-orm");

  if (!db) {
    console.log("No DATABASE_URL. Skipping.");
    process.exit(0);
  }

  // Find the Sunrise PM org
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, "sunrise-pm"),
  });

  if (!org) {
    console.log("Sunrise PM org not found in DB.");
    process.exit(1);
  }

  console.log(`Found org: ${org.name} (${org.id})`);

  // Delete existing knowledge items for this org
  const deleted = await db
    .delete(knowledgeItems)
    .where(eq(knowledgeItems.orgId, org.id));
  console.log("Deleted old knowledge items");

  // Insert expanded knowledge, remapping orgId to the real DB org
  const toInsert = demoKnowledge.map((item) => ({
    title: item.title,
    content: item.content,
    category: item.category,
    orgId: org.id,
    metadata: {},
  }));

  await db.insert(knowledgeItems).values(toInsert);
  console.log(`Inserted ${toInsert.length} knowledge items`);

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
