import { useCallback, useEffect, useRef, useState } from "react";
import { useBest } from "./useBest";

/**
 * Reflex game: bugs pop out of nine source files for thirty seconds; squash
 * as many as you can. They show for less time as the round goes on. Click or
 * tap a file, or press 1–9 (files numbered in reading order).
 */
const ROUND = 30;
const FILES = ["app.tsx", "api.ts", "auth.ts", "cart.tsx", "db.ts", "hooks.ts", "index.ts", "ui.tsx", "utils.ts"];
const more = (a: number, b: number) => a > b;

type Phase = "idle" | "playing" | "over";

export function BugSmash() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(ROUND);
  const [bug, setBug] = useState<number | null>(null);
  const [splat, setSplat] = useState<number | null>(null);
  const [record, setRecord] = useState(false);
  const [message, setMessage] = useState("");
  const { best, submit } = useBest("game:bug-smash", more);

  const startedAt = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const phaseRef = useRef<Phase>("idle");
  const bugRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  phaseRef.current = phase;
  bugRef.current = bug;

  const clear = () => window.clearTimeout(timer.current);

  // Next bug: a different file, shown for less time as the round goes on.
  const spawn = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const elapsed = (performance.now() - startedAt.current) / 1000;
    const prev = bugRef.current;
    let next = Math.floor(Math.random() * FILES.length);
    if (next === prev) next = (next + 1 + Math.floor(Math.random() * (FILES.length - 1))) % FILES.length;
    setBug(next);
    const showFor = Math.max(480, 1100 - elapsed * 20);
    clear();
    timer.current = window.setTimeout(() => {
      setBug(null);
      timer.current = window.setTimeout(spawn, 160 + Math.random() * 260);
    }, showFor);
  }, []);

  const start = () => {
    clear();
    scoreRef.current = 0;
    setScore(0);
    setLeft(ROUND);
    setRecord(false);
    setSplat(null);
    setBug(null);
    startedAt.current = performance.now();
    phaseRef.current = "playing";
    setPhase("playing");
    setMessage("Go. Bugs are appearing in the files.");
    timer.current = window.setTimeout(spawn, 500);
  };

  // Round clock; ends the round at zero.
  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, ROUND - Math.floor((performance.now() - startedAt.current) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        window.clearInterval(id);
        clear();
        setBug(null);
        phaseRef.current = "over";
        setPhase("over");
        const isRecord = submit(scoreRef.current);
        setRecord(isRecord);
        setMessage(`Time. ${scoreRef.current} bugs squashed${isRecord ? ", a new best" : ""}.`);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [phase, submit]);

  useEffect(() => () => clear(), []);

  const hit = useCallback(
    (i: number) => {
      if (phaseRef.current !== "playing" || bugRef.current !== i) return;
      clear();
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setBug(null);
      setSplat(i);
      window.setTimeout(() => setSplat((s) => (s === i ? null : s)), 320);
      timer.current = window.setTimeout(spawn, 140 + Math.random() * 200);
    },
    [spawn],
  );

  // Number keys 1–9 hit the files in reading order while a round runs.
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 9) hit(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, hit]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
      {/* Scoreboard */}
      <div className="flex flex-col gap-6">
        <dl className="game-stats">
          <div>
            <dt>Squashed</dt>
            <dd>{score}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{left}s</dd>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <dt>Best</dt>
            <dd>{best === null ? "—" : `${best} bugs`}</dd>
          </div>
        </dl>
        <div aria-hidden className="h-1 overflow-hidden rounded-full bg-line">
          <div className="h-full origin-left rounded-full bg-accent transition-transform duration-200 ease-linear" style={{ transform: `scaleX(${left / ROUND})` }} />
        </div>
        <p className="hidden text-muted lg:block">Bugs pop out of the files for thirty seconds. Tap them before they ship, or press 1–9.</p>
        {phase === "playing" ? (
          <p className="t-label text-subtle">Round in progress</p>
        ) : (
          <button type="button" onClick={start} className="game-button self-start">
            {phase === "idle" ? "Start round" : "Play again"}
          </button>
        )}
      </div>

      {/* Files */}
      <div className="relative">
        <ul className="mx-auto grid max-w-[46rem] grid-cols-3 gap-2 sm:gap-3" aria-label="Source files">
          {FILES.map((file, i) => {
            const live = bug === i;
            return (
              <li key={file}>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    // Pointer down, not click: fast taps count at once.
                    if (e.button === 0) hit(i);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      hit(i);
                    }
                  }}
                  aria-label={`${i + 1}, ${file}${live ? ", bug here" : ""}`}
                  aria-disabled={phase !== "playing"}
                  className={`bug-hole ${live ? "has-bug" : ""} ${splat === i ? "is-splat" : ""}`}
                >
                  <span aria-hidden className="bug-file">
                    <span className="text-subtle">{i + 1}</span> {file}
                  </span>
                  <span aria-hidden className="bug-code">
                    <span style={{ width: "62%" }} />
                    <span style={{ width: "44%" }} />
                    <span style={{ width: "71%" }} />
                  </span>
                  <span aria-hidden className="bug-critter">
                    <BugIcon />
                  </span>
                  <span aria-hidden className="bug-splat">
                    +1
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {phase !== "playing" && (
          <div className="game-overlay">
            {phase === "idle" ? (
              <>
                <p className="t-label text-accent">30 second round</p>
                <p className="mt-2 text-[clamp(2rem,1.4rem+2.4vw,3.5rem)] font-semibold leading-none tracking-[-0.04em]">
                  Squash the <span className="t-serif font-normal text-accent">bugs</span>
                </p>
                <p className="mt-3 text-muted">They get faster. Tap or press 1–9.</p>
                <button type="button" onClick={start} className="game-button mt-6">
                  Start round
                </button>
              </>
            ) : (
              <>
                <p className="t-label text-accent">{record ? "New best" : "Time"}</p>
                <p className="mt-2 text-[clamp(2rem,1.4rem+2.4vw,3.5rem)] font-semibold leading-none tracking-[-0.04em]">
                  <span className="t-serif font-normal text-accent">{score}</span> bugs squashed
                </p>
                <p className="mt-3 text-muted">{best !== null && !record ? `Best ${best} bugs` : "Production is safe, for now."}</p>
                <button type="button" onClick={start} className="game-button mt-6" autoFocus>
                  Play again
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {message}
      </p>
    </div>
  );
}

function BugIcon() {
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <ellipse cx="16" cy="18" rx="6.5" ry="8" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8.5" r="3.5" fill="currentColor" stroke="none" />
      <path d="M13.5 5.5 11 3M18.5 5.5 21 3M9.5 14 5 12M9 19H4M9.5 23.5 5 26M22.5 14 27 12M23 19h5M22.5 23.5 27 26" />
      <path d="M16 11v15" stroke="var(--bg)" strokeWidth="1.2" />
    </svg>
  );
}
