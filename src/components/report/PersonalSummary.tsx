"use client";

import { useEffect, useState } from "react";
import { templateSummary } from "@/lib/summary";
import type { LifestyleAgeResult } from "@/lib/types";

const CACHE_KEY = "reportSummary";

/** Shows the template immediately, then swaps in the AI wording if it passes its checks. */
export default function PersonalSummary({
  result,
  firstName,
  qualified,
}: {
  result: LifestyleAgeResult;
  firstName: string;
  qualified: boolean;
}) {
  const [text, setText] = useState(() => templateSummary(result, firstName, qualified));

  useEffect(() => {
    let cancelled = false;
    const cached = sessionStorage.getItem(CACHE_KEY);
    const load: Promise<{ text?: string } | null> = cached
      ? Promise.resolve({ text: cached })
      : fetch("/api/report/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result, firstName, qualified }),
        }).then((res) => (res.ok ? res.json() : null));

    load
      .then((data) => {
        if (cancelled || !data?.text) return;
        setText(data.text);
        sessionStorage.setItem(CACHE_KEY, data.text);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [result, firstName, qualified]);

  return (
    <div className="glass-card-gold mx-auto max-w-md px-6 py-5">
      <p className="text-center text-[14px] leading-relaxed text-muted/90">{text}</p>
    </div>
  );
}
