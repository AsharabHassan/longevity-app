import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import TrustBar from "@/components/landing/TrustBar";
import Link from "next/link";
import { CLINIC } from "@/lib/clinic";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg">
      {/* Ambient gradient mesh */}
      <div className="gradient-mesh" aria-hidden="true" />

      {/* Floating glow orbs */}
      <div
        className="glow-orb"
        style={{
          width: "500px",
          height: "500px",
          top: "-10%",
          left: "10%",
          background: "rgba(212, 168, 83, 0.05)",
        }}
        aria-hidden="true"
      />
      <div
        className="glow-orb"
        style={{
          width: "400px",
          height: "400px",
          bottom: "5%",
          right: "5%",
          background: "rgba(212, 168, 83, 0.04)",
          animationDelay: "4s",
        }}
        aria-hidden="true"
      />
      <div
        className="glow-orb"
        style={{
          width: "300px",
          height: "300px",
          top: "40%",
          left: "60%",
          background: "rgba(100, 80, 200, 0.03)",
          animationDelay: "8s",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <main className="relative z-10 w-full max-w-2xl">
        <Hero />
        <Features />
        <TrustBar />
        <footer className="px-6 pb-10 text-center text-[10.5px] leading-relaxed text-muted/40">
          <p>
            The lifestyle age estimate is educational and is not a medical test or a measurement of biological age.{" "}
            <Link href="/methodology" className="underline underline-offset-2 hover:text-gold/80">
              How we work it out
            </Link>
          </p>
          <p className="mt-2">
            {CLINIC.brand} · {CLINIC.locations.London.address} · {CLINIC.locations.Glasgow.address}
          </p>
        </footer>
      </main>
    </div>
  );
}
