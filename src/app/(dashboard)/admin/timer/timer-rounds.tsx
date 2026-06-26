"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Teko, Barlow_Semi_Condensed } from "next/font/google";

const teko = Teko({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const barlow = Barlow_Semi_Condensed({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

// ── Types ──

interface RankedStudent {
  id: string;
  name: string;
  photoUrl: string | null;
  presences: number;
}

type Phase = "idle" | "countdown" | "work" | "rest" | "paused" | "finished";

// ── Config options ──

const TIME_OPTS = [1, 3, 5]; // minutes
const ROUNDS_OPTS: (number | null)[] = [null, 2, 3, 4, 5]; // null = single round
const REST_OPTS = [15, 30, 60]; // seconds

// ── Colors ──

const PHASE_COLORS: Record<Phase, string> = {
  idle: "#6b6b73",
  countdown: "#2fe07a",
  work: "#ff3030",
  rest: "#ffcf2d",
  paused: "#9a9aa2",
  finished: "#2fe07a",
};

const PHASE_GLOWS: Record<Phase, string> = {
  idle: "rgba(150,150,162,0.28)",
  countdown: "rgba(47,224,122,0.62)",
  work: "rgba(255,55,55,0.72)",
  rest: "rgba(255,207,45,0.62)",
  paused: "rgba(150,150,162,0.28)",
  finished: "rgba(47,224,122,0.62)",
};

const PHASE_LABELS: Record<Phase, string> = {
  idle: "PRONTO",
  countdown: "PRONTO",
  work: "LUTA",
  rest: "DESCANSO",
  paused: "PAUSADO",
  finished: "FIM",
};

const MONTHS = ["JANEIRO","FEVEREIRO","MARCO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];

// ── Audio ──

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new AudioContext();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

function playBeeps(pattern: { freq: number; duration: number; gap: number }[]): number {
  try {
    const ctx = getAudioContext();
    let t = ctx.currentTime + 0.05;
    for (const { freq, duration, gap } of pattern) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.value = 0.5;
      osc.start(t);
      osc.stop(t + duration);
      t += duration + gap;
    }
    return t - ctx.currentTime;
  } catch {
    return 0;
  }
}

const START_BEEPS = [
  { freq: 660, duration: 0.15, gap: 0.85 },
  { freq: 660, duration: 0.15, gap: 0.85 },
  { freq: 660, duration: 0.15, gap: 0.85 },
  { freq: 880, duration: 0.5, gap: 0 },
];

const FINISH_BEEPS = [{ freq: 880, duration: 1, gap: 0 }];
const ROUND_END_BEEP = [{ freq: 660, duration: 0.3, gap: 0 }];
const TICK_BEEP = [{ freq: 700, duration: 0.09, gap: 0 }];

// ── Helpers ──

function fmt(sec: number): string {
  sec = Math.max(0, sec);
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
}

// ── Medal badges for ranking ──

const MEDAL_STYLES = [
  { bg: "#e8b923", fg: "#1a1400", bd: "#e8b923" },
  { bg: "#c5cad1", fg: "#15171a", bd: "#c5cad1" },
  { bg: "#c87f3a", fg: "#1a0f00", bd: "#c87f3a" },
];

// ── Component ──

interface Props {
  onToggleMode: () => void;
}

export default function TimerRounds({ onToggleMode }: Props) {
  const router = useRouter();

  // Config
  const [configSeconds, setConfigSeconds] = useState(0); // incremental, starts at 0
  const [roundsIdx, setRoundsIdx] = useState(0); // default null (single)
  const [restIdx, setRestIdx] = useState(1); // default 30s
  const [sel, setSel] = useState(0); // keyboard: 0=tempo, 1=rounds, 2=descanso

  // Timer state
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(1);

  // Ranking
  const [ranking, setRanking] = useState<RankedStudent[]>([]);
  const [rankingMonth, setRankingMonth] = useState("");

  // Refs
  const endTimeRef = useRef(0);
  const resumePhaseRef = useRef<"work" | "rest">("work");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTickBeepRef = useRef(-1);
  const phaseRef = useRef<Phase>("idle");
  const currentRoundRef = useRef(1);
  const totalRoundsRef = useRef(1);
  const remainingRef = useRef(0);
  const configSecondsRef = useRef(0);
  const roundsIdxRef = useRef(0);
  const restIdxRef = useRef(1);

  // Keep refs in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
  useEffect(() => { totalRoundsRef.current = totalRounds; }, [totalRounds]);
  useEffect(() => { remainingRef.current = remaining; }, [remaining]);
  useEffect(() => { configSecondsRef.current = configSeconds; }, [configSeconds]);
  useEffect(() => { roundsIdxRef.current = roundsIdx; }, [roundsIdx]);
  useEffect(() => { restIdxRef.current = restIdx; }, [restIdx]);

  const roundSec = useCallback(() => configSecondsRef.current, []);
  const restSec = useCallback(() => REST_OPTS[restIdxRef.current], []);

  // ── Hide sidebar ──
  useEffect(() => {
    const sidebar = document.querySelector("aside") as HTMLElement | null;
    const topbar = document.querySelector("div.fixed.top-0") as HTMLElement | null;
    const main = document.querySelector("main") as HTMLElement | null;
    if (sidebar) sidebar.style.display = "none";
    if (topbar) topbar.style.display = "none";
    if (main) { main.style.padding = "0"; main.style.paddingTop = "0"; }
    return () => {
      if (sidebar) sidebar.style.display = "";
      if (topbar) topbar.style.display = "";
      if (main) { main.style.padding = ""; main.style.paddingTop = ""; }
    };
  }, []);

  // ── Fetch ranking ──
  useEffect(() => {
    fetch("/api/ranking")
      .then((r) => r.json())
      .then((data) => {
        setRanking(Array.isArray(data?.ranked) ? data.ranked : Array.isArray(data) ? data : []);
        if (data?.monthLabel) setRankingMonth(data.monthLabel);
      });
  }, []);

  // ── Timer logic ──

  const clearTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const nextPhaseRef = useRef<() => void>(() => {});

  const tick = useCallback(() => {
    const p = phaseRef.current;
    if (p !== "work" && p !== "rest") return;
    const rem = Math.ceil((endTimeRef.current - Date.now()) / 1000);
    if (rem <= 0) {
      endTimeRef.current = Date.now() + 9e9; // guard re-trigger
      nextPhaseRef.current();
      return;
    }
    if (rem !== remainingRef.current) {
      setRemaining(rem);
      remainingRef.current = rem;
      if (rem <= 3 && rem >= 1 && rem !== lastTickBeepRef.current) {
        lastTickBeepRef.current = rem;
        playBeeps(TICK_BEEP);
      }
    }
  }, []);

  const startCountdownThenWork = useCallback((round: number, total: number) => {
    clearTimer();
    setPhase("countdown");
    phaseRef.current = "countdown";
    setCurrentRound(round);
    currentRoundRef.current = round;
    setTotalRounds(total);
    totalRoundsRef.current = total;
    const dur = roundSec();
    setRemaining(dur);
    remainingRef.current = dur;
    lastTickBeepRef.current = -1;

    const delay = playBeeps(START_BEEPS);
    countdownTimeoutRef.current = setTimeout(() => {
      endTimeRef.current = Date.now() + dur * 1000;
      setPhase("work");
      phaseRef.current = "work";
      intervalRef.current = setInterval(tick, 100);
    }, delay * 1000);
  }, [clearTimer, roundSec, tick]);

  // Wire nextPhase
  useEffect(() => {
    nextPhaseRef.current = () => {
      const p = phaseRef.current;
      const round = currentRoundRef.current;
      const total = totalRoundsRef.current;

      if (p === "work") {
        if (round < total) {
          // Round ended, start rest
          playBeeps(ROUND_END_BEEP);
          const rest = restSec();
          endTimeRef.current = Date.now() + rest * 1000;
          setPhase("rest");
          phaseRef.current = "rest";
          setRemaining(rest);
          remainingRef.current = rest;
          lastTickBeepRef.current = -1;
        } else {
          // Last round, finished
          clearTimer();
          playBeeps(FINISH_BEEPS);
          setPhase("finished");
          phaseRef.current = "finished";
          setRemaining(0);
          remainingRef.current = 0;
        }
      } else if (p === "rest") {
        // Rest ended, countdown to next round
        clearTimer();
        playBeeps(ROUND_END_BEEP);
        startCountdownThenWork(round + 1, total);
      }
    };
  }, [clearTimer, restSec, startCountdownThenWork]);

  // ── Actions ──

  function start() {
    if (configSeconds <= 0) return;
    const rounds = ROUNDS_OPTS[roundsIdx];
    const total = rounds == null ? 1 : rounds;
    resumePhaseRef.current = "work";
    startCountdownThenWork(1, total);
  }

  function pause() {
    resumePhaseRef.current = phaseRef.current as "work" | "rest";
    clearTimer();
    if (countdownTimeoutRef.current) { clearTimeout(countdownTimeoutRef.current); countdownTimeoutRef.current = null; }
    setPhase("paused");
    phaseRef.current = "paused";
  }

  function resume() {
    const rem = remainingRef.current;
    const rp = resumePhaseRef.current;
    endTimeRef.current = Date.now() + rem * 1000;
    lastTickBeepRef.current = -1;
    setPhase(rp);
    phaseRef.current = rp;
    intervalRef.current = setInterval(tick, 100);
  }

  function reset() {
    clearTimer();
    if (countdownTimeoutRef.current) { clearTimeout(countdownTimeoutRef.current); countdownTimeoutRef.current = null; }
    setPhase("idle");
    phaseRef.current = "idle";
    setCurrentRound(1);
    currentRoundRef.current = 1;
    setRemaining(configSecondsRef.current);
    remainingRef.current = configSecondsRef.current;
  }

  // ── Keyboard (TV remote) ──

  function addTime(minutes: number) {
    setConfigSeconds((prev) => {
      const next = prev + minutes * 60;
      setRemaining(next);
      remainingRef.current = next;
      configSecondsRef.current = next;
      return next;
    });
  }

  function clearTime() {
    setConfigSeconds(0);
    configSecondsRef.current = 0;
    setRemaining(0);
    remainingRef.current = 0;
  }

  function adjust(dir: number) {
    if (sel === 0) {
      // Add or subtract 1 minute with arrow keys
      setConfigSeconds((prev) => {
        const next = Math.max(60, prev + dir * 60);
        setRemaining(next);
        remainingRef.current = next;
        configSecondsRef.current = next;
        return next;
      });
    } else if (sel === 1) {
      const n = (roundsIdx + dir + ROUNDS_OPTS.length) % ROUNDS_OPTS.length;
      setRoundsIdx(n);
      roundsIdxRef.current = n;
    } else {
      const n = (restIdx + dir + REST_OPTS.length) % REST_OPTS.length;
      setRestIdx(n);
      restIdxRef.current = n;
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Enter"," "].includes(k)) e.preventDefault();
      const ok = k === "Enter" || k === " ";
      const p = phaseRef.current;

      if (p === "idle") {
        if (k === "ArrowUp") setSel((s) => (s + 2) % 3);
        else if (k === "ArrowDown") setSel((s) => (s + 1) % 3);
        else if (k === "ArrowLeft") adjust(-1);
        else if (k === "ArrowRight") adjust(1);
        else if (ok) start();
      } else if (p === "work" || p === "rest") {
        if (ok) pause();
      } else if (p === "paused") {
        if (ok) resume();
        else if (k === "ArrowDown" || k === "ArrowUp") reset();
      } else if (p === "finished") {
        if (ok) reset();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configSeconds, roundsIdx, restIdx, sel]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownTimeoutRef.current) clearTimeout(countdownTimeoutRef.current);
    };
  }, []);

  // ── Computed values ──

  const phaseColor = PHASE_COLORS[phase];
  const glow = PHASE_GLOWS[phase];

  const cfgRounds = ROUNDS_OPTS[roundsIdx];
  const displayTotal = phase === "idle" ? (cfgRounds == null ? 1 : cfgRounds) : totalRounds;
  const effectivePhase = phase === "paused" ? resumePhaseRef.current : phase;

  // Round text
  let roundText: string;
  if (phase === "idle") {
    roundText = displayTotal <= 1 ? "ROUND UNICO" : `${displayTotal} ROUNDS`;
  } else if (displayTotal <= 1) {
    roundText = "ROUND UNICO";
  } else if (effectivePhase === "rest") {
    roundText = `PROXIMO: ROUND ${currentRound + 1} / ${displayTotal}`;
  } else {
    roundText = `ROUND ${currentRound} / ${displayTotal}`;
  }

  // Dots
  const dots: string[] = [];
  if (displayTotal > 1) {
    const completed = effectivePhase === "rest" ? currentRound
      : phase === "finished" ? displayTotal
      : currentRound - 1;
    const activeIdx = effectivePhase === "rest" ? currentRound + 1 : currentRound;
    for (let r = 1; r <= displayTotal; r++) {
      if (phase === "finished") dots.push(PHASE_COLORS.finished);
      else if (r <= completed) dots.push("#e2e2e8");
      else if (r === activeIdx && phase !== "idle") dots.push(phaseColor);
      else dots.push("#2b2b32");
    }
  }

  // Progress bar
  let progressPct = 0;
  if (phase === "finished") {
    progressPct = 100;
  } else if (phase === "work" || phase === "rest" || phase === "paused") {
    const base = phase === "paused" ? resumePhaseRef.current : phase;
    const total = base === "work" ? roundSec() : restSec();
    progressPct = total ? Math.min(100, Math.max(0, (1 - remaining / total) * 100)) : 0;
  }

  // Config
  const restActive = cfgRounds != null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden ${barlow.className}`} style={{ background: "#0a0a0c", color: "#fff" }}>
      {/* Toggle mode (only idle) */}
      {phase === "idle" && (
        <button
          onClick={onToggleMode}
          className="absolute top-3 left-3 z-10 hover:opacity-80 transition-opacity text-xs font-medium tracking-wide"
          style={{ color: "#54545c" }}
        >
          &larr; Modo Classico
        </button>
      )}

      {/* Close button */}
      <button
        onClick={() => router.push("/admin")}
        className="absolute top-3 right-3 z-10 hover:opacity-80 transition-opacity"
        style={{ color: "#54545c" }}
      >
        <X size={24} />
      </button>

      <main className="flex-1 flex flex-col items-center justify-center w-full" style={{ gap: "2.4vh", padding: "5vh 2.5vw" }}>
        {/* Phase header: label + dots + round text */}
        <div className="flex flex-col items-center w-full" style={{ gap: "1.3vh" }}>
          <div className="flex items-center justify-center" style={{ gap: "1.6vw" }}>
            <span
              className="font-semibold"
              style={{ letterSpacing: "0.32em", fontSize: "clamp(1.1rem, 2.2vw, 2.1rem)", color: phaseColor }}
            >
              {PHASE_LABELS[phase]}
            </span>

            {dots.length > 0 && (
              <div className="flex items-center" style={{ gap: "0.8vw" }}>
                {dots.map((color, i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: "clamp(14px, 1.4vw, 20px)",
                      height: "clamp(14px, 1.4vw, 20px)",
                      background: color,
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>
            )}

            <span
              className="font-medium whitespace-nowrap"
              style={{ letterSpacing: "0.2em", fontSize: "clamp(1rem, 1.9vw, 1.7rem)", color: "#7a7a82" }}
            >
              {roundText}
            </span>
          </div>
        </div>

        {/* Timer display + progress bar */}
        <div className="flex flex-col items-center w-full" style={{ gap: "1.3vh" }}>
          <div
            className={`font-semibold ${teko.className}`}
            style={{
              lineHeight: 0.78,
              fontSize: phase === "idle" ? "clamp(6rem, min(30vw, 30vh), 32rem)" : "clamp(7rem, min(40vw, 40vh), 48rem)",
              color: phaseColor,
              fontVariantNumeric: "tabular-nums",
              textShadow: `0 0 4px ${glow}, 0 0 18px ${glow}, 0 0 48px ${glow}, 0 0 90px ${glow}`,
            }}
          >
            {fmt(remaining)}
          </div>

          {/* Progress bar */}
          <div
            className="overflow-hidden"
            style={{ width: "min(58vw, 880px)", height: 9, background: "#1a1a20", borderRadius: 99 }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct.toFixed(1)}%`,
                background: phaseColor,
                borderRadius: 99,
                transition: "width 0.15s linear",
              }}
            />
          </div>

          {/* Ranking strip (shown when not idle) */}
          {phase !== "idle" && ranking.length > 0 && (
            <div className="w-full flex flex-col items-center" style={{ gap: "0.8vh", marginTop: "0.4vh" }}>
              <div className="font-semibold" style={{ letterSpacing: "0.22em", fontSize: "clamp(0.8rem, 1.2vw, 1.05rem)", color: "#54545c" }}>
                RANKING DO MES · <span style={{ color: "#ff3030" }}>{rankingMonth || MONTHS[new Date().getMonth()]}</span>
              </div>
              <div className="w-full flex items-stretch" style={{ gap: "0.6vw" }}>
                {ranking.map((st, i) => {
                  const medal = MEDAL_STYLES[i];
                  return (
                    <div
                      key={st.id}
                      className="flex-1 min-w-0 flex items-center"
                      style={{ gap: "0.55vw", padding: "0.7vh 0.6vw", background: "#101013", border: "1px solid #1c1c22", borderRadius: 10 }}
                    >
                      <div
                        className={`flex-shrink-0 rounded-full flex items-center justify-center font-semibold ${teko.className}`}
                        style={{
                          width: "clamp(26px, 1.9vw, 36px)",
                          height: "clamp(26px, 1.9vw, 36px)",
                          fontSize: "clamp(1rem, 1.4vw, 1.3rem)",
                          background: medal?.bg ?? "transparent",
                          color: medal?.fg ?? "#7a7a82",
                          border: `2px solid ${medal?.bd ?? "#2c2c34"}`,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col" style={{ lineHeight: 1.05 }}>
                        <span
                          className="font-semibold truncate"
                          style={{ fontSize: "clamp(0.78rem, 1.05vw, 1.05rem)", color: "#ededf2" }}
                        >
                          {st.name}
                        </span>
                        <span className="flex items-baseline" style={{ gap: "0.2vw" }}>
                          <span className={`font-semibold ${teko.className}`} style={{ fontSize: "clamp(1.1rem, 1.5vw, 1.4rem)", color: "#fff" }}>
                            {st.presences}
                          </span>
                          <span style={{ fontSize: "clamp(0.55rem, 0.8vw, 0.72rem)", color: "#5a5a62" }}>pres.</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Config panel (idle only) */}
          {phase === "idle" && (
            <div className="w-full flex flex-col items-center" style={{ maxWidth: 820, gap: "1.1vh", marginTop: "0.4vh" }}>
              {/* Tempo do round */}
              <ConfigRow
                label="TEMPO DO ROUND"
                hint={configSeconds > 0 ? `${Math.floor(configSeconds / 60)}min ${configSeconds % 60 ? (configSeconds % 60) + "s" : ""} configurado` : "clique para adicionar tempo"}
                selected={sel === 0}
                dimmed={false}
              >
                {TIME_OPTS.map((o) => (
                  <Chip
                    key={o}
                    label={`+${o} MIN`}
                    isSelected={false}
                    onClick={() => addTime(o)}
                  />
                ))}
                <Chip
                  label="LIMPAR"
                  isSelected={false}
                  onClick={clearTime}
                  variant="ghost"
                />
              </ConfigRow>

              {/* Rounds */}
              <ConfigRow
                label="ROUNDS"
                hint="em branco = 1 round, sem descanso"
                selected={sel === 1}
                dimmed={false}
              >
                {ROUNDS_OPTS.map((o, i) => (
                  <Chip
                    key={i}
                    label={o == null ? "\u2014" : String(o)}
                    isSelected={i === roundsIdx}
                    onClick={() => { setRoundsIdx(i); roundsIdxRef.current = i; }}
                  />
                ))}
              </ConfigRow>

              {/* Descanso */}
              <ConfigRow
                label="DESCANSO"
                hint={restActive ? "pausa entre os rounds" : "sem descanso neste modo"}
                selected={sel === 2}
                dimmed={!restActive}
              >
                {REST_OPTS.map((o, i) => (
                  <Chip
                    key={o}
                    label={`${o}s`}
                    isSelected={i === restIdx}
                    onClick={() => { setRestIdx(i); restIdxRef.current = i; }}
                  />
                ))}
              </ConfigRow>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center items-center" style={{ gap: "1.4vw", minHeight: "6.5vh" }}>
          {phase === "idle" && (
            <ActionBtn
              label="INICIAR"
              bg="#2fe07a"
              fg="#06140b"
              glow="rgba(47,224,122,0.45)"
              onClick={start}
            />
          )}

          {(phase === "work" || phase === "rest" || phase === "countdown") && (
            <ActionBtn
              label="PAUSAR"
              bg="#ffcf2d"
              fg="#1a1400"
              glow="rgba(255,207,45,0.4)"
              onClick={pause}
            />
          )}

          {phase === "paused" && (
            <>
              <ActionBtn
                label="RETOMAR"
                bg="#2fe07a"
                fg="#06140b"
                glow="rgba(47,224,122,0.45)"
                onClick={resume}
              />
              <ActionBtn
                label="REINICIAR"
                bg="transparent"
                fg="#d2d2da"
                border="#3a3a44"
                onClick={reset}
              />
            </>
          )}

          {phase === "finished" && (
            <ActionBtn
              label="NOVO TREINO"
              bg="#2fe07a"
              fg="#06140b"
              glow="rgba(47,224,122,0.45)"
              onClick={reset}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ──

function ConfigRow({ label, hint, selected, dimmed, children }: {
  label: string;
  hint: string;
  selected: boolean;
  dimmed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between w-full"
      style={{
        gap: "2vw",
        padding: "0.9vh 1.5vw",
        borderRadius: 13,
        border: `1px solid ${selected ? "#ff3030" : "#1c1c22"}`,
        background: "#0e0e12",
        opacity: dimmed ? 0.4 : 1,
        transition: "border-color 0.15s",
      }}
    >
      <div className="flex flex-col" style={{ gap: 1 }}>
        <span className="font-semibold" style={{ letterSpacing: "0.16em", fontSize: "clamp(0.85rem, 1.35vw, 1.2rem)", color: "#d2d2da", whiteSpace: "nowrap" }}>
          {label}
        </span>
        <span style={{ fontSize: "clamp(0.72rem, 1.05vw, 0.95rem)", color: "#5a5a62" }}>
          {hint}
        </span>
      </div>
      <div className="flex" style={{ gap: "0.6vw" }}>
        {children}
      </div>
    </div>
  );
}

function Chip({ label, isSelected, onClick, variant }: { label: string; isSelected: boolean; onClick: () => void; variant?: "ghost" }) {
  const isGhost = variant === "ghost";
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer select-none text-center ${teko.className}`}
      style={{
        minWidth: "3.6vw",
        padding: "0.55vh 1.3vw",
        borderRadius: 10,
        fontWeight: 500,
        fontSize: "clamp(1.4rem, 2.1vw, 2rem)",
        lineHeight: 1.15,
        background: isGhost ? "transparent" : isSelected ? "#ff3030" : "#16161b",
        color: isGhost ? "#5a5a62" : isSelected ? "#0a0a0c" : "#9a9aa2",
        border: `2px solid ${isGhost ? "#2a2a32" : isSelected ? "#ff3030" : "#26262c"}`,
        transition: "all 0.12s",
      }}
    >
      {label}
    </div>
  );
}

function ActionBtn({ label, bg, fg, glow, border, onClick }: {
  label: string;
  bg: string;
  fg: string;
  glow?: string;
  border?: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer select-none font-bold"
      style={{
        padding: "1.4vh 3.6vw",
        borderRadius: 13,
        letterSpacing: "0.16em",
        fontSize: "clamp(1.2rem, 2.1vw, 1.9rem)",
        background: bg,
        color: fg,
        border: `2px solid ${border || bg}`,
        boxShadow: glow ? `0 0 26px ${glow}` : "none",
      }}
    >
      {label}
    </div>
  );
}
