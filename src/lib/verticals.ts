// ── Types ────────────────────────────────────────────────────

export type VerticalStat = {
  value: string;
  label: string;
  highlight?: boolean;
};

export type VerticalUseCase = {
  question: string;
  context: string;
};

export type VerticalCapability = {
  title: string;
  description: string;
};

export type VerticalData = {
  slug: string;
  industry: string;

  // SEO
  metaTitle: string;
  metaDescription: string;

  // Hero
  headline: string; // Use {vermillion} to mark accent text
  subheadline: string;

  // Problem stats
  problemHeadline: string;
  problemDescription: string;
  stats: [VerticalStat, VerticalStat, VerticalStat, VerticalStat];

  // Use cases
  useCasesHeadline: string;
  useCases: VerticalUseCase[];

  // Capabilities
  capabilities: VerticalCapability[];

  // Final CTA
  ctaHeadline: string;
  ctaDescription: string;
};

// ── Data ─────────────────────────────────────────────────────

export const VERTICALS: Record<string, VerticalData> = {
  "property-management": {
    slug: "property-management",
    industry: "Property Management",
    metaTitle: "AI Customer Support for Property Management | Resolvly",
    metaDescription:
      "Automate tenant inquiries about rent, maintenance, and leases. Resolvly handles 70%+ of property management conversations at $0.05 each.",

    headline:
      "Tenants don't wait until office hours.\n{vermillion}Now their questions don't have to, either.",
    subheadline:
      "An AI support agent trained on your leases, policies, and maintenance procedures. It handles tenant questions around the clock so your team can focus on the properties, not the inbox.",

    problemHeadline:
      "Property managers drown in repetitive tenant questions.",
    problemDescription:
      "Rent payment instructions, maintenance requests, lease renewal timelines, pet policies. The same 20 questions, hundreds of times a month. Your team spends hours answering what a well-trained agent could handle instantly.",
    stats: [
      {
        value: "62%",
        label: "of calls to property management offices go unanswered",
      },
      {
        value: "40%",
        label: "of tenant inquiries come outside business hours",
        highlight: true,
      },
      {
        value: "$8.50",
        label: "average cost per tenant support interaction with a human",
      },
      {
        value: "24min",
        label: "average response time tenants wait for email replies",
      },
    ],

    useCasesHeadline: "The questions your tenants ask every single day.",
    useCases: [
      {
        question: "How do I pay my rent online?",
        context:
          "Payment method inquiries are the #1 repetitive question for property managers.",
      },
      {
        question:
          "My kitchen faucet is leaking — how do I submit a maintenance request?",
        context:
          "Maintenance intake can be automated with clear instructions and portal links.",
      },
      {
        question: "When does my lease expire and how do I renew?",
        context:
          "Lease renewal timelines are standard policy that AI handles with high confidence.",
      },
      {
        question: "What's the pet deposit and which breeds are allowed?",
        context:
          "Pet policy is among the top 5 questions from prospective and current tenants.",
      },
      {
        question: "Where do guests park and for how long?",
        context:
          "Parking rules are straightforward knowledge base content with clear answers.",
      },
    ],

    capabilities: [
      {
        title: "Maintenance triage",
        description:
          "Distinguish emergencies from routine requests. Route flooding and gas leaks to your emergency line instantly while queuing non-urgent items for your maintenance team.",
      },
      {
        title: "Lease policy on demand",
        description:
          "Rent due dates, grace periods, late fees, renewal terms, move-out procedures — all answered accurately from your uploaded lease documents.",
      },
      {
        title: "After-hours coverage",
        description:
          "40% of tenant inquiries come outside 9-to-5. Your AI agent answers immediately at 2am on a Saturday without overtime pay.",
      },
      {
        title: "Multi-property support",
        description:
          "Manage separate knowledge bases for each property. Tenants at Building A get Building A's policies, not Building B's.",
      },
    ],

    ctaHeadline: "Stop losing tenants to voicemail.",
    ctaDescription:
      "Your tenants are reaching out right now — about rent, maintenance, move-in dates. Give them an answer in seconds. Set up in 5 minutes, no engineering required.",
  },

  "law-firms": {
    slug: "law-firms",
    industry: "Legal / Law Firms",
    metaTitle: "AI Client Intake & Support for Law Firms | Resolvly",
    metaDescription:
      "Automate client intake, answer common legal service questions, and capture leads 24/7. Resolvly handles front-desk inquiries for law firms at a fraction of the cost.",

    headline:
      "Potential clients call once.\n{vermillion}If nobody answers, they call someone else.",
    subheadline:
      "An AI agent that handles intake questions, explains your practice areas, and captures lead information — even when your office is closed. Trained on your firm's actual services, not generic legal advice.",

    problemHeadline: "Law firms lose leads to unanswered phones.",
    problemDescription:
      "A potential client with a time-sensitive legal matter calls your firm at 6pm. Nobody picks up. They call the next firm on Google. That retainer walks out the door. It happens dozens of times a month.",
    stats: [
      {
        value: "67%",
        label:
          "of potential legal clients hire the first firm that responds",
      },
      {
        value: "35%",
        label: "of calls to law firms go to voicemail",
        highlight: true,
      },
      {
        value: "$4,200",
        label: "average value of a single new client retainer",
      },
      {
        value: "72hrs",
        label:
          "average time for a law firm to follow up on a web inquiry",
      },
    ],

    useCasesHeadline:
      "The questions potential clients ask before they hire you.",
    useCases: [
      {
        question: "Do you handle personal injury cases?",
        context:
          "Practice area matching is the most common intake question — and the easiest to automate.",
      },
      {
        question: "How much does a consultation cost?",
        context:
          "Fee transparency is the #1 factor in whether a lead converts to a consultation booking.",
      },
      {
        question:
          "I was in a car accident yesterday — what should I do first?",
        context:
          "Urgent inquiries need immediate response. After-hours AI prevents leads from going to competitors.",
      },
      {
        question:
          "What documents do I need to bring to my first meeting?",
        context:
          "Pre-appointment preparation questions reduce no-shows and wasted attorney time.",
      },
      {
        question: "How long does a divorce case typically take?",
        context:
          "Timeline expectations are standard across similar cases and easy to answer from your knowledge base.",
      },
    ],

    capabilities: [
      {
        title: "24/7 lead capture",
        description:
          "Potential clients searching for attorneys don't wait until Monday. Your AI agent captures their name, matter type, and contact details any time of day.",
      },
      {
        title: "Practice area routing",
        description:
          "Automatically identify whether the inquiry relates to family law, personal injury, estate planning, or another practice area and route accordingly.",
      },
      {
        title: "Intake pre-qualification",
        description:
          "Ask screening questions from your intake checklist before a prospect ever reaches an attorney. Filter out matters you don't handle.",
      },
      {
        title: "Confidentiality-first design",
        description:
          "The agent never gives legal advice. It explains your services, captures information, and escalates to your team. Your knowledge base controls exactly what it says.",
      },
    ],

    ctaHeadline: "Stop losing retainers to voicemail.",
    ctaDescription:
      "A potential client just searched for a lawyer in your practice area. They're on your website right now. Give them an answer before they click back to Google.",
  },

  healthcare: {
    slug: "healthcare",
    industry: "Healthcare / Dental",
    metaTitle:
      "AI Patient Support for Healthcare & Dental Practices | Resolvly",
    metaDescription:
      "Automate patient inquiries about appointments, insurance, and office policies. Resolvly handles 70%+ of healthcare front-desk questions at $0.05 each.",

    headline:
      "Your front desk is overwhelmed.\n{vermillion}Your patients just want a straight answer.",
    subheadline:
      "An AI agent that answers appointment, insurance, and office policy questions instantly — freeing your staff to focus on the patients in the waiting room.",

    problemHeadline:
      "Healthcare practices lose patients to hold music.",
    problemDescription:
      "Patients call to ask about appointment availability, insurance acceptance, or pre-visit instructions. They get put on hold. They hang up. They book with the practice down the street that picked up.",
    stats: [
      {
        value: "30%",
        label:
          "of patient calls are abandoned after being placed on hold",
      },
      {
        value: "53%",
        label:
          "of patients will switch providers over a poor service experience",
        highlight: true,
      },
      {
        value: "$650",
        label: "average lifetime value of a single dental patient",
      },
      {
        value: "8min",
        label:
          "average hold time at medical and dental front desks",
      },
    ],

    useCasesHeadline:
      "The questions that keep your front desk on the phone all day.",
    useCases: [
      {
        question: "Do you accept Delta Dental insurance?",
        context:
          "Insurance acceptance is the #1 question for new patients — answerable from a simple list.",
      },
      {
        question:
          "I need to reschedule my appointment — what's available next week?",
        context:
          "Scheduling inquiries are high-volume. AI can provide instructions and links to your booking system.",
      },
      {
        question: "What should I do before my first visit?",
        context:
          "New patient prep instructions are identical every time — forms, documents, arrival time.",
      },
      {
        question:
          "How much does a teeth cleaning cost without insurance?",
        context:
          "Self-pay pricing questions are increasingly common and easy to answer from your fee schedule.",
      },
      {
        question: "Are you open on Saturdays?",
        context:
          "Office hours questions are the simplest to automate and among the most frequently asked.",
      },
    ],

    capabilities: [
      {
        title: "Insurance verification guidance",
        description:
          "Answer which plans you accept, direct patients to pre-authorization steps, and explain out-of-network billing — without your staff repeating the same list 50 times a day.",
      },
      {
        title: "Appointment prep automation",
        description:
          "New patient paperwork, fasting instructions, what to bring, when to arrive. Every patient gets the same complete instructions, every time.",
      },
      {
        title: "After-hours patient support",
        description:
          "Patients with post-procedure questions at 9pm get immediate answers from your care instructions. True emergencies are directed to your on-call line or 911.",
      },
      {
        title: "HIPAA-conscious design",
        description:
          "The agent never accesses or stores patient health records. It answers policy questions from your knowledge base and escalates clinical inquiries to your team.",
      },
    ],

    ctaHeadline: "Stop losing patients to hold music.",
    ctaDescription:
      "A new patient is on your website right now, wondering if you accept their insurance. Give them an instant answer instead of a phone number and a prayer.",
  },

  restaurants: {
    slug: "restaurants",
    industry: "Restaurants / Cafes",
    metaTitle:
      "AI Customer Support for Restaurants & Cafes | Resolvly",
    metaDescription:
      "Automate reservation inquiries, menu questions, and hours/location info. Resolvly handles 70%+ of restaurant customer questions at $0.05 each.",

    headline:
      "Customers want to know if you're open.\n{vermillion}Not listen to your voicemail greeting.",
    subheadline:
      "An AI agent that answers questions about your menu, hours, reservations, and catering — so your staff can focus on the guests who are already there.",

    problemHeadline:
      "Restaurants lose covers to unanswered phones.",
    problemDescription:
      "A party of eight wants to book for Saturday. They call during the dinner rush. No one picks up. They book somewhere else. Your kitchen staff shouldn't have to be your call center too.",
    stats: [
      {
        value: "73%",
        label: "of diners check a restaurant's info online before visiting",
      },
      {
        value: "45%",
        label:
          "of restaurant calls go unanswered during peak hours",
        highlight: true,
      },
      {
        value: "$85",
        label: "average spend per party lost to an unanswered reservation call",
      },
      {
        value: "3x",
        label:
          "more likely customers are to try a competitor after no response",
      },
    ],

    useCasesHeadline: "The questions your guests ask before they walk in.",
    useCases: [
      {
        question: "Do you take reservations for Saturday night?",
        context:
          "Reservation questions are the highest-value inquiry — directly tied to revenue.",
      },
      {
        question: "Do you have gluten-free options?",
        context:
          "Allergen and dietary questions are critical for safety and easily answered from your menu.",
      },
      {
        question: "What time do you close on Sundays?",
        context:
          "Hours and location questions are the #1 reason customers call — and the simplest to automate.",
      },
      {
        question: "Do you offer catering for events?",
        context:
          "Catering inquiries are high-value leads that often get lost in the dinner rush.",
      },
      {
        question: "Is there parking nearby?",
        context:
          "Logistics questions affect whether guests choose your restaurant over an easier option.",
      },
    ],

    capabilities: [
      {
        title: "Menu & allergen info",
        description:
          "Gluten-free, vegan, nut-free — your AI agent answers dietary questions from your menu instantly. No staff member needs to pull up the binder.",
      },
      {
        title: "Reservation & hours on demand",
        description:
          "Hours, holiday schedules, reservation links, wait time estimates — the questions that fill your phone lines during service are answered automatically.",
      },
      {
        title: "Catering lead capture",
        description:
          "Corporate lunches, wedding receptions, birthday parties. Your agent captures event details and contact info so your catering manager can follow up.",
      },
      {
        title: "Multi-location support",
        description:
          "Different menus, hours, and policies per location. Customers always get the right answer for the right restaurant.",
      },
    ],

    ctaHeadline: "Stop losing tables to unanswered calls.",
    ctaDescription:
      "A party of six is deciding between you and the place next door. They just want to know if you have a patio. Answer the question. Win the table.",
  },

  ecommerce: {
    slug: "ecommerce",
    industry: "E-commerce",
    metaTitle: "AI Customer Support for E-commerce Stores | Resolvly",
    metaDescription:
      "Automate order tracking, return requests, and product questions. Resolvly handles 70%+ of e-commerce support conversations at $0.05 each.",

    headline:
      "Your customers have questions at 2am.\n{vermillion}Your support team clocks out at 5.",
    subheadline:
      "An AI agent that handles order inquiries, return policies, and product questions around the clock — trained on your catalog, not generic scripts.",

    problemHeadline:
      "E-commerce brands lose sales to slow support.",
    problemDescription:
      "A customer wants to know if that jacket runs true to size. They ask via chat. No reply for 4 hours. They buy from the competitor who answered in 30 seconds. Fast support isn't a nice-to-have — it's a conversion tool.",
    stats: [
      {
        value: "53%",
        label: "of online shoppers abandon purchases when they can't find answers",
      },
      {
        value: "79%",
        label:
          "of consumers expect a response within 24 hours",
        highlight: true,
      },
      {
        value: "$33",
        label: "average cost of a single support ticket handled by a human",
      },
      {
        value: "4.2x",
        label:
          "higher conversion rate when customers get real-time answers",
      },
    ],

    useCasesHeadline:
      "The questions standing between your customers and checkout.",
    useCases: [
      {
        question: "Where's my order? It was supposed to arrive yesterday.",
        context:
          "Order tracking is the #1 support question for e-commerce — and the most automatable.",
      },
      {
        question: "What's your return policy?",
        context:
          "Return policies are standard content that AI handles with near-perfect confidence.",
      },
      {
        question: "Does this come in a size medium?",
        context:
          "Product availability questions directly impact conversion — fast answers mean more sales.",
      },
      {
        question: "How long does shipping take to Canada?",
        context:
          "Shipping timeline questions are high-frequency and easily answered from your policies.",
      },
      {
        question: "Can I change the color on my order?",
        context:
          "Order modification requests can be triaged by AI and escalated to your fulfillment team.",
      },
    ],

    capabilities: [
      {
        title: "Order status on demand",
        description:
          "Customers ask where their package is more than anything else. Your agent answers instantly using your shipping policies and tracking instructions.",
      },
      {
        title: "Return & exchange automation",
        description:
          "Walk customers through your return process step by step. Provide RMA instructions, shipping labels, and timelines — no human needed.",
      },
      {
        title: "Product knowledge",
        description:
          "Sizing, materials, compatibility, stock status. Your agent knows your catalog and answers confidently. When it doesn't know, it escalates.",
      },
      {
        title: "Pre-sale conversion",
        description:
          "Answer product questions in real time before customers bounce. Shipping estimates, discount codes, bundle options — every question answered is a sale saved.",
      },
    ],

    ctaHeadline: "Stop losing sales to slow support.",
    ctaDescription:
      "A customer is about to close your tab and buy from someone else. They just have one question. Answer it instantly and keep the sale.",
  },

  "home-services": {
    slug: "home-services",
    industry: "Auto / Home Services",
    metaTitle:
      "AI Customer Support for Home & Auto Service Businesses | Resolvly",
    metaDescription:
      "Automate scheduling inquiries, service area questions, and pricing estimates. Resolvly handles 70%+ of home service conversations at $0.05 each.",

    headline:
      "Homeowners need help now.\n{vermillion}Not a callback in 48 hours.",
    subheadline:
      "An AI agent that answers service area questions, explains your pricing, and captures job details — while you're on the job site, not glued to your phone.",

    problemHeadline:
      "Service businesses lose jobs to missed calls.",
    problemDescription:
      "A homeowner's water heater breaks at 7pm. They search Google, call three plumbers. The first one who picks up gets the job. If you're on another call or under a sink, that's $500 you'll never see.",
    stats: [
      {
        value: "85%",
        label: "of callers who don't reach a service business won't call back",
      },
      {
        value: "60%",
        label:
          "of home service leads come outside regular hours",
        highlight: true,
      },
      {
        value: "$275",
        label: "average revenue per residential service call",
      },
      {
        value: "3.5x",
        label:
          "more jobs booked by businesses that respond within 5 minutes",
      },
    ],

    useCasesHeadline:
      "The questions homeowners ask when something breaks.",
    useCases: [
      {
        question: "Do you service the 94110 zip code?",
        context:
          "Service area is the first qualifying question — instant answers prevent lost leads.",
      },
      {
        question: "How much does a furnace tune-up cost?",
        context:
          "Pricing estimates are the #1 question after service area — answerable from your rate card.",
      },
      {
        question:
          "My AC isn't cooling — can someone come out today?",
        context:
          "Urgent service requests need immediate response. AI captures the details for dispatch.",
      },
      {
        question: "Do you offer financing for a new roof?",
        context:
          "Financing questions come up on big-ticket jobs and are easy to answer from your options.",
      },
      {
        question: "Are you licensed and insured?",
        context:
          "Credentialing questions build trust — answer them instantly with your license numbers and coverage.",
      },
    ],

    capabilities: [
      {
        title: "Service area verification",
        description:
          "Instantly confirm whether you serve a customer's zip code or neighborhood. No more wasted calls for areas you don't cover.",
      },
      {
        title: "Job intake automation",
        description:
          "Capture the problem description, property type, urgency level, and contact info while you're on the job site. Your dispatch queue fills itself.",
      },
      {
        title: "Emergency routing",
        description:
          "Burst pipes, gas leaks, electrical fires — true emergencies get routed to your emergency line or 911 immediately. Routine requests get queued.",
      },
      {
        title: "Pricing & scheduling",
        description:
          "Standard service rates, seasonal promotions, financing options, availability windows — answer the questions that close jobs before your competitor calls back.",
      },
    ],

    ctaHeadline: "Stop losing jobs to missed calls.",
    ctaDescription:
      "A homeowner just Googled your service. They're about to call. If you don't pick up, the next listing will. Let your AI agent pick up for you.",
  },
};

// ── Helpers ──────────────────────────────────────────────────

export function getVerticalSlugs(): string[] {
  return Object.keys(VERTICALS);
}

export function getVerticalBySlug(slug: string): VerticalData | undefined {
  return VERTICALS[slug];
}
