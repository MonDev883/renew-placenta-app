export const SITE_DEFAULTS = {
  hero: {
    heading: "Trusted for almost 25 years in skincare and personal care.",
    paragraph: "Renew Herbal Beauty Products are trusted for almost 25 years in the line of skincare and personal care products.",
  },
  about: {
    heading: "Three decades of formulating for Filipino skin",
    story1: "Pureform Cosmetics began in 1991 as a contract manufacturer for local and international beauty brands. In 1998, founders Rene and Grace Garcia launched Renew Placenta Soap, pairing wheat placenta enzymes with natural fruit extracts — a formulation that became a household name.",
    story2: "Rene and Grace still travel to expos across Hong Kong, New York, and Milan to bring new botanical research home, so every bar keeps pace with what skin actually needs.",
    facts: [
      { label: "Founded", value: "1991, Pureform Cosmetics" },
      { label: "Flagship launch", value: "1998, Renew Placenta Herbal Beauty Products" },
      { label: "Head Office", value: "Sampaloc, Manila" },
    ],
    mission: "To produce high-quality products that meet market demands, pass government standards, and satisfy customer needs.",
    vision: "To distribute the finest quality and value-priced products both locally and in the international market.",
  },
  contact: {
    address: "#610 Blumentritt Ext., Brgy. 536\nSampaloc, Manila, Metro Manila, Philippines",
    phones: "(+63) 917 817 6736 · (+63) 922 845 8284 · (02) 8251 4850",
    emails: "rene@renewplacenta.com · pureformcosmetics@yahoo.com",
    hours: [
      { day: "Monday – Friday", time: "8:00 AM – 5:00 PM" },
      { day: "Saturday", time: "8:00 AM – 3:00 PM" },
      { day: "Sunday", time: "Closed" },
    ],
  },
  services: [
    { title: "Nationwide Delivery", desc: "We ship anywhere in the Philippines. Contact us for export or distributorship inquiries." },
    { title: "Online Support", desc: "Our customer service team is available Mon–Fri 8AM–5PM, Sat 8AM–3PM." },
    { title: "Bulk Discounts", desc: "We offer bulk pricing and exclusive deals for resellers and distributors." },
    { title: "Secure Payments", desc: "Your information and payments are always protected." },
  ],
  testimonials: [
    { quote: "My skin felt noticeably brighter within two weeks — and it still smells like a proper herbal soap, not a chemical bar.", who: "Long-time user, Renew Placenta Classic" },
    { quote: "The lather is thick and the scent stays with you. It cleans deeply without leaving that tight, stripped feeling.", who: "Verified buyer" },
    { quote: "I've used it for years for the fine lines and dark spots. Slow and steady, but it works.", who: "Repeat customer" },
  ],
  footer: {
    copyrightName: "Pureform Cosmetics",
    notice1: "All Renew and Truderm products carry a valid Certificate of Product Notification (CPN) from the Philippine FDA, meeting the safety and labeling standards required before market release.",
    notice2: "As with any cosmetic product made from natural botanical and herbal ingredients, individual sensitivities can vary. We recommend a 24-hour patch test before full use, and discontinuing use if irritation occurs.",
    notice3: "Information on this site is for cosmetic and educational purposes only and is not medical advice. Consult a dermatologist for specific skin conditions, or before use if pregnant or nursing.",
  },
};

const text = (value, fallback) => (typeof value === 'string' && value.trim() ? value : fallback);
const list = (value, fallback, allowEmpty = false) =>
  Array.isArray(value) && (allowEmpty || value.length > 0) ? value : fallback;

// Combines the saved text with the originals, so a missing field never leaves a gap
export function mergeContent(saved) {
  const s = saved && typeof saved === 'object' ? saved : {};
  const d = SITE_DEFAULTS;
  return {
    hero: {
      heading: text(s.hero?.heading, d.hero.heading),
      paragraph: text(s.hero?.paragraph, d.hero.paragraph),
    },
    about: {
      heading: text(s.about?.heading, d.about.heading),
      story1: text(s.about?.story1, d.about.story1),
      story2: text(s.about?.story2, d.about.story2),
      facts: list(s.about?.facts, d.about.facts),
      mission: text(s.about?.mission, d.about.mission),
      vision: text(s.about?.vision, d.about.vision),
    },
    contact: {
      address: text(s.contact?.address, d.contact.address),
      phones: text(s.contact?.phones, d.contact.phones),
      emails: text(s.contact?.emails, d.contact.emails),
      hours: list(s.contact?.hours, d.contact.hours),
    },
    services: list(s.services, d.services),
    testimonials: list(s.testimonials, d.testimonials, true),
    footer: {
      copyrightName: text(s.footer?.copyrightName, d.footer.copyrightName),
      notice1: text(s.footer?.notice1, d.footer.notice1),
      notice2: text(s.footer?.notice2, d.footer.notice2),
      notice3: text(s.footer?.notice3, d.footer.notice3),
    },
  };
}