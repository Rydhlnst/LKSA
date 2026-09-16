"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/content-types";

const AUTO_ADVANCE_MS = 6500;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const visibleSlides = slides.filter((slide) => slide.active).sort((a, b) => a.order - b.order);
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (visibleSlides.length < 2 || isPaused) return;

    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % visibleSlides.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, visibleSlides.length]);


  if (!visibleSlides.length) return <div className="hero-placeholder" />;
  const currentIndex = Math.min(active, visibleSlides.length - 1);

  return (
    <section
      className="relative overflow-hidden bg-navy"
      aria-label="Pesan utama"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="relative min-h-[640px] md:min-h-[740px] lg:min-h-[820px]">
        {visibleSlides.map((item, index) => {
          const isActive = currentIndex === index;

          return (
            <article
              key={item.id}
              aria-hidden={!isActive}
              className={"absolute inset-0 transition-opacity duration-700 ease-in-out " + (isActive ? "opacity-100" : "pointer-events-none opacity-0")}
            >
              <img
                src={item.imageUrl}
                alt=""
                className={"absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out " + (isActive ? "scale-100 opacity-60" : "scale-105 opacity-0")}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b1624]/95 via-[#0b1624]/60 to-transparent" />
              <div className="site-container relative z-10 flex min-h-[640px] items-center py-24 md:min-h-[740px] md:py-28 lg:min-h-[820px] lg:py-32">
                <div className="max-w-3xl text-white">
                  <span className="eyebrow border-white/30 bg-white/10 text-white">Melayani dengan hati</span>
                  <h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">{item.title}</h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 md:text-lg">{item.description}</p>
                  <Link className="button-primary mt-9 inline-flex gap-2 text-base" href={item.ctaHref} tabIndex={isActive ? 0 : -1}>
                    {item.ctaLabel}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}

        {visibleSlides.length > 1 ? (
          <>
            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2" aria-label="Pilih slide">
              {visibleSlides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={"h-2 rounded-full transition-all duration-500 " + (currentIndex === index ? "w-8 bg-orange" : "w-2 bg-white/50 hover:bg-white/80")}
                  aria-label={"Slide " + (index + 1)}
                  aria-current={currentIndex === index}
                />
              ))}
            </div>
            <div className="absolute bottom-7 right-6 z-20 hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => setActive((value) => (value - 1 + visibleSlides.length) % visibleSlides.length)}
                className="rounded-full border border-white/30 bg-white/10 p-2 text-white transition hover:bg-white/20"
                aria-label="Slide sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setActive((value) => (value + 1) % visibleSlides.length)}
                className="rounded-full border border-white/30 bg-white/10 p-2 text-white transition hover:bg-white/20"
                aria-label="Slide berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}