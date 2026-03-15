import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import TrustBar from "@/components/landing/TrustBar";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg">
      {/* Subtle radial gold glow behind hero */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <main className="relative z-10 w-full max-w-lg">
        <Hero />
        <Features />
        <TrustBar />
      </main>
    </div>
  );
}
