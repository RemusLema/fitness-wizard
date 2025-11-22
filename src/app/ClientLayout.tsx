// src/app/ClientLayout.tsx   ← This one is the CLIENT COMPONENT
'use client';

import Confetti from "react-confetti";
import { useEffect, useState } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handler = () => setShowConfetti(true);
    window.addEventListener("fitness-success", handler);
    return () => window.removeEventListener("fitness-success", handler);
  }, []);

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={600} gravity={0.15} />}
      {children}
    </>
  );
}