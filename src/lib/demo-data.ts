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
  affiliateCode: null,
  agencyId: null,
  status: "active",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export function getOrgSettings(): OrgSettings {
  return demoOrg.settings as OrgSettings;
}

// ── Knowledge Base ───────────────────────────────────────────────────
// 30+ articles covering the full range of tenant questions to make
// the demo feel like a real, production-grade support agent.

function kb(title: string, content: string, category: string): KnowledgeItem {
  return { id: uuidv4(), orgId: ORG_ID, title, content, category, embedding: null, metadata: {}, createdAt: new Date(), updatedAt: new Date() };
}

export const demoKnowledge: KnowledgeItem[] = [
  // ── Payments ──────────────────────────────────────────────────────
  kb("Rent Payment Methods",
    "Tenants can pay rent through our online portal at pay.sunrisepm.com, by mailing a check to our office at 123 Main St, Suite 200, or via ACH bank transfer. Online payments are processed within 1-2 business days. We accept Visa, Mastercard, and ACH transfers. There is a $2.95 convenience fee for credit card payments. ACH transfers are free. We do not accept cash payments at the office. For recurring payments, you can set up autopay through the tenant portal under Settings > Autopay.",
    "payments"),

  kb("Late Rent Policy",
    "Rent is due on the 1st of each month. There is a 5-day grace period. After the 5th, a late fee of $50 is applied. If rent remains unpaid after 15 days, an additional $25 fee is added and a formal notice is sent. If rent is 30+ days past due, we begin the formal collections process. Please contact us immediately if you're experiencing financial difficulties — we may be able to arrange a payment plan. Payment plans must be requested before the 15th of the month and are approved on a case-by-case basis.",
    "payments"),

  kb("Security Deposit Information",
    "The security deposit is equal to one month's rent and is due at lease signing along with the first month's rent. The deposit is held in a separate escrow account as required by state law. Upon move-out, the deposit (minus any deductions for damages beyond normal wear and tear) is returned within 30 days. You will receive an itemized statement of any deductions. Common deductions include: excessive wall damage ($25-$75 per hole), carpet stains requiring professional cleaning ($150-$300), broken blinds ($40 per blind), and unreturned keys ($50 per key).",
    "payments"),

  kb("Rent Increase Policy",
    "Rent adjustments are made annually at lease renewal. We provide 90 days' notice of any rent changes. Typical increases are 2-5% based on market conditions. If you believe your increase is above market rate, you can request a review by emailing leasing@sunrisepm.com with comparable listings. We are committed to keeping rents fair while maintaining the quality of our properties.",
    "payments"),

  // ── Maintenance ───────────────────────────────────────────────────
  kb("Maintenance Request Process",
    "To submit a maintenance request, log into your tenant portal and click 'New Request', or call our maintenance line at (555) 123-4567. You can also text your request to (555) 123-4569. Non-emergency requests are typically addressed within 2-3 business days. You'll receive email and text updates as your request progresses through the stages: Submitted, Scheduled, In Progress, and Completed. Please provide as much detail as possible, including photos if applicable, to help our team prepare.",
    "maintenance"),

  kb("Emergency Maintenance",
    "For emergencies such as flooding, gas leaks, no heat in winter (below 55°F), electrical hazards, sewage backups, or a break-in that compromises your door/window locks, call our 24/7 emergency line at (555) 123-4568. Do NOT submit these through the portal — call immediately. If you smell gas, leave the building immediately and call 911 first, then call us. Emergency repairs are typically responded to within 1-2 hours. Our on-call maintenance team is available 365 days a year.",
    "maintenance"),

  kb("Common Maintenance Issues and Tips",
    "Before submitting a request, try these quick fixes: Garbage disposal jammed? Turn it off, press the red reset button on the bottom of the unit, then try again. Toilet running? Jiggle the handle or check if the flapper inside the tank is seated properly. AC not cooling? Check that the thermostat is set to 'cool' (not 'auto' or 'fan'), and make sure air filters are clean — we provide free filters at the office. Circuit breaker tripped? Check your breaker panel (usually in a closet or utility area) and flip the tripped breaker fully off, then back on. If these don't resolve the issue, submit a maintenance request and we'll take care of it.",
    "maintenance"),

  kb("HVAC and Air Filter Policy",
    "Air filters should be replaced every 60-90 days. We provide free standard filters at the leasing office — just stop by during office hours. Using the wrong filter size or neglecting to change filters can cause HVAC damage, which may result in charges to the tenant. If your heating or cooling system isn't working after checking the thermostat and filter, submit a maintenance request. Annual HVAC inspections are conducted every spring at no cost to tenants — we'll notify you 48 hours in advance.",
    "maintenance"),

  kb("Pest Control",
    "We provide quarterly preventive pest control treatment for all units at no charge. Treatments are scheduled in advance and you'll receive a 48-hour notice. If you're experiencing a pest issue between treatments, submit a maintenance request and we'll schedule an additional treatment within 3-5 business days. To help prevent pests: keep food sealed, take out trash regularly, don't leave pet food out overnight, and report any cracks or gaps around windows/doors. Bed bug treatments require a separate protocol — contact the office immediately if suspected.",
    "maintenance"),

  // ── Leasing ───────────────────────────────────────────────────────
  kb("Lease Renewal Process",
    "We send lease renewal offers 90 days before your lease expires via email and postal mail. You'll receive renewal terms and any rent adjustments. You have 30 days to accept, negotiate, or decline. To renew, sign the new lease through the tenant portal or visit the office. If you choose not to renew, you must provide 60 days written notice before your lease end date. If you go month-to-month after your lease expires, rent increases by 10% and either party can terminate with 30 days notice.",
    "leasing"),

  kb("Application Process",
    "To apply for an apartment, complete the application on our website at sunrisepm.com/apply and pay the $45 non-refundable application fee. We run credit checks, background checks, and verify employment and rental history. Applicants need a credit score of 620+ and verifiable income of at least 3x the monthly rent. Co-signers are accepted if you don't meet income requirements (co-signer must have 700+ credit score and 5x income). Applications are processed within 2-3 business days. You'll receive an email notification of approval or denial.",
    "leasing"),

  kb("Move-In Checklist",
    "Before moving in: 1) Sign your lease and pay the security deposit + first month's rent. 2) Set up utilities (electric, gas, internet) in your name — we'll provide the account transfer forms. 3) Schedule your move-in date with the office (elevator reservations required for buildings with elevators). 4) Pick up your keys, mailbox key, parking pass, and access fobs from the office during business hours. 5) Complete a move-in condition report within 48 hours — document any existing damage with photos and submit through the portal. This protects your security deposit at move-out.",
    "leasing"),

  kb("Move-Out Procedures",
    "Provide 60 days written notice before your lease end date via email to leasing@sunrisepm.com or in writing at the office. Schedule a pre-move-out inspection with us at least 2 weeks before your move-out date — this lets you fix issues before final inspection and avoid charges. On move-out day: return all keys, mailbox keys, fobs, and garage remotes to the office. Remove all personal belongings and trash. Your security deposit (minus any deductions for damages beyond normal wear) will be returned within 30 days to your forwarding address. Professional cleaning is strongly recommended to avoid a $200-$350 cleaning charge.",
    "leasing"),

  kb("Subletting and Roommate Changes",
    "Subletting is not permitted without prior written approval from management. To request subletting, submit a written request at least 30 days in advance. The subtenant must pass our standard application process. For roommate changes: the departing roommate must sign a lease release form, and the new roommate must submit a full application ($45 fee) and be approved. Both the departing and new roommate must come to the office together to complete paperwork. There is a $150 lease modification fee for roommate changes.",
    "leasing"),

  kb("Early Lease Termination",
    "If you need to break your lease early, contact us as soon as possible. Early termination options: 1) Pay an early termination fee equal to 2 months' rent and provide 30 days notice. 2) Find a qualified replacement tenant who passes our application process — in this case, there is only a $250 lease transfer fee. 3) For military deployment, domestic violence, or certain medical situations, early termination may be available without penalty under state law. Contact the office to discuss your specific situation. We try to work with tenants to find the best solution.",
    "leasing"),

  // ── Policies ──────────────────────────────────────────────────────
  kb("Pet Policy",
    "We allow up to 2 pets per unit (cats and dogs only, under 75 lbs each). There is a one-time pet deposit of $300 per pet and monthly pet rent of $35 per pet. Breed restrictions apply — the following breeds are not permitted: Pit Bulls, Rottweilers, Dobermans, German Shepherds, Chow Chows, Akitas, and wolf hybrids. All pets must be registered through the tenant portal with current vaccination records and a photo. Pets must be leashed in all common areas. Excessive barking or aggressive behavior may result in a requirement to remove the pet. Service animals and emotional support animals with proper documentation are exempt from breed restrictions and pet fees.",
    "policies"),

  kb("Guest and Noise Policy",
    "Quiet hours are 10 PM to 8 AM daily. During quiet hours, noise should not be audible outside your unit. Guests may stay for up to 14 consecutive days; longer stays require written approval from management and may require the guest to be added to your lease. If a guest stays more than 14 days in any 30-day period without approval, it's considered an unauthorized occupant and a lease violation. Repeated noise complaints (3 or more documented incidents) may result in a formal lease violation notice. Please be considerate of your neighbors and keep common areas clean after gatherings.",
    "policies"),

  kb("Smoking Policy",
    "All Sunrise Properties are 100% smoke-free, including inside units, on balconies and patios, and within 25 feet of any building entrance. This applies to cigarettes, cigars, pipes, e-cigarettes, and vaping devices. Violations result in a $250 cleaning/remediation fee per incident. Designated smoking areas are available in marked outdoor zones in the parking areas. Marijuana smoking is prohibited regardless of state legality due to federal housing regulations.",
    "policies"),

  kb("Renter's Insurance Requirement",
    "All tenants are required to maintain renter's insurance with a minimum of $100,000 in liability coverage for the duration of their lease. You must add Sunrise Property Management as an 'interested party' (not additional insured) on your policy. Proof of insurance is required at lease signing and must be kept current. If your policy lapses, we will place you on our master policy at a cost of $45/month, which covers liability only (not your personal belongings). We strongly recommend at least $30,000 in personal property coverage. Average renter's insurance costs $15-$25/month.",
    "policies"),

  kb("Package Delivery Policy",
    "We have Amazon Hub package lockers in the mail room of each building. When a package is delivered to a locker, you'll receive a code via email/text. Packages must be picked up within 3 business days. Oversized packages that don't fit in lockers will be held at the leasing office during business hours for up to 7 days. We are not responsible for packages left at your door. For valuable deliveries, we recommend requiring a signature or using the package lockers. FedEx, UPS, USPS, and Amazon all deliver to our lockers.",
    "policies"),

  // ── Amenities ─────────────────────────────────────────────────────
  kb("Fitness Center",
    "Our fitness center is open 5 AM to 11 PM daily, accessible with your key fob. Equipment includes: treadmills (6), ellipticals (4), stationary bikes (3), a full set of free weights (5-75 lbs), Smith machine, cable crossover machine, lat pulldown, leg press, and a stretching area with yoga mats and resistance bands. The gym is cleaned daily and equipment is sanitized. Please wipe down equipment after use. Personal trainers are not permitted to conduct sessions in the fitness center. Report any broken equipment through the maintenance portal.",
    "amenities"),

  kb("Pool and Outdoor Areas",
    "The resort-style pool is open Memorial Day through Labor Day, 8 AM to 10 PM daily. Pool rules: no glass containers, no diving, children under 12 must be accompanied by an adult, no pets in the pool area. Poolside grills are available first-come, first-served — please clean the grill after use. Pool furniture should not be reserved with towels/belongings. The pool area can be reserved for private parties (up to 20 guests) for $100/2 hours — book through the office at least 2 weeks in advance.",
    "amenities"),

  kb("Parking Information",
    "Each unit includes one assigned parking spot (spot number matches your unit). Additional spots are available for $75/month, subject to availability — join the waitlist at the office. Visitor parking is available in designated areas (marked with 'V') for up to 48 hours. Visitor permits are not required but vehicles must be in marked visitor spots. Vehicles without valid resident stickers in reserved spots will be towed at the owner's expense by City Towing at (555) 999-8888. Motorcycle parking is available near building entrances. Covered/garage parking is available for $125/month where available.",
    "amenities"),

  kb("Laundry Facilities",
    "Buildings A, B, and C have in-unit washer/dryer hookups. Buildings D, E, and F have shared laundry rooms on the ground floor with card-operated machines (same card as your key fob — add funds at the kiosk in the mail room). Washer: $1.75 per load. Dryer: $1.50 per load. Laundry rooms are open 7 AM to 10 PM. Please remove clothes promptly — items left in machines for more than 1 hour may be moved to the folding table. Report machine issues through the maintenance portal.",
    "amenities"),

  kb("Community Room and Business Center",
    "The community room (Building A, ground floor) seats up to 40 people and includes tables, chairs, a kitchenette with refrigerator and microwave, and a TV with HDMI hookup. Reservation: $50 for 4 hours, book through the office. A $200 refundable deposit is required for events with 20+ guests. The business center (Building A, 2nd floor) has free WiFi, two desktop computers, a printer/scanner (20 free pages/month, then $0.10/page), and a conference table for 6. Open 24/7 with key fob access.",
    "amenities"),

  kb("Dog Park",
    "Our fenced dog park is located between Buildings C and D. It features separate areas for large dogs (over 30 lbs) and small dogs (under 30 lbs), water fountains for dogs and humans, waste bag stations, and benches. Open dawn to dusk. Rules: dogs must be registered with the office, aggressive dogs must leave immediately, owners must clean up after their pets, and no more than 2 dogs per person at a time. The dog park is closed for maintenance on the first Monday of each month.",
    "amenities"),

  // ── General / Contact ─────────────────────────────────────────────
  kb("Office Hours and Contact Information",
    "Leasing office hours: Monday-Friday 9 AM to 5 PM, Saturday 10 AM to 2 PM. Closed Sundays and major holidays (New Year's Day, Memorial Day, July 4th, Labor Day, Thanksgiving, Christmas). Phone: (555) 123-4567. Email: info@sunrisepm.com. Text: (555) 123-4569. Address: 123 Main St, Suite 200. For after-hours emergencies only, call (555) 123-4568. Our website is sunrisepm.com and the tenant portal is portal.sunrisepm.com.",
    "general"),

  kb("Mail and Shipping",
    "Each unit has a locking mailbox in the mail room on the ground floor of your building. Your mailbox key is provided at move-in. If you lose your mailbox key, contact the office for a replacement ($25 fee). Our mailing address format is: Your Name, 123 Main St, Apt [your unit number], Anytown, ST 12345. For USPS mail forwarding after move-out, visit usps.com/forward. Large packages go to the Amazon Hub lockers or the office (see Package Delivery Policy).",
    "general"),

  kb("Internet and Cable Setup",
    "Sunrise Properties is pre-wired for Xfinity/Comcast and AT&T Fiber. To set up service, contact the provider directly: Xfinity (1-800-934-6489) or AT&T (1-800-288-2020). Most units can get speeds up to 1 Gbps. Satellite dishes are permitted on balconies only with a non-penetrating mount — no drilling into building surfaces. The business center and pool area have free WiFi (network: SunriseGuest, no password required). We do not provide internet service as part of rent.",
    "general"),

  kb("Lockout Policy",
    "If you're locked out during office hours (Mon-Fri 9-5, Sat 10-2), visit the office with a photo ID and we'll let you in at no charge. After-hours lockouts: call our emergency line at (555) 123-4568. A locksmith will be dispatched — the first after-hours lockout per year is free. Subsequent after-hours lockouts incur a $75 fee. We recommend giving a spare key to a trusted friend or neighbor. If you need your locks changed (for any reason, including safety concerns), submit a maintenance request and we'll re-key within 24 hours ($50 fee, waived for safety concerns).",
    "general"),

  kb("Trash and Recycling",
    "Trash dumpsters are located in the parking area behind each building. Recycling bins (blue) are next to the trash dumpsters. Pickup is Tuesday and Friday. Please break down cardboard boxes before recycling. Do NOT leave trash outside dumpsters — this attracts pests and may result in a $50 fine. Large item disposal (furniture, appliances): schedule a bulk pickup through the office at least 1 week in advance ($25 fee). Do not leave large items near dumpsters. Hazardous waste (paint, batteries, chemicals) must be taken to the county hazardous waste facility.",
    "general"),

  kb("Accessibility and ADA Accommodations",
    "We are committed to fair housing and accessibility. Accessible units are available on the ground floor of each building with wider doorways, roll-in showers, and lowered countertops. If you need a reasonable accommodation or modification to your unit (grab bars, ramp, visual doorbell, etc.), submit a written request to the office. We will work with you to accommodate your needs in compliance with the Fair Housing Act and ADA. Requests are typically processed within 5-10 business days. Service animals and emotional support animals are welcome with proper documentation — contact the office for details.",
    "general"),

  kb("Severe Weather and Emergency Procedures",
    "In case of severe weather: Tornado warning — move to the lowest interior room away from windows (stairwells and interior bathrooms are safest). We will send text alerts to all registered tenants. Fire — pull the nearest fire alarm, evacuate immediately via stairwells (not elevators), and meet at the designated assembly area in the west parking lot. Power outage — report to the office or after-hours line. We have emergency lighting in all hallways and stairwells. The property has a backup generator for common area systems. Keep a flashlight and basic emergency supplies in your unit.",
    "general"),
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
