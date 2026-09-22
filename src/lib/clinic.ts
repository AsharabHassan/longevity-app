/**
 * Every clinic fact the app displays, in one place, so nothing unverifiable is
 * hardcoded in a component. Leave a value empty/null and the UI omits it —
 * never fill these with placeholders.
 */

export interface Testimonial {
  name: string;
  /** Where it was published, e.g. "Google review". */
  source: string;
  text: string;
}

export type ClinicLocation = "London" | "Glasgow";

interface ClinicConfig {
  brand: string;
  phone: string;
  email: string;
  bookingUrl: string;
  /** Public privacy policy. The consent line links to it when set. */
  privacyUrl: string;
  locations: Record<ClinicLocation, { address: string; regulator: string }>;
  /**
   * Who takes the free consultation. Fill `name` and `gmcNumber` only for the
   * GMC-registered doctor who actually takes these calls, and point `bookingUrl`
   * at THEIR calendar: the report then puts them front and centre. While `name`
   * is empty the report says "one of our wellness consultants", matching the
   * current calendar, and makes no doctor claim. `minutes` must match the calendar.
   */
  consultation: {
    minutes: number;
    /** e.g. "Dr Jane Smith" */
    name: string;
    /** Used on buttons where the full name is too long, e.g. "Dr Smith" */
    shortName: string;
    /** e.g. "Medical Director" */
    role: string;
    gmcNumber: string;
    /** e.g. "MBBS, MRCGP" */
    credentials: string;
    /** Path under /public, e.g. "/medical-director.jpg" */
    photo: string;
    /** One or two factual sentences: training, years in practice, clinical interests. */
    bio: string;
    /** Optional short introduction video, e.g. "/videos/dr-ahmad-intro.mp4". Hidden while empty. */
    video: string;
  };
  /** From the live Google Business Profile, e.g. { rating: 4.9, count: 212 }. */
  googleReviews: { rating: number; count: number } | null;
  /**
   * Genuine, consented reviews only, quoted verbatim, and only ones that
   * describe the experience (staff, explanation, clinic) — not treatment
   * outcomes. CAP Code 3.45-3.47 and 12.1 apply.
   */
  testimonials: Testimonial[];
}

export const CLINIC: ClinicConfig = {
  brand: "Harley Street Medical Wellness",
  phone: "020 4628 3137",
  email: "hello@harleystreetwellness.co.uk",
  bookingUrl: "https://link.harleystreetmedicalwellness.co.uk/widget/bookings/wellness-consultant-1",
  privacyUrl: "",
  locations: {
    London: {
      address: "1-5 Portpool Lane, London EC1N 7UU",
      regulator: "Care Quality Commission (CQC)",
    },
    Glasgow: {
      address: "Suite 5b, Ingram House, 227 Ingram Street, Glasgow G1 1DA",
      regulator: "Healthcare Improvement Scotland (HIS)",
    },
  },
  consultation: {
    minutes: 10,
    name: "Dr Muhammad Tauqir Ahmad",
    shortName: "Dr Ahmad",
    role: "Medical Director",
    gmcNumber: "",
    credentials: "GMC registered",
    photo: "/dr-ahmad.webp",
    // From the team section of harleystreetmedicalwellness.co.uk/london
    bio: "Founder of the clinic, with extensive experience in aesthetic and regenerative medicine.",
    video: "",
  },
  googleReviews: null,
  testimonials: [],
};

export function consultationHost(): string {
  const { name, role } = CLINIC.consultation;
  return name ? `${name}, our ${role}` : "one of our wellness consultants";
}

/** Short label for buttons: "Book with Dr Smith" or "Book My Free Consultation". */
export function bookingLabel(): string {
  const { name, shortName } = CLINIC.consultation;
  return name ? `Book with ${shortName || name}` : "Book My Free Consultation";
}
