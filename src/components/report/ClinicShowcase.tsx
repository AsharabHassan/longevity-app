import Image from "next/image";
import { Star, MapPin, ShieldCheck, Phone } from "lucide-react";
import { CLINIC, type ClinicLocation } from "@/lib/clinic";

export default function ClinicShowcase({ location }: { location: ClinicLocation }) {
  const site = CLINIC.locations[location];
  const { googleReviews, testimonials } = CLINIC;

  return (
    <section className="animate-fade-in space-y-5">
      <div className="text-center">
        <p className="text-[10px] font-semibold tracking-[3px] text-gold/60 uppercase mb-1">Who you&apos;ll be speaking to</p>
        <h2 className="font-heading text-xl font-bold text-white">{CLINIC.brand}</h2>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/5">
        <Image
          src="/clinic-hero.jpg"
          alt={`${CLINIC.brand} clinic`}
          width={640}
          height={360}
          className="w-full h-auto object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      </div>

      <div className="glass-card grid gap-4 p-5 sm:grid-cols-2">
        <div className="flex items-start gap-2.5">
          <MapPin size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold/70" />
          <p className="text-[12px] leading-relaxed text-white/80">{site.address}</p>
        </div>
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold/70" />
          <p className="text-[12px] leading-relaxed text-white/80">Regulated by the {site.regulator}</p>
        </div>
        <div className="flex items-start gap-2.5">
          <Phone size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold/70" />
          <p className="text-[12px] leading-relaxed text-white/80">
            {CLINIC.phone}
            <br />
            <span className="text-muted/50">{CLINIC.email}</span>
          </p>
        </div>
        {googleReviews && (
          <div className="flex items-start gap-2.5">
            <Star size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold/70" />
            <p className="text-[12px] leading-relaxed text-white/80">
              {googleReviews.rating.toFixed(1)} on Google
              <br />
              <span className="text-muted/50">{googleReviews.count} reviews</span>
            </p>
          </div>
        )}
      </div>

      {testimonials.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory scrollbar-hide">
          {testimonials.map((t) => (
            <figure
              key={t.name + t.text}
              className="flex-shrink-0 w-[280px] snap-start rounded-xl border border-white/5 bg-[rgba(255,255,255,0.02)] p-4"
            >
              <blockquote className="text-[12px] leading-relaxed text-muted/70">&ldquo;{t.text}&rdquo;</blockquote>
              <figcaption className="mt-3 text-[11px] font-semibold text-white/80">
                {t.name} <span className="font-normal text-muted/40">· {t.source}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
