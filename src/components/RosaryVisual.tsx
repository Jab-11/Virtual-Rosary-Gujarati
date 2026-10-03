import { loopBeads, loopPath, medalPoint, pendantBeads, pendantPath, type Bead, type Theme } from "@/lib/rosary";

type Props = {
  theme: Theme;
  activeBeadId: string | null;
  doneIds: Set<string>;
  image: string;
  imageVisible: boolean;
};

function state(id: string, activeBeadId: string | null, doneIds: Set<string>) {
  if (id === activeBeadId) return "active" as const;
  if (doneIds.has(id)) return "done" as const;
  return "idle" as const;
}

export default function RosaryVisual({ theme, activeBeadId, doneIds, image, imageVisible }: Props) {
  const beadFill = (s: "active" | "done" | "idle", kind: Bead["kind"]) => {
    if (s === "active") return theme.beadActive;
    if (s === "done") return kind === "ourFather" ? theme.ourFather : theme.beadDone;
    return theme.beadIdle;
  };

  const renderBead = (b: Bead) => {
    const s = state(b.id, activeBeadId, doneIds);
    const big = b.kind === "ourFather";
    const r = big ? 15 : 10.5;
    return (
      <g
        key={b.id}
        transform={`translate(${b.x} ${b.y}) rotate(${b.angle}) scale(${s === "active" ? 1.3 : 1})`}
        style={{ transition: "transform 700ms cubic-bezier(.22,.61,.36,1)" }}
      >
        {s === "active" && (
          <circle r={r * 2.6} fill={theme.beadActive} opacity={0.22} className="rosary-halo" />
        )}
        {big && (
          <>
            <ellipse rx={r + 5.5} ry={r + 1} fill="none" stroke={theme.chain} strokeWidth={1.6} opacity={0.75} />
            <ellipse rx={r + 2} ry={r - 1.5} fill={theme.chain} opacity={s === "idle" ? 0.3 : 0.55} />
          </>
        )}
        <ellipse
          rx={big ? r : r * 0.95}
          ry={big ? r * 0.82 : r * 0.88}
          fill={beadFill(s, b.kind)}
          stroke={theme.chain}
          strokeWidth={big ? 1.2 : 0.7}
          strokeOpacity={0.55}
          filter={s === "active" ? "url(#beadGlow)" : undefined}
          style={{ transition: "fill 900ms ease" }}
        />
        <ellipse
          cx={-r * 0.28}
          cy={-r * 0.3}
          rx={r * 0.34}
          ry={r * 0.22}
          fill="#ffffff"
          opacity={s === "idle" ? 0.12 : 0.4}
        />
      </g>
    );
  };

  const medalState = state("medal", activeBeadId, doneIds);
  const cross = pendantBeads.find((b) => b.kind === "cross")!;
  const crossState = state("cross", activeBeadId, doneIds);
  const crossColor =
    crossState === "active" ? theme.beadActive : crossState === "done" ? theme.ourFather : theme.beadIdle;

  return (
    <svg viewBox="-370 -350 740 1010" className="h-full w-full" role="img" aria-label="Rosary">
      <defs>
        <filter id="beadGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="artFade">
          <stop offset="60%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="artMask">
          <circle r="235" fill="url(#artFade)" />
        </mask>
      </defs>

      {/* Mystery artwork framed by the rosary */}
      <g mask="url(#artMask)" opacity={imageVisible ? 0.95 : 0} style={{ transition: "opacity 1200ms ease" }}>
        <image href={image} x={-235} y={-235} width={470} height={470} preserveAspectRatio="xMidYMid slice" />
      </g>

      {/* Chain */}
      <path d={loopPath} fill="none" stroke={theme.chain} strokeWidth={2.2} strokeOpacity={0.55} />
      <path d={loopPath} fill="none" stroke={theme.chain} strokeWidth={0.8} strokeOpacity={0.9} strokeDasharray="1 7" />
      <path d={pendantPath} fill="none" stroke={theme.chain} strokeWidth={2.2} strokeOpacity={0.55} />
      <path
        d={pendantPath}
        fill="none"
        stroke={theme.chain}
        strokeWidth={0.8}
        strokeOpacity={0.9}
        strokeDasharray="1 7"
      />

      {loopBeads.map(renderBead)}
      {pendantBeads.filter((b) => b.kind !== "cross").map(renderBead)}

      {/* Marian centrepiece */}
      <g transform={`translate(${medalPoint.x} ${medalPoint.y})`}>
        {medalState === "active" && <circle r={54} fill={theme.beadActive} opacity={0.2} className="rosary-halo" />}
        <ellipse
          rx={24}
          ry={30}
          fill={medalState === "idle" ? theme.beadIdle : theme.ourFather}
          stroke={theme.chain}
          strokeWidth={2.4}
          style={{ transition: "fill 900ms ease" }}
        />
        <ellipse rx={18} ry={23.5} fill="none" stroke={theme.chain} strokeWidth={1} opacity={0.8} />
        {/* stylised veiled Madonna */}
        <g fill="none" stroke={theme.chain} strokeWidth={1.4} opacity={0.95} strokeLinecap="round">
          <circle cx={0} cy={-8} r={5} />
          <path d="M -11 14 C -11 0 -6 -5 0 -5 C 6 -5 11 0 11 14 Z" />
          <path d="M -7.5 -8 C -7.5 -16 7.5 -16 7.5 -8" />
        </g>
      </g>

      {/* Cross */}
      <g
        transform={`translate(${cross.x} ${cross.y}) scale(${crossState === "active" ? 1.12 : 1})`}
        style={{ transition: "transform 700ms ease" }}
      >
        {crossState === "active" && <circle r={62} fill={theme.beadActive} opacity={0.18} className="rosary-halo" />}
        <g fill={crossColor} stroke={theme.chain} strokeWidth={1.8} style={{ transition: "fill 900ms ease" }}>
          <rect x={-8} y={-44} width={16} height={112} rx={4} />
          <rect x={-34} y={-14} width={68} height={16} rx={4} />
        </g>
        <circle cy={-6} r={4.5} fill={theme.chain} opacity={0.9} />
      </g>
    </svg>
  );
}
