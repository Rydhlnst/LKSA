export function SectionHeading({ eyebrow, title, description, align = "left" }: { eyebrow: string; title: string; description?: string; align?: "left" | "center" }) {
  return <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}><span className="eyebrow">{eyebrow}</span><h2 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight text-ink md:text-4xl">{title}</h2>{description && <p className="mt-4 text-base leading-7 text-muted">{description}</p>}</div>;
}

