"use client";

import QuizEngine from "@/components/quiz/QuizEngine";

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-bg flex items-start justify-center pt-12 pb-20">
      <div className="w-full max-w-[480px]">
        <QuizEngine />
      </div>
    </main>
  );
}
