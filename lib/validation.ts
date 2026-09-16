import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const settingsSchema = z.object({
  organizationName: z.string().min(2).max(120),
  shortName: z.string().min(2).max(80),
  address: z.string().min(5).max(300),
  phone: z.string().min(6).max(30),
  email: z.string().email(),
  mapUrl: z.string().url(),
  whatsappNumber: z.string().regex(/^\d{8,16}$/),
  whatsappAgentName: z.string().min(2).max(80),
  whatsappResponseTime: z.string().min(2).max(120),
  whatsappGreeting: z.string().min(2).max(300),
  whatsappMessage: z.string().min(2).max(500),
});

export const articleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(160),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().min(3).max(300),
  body: z.string().min(3),
  publishDate: z.string().min(8),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean().default(false),
});

