/**
 * Seed script for Resolvly demo data.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires DATABASE_URL to be set. In demo mode (no DB), the app uses
 * in-memory data from src/lib/demo-data.ts automatically.
 */

import { db } from "../src/lib/db";
import {
  organizations,
  knowledgeItems,
  conversations,
  messages,
  dailyStats,
} from "../src/lib/db/schema";
import {
  demoOrg,
  demoKnowledge,
  demoConversations,
  demoMessages,
  demoDailyStats,
} from "../src/lib/demo-data";

async function seed() {
  if (!db) {
    console.log("No DATABASE_URL set. The app will use in-memory demo data.");
    console.log("To seed a real database, set DATABASE_URL in .env and run again.");
    process.exit(0);
  }

  console.log("Seeding database...");

  // Clear existing data
  await db.delete(messages);
  await db.delete(dailyStats);
  await db.delete(conversations);
  await db.delete(knowledgeItems);
  await db.delete(organizations);

  // Insert demo org
  await db.insert(organizations).values(demoOrg);
  console.log("  Created organization: Sunrise Property Management");

  // Insert knowledge base
  await db.insert(knowledgeItems).values(demoKnowledge);
  console.log(`  Created ${demoKnowledge.length} knowledge base articles`);

  // Insert conversations
  await db.insert(conversations).values(demoConversations);
  console.log(`  Created ${demoConversations.length} conversations`);

  // Insert messages
  await db.insert(messages).values(demoMessages);
  console.log(`  Created ${demoMessages.length} messages`);

  // Insert daily stats
  await db.insert(dailyStats).values(demoDailyStats);
  console.log(`  Created ${demoDailyStats.length} daily stat records`);

  console.log("\nDone! Database seeded successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
