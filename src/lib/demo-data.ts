import type { Organization, KnowledgeItem, Conversation, Message, DailyStat, OrgSettings } from "./db/schema";
import { v4 as uuidv4 } from "uuid";

// ── Demo Organization ────────────────────────────────────────────────
const ORG_ID = "00000000-0000-0000-0000-000000000001";

export const demoOrg: Organization = {
  id: ORG_ID,
  name: "Sunrise Property Management",
  slug: "sunrise-pm",
  settings: {
    confidenceThreshold: 0.75,
    persona: "friendly, professional property management assistant",
    greeting: "Hi! Welcome to Sunrise Property Management. How can I help you today?",
    escalationEmail: "support@sunrisepm.com",
    branding: { primaryColor: "#2563eb", position: "bottom-right" },
  },
  plan: "free",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  conversationLimit: 50,
  currentPeriodConversations: 0,
  currentPeriodStart: null,
  clerkUserId: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export function getOrgSettings(): OrgSettings {
  return demoOrg.settings as OrgSettings;
}

// ── Knowledge Base ───────────────────────────────────────────────────
export const demoKnowledge: KnowledgeItem[] = [
  {
    id: uuidv4(), orgId: ORG_ID,
    title: "Rent Payment Methods",
    content: "Tenants can pay rent through our online portal at pay.sunrisepm.com, by mailing a check to our office at 123 Main St, Suite 200, or via ACH bank transfer. Online payments are processed within 1-2 business days. We accept Visa, Mastercard, and ACH transfers. There is a $2.95 convenience fee for credit card payments. ACH transfers are free.",
    category: "payments", embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: uuidv4(), orgId: ORG_ID,
    title: "Late Rent Policy",
    content: "Rent is due on the 1st of each month. There is a 5-day grace period. After the 5th, a late fee of $50 is applied. If rent remains unpaid after 15 days, an additional $25 fee is added and a formal notice is sent. Please contact us immediately if you're experiencing financial difficulties — we may be able to arrange a payment plan.",
    category: "payments", embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: uuidv4(), orgId: ORG_ID,
    title: "Maintenance Request Process",
    content: "To submit a maintenance request, log into your tenant portal and click 'New Request', or call our maintenance line at (555) 123-4567. Emergency maintenance (flooding, no heat, gas leak) is available 24/7 at (555) 123-4568. Non-emergency requests are typically addressed within 2-3 business days. You'll receive email updates as your request progresses.",
    category: "maintenance", embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: uuidv4(), orgId: ORG_ID,
    title: "Emergency Maintenance",
    content: "For emergencies such as flooding, gas leaks, no heat in winter, or electrical hazards, call our 24/7 emergency line at (555) 123-4568. Do NOT submit these through the portal. If you smell gas, leave the building immediately and call 911 first, then call us. Emergency repairs are typically responded to within 1-2 hours.",
    category: "maintenance", embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: uuidv4(), orgId: ORG_ID,
    title: "Lease Renewal Process",
    content: "We send lease renewal offers 90 days before your lease expires. You'll receive an email with renewal terms and any rent adjustments. You have 30 days to accept, negotiate, or decline. If you choose not to renew, you must provide 60 days written notice before your lease end date. Early termination without notice may result in forfeiture of your security deposit.",
    category: "leasing", embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: uuidv4(), orgId: ORG_ID,
    title: "Pet Policy",
    content: "We allow up to 2 pets per unit (cats and dogs only, breed restrictions apply). There is a one-time pet deposit of $300 per pet and monthly pet rent of $35 per pet. Aggressive breeds including Pit Bulls, Rottweilers, and Dobermans are not permitted. All pets must be registered through the tenant portal with vaccination records.",
    category: "policies", embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: uuidv4(), orgId: ORG_ID,
    title: "Parking Information",
    content: "Each unit includes one assigned parking spot. Additional spots are available for $75/month, subject to availability. Visitor parking is available in designated areas for up to 48 hours. Vehicles without valid permits in reserved spots will be towed at the owner's expense. Contact the office to request additional parking.",
    category: "amenities", embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: uuidv4(), orgId: ORG_ID,
    title: "Move-Out Procedures",
    content: "Provide 60 days written notice before your lease end date. Schedule a pre-move-out inspection with us to identify any issues. On move-out day, return all keys and garage remotes to the office. Your security deposit (minus any deductions for damages beyond normal wear) will be returned within 30 days. A professional cleaning is recommended to avoid cleaning charges.",
    category: "leasing", embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: uuidv4(), orgId: ORG_ID,
    title: "Guest and Noise Policy",
    content: "Quiet hours are 10 PM to 8 AM daily. Guests may stay for up to 14 consecutive days; longer stays must be approved by management. Repeated noise complaints may result in lease violations. Please be considerate of your neighbors and keep common areas clean after gatherings.",
    category: "policies", embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: uuidv4(), orgId: ORG_ID,
    title: "Office Hours and Contact",
    content: "Our leasing office is open Monday through Friday, 9 AM to 5 PM, and Saturday 10 AM to 2 PM. We are closed on Sundays and major holidays. Phone: (555) 123-4567. Email: info@sunrisepm.com. Address: 123 Main St, Suite 200. For after-hours emergencies only, call (555) 123-4568.",
    category: "general", embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: uuidv4(), orgId: ORG_ID,
    title: "Application Process",
    content: "To apply for an apartment, complete the application on our website and pay the $45 non-refundable application fee. We run credit checks, background checks, and verify employment and rental history. Applicants need a credit score of 620+ and income of at least 3x the monthly rent. Applications are typically processed within 2-3 business days.",
    category: "leasing", embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: uuidv4(), orgId: ORG_ID,
    title: "Amenities",
    content: "Our property features a fitness center (open 5 AM - 11 PM), a resort-style pool (open Memorial Day through Labor Day, 8 AM - 10 PM), a business center with free WiFi and printers, a dog park, package lockers, and on-site laundry facilities in buildings without in-unit washers. The community room can be reserved for private events at $50/4 hours.",
    category: "amenities", embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date(),
  },
];

// ── Sample Conversations ─────────────────────────────────────────────
const CONV_1 = "00000000-0000-0000-0000-000000000010";
const CONV_2 = "00000000-0000-0000-0000-000000000020";
const CONV_3 = "00000000-0000-0000-0000-000000000030";
const CONV_4 = "00000000-0000-0000-0000-000000000040";
const CONV_5 = "00000000-0000-0000-0000-000000000050";

export const demoConversations: Conversation[] = [
  {
    id: CONV_1, orgId: ORG_ID, status: "resolved", channel: "chat",
    customerName: "Sarah Johnson", customerEmail: "sarah.j@email.com",
    metadata: {}, createdAt: new Date("2024-03-08T14:30:00"), updatedAt: new Date("2024-03-08T14:35:00"),
  },
  {
    id: CONV_2, orgId: ORG_ID, status: "resolved", channel: "chat",
    customerName: "Mike Chen", customerEmail: "mike.c@email.com",
    metadata: {}, createdAt: new Date("2024-03-08T10:15:00"), updatedAt: new Date("2024-03-08T10:22:00"),
  },
  {
    id: CONV_3, orgId: ORG_ID, status: "escalated", channel: "chat",
    customerName: "Emily Rodriguez", customerEmail: "emily.r@email.com",
    metadata: {}, createdAt: new Date("2024-03-07T16:45:00"), updatedAt: new Date("2024-03-07T16:52:00"),
  },
  {
    id: CONV_4, orgId: ORG_ID, status: "active", channel: "chat",
    customerName: "David Kim", customerEmail: null,
    metadata: {}, createdAt: new Date("2024-03-09T09:00:00"), updatedAt: new Date("2024-03-09T09:05:00"),
  },
  {
    id: CONV_5, orgId: ORG_ID, status: "resolved", channel: "email",
    customerName: "Lisa Park", customerEmail: "lisa.p@email.com",
    metadata: {}, createdAt: new Date("2024-03-06T11:30:00"), updatedAt: new Date("2024-03-06T11:45:00"),
  },
];

export const demoMessages: Message[] = [
  // Conversation 1: Rent payment question
  { id: uuidv4(), conversationId: CONV_1, role: "assistant", content: "Hi! Welcome to Sunrise Property Management. How can I help you today?", confidence: null, metadata: {}, createdAt: new Date("2024-03-08T14:30:00") },
  { id: uuidv4(), conversationId: CONV_1, role: "user", content: "How can I pay my rent online?", confidence: null, metadata: {}, createdAt: new Date("2024-03-08T14:30:30") },
  { id: uuidv4(), conversationId: CONV_1, role: "assistant", content: "You can pay your rent through our online portal at pay.sunrisepm.com. We accept Visa, Mastercard, and ACH bank transfers. Online payments are processed within 1-2 business days. There's a $2.95 convenience fee for credit card payments, but ACH transfers are free!", confidence: 0.95, metadata: {}, createdAt: new Date("2024-03-08T14:31:00") },
  { id: uuidv4(), conversationId: CONV_1, role: "user", content: "Great, thanks!", confidence: null, metadata: {}, createdAt: new Date("2024-03-08T14:31:30") },
  { id: uuidv4(), conversationId: CONV_1, role: "assistant", content: "You're welcome! Is there anything else I can help you with?", confidence: 0.97, metadata: {}, createdAt: new Date("2024-03-08T14:32:00") },

  // Conversation 2: Maintenance request
  { id: uuidv4(), conversationId: CONV_2, role: "assistant", content: "Hi! Welcome to Sunrise Property Management. How can I help you today?", confidence: null, metadata: {}, createdAt: new Date("2024-03-08T10:15:00") },
  { id: uuidv4(), conversationId: CONV_2, role: "user", content: "My kitchen faucet is leaking pretty badly", confidence: null, metadata: {}, createdAt: new Date("2024-03-08T10:15:30") },
  { id: uuidv4(), conversationId: CONV_2, role: "assistant", content: "I'm sorry to hear about the leaking faucet! To get this fixed, you can submit a maintenance request by logging into your tenant portal and clicking 'New Request', or call our maintenance line at (555) 123-4567. Non-emergency requests like this are typically addressed within 2-3 business days. You'll receive email updates as your request progresses. Would you like help with anything else?", confidence: 0.92, metadata: {}, createdAt: new Date("2024-03-08T10:16:00") },

  // Conversation 3: Escalated — complex question
  { id: uuidv4(), conversationId: CONV_3, role: "assistant", content: "Hi! Welcome to Sunrise Property Management. How can I help you today?", confidence: null, metadata: {}, createdAt: new Date("2024-03-07T16:45:00") },
  { id: uuidv4(), conversationId: CONV_3, role: "user", content: "I want to break my lease early because I got a job in another state. What are my options?", confidence: null, metadata: {}, createdAt: new Date("2024-03-07T16:45:30") },
  { id: uuidv4(), conversationId: CONV_3, role: "assistant", content: "I understand you need to relocate for a new job — congratulations on the new position! Based on our policies, if you choose not to renew or need to end your lease early, 60 days written notice is required. However, early termination specifics and any associated fees can vary by lease agreement. I want to make sure you get the most accurate information for your situation. Let me connect you with one of our leasing specialists who can review your specific lease terms and discuss your options.", confidence: 0.55, metadata: {}, createdAt: new Date("2024-03-07T16:46:00") },
  { id: uuidv4(), conversationId: CONV_3, role: "system", content: "Conversation escalated to human agent due to low confidence (0.55).", confidence: null, metadata: {}, createdAt: new Date("2024-03-07T16:46:01") },

  // Conversation 4: Active — pet question
  { id: uuidv4(), conversationId: CONV_4, role: "assistant", content: "Hi! Welcome to Sunrise Property Management. How can I help you today?", confidence: null, metadata: {}, createdAt: new Date("2024-03-09T09:00:00") },
  { id: uuidv4(), conversationId: CONV_4, role: "user", content: "I'm thinking about getting a dog. What's your pet policy?", confidence: null, metadata: {}, createdAt: new Date("2024-03-09T09:00:30") },
  { id: uuidv4(), conversationId: CONV_4, role: "assistant", content: "Great question! We do allow pets. Here are the key details:\n\n• Up to 2 pets per unit (cats and dogs only)\n• One-time pet deposit: $300 per pet\n• Monthly pet rent: $35 per pet\n• Breed restrictions apply — aggressive breeds including Pit Bulls, Rottweilers, and Dobermans are not permitted\n• All pets must be registered through the tenant portal with up-to-date vaccination records\n\nWould you like to know anything else about our pet policy?", confidence: 0.94, metadata: {}, createdAt: new Date("2024-03-09T09:01:00") },

  // Conversation 5: Email — amenities
  { id: uuidv4(), conversationId: CONV_5, role: "user", content: "Can you tell me about the amenities available at the property?", confidence: null, metadata: {}, createdAt: new Date("2024-03-06T11:30:00") },
  { id: uuidv4(), conversationId: CONV_5, role: "assistant", content: "Absolutely! Here's what we offer:\n\n• Fitness center (5 AM - 11 PM)\n• Resort-style pool (Memorial Day through Labor Day, 8 AM - 10 PM)\n• Business center with free WiFi and printers\n• Dog park\n• Package lockers\n• On-site laundry facilities\n• Community room available for private events ($50/4 hours)\n\nIs there a specific amenity you'd like more details about?", confidence: 0.96, metadata: {}, createdAt: new Date("2024-03-06T11:31:00") },
];

// ── Daily Stats (last 30 days) ───────────────────────────────────────
export const demoDailyStats: DailyStat[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const conversationsCount = Math.floor(Math.random() * 30) + 10;
  const resolvedCount = Math.floor(conversationsCount * (0.65 + Math.random() * 0.2));
  const escalatedCount = Math.floor((conversationsCount - resolvedCount) * (0.4 + Math.random() * 0.3));
  return {
    id: uuidv4(),
    orgId: ORG_ID,
    date: date.toISOString().split("T")[0],
    conversationsCount,
    resolvedCount,
    escalatedCount,
    avgConfidence: parseFloat((0.75 + Math.random() * 0.2).toFixed(2)),
  };
});

// ── Lookup Helpers ───────────────────────────────────────────────────
export function getConversation(id: string) {
  return demoConversations.find((c) => c.id === id) ?? null;
}

export function getMessagesForConversation(conversationId: string) {
  return demoMessages.filter((m) => m.conversationId === conversationId);
}
