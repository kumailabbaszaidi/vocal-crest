/**
 * VOCAL CREST — Central site configuration
 * -----------------------------------------------------------------------------
 * Business values live here so they can be changed in one place.
 *
 *   plans          Rendered into every [data-plans] block (Home + Pricing) and
 *                  the comparison table on the Pricing page.
 *   contact.*      Empty until confirmed. While empty, the contact page shows
 *                  clearly marked placeholders.
 *   form.endpoint  URL that receives contact-form submissions (Formspree,
 *                  Basin, Getform or your own API). While empty, the form
 *                  validates but tells the visitor it is not connected yet —
 *                  it never fakes a "sent" message.
 */
window.VC_CONFIG = {
  brand: {
    name: "Vocal Crest",
    tagline: "AI receptionists. Website chat. More opportunities to grow.",
  },

  contact: {
    // e.g. { display: "(555) 010-0000", tel: "+15550100000" }
    phone: { display: "", tel: "" },
    email: "",
  },

  form: {
    endpoint: "", // e.g. "https://formspree.io/f/xxxxxxx"
    method: "POST",
  },

  currency: "$",
  period: "/month",
  plansNote: "Setup fees, usage allowances and additional charges are confirmed before you start. Website design is quoted separately.",

  plans: [
    {
      id: "chat",
      name: "Vocal Chat",
      price: "297",
      summary: "For businesses ready to turn more website visits into conversations.",
      features: [
        "AI website chatbot",
        "Custom business information and FAQs",
        "Lead and enquiry capture",
        "Connected booking or callback requests",
        "Ongoing monitoring and support",
      ],
      cta: "Choose Vocal Chat",
    },
    {
      id: "receptionist",
      name: "Vocal Receptionist",
      price: "497",
      summary: "For businesses that need help answering incoming calls.",
      features: [
        "AI phone receptionist",
        "Busy-period and after-hours answering options",
        "Custom business information and FAQs",
        "Caller details and enquiry capture",
        "Connected booking and agreed call routing",
        "Ongoing monitoring and support",
      ],
      cta: "Choose Vocal Receptionist",
    },
    {
      id: "suite",
      name: "Vocal Suite",
      price: "797",
      summary: "For businesses that want support across phone calls and website chat.",
      features: [
        "AI receptionist and website chatbot",
        "Consistent business information across both",
        "Lead capture from calls and chats",
        "Connected appointment booking",
        "Agreed routing and team notifications",
        "Combined reporting, monitoring and support",
      ],
      cta: "Choose Vocal Suite",
    },
  ],

  nav: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about/" },
    { label: "Pricing", href: "/pricing/" },
    { label: "Contact Us", href: "/contact/" },
  ],
};
