"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, ExternalLink } from "lucide-react";
import { CLINIC, consultationHost, type ClinicLocation } from "@/lib/clinic";
import { topDrivers } from "@/lib/lifestyleAge";
import { PixelEvents, trackCustomEvent } from "@/lib/pixel";
import type { LeadData, LifestyleAgeResult } from "@/lib/types";

interface ConsultationCardProps {
  result: LifestyleAgeResult;
  lead: LeadData;
  location: ClinicLocation;
}

export default function ConsultationCard({ result, lead, location }: ConsultationCardProps) {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Load the calendar only once it scrolls into view
  useEffect(() => {
    const el = calendarRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCalendarVisible(true);
          trackCustomEvent("CalendarViewed", { location });
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [location]);

  const drivers = topDrivers(result).map((f) => f.name.toLowerCase());
  const { minutes, name, role, gmcNumber, credentials, photo } = CLINIC.consultation;
  const host = consultationHost();

  const agenda = [
    drivers.length > 0
      ? `Walk through your biggest drivers: ${drivers.join(", ")}`
      : "Walk through what's already working for you, and how to keep it that way",
    result.concerns.length > 0
      ? `Talk about ${result.concerns.slice(0, 2).join(" and ").toLowerCase()}, and what's worth checking first`
      : "Explain which tests are worth considering for you — and which aren't",
    "Outline what a plan could look like, with clear pricing. No obligation.",
  ];

  const bookingUrl = new URL(CLINIC.bookingUrl);
  if (lead.firstName) bookingUrl.searchParams.set("first_name", lead.firstName);
  if (lead.email) bookingUrl.searchParams.set("email", lead.email);
  if (lead.phone) bookingUrl.searchParams.set("phone", lead.phone);

  return (
    <section id="book" className="animate-fade-in scroll-mt-6">
      <div className="glass-card-gold p-5">
        <p className="text-[10px] font-semibold tracking-[3px] text-gold uppercase mb-1">Your next step</p>
        <h2 className="font-heading text-xl font-bold text-white">
          {name ? `${minutes} minutes with ${name}` : `A free ${minutes}-minute consultation`}
        </h2>
        <p className="mt-1 text-[13px] text-muted/70">
          {name
            ? `Free, by phone or video, with ${host}. He'll have your answers beforehand. On the call he will:`
            : `By phone or video with ${host}. Here's what it covers:`}
        </p>

        <ul className="mt-4 space-y-2.5">
          {agenda.map((item) => (
            <li key={item} className="flex gap-2.5 text-[13.5px] leading-relaxed text-white/85">
              <Check size={15} className="mt-0.5 shrink-0 text-gold" />
              {item}
            </li>
          ))}
        </ul>

        {name && (
          <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
            {photo && <Image src={photo} alt={name} width={44} height={44} className="rounded-full object-cover" />}
            <div>
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-[11px] text-muted/50">
                {[role, credentials, gmcNumber && `GMC ${gmcNumber}`].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        )}

        <p className="mt-4 text-[11px] text-muted/50">
          {CLINIC.locations[location].address} · Regulated by the {CLINIC.locations[location].regulator}
        </p>
      </div>

      <div ref={calendarRef} className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white">
        {calendarVisible ? (
          <iframe
            src={bookingUrl.toString()}
            title="Book your free consultation"
            className="h-[720px] w-full"
            loading="lazy"
          />
        ) : (
          <div className="flex h-[720px] items-center justify-center text-sm text-neutral-400">Loading calendar…</div>
        )}
      </div>

      <a
        href={bookingUrl.toString()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => PixelEvents.bookingClick(location)}
        className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-muted/50 underline underline-offset-2 hover:text-gold/80"
      >
        Calendar not loading? Open it in a new tab <ExternalLink size={11} />
      </a>
    </section>
  );
}
