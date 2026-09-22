import { ArrowDown } from "lucide-react";
import { bookingLabel } from "@/lib/clinic";

/** Jumps to the calendar. `lead` is the sentence that ties the button to the section above it. */
export default function BookCTA({ lead }: { lead?: string }) {
  return (
    <div className="mx-auto mt-6 max-w-md text-center">
      {lead && <p className="mb-3 text-[13px] leading-relaxed text-muted/70">{lead}</p>}
      <a
        href="#book"
        className="gold-gradient gold-glow flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-heading text-sm font-bold tracking-wide text-bg transition-all hover:brightness-110 active:scale-[0.98]"
      >
        {bookingLabel()}
        <ArrowDown size={16} strokeWidth={2.5} />
      </a>
    </div>
  );
}
