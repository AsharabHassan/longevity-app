"use client";

import ScanFlow from "@/components/quiz/ScanFlow";

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-bg flex items-start justify-center px-4">
      <div className="w-full max-w-[520px]">
        <ScanFlow />
      </div>
    </main>
  );
}
