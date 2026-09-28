import { useState } from "react";
import { FadeIn, RevealText } from "../../components/motion";
import { SectionLabel } from "../../components/ui/SectionLabel";
import { BugSmash } from "./BugSmash";
import { StackMatch } from "./StackMatch";

const GAMES = [
  { id: "match", label: "Stack Match", hint: "Memory" },
  { id: "bugs", label: "Bug Smash", hint: "Reflex" },
] as const;
type GameId = (typeof GAMES)[number]["id"];

/**
 * A small arcade between Skills and Contact: two quick games on one console,
 * switched with tabs. Stack Match pairs up the tech stack; Bug Smash is a
 * thirty-second reflex round. Mouse, touch and keyboard; best scores stay in
 * this browser only.
 */
export function Games() {
  const [game, setGame] = useState<GameId>("match");

  return (
    <section id="games" aria-labelledby="games-title" className="relative py-section">
      <div className="container-x">
        <SectionLabel index="04">Play</SectionLabel>

        <div className="grid-12 mt-8 gap-y-8 md:mt-10">
          <h2 id="games-title" className="t-display col-span-4 md:col-span-8 lg:col-span-7">
            <RevealText as="span" by="chars" className="block">
              Take a
            </RevealText>
            <RevealText as="span" by="chars" delay={0.1} className="t-serif block text-accent">
              break.
            </RevealText>
          </h2>
          <FadeIn className="col-span-4 self-end md:col-span-6 lg:col-span-4 lg:col-start-9">
            <p className="t-lead text-muted">Two quick games built for this site. Pair up the stack, or squash the bugs before they ship.</p>
          </FadeIn>
        </div>

        <FadeIn className="mt-12 md:mt-16">
          <div className="game-console">
            {/* Tabs */}
            <div role="tablist" aria-label="Games" className="flex flex-wrap items-center justify-between gap-3">
              <div className="game-tabs">
                {GAMES.map((g) => (
                  <button
                    key={g.id}
                    id={`tab-${g.id}`}
                    type="button"
                    role="tab"
                    aria-selected={game === g.id}
                    aria-controls={`panel-${g.id}`}
                    tabIndex={game === g.id ? 0 : -1}
                    onClick={() => setGame(g.id)}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                      e.preventDefault();
                      const next = GAMES[(GAMES.findIndex((x) => x.id === game) + 1) % GAMES.length].id;
                      setGame(next);
                      document.getElementById(`tab-${next}`)?.focus();
                    }}
                    className="game-tab"
                  >
                    <span className="t-label opacity-60">{g.hint}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
              <p className="t-label hidden items-center gap-2 text-subtle sm:flex">
                <span aria-hidden className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-full rounded-full bg-accent" />
                </span>
                Insert coin: free
              </p>
            </div>

            <div id={`panel-${game}`} role="tabpanel" aria-labelledby={`tab-${game}`} className="mt-6 md:mt-8">
              {game === "match" ? <StackMatch /> : <BugSmash />}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
