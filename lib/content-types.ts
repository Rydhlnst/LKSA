export type PublishStatus = "draft" | "published" | "archived";

export type SiteSettings = {
  organizationName: string;
  shortName: string;
  logoPrimary: string;
  logoSecondary: string;
  address: string;
  phone: string;
  email: string;
  mapUrl: string;
  socialLinks: { label: string; href: string }[];
  footerDescription: string;
  whatsappNumber: string;
  whatsappAgentName: string;
  whatsappResponseTime: string;
  whatsappGreeting: string;
  whatsappMessage: string;
};

export type HeroSlide = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  order: number;
  active: boolean;
};

export type HomeValue = {
  id: string;
  title: string;
  description: string;
  icon: "heart" | "book" | "sparkles" | "users";
  order: number;
  active: boolean;
};

export type HomeContent = {
  about: { eyebrow: string; title: string; description: string; ctaLabel: string };
  video: { eyebrow: string; title: string; description: string; youtubeUrl: string };
  gallery: { eyebrow: string; title: string; description: string; ctaLabel: string };
  news: { eyebrow: string; title: string; description: string; ctaLabel: string };
  support: { eyebrow: string; title: string; description: string; ctaLabel: string };
};

export type PageSectionCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

export type PageSections = Partial<Record<
  "account" | "transparency" | "legal" | "organigram" | "weekday" | "weekend",
  PageSectionCopy
>>;

export type PageContent = {
  id: string;
  slug: string;
  eyebrow: string;
  sections: PageSections;
  title: string;
  intro: string;
  body: string;
  status: PublishStatus;
  updatedAt: string;
};

export type OrganizationNode = {
  id: string;
  name: string;
  role: string;
  parentId: string | null;
  order: number;
  active: boolean;
};

export type ScheduleEntry = {
  id: string;
  group: "weekday" | "weekend";
  period: "pagi" | "siang" | "sore" | "malam";
  time: string;
  activity: string;
  location: string;
  coordinator: string;
  order: number;
  active: boolean;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string;
  body: string;
  publishDate: string;
  status: PublishStatus;
  featured: boolean;
  updatedAt: string;
};

export type GalleryItem = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  order: number;
  visible: boolean;
};

export type PublicDocument = {
  id: string;
  title: string;
  description: string;
  href: string;
  category: "legalitas" | "profil" | "organisasi";
  published: boolean;
};

export type DonationSettings = {
  heading: string;
  description: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisUrl: string;
  confirmationMessage: string;
  confirmationWhatsapp: string;
  transparencyHeading: string;
};

export type DonationLedgerEntry = {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  status: "planned" | "completed";
  public: boolean;
};

export type DonorEntry = {
  id: string;
  displayName: string;
  amount: number;
  date: string;
  public: boolean;
};

export type SiteContent = {
  contentVersion: number;
  settings: SiteSettings;
  home: HomeContent;
  heroSlides: HeroSlide[];
  homeValues: HomeValue[];
  pages: PageContent[];
  organization: OrganizationNode[];
  schedule: ScheduleEntry[];
  articles: Article[];
  galleries: GalleryItem[];
  documents: PublicDocument[];
  donation: DonationSettings;
  ledger: DonationLedgerEntry[];
  donors: DonorEntry[];
};
