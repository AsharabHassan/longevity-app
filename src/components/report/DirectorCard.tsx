import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { CLINIC } from "@/lib/clinic";

/** Shown only once a named, GMC-registered doctor is set in clinic.ts. */
export default function DirectorCard({ firstName }: { firstName: string }) {
  const { name, role, gmcNumber, credentials, photo, bio, minutes, video } = CLINIC.consultation;
  if (!name) return null;

  return (
    <section className="glass-card-gold animate-fade-in-up mx-auto mt-6 max-w-md p-5">
      <div className="flex items-center gap-4">
        {photo && (
          <Image src={photo} alt={name} width={64} height={64} className="h-16 w-16 shrink-0 rounded-full border border-gold/30 object-cover" />
        )}
        <div className="min-w-0">
          <p className="font-heading text-base font-bold text-white">{name}</p>
          <p className="text-[12px] text-gold/80">
            {role}
            {credentials ? ` · ${credentials}` : ""}
          </p>
          {gmcNumber && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted/50">
              <BadgeCheck size={12} className="text-gold/70" /> GMC {gmcNumber}
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-[13.5px] leading-relaxed text-white/85">
        &ldquo;{firstName ? `${firstName}, I` : "I"}&apos;ll have your answers in front of me before we speak, so we can use
        the {minutes} minutes on what matters for you rather than going over them again.&rdquo;
      </p>
      {bio && <p className="mt-3 text-[12px] leading-relaxed text-muted/60">{bio}</p>}
      {video && (
        <video
          src={video}
          poster={photo || undefined}
          controls
          playsInline
          preload="metadata"
          className="mt-4 w-full rounded-xl border border-white/10 bg-black"
        />
      )}
    </section>
  );
}
