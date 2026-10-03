import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import RosaryVisual from "@/components/RosaryVisual";
import { artwork, beadOrder, getSet, mysteriesFor, rosaryData, sequence } from "@/lib/rosary";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "પવિત્ર ગુલાબમાળા — Virtual Rosary" },
      {
        name: "description",
        content:
          "Gujarati virtual rosary for church projection: mysteries, artwork and illuminated beads.",
      },
      { property: "og:title", content: "પવિત્ર ગુલાબમાળા — Virtual Rosary" },
      {
        property: "og:description",
        content:
          "A projector-ready Gujarati rosary with Joyful, Sorrowful, Glorious and Luminous mysteries.",
      },
    ],
  }),
  component: RosaryApp,
});

function RosaryApp() {
  const [setId, setSetId] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const set = setId ? getSet(setId) : null;
  const theme = set?.theme ?? rosaryData.sets[0]!.theme;
  const mysteries = setId ? mysteriesFor(setId) : [];
  const current = sequence[Math.min(step, sequence.length - 1)]!;
  const finished = step >= sequence.length;

  const activeBeadId = !finished && current?.type === "bead" ? current.beadId : null;

  const doneIds = useMemo(() => {
    const done = new Set<string>();
    let upto: number;
    if (finished) {
      upto = beadOrder.length;
    } else {
      const lastBead = sequence
        .slice(0, step + 1)
        .filter((s): s is Extract<typeof s, { type: "bead" }> => s.type === "bead")
        .at(-1);
      const idx = lastBead ? beadOrder.indexOf(lastBead.beadId) : 0;
      upto = idx + (sequence[step]?.type === "bead" ? 0 : 1);
    }
    for (let i = 0; i < upto; i++) done.add(beadOrder[i]!);
    return done;
  }, [step, finished]);

  const currentDecade = useMemo(() => {
    for (let i = Math.min(step, sequence.length - 1); i >= 0; i--) {
      const s = sequence[i]!;
      if (s.type === "mystery") return s.decade;
      if (s.type === "bead" && s.decade !== null) return s.decade;
    }
    return null;
  }, [step]);

  const showMysteryCard = !finished && current?.type === "mystery";
  const currentMystery = currentDecade !== null ? mysteries[currentDecade] : undefined;
  const mysteryImage = currentMystery?.image ?? mysteries[0]?.image ?? "";

  const mysteryImageUrl = mysteryImage.startsWith("/")
    ? `${import.meta.env.BASE_URL}${mysteryImage.slice(1)}`
    : mysteryImage;

  const move = useCallback((delta: number) => {
    setStep((s) => Math.max(0, Math.min(sequence.length, s + delta)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSetId(null);
        setStep(0);
        return;
      }
      if (!setId) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        move(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        move(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setId, move]);

  const bgStyle = {
    background: `radial-gradient(120% 100% at 50% 40%, ${theme.bgGlow} 0%, ${theme.bg} 70%)`,
    color: theme.text,
  } as const;

  if (!set) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center gap-12 px-8 gu"
        style={bgStyle}
      >
        <header className="text-center">
          <h1 className="text-6xl leading-tight tracking-wide" style={{ color: theme.accent }}>
            {rosaryData.app.title}
          </h1>
          <p className="mt-3 text-2xl" style={{ color: theme.muted }}>
            {rosaryData.app.subtitle}
          </p>
        </header>

        <div className="grid w-full max-w-6xl grid-cols-2 gap-8 lg:grid-cols-4">
          {rosaryData.sets.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSetId(s.id);
                setStep(0);
              }}
              className="group relative overflow-hidden rounded-2xl text-left transition-transform duration-500 hover:scale-[1.03]"
              style={{ border: `1px solid ${s.theme.chain}66`, background: s.theme.bg }}
            >
              <img
                src={artwork[s.image]}
                alt=""
                width={1024}
                height={1024}
                loading="lazy"
                className="h-56 w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div
                className="p-5"
                style={{ background: `linear-gradient(${s.theme.bg}00, ${s.theme.bg})` }}
              >
                <h2 className="text-2xl" style={{ color: s.theme.accent }}>
                  {s.name}
                </h2>
                <p className="mt-1 text-sm" style={{ color: s.theme.muted }}>
                  {s.day}
                </p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-base tracking-wide" style={{ color: theme.muted }}>
          {rosaryData.app.hint}
        </p>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden gu" style={bgStyle}>
      <button
        onClick={() => {
          setSetId(null);
          setStep(0);
        }}
        aria-label={rosaryData.app.backLab}
        className="absolute left-6 top-6 z-30 rounded-full px-4 py-2 text-xl opacity-30 transition-opacity hover:opacity-90"
        style={{ color: theme.text, border: `1px solid ${theme.chain}55` }}
      >
        ←
      </button>

      {/* Rosary stage */}
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-[96vh] py-2">
          <RosaryVisual
            theme={theme}
            activeBeadId={activeBeadId}
            doneIds={doneIds}
            image={mysteryImageUrl}
            imageVisible={!showMysteryCard}
          />
        </div>
      </div>

      {/* Header: current mystery */}
      {currentMystery && !showMysteryCard && !finished && (
        <div className="pointer-events-none absolute inset-x-0 top-10 z-20 animate-fade-in text-center">
          <p className="text-xl tracking-[0.3em]" style={{ color: theme.muted }}>
            {currentMystery.prefix}
          </p>
          <h2 className="mt-2 text-4xl" style={{ color: theme.accent }}>
            {currentMystery.title}
          </h2>
        </div>
      )}

      {/* Mystery announcement */}
      {showMysteryCard && current.type === "mystery" && currentMystery && (
        <div className="absolute inset-0 z-20 animate-fade-in">
          <img
            src={mysteryImageUrl}
            alt=""
            width={1024}
            height={1024}
            className="h-full w-full object-cover opacity-45"
          />
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center"
            style={{
              background: `radial-gradient(70% 70% at 50% 50%, ${theme.bg}aa, ${theme.bg})`,
            }}
          >
            <p className="text-3xl tracking-[0.35em]" style={{ color: theme.muted }}>
              {currentMystery.prefix}
            </p>
            <h2 className="max-w-5xl text-7xl leading-tight" style={{ color: theme.accent }}>
              {currentMystery.title}
            </h2>
          </div>
        </div>
      )}

      {finished && (
        <div
          className="absolute inset-0 z-20 flex animate-fade-in items-center justify-center"
          style={{
            background: `radial-gradient(70% 70% at 50% 50%, ${theme.bgGlow}cc, ${theme.bg})`,
          }}
        >
          <h2 className="text-6xl" style={{ color: theme.accent }}>
            {rosaryData.app.completeLabel}
          </h2>
        </div>
      )}
    </main>
  );
}
