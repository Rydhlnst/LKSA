import { register } from "node:module";
import nextEnv from "@next/env";
import { seedCanonicalContent } from "../lib/content-seed.ts";

// Plain Node needs the aliases that Next.js normally supplies to the existing DB module.
register(`data:text/javascript,${encodeURIComponent(`
  export async function resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith("/lib/db/index.ts")) {
      if (specifier === "server-only") return { url: "data:text/javascript,export {};", shortCircuit: true };
      if (specifier === "./schema") specifier = "./schema.ts";
    }
    return nextResolve(specifier, context);
  }
`)}`, import.meta.url);

try {
  nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed canonical content.");
  const { sql } = await import("../lib/db/index.ts");
  try {
    const { inserted, content } = await seedCanonicalContent();
    const counts = Object.entries(content)
      .filter(([, value]) => Array.isArray(value))
      .map(([name, value]) => `${name}=${(value as unknown[]).length}`);
    console.log(`${inserted ? "Inserted" : "Merged"} canonical content: ${counts.join(", ")}`);
  } finally {
    await sql?.end();
  }
} catch {
  console.error("Canonical content seed failed. Check DATABASE_URL and database availability.");
  process.exitCode = 1;
}
