import { useCallback, useEffect, useRef, useState } from "react";
import { skills } from "../../content/skills";
import { useBest } from "./useBest";

/**
 * Memory game with the tech stack: sixteen face-down cards, eight pairs of
 * technologies from the skills list. Flip two at a time; a pair stays open.
 * Scored by moves (fewer is better) with a running clock.
 */
const PAIRS = 8;
const POOL = skills.map((s) => s.name).filter((n) => n.length <= 12);
const fewer = (a: number, b: number) => a < b;

interface Card {
  key: number;
  name: string;
  matched: boolean;
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const deal = (): Card[] => {
  const names = shuffle(POOL).slice(0, PAIRS);
  return shuffle([...names, ...names]).map((name, key) => ({ key, name, matched: false }));
};

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function StackMatch() {
  const [cards, setCards] = useState<Card[]>(deal);
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [record, setRecord] = useState(false);
  const [message, setMessage] = useState("");
  const locked = useRef(false);
  const timers = useRef<number[]>([]);
  const { best, submit } = useBest("game:stack-match", fewer);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // The clock runs from the first flip until the last pair.
  useEffect(() => {
    if (!started || won) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [started, won]);

  const restart = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    locked.current = false;
    setCards(deal());
    setOpen([]);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setWon(false);
    setRecord(false);
    setMessage("New game. Sixteen cards face down.");
  }, []);

  const flip = (i: number) => {
    const card = cards[i];
    if (locked.current || won || card.matched || open.includes(i)) return;
    if (!started) setStarted(true);
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) {
      setMessage(`${card.name}.`);
      return;
    }

    const [a, b] = next;
    const move = moves + 1;
    setMoves(move);
    locked.current = true;
    if (cards[a].name === cards[b].name) {
      later(() => {
        const updated = cards.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c));
        setCards(updated);
        setOpen([]);
        locked.current = false;
        if (updated.every((c) => c.matched)) {
          setWon(true);
          const isRecord = submit(move);
          setRecord(isRecord);
          setMessage(`All pairs found in ${move} moves${isRecord ? ", a new best" : ""}.`);
        } else setMessage(`${card.name}. A pair!`);
      }, 380);
    } else {
      setMessage(`${card.name}. No match.`);
      later(() => {
        setOpen([]);
        locked.current = false;
      }, 850);
    }
  };

  const found = cards.filter((c) => c.matched).length / 2;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
      {/* Scoreboard */}
      <div className="flex flex-col gap-6">
        <dl className="game-stats">
          <div>
            <dt>Moves</dt>
            <dd>{moves}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{clock(seconds)}</dd>
          </div>
          <div>
            <dt>Pairs</dt>
            <dd>
              {found}/{PAIRS}
            </dd>
          </div>
          <div>
            <dt>Best</dt>
            <dd>{best === null ? "—" : `${best} moves`}</dd>
          </div>
        </dl>
        <p className="hidden text-muted lg:block">Flip two cards at a time. Match every pair of the stack in as few moves as you can.</p>
        <button type="button" onClick={restart} className="game-button self-start">
          Shuffle &amp; restart
        </button>
      </div>

      {/* Board */}
      <div className="relative">
        <ul className="mx-auto grid max-w-[46rem] grid-cols-4 gap-2 sm:gap-3" aria-label="Cards">
          {cards.map((c, i) => {
            const up = c.matched || open.includes(i);
            return (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => flip(i)}
                  aria-label={up ? `${c.name}${c.matched ? ", matched" : ""}` : `Card ${i + 1}, face down`}
                  aria-disabled={c.matched || won}
                  className={`match-card ${up ? "is-up" : ""} ${c.matched ? "is-matched" : ""}`}
                >
                  <span className="match-card-inner">
                    <span aria-hidden className="match-face match-back">
                      <span className="t-serif text-[1.6em] text-accent">&lt;/&gt;</span>
                    </span>
                    <span aria-hidden className="match-face match-front">
                      <span className="match-mono">{c.name.slice(0, 1)}</span>
                      <span className="match-name">{c.name}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {won && (
          <div className="game-overlay">
            <p className="t-label text-accent">{record ? "New best" : "Deployed"}</p>
            <p className="mt-2 text-[clamp(2rem,1.4rem+2.4vw,3.5rem)] font-semibold leading-none tracking-[-0.04em]">
              Shipped in <span className="t-serif font-normal text-accent">{moves} moves</span>
            </p>
            <p className="mt-3 text-muted">
              {clock(seconds)} on the clock{best !== null && !record ? ` · best ${best} moves` : ""}
            </p>
            <button type="button" onClick={restart} className="game-button mt-6" autoFocus>
              Play again
            </button>
          </div>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {message}
      </p>
    </div>
  );
}
