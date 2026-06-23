"use client";

import { useState, useEffect } from "react";
import TimerClassic from "./timer-classic";
import TimerRounds from "./timer-rounds";

export default function TimerPage() {
  const [mode, setMode] = useState<"classic" | "rounds">("classic");

  useEffect(() => {
    const saved = localStorage.getItem("timer-mode");
    if (saved === "classic" || saved === "rounds") setMode(saved);
  }, []);

  const toggle = () => {
    const next = mode === "classic" ? "rounds" : "classic";
    localStorage.setItem("timer-mode", next);
    setMode(next);
  };

  if (mode === "rounds") return <TimerRounds onToggleMode={toggle} />;
  return <TimerClassic onToggleMode={toggle} />;
}
