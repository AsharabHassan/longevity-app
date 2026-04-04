"use client";

import Image from "next/image";
import ScanFlow from "@/components/quiz/ScanFlow";

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center px-4">
      {/* Logo Header */}
      <div className="pt-6 pb-2">
        <Image
          src="/logo.png"
          alt="Harley Street Wellness"
          width={80}
          height={80}
          className="mx-auto"
          priority
        />
      </div>
      <div className="w-full max-w-[520px]">
        <ScanFlow />
      </div>
    </main>
  );
}
