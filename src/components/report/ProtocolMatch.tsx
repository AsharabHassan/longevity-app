"use client";

import { useState } from "react";
import { ArrowUpRight, Check, FlaskConical, Loader2 } from "lucide-react";
import { CLINIC, type ClinicLocation } from "@/lib/clinic";
import {
  PROTOCOL_STAGES,
  TIER_LABEL,
  discussionTopics,
  protocolUrl,
  testsForConcerns,
  type ComponentTier,
  type Protocol,
  type StageId,
} from "@/lib/protocols";
import type { LeadData } from "@/lib/types";

interface ProtocolMatchProps {
  protocols: Protocol[];
  concerns: string[];
  location: ClinicLocation;
  lead: LeadData;
}

const TIER_STYLE: Record<ComponentTier, string> = {
  foundation: "border-green-500/25 text-green-500/90",
  optional: "border-gold/30 text-gold",
  specialist: "border-white/15 text-muted/70",
};

export default function ProtocolMatch({ protocols, concerns, location, lead }: ProtocolMatchProps) {
  const [activeProtocol, setActiveProtocol] = useState(0);
  const [stage, setStage] = useState<StageId>("assess");
  const [topics, setTopics] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  if (protocols.length === 0) return null;

  const protocol = protocols[activeProtocol];
  const doctor = CLINIC.consultation.shortName || CLINIC.consultation.name || "your clinician";
  const tests = testsForConcerns(concerns);
  const stageIndex = PROTOCOL_STAGES.findIndex((s) => s.id === stage);

  const toggleTopic = (topic: string) => {
    setSaveState("idle");
    setTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  };

  // Saves what they want to talk about to the CRM, then takes them to the calendar
  const saveTopics = async () => {
    setSaveState("saving");
    await fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "interests", lead, location, interests: topics }),
    }).catch(() => {});
    setSaveState("saved");
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="animate-fade-in">
      <p className="text-[10px] font-semibold tracking-[3px] text-gold/60 uppercase mb-1">Where you&apos;d start with us</p>
      <h2 className="font-heading text-xl font-bold text-white mb-1">Walk through your protocol</h2>
      <p className="text-[13px] text-muted/60 mb-5">
        A protocol is a pathway, not a prescription. Tap each stage to see what it would involve for you.
      </p>

      {protocols.length > 1 && (
        <div className="mb-3 flex rounded-xl border border-white/10 p-1 text-xs font-semibold">
          {protocols.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActiveProtocol(i)}
              className={`flex-1 rounded-lg px-2 py-2.5 transition-colors ${
                i === activeProtocol ? "bg-[rgba(212,168,83,0.12)] text-gold" : "text-muted/50"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div className="glass-card-gold p-5">
        <p className="text-[10px] font-semibold tracking-[2px] text-muted/50 uppercase">{protocol.concern}</p>
        <p className="mt-1 font-heading text-lg font-bold text-white">{protocol.name}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted/80">{protocol.summary}</p>
        {protocol.video && (
          <div className="mt-4">
            <p className="mb-3 text-[12px] font-semibold text-gold">Watch: inside {protocol.name}</p>
            <video
              key={protocol.video}
              src={protocol.video}
              poster={protocol.videoPoster || undefined}
              controls
              playsInline
              preload="none"
              aria-label={`${protocol.name} protocol explainer`}
              className="mx-auto aspect-[9/16] w-full max-w-[300px] rounded-xl border border-white/10 bg-black"
            >
              Your browser does not support embedded video. <a href={protocol.video}>Watch the {protocol.name} film</a>.
            </video>
          </div>
        )}
      </div>

      {/* Stage stepper */}
      <div className="mt-4 grid grid-cols-4 gap-1.5" role="tablist" aria-label="Protocol stages">
        {PROTOCOL_STAGES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={s.id === stage}
            onClick={() => setStage(s.id)}
            className={`rounded-xl border px-1 py-2.5 text-center transition-colors ${
              s.id === stage
                ? "border-gold/50 bg-[rgba(212,168,83,0.1)] text-gold"
                : i < stageIndex
                  ? "border-white/10 text-white/70"
                  : "border-white/8 text-muted/50"
            }`}
          >
            <span className="block text-[9px] font-bold tracking-[1.5px]">{String(i + 1).padStart(2, "0")}</span>
            <span className="block text-[11.5px] font-semibold">{s.title}</span>
          </button>
        ))}
      </div>

      <div className="glass-card mt-2 px-4 py-4" role="tabpanel" key={`${protocol.id}-${stage}`}>
        <p className="text-[13px] leading-relaxed text-white/85">{PROTOCOL_STAGES[stageIndex].text}</p>

        {stage === "assess" && tests.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-gold/80">
              <FlaskConical size={13} /> For what you told us, that usually means looking at
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tests.map((t) => (
                <span key={t} className="rounded-full border border-white/10 px-2.5 py-1 text-[11.5px] text-muted/80">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {stage === "personalise" && (
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted/70">
            You receive a written proposal setting out the selected components, schedule, alternatives, monitoring and
            fees before you proceed with anything.
          </p>
        )}

        {stage === "treat" && (
          <ul className="mt-4 space-y-3">
            {protocol.components.map((c) => (
              <li key={c.name}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13.5px] font-semibold text-white">{c.name}</p>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-[1px] uppercase ${TIER_STYLE[c.tier]}`}>
                    {TIER_LABEL[c.tier]}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted/70">{c.text}</p>
              </li>
            ))}
          </ul>
        )}

        {stage === "review" && <p className="mt-3 text-[12.5px] leading-relaxed text-muted/70">{protocol.review}</p>}

        <div className="mt-4 flex items-center justify-between">
          <a
            href={protocolUrl(protocol, location)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-gold underline-offset-2 hover:underline"
          >
            Full {location} protocol <ArrowUpRight size={13} />
          </a>
          {stageIndex < PROTOCOL_STAGES.length - 1 && (
            <button onClick={() => setStage(PROTOCOL_STAGES[stageIndex + 1].id)} className="text-[12px] font-semibold text-white/80 hover:text-white">
              Next: {PROTOCOL_STAGES[stageIndex + 1].title} →
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 text-[11.5px] leading-relaxed text-muted/50">
        A listed component is an option for individual review, not an automatic inclusion, and the evidence for each
        differs. This questionnaire can&apos;t decide which, if any, are right for you. {doctor} confirms that after
        assessment.
      </p>

      {/* What they want to talk about */}
      <div className="glass-card mt-6 px-4 py-4">
        <p className="text-sm font-semibold text-white">What would you like to discuss with {doctor}?</p>
        <p className="mt-0.5 text-[12px] text-muted/60">Tap anything you&apos;re curious about. He&apos;ll see it before your call.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {discussionTopics(protocols).map((topic) => {
            const on = topics.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                aria-pressed={on}
                className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                  on ? "border-gold/50 bg-[rgba(212,168,83,0.1)] text-gold" : "border-white/10 text-muted/80 hover:border-white/20"
                }`}
              >
                {on && <Check size={12} />}
                {topic}
              </button>
            );
          })}
        </div>
        <button
          onClick={saveTopics}
          disabled={topics.length === 0 || saveState === "saving"}
          className="gold-gradient mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-heading text-sm font-bold text-bg transition-opacity disabled:opacity-30"
        >
          {saveState === "saving" && <Loader2 size={15} className="animate-spin" />}
          {saveState === "saved" ? "Saved. Pick a time below" : "Save these and choose a time"}
        </button>
      </div>
    </section>
  );
}
