"use client";

import { useState, type FormEvent } from "react";
import { User, Mail, Phone, Lock, Shield, Award } from "lucide-react";
import type { LeadData } from "@/lib/types";

interface LeadCaptureFormProps {
  onSubmit: (data: LeadData) => void;
  isSubmitting: boolean;
}

export default function LeadCaptureForm({ onSubmit, isSubmitting }: LeadCaptureFormProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = "First name is required";
    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Please enter a valid email";
    }
    if (!phone.trim()) next.phone = "Phone number is required";
    if (!consent) next.consent = "You must agree to continue";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ firstName: firstName.trim(), email: email.trim(), phone: phone.trim() });
  };

  return (
    <div className="w-full animate-fade-in">
      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
          Your Report is <span className="gold-text">Ready</span>
        </h2>
        <p className="text-muted text-sm max-w-xs mx-auto">
          Enter your details to unlock your personalised wellness report, biological age
          estimate, and treatment recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* First Name */}
        <div>
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-bg-card transition-colors ${
              errors.firstName ? "border-danger" : "border-[#1a1a1e] focus-within:border-gold"
            }`}
          >
            <User size={18} className="text-gold shrink-0" />
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-muted"
            />
          </div>
          {errors.firstName && (
            <p className="text-danger text-xs mt-1 ml-1">{errors.firstName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-bg-card transition-colors ${
              errors.email ? "border-danger" : "border-[#1a1a1e] focus-within:border-gold"
            }`}
          >
            <Mail size={18} className="text-gold shrink-0" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-muted"
            />
          </div>
          {errors.email && (
            <p className="text-danger text-xs mt-1 ml-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-bg-card transition-colors ${
              errors.phone ? "border-danger" : "border-[#1a1a1e] focus-within:border-gold"
            }`}
          >
            <Phone size={18} className="text-gold shrink-0" />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-muted"
            />
          </div>
          {errors.phone && (
            <p className="text-danger text-xs mt-1 ml-1">{errors.phone}</p>
          )}
        </div>

        {/* GDPR Consent */}
        <label className="flex items-start gap-3 cursor-pointer mt-1">
          <button
            type="button"
            onClick={() => setConsent(!consent)}
            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
              consent ? "bg-gold border-gold" : "border-[#1a1a1e] bg-transparent"
            } ${errors.consent ? "border-danger" : ""}`}
          >
            {consent && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="#0A0A0A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <span className="text-xs text-muted leading-relaxed">
            I consent to receiving my personalised health report and occasional wellness
            communications. Your data is processed in accordance with GDPR and our{" "}
            <span className="text-gold underline">Privacy Policy</span>.
          </span>
        </label>
        {errors.consent && (
          <p className="text-danger text-xs ml-8 -mt-2">{errors.consent}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl font-heading font-bold text-sm tracking-wider uppercase gold-gradient text-bg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            "Unlock My Report →"
          )}
        </button>
      </form>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-[#1a1a1e]">
        <div className="flex items-center gap-1.5">
          <Lock size={13} className="text-gold" />
          <span className="text-[10px] text-muted">256-bit encrypted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield size={13} className="text-gold" />
          <span className="text-[10px] text-muted">GDPR compliant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Award size={13} className="text-gold" />
          <span className="text-[10px] text-muted">Harley Street certified</span>
        </div>
      </div>
    </div>
  );
}
