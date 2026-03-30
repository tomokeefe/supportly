import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { knowledgeItems, organizations } = await import("../src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  if (!db) {
    console.log("No DATABASE_URL configured");
    process.exit(0);
  }

  const orgs = await db.select().from(organizations);
  console.log(`Organizations: ${orgs.length}`);
  for (const org of orgs) {
    const items = await db
      .select()
      .from(knowledgeItems)
      .where(eq(knowledgeItems.orgId, org.id));
    console.log(`\n  ${org.name} (${org.slug}): ${items.length} articles`);
    for (const item of items) {
      console.log(`    - ${item.title} [${item.category}]`);
    }
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
