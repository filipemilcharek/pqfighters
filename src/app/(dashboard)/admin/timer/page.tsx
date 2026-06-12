"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, Play, Pause, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface RankedStudent {
  id: string;
  name: string;
  photoUrl: string | null;
  presences: number;
}

const ADD_OPTIONS = [
  { label: "+1", seconds: 60 },
  { label: "+3", seconds: 180 },
  { label: "+5", seconds: 300 },
];

function medalEmoji(position: number): string | null {
  switch (position) {
    case 1: return "\u{1F947}";
    case 2: return "\u{1F948}";
    case 3: return "\u{1F949}";
    default: return null;
  }
}

function badgeClass(position: number): string {
  switch (position) {
    case 1: return "bg-yellow-500 text-content-primary";
    case 2: return "bg-gray-300 text-content-primary";
    case 3: return "bg-amber-700 text-content-primary";
    default: return "bg-white text-content-primary";
  }
}

export default function TimerPage() {
  const router = useRouter();
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [blinkVisible, setBlinkVisible] = useState(true);
  const [ranking, setRanking] = useState<RankedStudent[]>([]);
  const [rankingMonth, setRankingMonth] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastConfigRef = useRef(0);

  // Hide sidebar
  useEffect(() => {
    const sidebar = document.querySelector("aside") as HTMLElement | null;
    const topbar = document.querySelector("div.fixed.top-0") as HTMLElement | null;
    const main = document.querySelector("main") as HTMLElement | null;
    if (sidebar) sidebar.style.display = "none";
    if (topbar) topbar.style.display = "none";
    if (main) {
      main.style.padding = "0";
      main.style.paddingTop = "0";
    }
    return () => {
      if (sidebar) sidebar.style.display = "";
      if (topbar) topbar.style.display = "";
      if (main) {
        main.style.padding = "";
        main.style.paddingTop = "";
      }
    };
  }, []);

  // Fetch ranking
  useEffect(() => {
    fetch("/api/ranking")
      .then((r) => r.json())
      .then((data) => {
        setRanking(Array.isArray(data?.ranked) ? data.ranked : Array.isArray(data) ? data : []);
        if (data?.monthLabel) setRankingMonth(data.monthLabel);
      });
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const startBlink = useCallback(() => {
    if (blinkRef.current) clearInterval(blinkRef.current);
    setBlinkVisible(true);
    blinkRef.current = setInterval(() => {
      setBlinkVisible((v) => !v);
    }, 500);
  }, []);

  const stopBlink = useCallback(() => {
    if (blinkRef.current) {
      clearInterval(blinkRef.current);
      blinkRef.current = null;
    }
    setBlinkVisible(true);
  }, []);

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 1) {
        stop();
        setFinished(true);
        startBlink();
        try {
          const ctx = new AudioContext();
          const totalBeeps = 10;
          for (let i = 0; i < totalBeeps; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "square";
            osc.frequency.value = i % 2 === 0 ? 880 : 660;
            gain.gain.value = 0.5;
            const start = ctx.currentTime + i * 0.3;
            osc.start(start);
            osc.stop(start + 0.2);
          }
        } catch {}
        return 0;
      }
      return prev - 1;
    });
  }, [stop, startBlink]);

  function addTime(seconds: number) {
    setFinished(false);
    stopBlink();
    setRemaining((prev) => {
      const next = prev + seconds;
      lastConfigRef.current = next;
      return next;
    });
  }

  function togglePlay() {
    if (running) {
      stop();
      return;
    }
    stopBlink();
    // If finished or at 0, restart with last configured time
    if (remaining === 0 && lastConfigRef.current > 0) {
      setRemaining(lastConfigRef.current);
      setFinished(false);
      intervalRef.current = setInterval(tick, 1000);
      setRunning(true);
      return;
    }
    if (remaining === 0) return;
    setFinished(false);
    intervalRef.current = setInterval(tick, 1000);
    setRunning(true);
  }

  function reset() {
    stop();
    stopBlink();
    setRemaining(0);
    setFinished(false);
    lastConfigRef.current = 0;
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (blinkRef.current) clearInterval(blinkRef.current);
    };
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Colors: green when idle/finished, red when running
  const hasTime = remaining > 0 || lastConfigRef.current > 0 || finished;
  const timerColor = running ? "text-red-500" : hasTime ? "text-emerald-500" : "text-content-muted";
  const glowColor = running
    ? "0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.25)"
    : hasTime
    ? "0 0 40px rgba(16,185,129,0.5), 0 0 80px rgba(16,185,129,0.25)"
    : "none";

  const canPlay = remaining > 0 || lastConfigRef.current > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Close button */}
      <button
        onClick={() => router.push("/admin")}
        className="absolute top-3 right-3 z-10 text-content-muted hover:text-content-secondary transition-colors"
      >
        <X size={24} />
      </button>

      {/* Timer display */}
      <div
        className={`font-mono font-bold tracking-wider ${timerColor}`}
        style={{
          fontSize: "clamp(8rem, 28vw, 22rem)",
          lineHeight: 1,
          textShadow: glowColor,
          opacity: finished && !blinkVisible ? 0 : 1,
        }}
      >
        {display}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
        {ADD_OPTIONS.map((opt) => (
          <button
            key={opt.seconds}
            onClick={() => addTime(opt.seconds)}
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-base sm:text-lg font-bold bg-surface-secondary text-content-secondary border-2 border-border hover:border-border hover:text-content-primary transition-all"
          >
            {opt.label}
          </button>
        ))}

        <div className="w-px h-6 sm:h-8 bg-surface-tertiary" />

        <button
          onClick={togglePlay}
          disabled={!canPlay}
          className={`flex items-center px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all ${
            !canPlay
              ? "bg-surface-secondary text-content-muted border-2 border-border cursor-not-allowed"
              : running
              ? "bg-surface-tertiary text-content-secondary border-2 border-border hover:bg-surface-tertiary"
              : "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 hover:bg-emerald-500/30"
          }`}
        >
          {running ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <button
          onClick={reset}
          className="flex items-center px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold bg-surface-secondary text-content-secondary border-2 border-border hover:text-content-primary hover:border-border transition-all"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Ranking — single row of boxes */}
      {ranking.length > 0 && (
        <div className="mt-6 sm:mt-10">
          {rankingMonth && (
            <h2 className="text-center text-lg sm:text-2xl font-bold text-content-primary uppercase tracking-wider mb-3 sm:mb-4">
              Ranking {rankingMonth}
            </h2>
          )}
        <div className="flex items-stretch gap-2 sm:gap-3 overflow-x-auto px-4 pb-2 max-w-full">
          {ranking.map((student, i) => {
            const pos = i + 1;
            const nameParts = student.name.split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
            const borderClass = pos === 1
              ? "border-yellow-500/60"
              : pos === 2
              ? "border-gray-400/60"
              : pos === 3
              ? "border-amber-700/60"
              : "border-border";
            return (
              <div
                key={student.id}
                className={`shrink-0 flex flex-col items-center justify-between rounded-lg border-2 bg-surface-secondary/80 px-3 sm:px-4 py-2 sm:py-3 w-[72px] sm:w-[88px] ${borderClass}`}
              >
                {medalEmoji(pos) ? (
                  <span className="text-lg sm:text-xl leading-none">{medalEmoji(pos)}</span>
                ) : (
                  <div className={`text-xs sm:text-sm font-bold ${badgeClass(pos)} w-6 h-6 rounded-full flex items-center justify-center`}>
                    {pos}
                  </div>
                )}
                <div className="mt-1.5 text-center min-w-0 w-full">
                  <p className="text-[11px] sm:text-xs font-bold text-content-primary truncate">{firstName}</p>
                  {lastName && (
                    <p className="text-[10px] sm:text-[11px] text-content-secondary truncate">{lastName}</p>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] sm:text-xs text-content-muted font-semibold">
                  {student.presences} <span className="hidden sm:inline">pres.</span>
                </p>
              </div>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
}
