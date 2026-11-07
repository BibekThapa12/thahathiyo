// Channel facts used across the site. Edit here.
export const CHANNEL = {
  nameNe: "थाहा थियो?",
  nameEn: "Thaha Thiyo",
  display: "थाहा थियो? | Thaha Thiyo",
  handle: "@thahathiyo",
  taglineNe: "नेपालीमा रोचक तथ्य · हरेक दिन नयाँ",
  taglineEn: "Facts in Nepali, every day",
  taglineMix: "नेपालीमा interesting facts · हरेक दिन new",
  youtubeChannelId: "UCB00VCoCfdHd6oAa0iIwtdQ",
  contactEmail: "bibekthapa9746@gmail.com",
};

// "थाहालाई एक कप चिया" support card. Leave bmcUrl empty to hide the Buy Me a Coffee button.
export const SUPPORT = {
  bmcUrl: "",
  qrs: [
    { name: "eSewa", src: "qr/esewa.jpeg", width: 461, height: 460, color: "#60BB46" },
    { name: "Khalti", src: "qr/khalti.jpeg", width: 258, height: 255, color: "#5C2D91" },
  ],
};

export type Platform = "youtube" | "tiktok" | "instagram" | "facebook";

export const SOCIALS: { id: Platform; name: string; nameNe: string; url: string; color: string }[] = [
  { id: "youtube", name: "YouTube", nameNe: "युट्युब", url: "https://www.youtube.com/@thahathiyo", color: "#D4372C" },
  { id: "tiktok", name: "TikTok", nameNe: "टिकटक", url: "https://www.tiktok.com/@thahathiyo", color: "#111111" },
  { id: "instagram", name: "Instagram", nameNe: "इन्स्टाग्राम", url: "https://www.instagram.com/thahathiyo", color: "#A8261F" },
  // TODO(Bibek): swap for the vanity URL (e.g. https://www.facebook.com/thahathiyo) if the page has one.
  { id: "facebook", name: "Facebook", nameNe: "फेसबुक", url: "https://www.facebook.com/1367026079832460", color: "#2E3F8F" },
];

export const TOPICS = [
  { id: "festivals", ne: "चाडपर्व", en: "Festivals", mix: "चाडपर्व Vibes" },
  { id: "history", ne: "इतिहास", en: "History", mix: "History कुरा" },
  { id: "science", ne: "विज्ञान", en: "Science", mix: "Science गफ" },
  { id: "business", ne: "ब्यापार", en: "Business", mix: "Business खेल" },
] as const;
export type TopicId = (typeof TOPICS)[number]["id"];
