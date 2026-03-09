# CLAUDE.md — Project Context for Claude Code

## What is this?
Supportly is an AI-powered customer support agent for SMBs. It's a SaaS product where businesses install a chat widget on their website, and an AI agent (powered by Claude) handles customer conversations using the business's knowledge base.

## Business Context
- Based on failed YC startups Parabolic (W23) and Argovox (S22) that died because LLMs weren't production-ready
- Target market: SMBs that miss 62% of calls and pay $6/interaction for human support
- Our AI handles 70%+ of conversations at $0.05/conversation
- Revenue model: $299-$1,999/mo SaaS tiers

## Architecture
- **Next.js 15** (App Router) — full-stack framework
- **Claude API** (Sonnet) — AI engine for generating responses
- **PostgreSQL + Drizzle ORM** — database with type-safe queries
- **Supabase pgvector** — vector search for knowledge base RAG
- **Embeddable widget** (public/widget.js) — vanilla JS, zero dependencies

## Key Design Decisions
1. **Confidence scoring**: Every AI response includes a 0-1 confidence score. Below the org's threshold (default 0.75), conversations auto-escalate to humans.
2. **Multi-tenant**: Each SMB client is an "organization" with their own knowledge base, agent persona, and branding.
3. **Channel-agnostic**: The AI engine (`src/lib/ai/agent.ts`) is decoupled from channels. Same agent handles chat, email, SMS, and voice.
4. **RAG-first**: Never hallucinate. The agent only uses information from the org's knowledge base. If it doesn't know, it escalates.

## Common Tasks
- **Add a new API route**: Create in `src/app/api/[route]/route.ts`
- **Modify the AI agent**: Edit `src/lib/ai/agent.ts`
- **Change the database schema**: Edit `src/lib/db/schema.ts`, then run `npm run db:push`
- **Add knowledge base entries**: Use `npm run ingest -- --org=slug --file=./data.json`
- **Test the widget**: Go to http://localhost:3000/demo

## Code Style
- TypeScript strict mode
- Prefer server components, use "use client" only when needed
- Use Drizzle ORM for all database queries (no raw SQL)
- Use Zod for input validation on API routes
- Keep AI prompts in agent.ts, not scattered across files

## Current State
The project has the core foundation:
- Database schema (organizations, knowledge_items, conversations, messages, daily_stats)
- AI agent engine with RAG, confidence scoring, and escalation
- Chat API endpoint
- Embeddable chat widget
- Demo page and landing page
- Dashboard page (conversations list)
- Seed script with demo data (property management vertical)

## Next Priority Tasks
1. Set up Supabase and run db:push
2. Replace keyword RAG with pgvector semantic search
3. Add streaming to chat responses
4. Build out dashboard with recharts visualizations
5. Add auth (Clerk recommended)
6. Add Twilio SMS channel
