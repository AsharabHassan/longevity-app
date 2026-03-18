import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import TrustBar from "@/components/landing/TrustBar";

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
      </main>
    </div>
  );
}
