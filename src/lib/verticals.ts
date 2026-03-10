// ── Types ────────────────────────────────────────────────────

export type VerticalStat = {
  value: string;
  label: string;
  highlight?: boolean;
};

export type VerticalUseCase = {
  question: string;
  context: string;
  answer?: string; // Customer-facing answer for FAQ pre-population
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
        answer:
          "You can pay your rent online through our tenant portal. Log in with your account credentials, click 'Make a Payment', and follow the prompts. We accept bank transfers (ACH) and credit/debit cards. Payments are typically processed within 1-2 business days. If you need help setting up your portal account, please contact our office.",
      },
      {
        question:
          "My kitchen faucet is leaking — how do I submit a maintenance request?",
        context:
          "Maintenance intake can be automated with clear instructions and portal links.",
        answer:
          "To submit a maintenance request, log into the tenant portal and click 'Maintenance Request'. Describe the issue, include any photos if possible, and submit. For emergencies like flooding, gas leaks, or no heat, please call our emergency maintenance line immediately. Non-emergency requests are typically addressed within 2-3 business days.",
      },
      {
        question: "When does my lease expire and how do I renew?",
        context:
          "Lease renewal timelines are standard policy that AI handles with high confidence.",
        answer:
          "Your lease expiration date is listed on your lease agreement, and we also send renewal notices 60-90 days before expiration. To renew, watch for the renewal offer from our office and sign the updated lease. If you're unsure of your end date or want to discuss renewal terms, feel free to contact us and we'll look up your details.",
      },
      {
        question: "What's the pet deposit and which breeds are allowed?",
        context:
          "Pet policy is among the top 5 questions from prospective and current tenants.",
        answer:
          "We require a refundable pet deposit (typically $250-$500 depending on the property) plus a monthly pet rent. Most domestic cats and dogs are welcome, though some properties have breed and weight restrictions. Please contact our office with your specific property address and pet details so we can confirm the policy for your unit.",
      },
      {
        question: "Where do guests park and for how long?",
        context:
          "Parking rules are straightforward knowledge base content with clear answers.",
        answer:
          "Guest parking is available in designated visitor spots marked with 'Visitor' signs. Guests may park for up to 48 hours without a permit. For longer stays, please contact the office to arrange a temporary parking pass. Unauthorized vehicles in resident spots may be towed at the owner's expense.",
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
        answer:
          "Yes, personal injury is one of our primary practice areas. We handle car accidents, slip and falls, workplace injuries, and medical malpractice cases. We offer free initial consultations to evaluate your case. Would you like to schedule a consultation with one of our attorneys?",
      },
      {
        question: "How much does a consultation cost?",
        context:
          "Fee transparency is the #1 factor in whether a lead converts to a consultation booking.",
        answer:
          "We offer a free initial consultation for most case types. During this meeting, an attorney will review the details of your situation and explain your options. There is no obligation to proceed. For certain matters, we work on a contingency fee basis, meaning you only pay if we win your case.",
      },
      {
        question:
          "I was in a car accident yesterday — what should I do first?",
        context:
          "Urgent inquiries need immediate response. After-hours AI prevents leads from going to competitors.",
        answer:
          "First, make sure you've received any needed medical attention. Then, document everything: take photos of the scene and vehicles, get the other driver's information, and file a police report if you haven't already. Avoid giving recorded statements to insurance companies before speaking with an attorney. We'd recommend scheduling a consultation as soon as possible to protect your rights.",
      },
      {
        question:
          "What documents do I need to bring to my first meeting?",
        context:
          "Pre-appointment preparation questions reduce no-shows and wasted attorney time.",
        answer:
          "Please bring any documents related to your case: police reports, medical records and bills, insurance correspondence, photographs, and any contracts or agreements involved. Also bring a valid photo ID. If you don't have all of these, don't worry — bring what you have and we can help you obtain the rest.",
      },
      {
        question: "How long does a divorce case typically take?",
        context:
          "Timeline expectations are standard across similar cases and easy to answer from your knowledge base.",
        answer:
          "An uncontested divorce where both parties agree on terms typically takes 3-6 months. Contested divorces involving disputes over custody, property, or support can take 12-18 months or longer. Every situation is unique, so we'd recommend a consultation where an attorney can give you a more specific timeline based on your circumstances.",
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
        answer:
          "We accept most major dental insurance plans. To confirm that your specific plan is accepted, please give us a call or send us a message with your insurance provider name and plan details. We'll verify your coverage before your appointment so there are no surprises.",
      },
      {
        question:
          "I need to reschedule my appointment — what's available next week?",
        context:
          "Scheduling inquiries are high-volume. AI can provide instructions and links to your booking system.",
        answer:
          "You can reschedule your appointment through our online booking portal, or by calling our office during business hours. We ask for at least 24 hours' notice for cancellations or reschedules to avoid a cancellation fee. Our portal shows real-time availability so you can pick a time that works best for you.",
      },
      {
        question: "What should I do before my first visit?",
        context:
          "New patient prep instructions are identical every time — forms, documents, arrival time.",
        answer:
          "For your first visit, please arrive 15 minutes early to complete paperwork. Bring a valid photo ID, your insurance card (if applicable), and a list of any current medications. You can also fill out new patient forms in advance through our website to save time. If you have recent dental X-rays, please bring those as well.",
      },
      {
        question:
          "How much does a teeth cleaning cost without insurance?",
        context:
          "Self-pay pricing questions are increasingly common and easy to answer from your fee schedule.",
        answer:
          "A standard adult cleaning (prophylaxis) typically ranges from $100-$200 without insurance. Deep cleanings and other procedures vary in cost. We offer transparent pricing and can provide a detailed estimate before any treatment. Ask us about our discount program for patients without insurance.",
      },
      {
        question: "Are you open on Saturdays?",
        context:
          "Office hours questions are the simplest to automate and among the most frequently asked.",
        answer:
          "Our office hours vary by location. Typically we are open Monday through Friday, with select Saturday hours available. Please check our website or contact us for the specific hours at your nearest location. We're happy to help you find a convenient appointment time.",
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
        answer:
          "Yes, we accept reservations! You can book a table through our website or by calling us during business hours. For weekend evenings, we recommend booking at least 2-3 days in advance as they fill up quickly. Walk-ins are also welcome on a first-come, first-served basis.",
      },
      {
        question: "Do you have gluten-free options?",
        context:
          "Allergen and dietary questions are critical for safety and easily answered from your menu.",
        answer:
          "Yes, we offer several gluten-free options on our menu, which are clearly marked. We can also modify many dishes to accommodate gluten-free, dairy-free, vegetarian, and vegan diets. Please inform your server about any allergies when you arrive so our kitchen can take extra precautions.",
      },
      {
        question: "What time do you close on Sundays?",
        context:
          "Hours and location questions are the #1 reason customers call — and the simplest to automate.",
        answer:
          "Our hours vary by location and may change for holidays. You can find our current hours on our website or Google listing. We recommend checking before your visit, especially on holidays when we may have modified hours.",
      },
      {
        question: "Do you offer catering for events?",
        context:
          "Catering inquiries are high-value leads that often get lost in the dinner rush.",
        answer:
          "Yes, we offer catering for corporate events, private parties, weddings, and special occasions. Our catering menu includes options for groups of all sizes. Please reach out with your event date, expected guest count, and any dietary requirements, and our catering team will put together a custom proposal for you.",
      },
      {
        question: "Is there parking nearby?",
        context:
          "Logistics questions affect whether guests choose your restaurant over an easier option.",
        answer:
          "There is street parking available around our location, and a public parking garage within a short walk. We recommend checking our website for specific parking directions and tips for your visit. During peak hours, arriving a few minutes early to find parking is a good idea.",
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
        answer:
          "You can track your order status using the tracking link sent to your email when it shipped. If your order appears delayed, please allow 1-2 extra business days as shipping carriers sometimes experience delays. If you still haven't received it after that window, contact us with your order number and we'll investigate right away.",
      },
      {
        question: "What's your return policy?",
        context:
          "Return policies are standard content that AI handles with near-perfect confidence.",
        answer:
          "We offer a 30-day return policy on most items. Products must be unused, in their original packaging, and accompanied by a receipt or order confirmation. To initiate a return, visit our Returns page on the website and follow the instructions to generate a return shipping label. Refunds are processed within 5-7 business days after we receive the item.",
      },
      {
        question: "Does this come in a size medium?",
        context:
          "Product availability questions directly impact conversion — fast answers mean more sales.",
        answer:
          "Product availability varies and is shown in real time on each product page. If a size or variant shows as 'Out of Stock', you can sign up for restock notifications by entering your email on the product page. We restock popular items regularly. Feel free to ask about a specific product and we'll check availability for you.",
      },
      {
        question: "How long does shipping take to Canada?",
        context:
          "Shipping timeline questions are high-frequency and easily answered from your policies.",
        answer:
          "International shipping to Canada typically takes 7-14 business days depending on your location and the shipping method selected at checkout. Standard shipping is the most economical option, while expedited shipping (5-7 business days) is available for an additional fee. Please note that customs duties and taxes may apply.",
      },
      {
        question: "Can I change the color on my order?",
        context:
          "Order modification requests can be triaged by AI and escalated to your fulfillment team.",
        answer:
          "We can modify orders that haven't entered the shipping process yet. Please send us your order number and the change you'd like to make as soon as possible. If your order has already been shipped, we may not be able to modify it, but you can return the item and place a new order with the correct color.",
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
        answer:
          "We service a wide area and can quickly check if your location is covered. Please provide your zip code or address and we'll confirm right away. You can also check our service area map on our website for immediate confirmation.",
      },
      {
        question: "How much does a furnace tune-up cost?",
        context:
          "Pricing estimates are the #1 question after service area — answerable from your rate card.",
        answer:
          "A standard furnace tune-up starts at a competitive rate and includes a full inspection, filter check, and cleaning. The exact price depends on your system type and any additional services needed. We'd be happy to provide a detailed quote — just let us know your system type and we can give you an accurate estimate.",
      },
      {
        question:
          "My AC isn't cooling — can someone come out today?",
        context:
          "Urgent service requests need immediate response. AI captures the details for dispatch.",
        answer:
          "We understand how uncomfortable that is, especially in warm weather. We offer same-day and next-day service appointments for urgent issues. Please provide your name, address, phone number, and a brief description of the problem, and we'll get a technician scheduled for you as soon as possible.",
      },
      {
        question: "Do you offer financing for a new roof?",
        context:
          "Financing questions come up on big-ticket jobs and are easy to answer from your options.",
        answer:
          "Yes, we offer flexible financing options for larger projects. We partner with financing providers to offer affordable monthly payment plans, and many customers qualify for 0% interest for an introductory period. We can discuss financing options during your free estimate appointment.",
      },
      {
        question: "Are you licensed and insured?",
        context:
          "Credentialing questions build trust — answer them instantly with your license numbers and coverage.",
        answer:
          "Yes, we are fully licensed, bonded, and insured. Our team includes certified technicians with all required state and local licenses. We carry both general liability and workers' compensation insurance for your protection. We're happy to provide our license numbers and proof of insurance upon request.",
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

/** Map onboarding display name → VERTICALS slug key */
const INDUSTRY_TO_SLUG: Record<string, string> = {
  "Property Management": "property-management",
  "Legal / Law Firm": "law-firms",
  "Healthcare / Dental": "healthcare",
  "Restaurant / Cafe": "restaurants",
  "E-commerce": "ecommerce",
  "Auto / Home Services": "home-services",
};

export function getVerticalSlugByIndustry(industry: string): string | null {
  return INDUSTRY_TO_SLUG[industry] ?? null;
}

/** Convert a vertical's use cases into FAQ format for onboarding pre-population */
export function getVerticalFAQs(
  slug: string
): Array<{ title: string; content: string }> {
  const vertical = VERTICALS[slug];
  if (!vertical) return [];
  return vertical.useCases
    .filter((uc) => uc.answer)
    .map((uc) => ({
      title: uc.question,
      content: uc.answer!,
    }));
}
