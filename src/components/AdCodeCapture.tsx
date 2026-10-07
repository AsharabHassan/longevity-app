"use client";

import { useEffect } from "react";
import { cleanAdCode } from "@/lib/adHeadlines";

/** Remembers which ad brought the visitor, so the lead can be tagged in the CRM. Never sent to Meta. */
export default function AdCodeCapture() {
  useEffect(() => {
    try {
      const code = cleanAdCode(new URLSearchParams(window.location.search).get("utm_content"));
      if (code) sessionStorage.setItem("adCode", code);
    } catch {
      // storage blocked: the lead simply goes untagged
    }
  }, []);
  return null;
}
