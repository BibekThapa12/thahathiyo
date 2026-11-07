// Drawings ported 1:1 from the video kit (template-folk/src/folk/art.tsx + art7.tsx) so the
// website matches the videos exactly. Rendered to static SVG at build time (no hydration).
import React from "react";
import { FOLK, type Theme } from "./themes";

export const FONT = "Mukta, 'Noto Sans Devanagari', sans-serif";
export const ThemeCtx = React.createContext<Theme>(FOLK);
export const useT = () => React.useContext(ThemeCtx);

export const ol = (t: Theme, scale = 1) =>
  t.lw ? { stroke: t.line, strokeWidth: t.lw * scale, strokeLinejoin: "round" as const, strokeLinecap: "round" as const } : {};

/** Shared SVG defs: folk patterns, dhaka cloth, glows. Every standalone <svg> includes it. */
export const Defs: React.FC = () => {
  const t = useT();
  return (
    <defs>
      <filter id="glow-folk" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={18} />
      </filter>
      <pattern id="folkDots-folk" width={26} height={26} patternUnits="userSpaceOnUse">
        <circle cx={13} cy={13} r={3.2} fill={t.gold} />
      </pattern>
      <pattern id="folkZig-folk" width={40} height={24} patternUnits="userSpaceOnUse">
        <path d="M0 18 L10 6 L20 18 L30 6 L40 18" fill="none" stroke={t.line} strokeWidth={4} />
      </pattern>
      <pattern id="folkFish-folk" width={60} height={60} patternUnits="userSpaceOnUse">
        <path d="M8 30 Q30 12 52 30 Q30 48 8 30 Z" fill="none" stroke={t.gold} strokeWidth={3} />
        <circle cx={40} cy={28} r={3} fill={t.gold} />
      </pattern>
      <pattern id="dhaka-folk" width={44} height={44} patternUnits="userSpaceOnUse">
        <rect width={44} height={44} fill={t.topi} />
        <polygon points="0,44 22,22 44,44" fill={t.topi2} />
        <polygon points="0,0 11,11 22,0" fill={t.topi3} />
        <polygon points="22,0 33,11 44,0" fill={t.topi3} />
        <rect y={20} width={44} height={4} fill={t.hair} opacity={0.6} />
      </pattern>
      <radialGradient id="diyaGlow-folk">
        <stop offset="0%" stopColor={t.flame} stopOpacity={0.7} />
        <stop offset="100%" stopColor={t.flame} stopOpacity={0} />
      </radialGradient>
      <linearGradient id="sky-folk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={t.sky[0]} />
        <stop offset="100%" stopColor={t.sky[1]} />
      </linearGradient>
    </defs>
  );
};

// ---------------- the mascot थाहा ----------------
const Limb: React.FC<{ d: string }> = ({ d }) => {
  const t = useT();
  return (
    <>
      <path d={d} fill="none" stroke={t.line} strokeWidth={34 + t.lw * 2} strokeLinecap="round" />
      <path d={d} fill="none" stroke={t.daura} strokeWidth={34} strokeLinecap="round" />
    </>
  );
};
export type Mood = "smile" | "talk" | "shock" | "point" | "wonder";
/** Standing mascot, origin at his feet, ~540 px tall at scale 1. */
export const Mascot: React.FC<{ mood?: Mood; mouth?: number; blink?: boolean; look?: number; wave?: boolean }> = ({
  mood = "smile",
  mouth = 0,
  blink = false,
  look = 0,
  wave = false,
}) => {
  const t = useT();
  const o = ol(t);
  const shock = mood === "shock";
  const point = mood === "point";
  const browY = shock ? -14 : mood === "wonder" ? -6 : 0;
  return (
    <g className="mascot">
      <rect x={-52} y={-110} width={42} height={96} rx={18} fill={t.suruwal} {...o} />
      <rect x={10} y={-110} width={42} height={96} rx={18} fill={t.suruwal} {...o} />
      <ellipse cx={-30} cy={-12} rx={36} ry={16} fill={t.hair} />
      <ellipse cx={32} cy={-12} rx={36} ry={16} fill={t.hair} />
      <path d="M-92 -232 Q-100 -150 -84 -96 L84 -96 Q100 -150 92 -232 Q0 -262 -92 -232 Z" fill={t.daura} {...o} />
      <path d="M-58 -244 L44 -110" fill="none" stroke={t.dauraTrim} strokeWidth={8} strokeLinecap="round" />
      <path d="M-84 -104 L84 -104" stroke={t.dauraTrim} strokeWidth={8} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={-30 + i * 30} cy={-206 + i * 40} r={6} fill={t.gold} />
      ))}
      <Limb d="M-90 -224 Q-130 -170 -118 -122" />
      <circle cx={-118} cy={-116} r={18} fill={t.skin} {...o} />
      {point || wave ? (
        <g className={wave ? "mascot-wave" : undefined}>
          <Limb d="M90 -224 Q150 -270 196 -330" />
          <circle cx={200} cy={-336} r={18} fill={t.skin} {...o} />
          {point ? <path d="M206 -350 L232 -380" stroke={t.skin} strokeWidth={12} strokeLinecap="round" /> : null}
        </g>
      ) : (
        <>
          <Limb d="M90 -224 Q130 -170 118 -122" />
          <circle cx={118} cy={-116} r={18} fill={t.skin} {...o} />
        </>
      )}
      <g transform="translate(0 -360)">
        <circle cx={-118} cy={10} r={22} fill={t.skin} {...o} />
        <circle cx={118} cy={10} r={22} fill={t.skin} {...o} />
        <circle r={124} fill={t.skin} {...o} />
        <g transform="rotate(-6)">
          <path d="M-112 -62 L112 -62 L96 -150 Q0 -176 -96 -140 Z" fill="url(#dhaka-folk)" {...o} />
          <path d="M-112 -62 L112 -62" stroke={t.hair} strokeWidth={10} opacity={0.5} />
        </g>
        <g transform="translate(-50 -52) scale(0.62)">
          <path d="M-30 -40 C-30 -76 32 -76 32 -40 C32 -14 2 -12 2 16" fill="none" stroke={t.hair} strokeWidth={22} strokeLinecap="round" />
          <circle cx={2} cy={42} r={11} fill={t.hair} />
        </g>
        <path d={`M-84 ${-44 + browY} Q-50 ${-60 + browY} -18 ${-46 + browY}`} fill="none" stroke={t.hair} strokeWidth={10} strokeLinecap="round" />
        <path d={`M18 ${-46 + browY} Q50 ${-60 + browY} 84 ${-44 + browY}`} fill="none" stroke={t.hair} strokeWidth={10} strokeLinecap="round" />
        {[-48, 48].map((x) => (
          <g key={x}>
            <circle cx={x} cy={4} r={40} fill="#FFFFFF" />
            {blink ? (
              <path d={`M${x - 20} 6 Q${x} 16 ${x + 20} 6`} fill="none" stroke={t.hair} strokeWidth={7} strokeLinecap="round" />
            ) : (
              <g className="mascot-eye">
                <circle cx={x + look * 10} cy={6} r={shock ? 11 : 15} fill={t.hair} />
                <circle cx={x + look * 10 + 5} cy={0} r={4.5} fill="#FFFFFF" />
              </g>
            )}
            <circle cx={x} cy={4} r={40} fill="none" stroke={t.glasses} strokeWidth={9} />
          </g>
        ))}
        <path d="M-8 2 Q0 -6 8 2" fill="none" stroke={t.glasses} strokeWidth={8} />
        <circle cx={-82} cy={56} r={16} fill={t.cheek} opacity={0.55} />
        <circle cx={82} cy={56} r={16} fill={t.cheek} opacity={0.55} />
        {shock ? (
          <ellipse cy={72} rx={18} ry={24} fill={t.hair} />
        ) : mouth > 0.08 ? (
          <path d={`M-30 62 Q0 ${66 + mouth * 40} 30 62 Q0 ${70} -30 62 Z`} fill={t.hair} />
        ) : (
          <path d="M-30 60 Q0 86 30 60" fill="none" stroke={t.hair} strokeWidth={9} strokeLinecap="round" />
        )}
      </g>
    </g>
  );
};

// ---------------- the dog (Kukur Tihar) ----------------
export const Dog: React.FC = () => {
  const t = useT();
  const o = ol(t);
  return (
    <g>
      <path d="M90 -40 Q150 -80 140 -150" fill="none" stroke={t.dog} strokeWidth={22} strokeLinecap="round" />
      <ellipse cx={0} cy={-110} rx={110} ry={112} fill={t.dog} {...o} />
      <ellipse cx={0} cy={-90} rx={56} ry={74} fill={t.dogLight} />
      <ellipse cx={-56} cy={-12} rx={34} ry={20} fill={t.dog} {...o} />
      <ellipse cx={56} cy={-12} rx={34} ry={20} fill={t.dog} {...o} />
      <g transform="translate(0 -250)">
        <path d="M-74 -40 Q-118 -10 -96 60 Q-70 70 -60 10 Z" fill={t.dogDark} {...o} />
        <path d="M74 -40 Q118 -10 96 60 Q70 70 60 10 Z" fill={t.dogDark} {...o} />
        <circle r={84} fill={t.dog} {...o} />
        <ellipse cy={36} rx={50} ry={38} fill={t.dogLight} {...o} />
        <ellipse cy={14} rx={18} ry={13} fill={t.hair} />
        <path d="M0 26 L0 44 M-16 50 Q0 60 16 50" fill="none" stroke={t.hair} strokeWidth={6} strokeLinecap="round" />
        <circle cx={-32} cy={-14} r={11} fill={t.hair} />
        <circle cx={32} cy={-14} r={11} fill={t.hair} />
        <circle cx={-28} cy={-18} r={3.5} fill="#FFFFFF" />
        <circle cx={36} cy={-18} r={3.5} fill="#FFFFFF" />
        <ellipse cy={-48} rx={12} ry={16} fill={t.tika} />
      </g>
      {Array.from({ length: 13 }, (_, i) => {
        const a = Math.PI * (0.08 + (0.84 * i) / 12);
        return <circle key={i} cx={Math.cos(a) * -92} cy={-196 + Math.sin(a) * 74} r={17} fill={i % 2 ? t.marigold : t.marigold2} {...ol(t, 0.6)} />;
      })}
    </g>
  );
};

// ---------------- environment ----------------
export const Diya: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const t = useT();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cy={-26} r={70} fill="url(#diyaGlow-folk)" />
      <path className="flame" d="M0 -60 C14 -40 12 -18 0 -10 C-12 -18 -14 -40 0 -60 Z" fill={t.flame} />
      <path d="M-34 -10 Q0 26 34 -10 Z" fill={t.diya} {...ol(t, 0.6)} />
    </g>
  );
};

export const Garland: React.FC<{ x1: number; x2: number; y: number; sag: number; n?: number }> = ({ x1, x2, y, sag, n = 16 }) => {
  const t = useT();
  return (
    <g>
      <path d={`M${x1} ${y} Q${(x1 + x2) / 2} ${y + sag * 2} ${x2} ${y}`} fill="none" stroke={t.wood} strokeWidth={4} />
      {Array.from({ length: n }, (_, i) => {
        const u = (i + 0.5) / n;
        return <circle key={i} cx={x1 + (x2 - x1) * u} cy={y + 4 * sag * u * (1 - u) + 10} r={15} fill={i % 2 ? t.marigold : t.marigold2} {...ol(t, 0.5)} />;
      })}
    </g>
  );
};

/** Three-tier Nepali pagoda temple, origin at base centre, ~770 px tall. */
export const Pagoda: React.FC = () => {
  const t = useT();
  const o = ol(t);
  const tier = (w: number, y: number, h: number) => (
    <g>
      <path d={`M${-w} ${y} L${w} ${y} L${w * 0.55} ${y - h} L${-w * 0.55} ${y - h} Z`} fill={t.roof} {...o} />
      <path d={`M${-w} ${y} L${w} ${y}`} stroke={t.roofEdge} strokeWidth={10} />
      <path d={`M${-w * 0.8} ${y - 18} L${w * 0.8} ${y - 18}`} stroke="url(#folkDots-folk)" strokeWidth={14} />
    </g>
  );
  return (
    <g>
      <rect x={-260} y={-60} width={520} height={60} fill={t.brick2} {...o} />
      <rect x={-210} y={-120} width={420} height={60} fill={t.brick} {...o} />
      <rect x={-150} y={-330} width={300} height={210} fill={t.brick} {...o} />
      {[-90, 0, 90].map((x) => (
        <rect key={x} x={x - 30} y={-300} width={60} height={150} fill={t.wood} {...ol(t, 0.6)} />
      ))}
      {tier(250, -330, 90)}
      <rect x={-110} y={-500} width={220} height={80} fill={t.brick} {...o} />
      {tier(190, -500, 80)}
      <rect x={-70} y={-640} width={140} height={60} fill={t.brick} {...o} />
      {tier(130, -640, 70)}
      <path d="M0 -770 L-16 -710 L16 -710 Z" fill={t.gold} {...o} />
      <circle cy={-720} r={20} fill={t.gold} {...o} />
    </g>
  );
};

/** Newari brick house with carved windows, origin bottom-left. */
export const House: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const t = useT();
  const o = ol(t);
  const rows = Math.max(1, Math.floor(h / 170));
  const cols = Math.max(1, Math.floor(w / 130));
  return (
    <g>
      <rect x={0} y={-h} width={w} height={h} fill={t.brick} {...o} />
      <rect x={0} y={-h} width={w} height={h} fill="url(#folkZig-folk)" opacity={0.25} />
      <path d={`M-20 ${-h} L${w + 20} ${-h} L${w - 10} ${-h - 46} L10 ${-h - 46} Z`} fill={t.roof} {...o} />
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const x = (w / cols) * (c + 0.5);
          const y = -h + 60 + r * 170;
          return (
            <g key={`${r}-${c}`}>
              <rect x={x - 42} y={y} width={84} height={100} fill={t.wood} {...ol(t, 0.6)} />
              <rect x={x - 30} y={y + 12} width={60} height={76} fill={t.window} opacity={0.9} />
              <path d={`M${x - 30} ${y + 50} L${x + 30} ${y + 50} M${x} ${y + 12} L${x} ${y + 88}`} stroke={t.wood} strokeWidth={5} />
            </g>
          );
        }),
      )}
    </g>
  );
};

export const Mountains: React.FC<{ y: number; color: string; peaks: number[][]; snow?: boolean; x0?: number; x1?: number }> = ({ y, color, peaks, snow, x0 = -200, x1 = 1300 }) => {
  const t = useT();
  const d = `M${x0} ${y} ` + peaks.map(([x, py]) => `L${x} ${py}`).join(" ") + ` L${x1} ${y} Z`;
  return (
    <g>
      <path d={d} fill={color} {...ol(t, 0.7)} />
      {snow
        ? peaks
            .filter(([, py]) => py < y - 260)
            .map(([x, py], i) => (
              <path key={i} d={`M${x} ${py} L${x - 60} ${py + 70} L${x - 20} ${py + 56} L${x} ${py + 80} L${x + 24} ${py + 54} L${x + 62} ${py + 70} Z`} fill={t.snow} {...ol(t, 0.5)} />
            ))
        : null}
    </g>
  );
};

// ---------------- video 07 kit ----------------
const CROW = "#1C1B2E";
const CROW2 = "#2E2C4A";
const BEAK = "#4A4866";
/** Crow, origin at its feet, ~260 px tall. Gold edge line. */
export const Crow: React.FC<{ vip?: boolean; flip?: boolean }> = ({ vip, flip }) => {
  const t = useT();
  const edge = { stroke: t.gold, strokeWidth: 4, strokeLinejoin: "round" as const };
  return (
    <g transform={`scale(${flip ? -1 : 1} 1)`}>
      <path d="M-14 -6 L-18 -40 M14 -6 L10 -40" stroke={BEAK} strokeWidth={8} strokeLinecap="round" />
      <path d="M-34 -4 L0 -4 M-8 -4 L24 -4" stroke={BEAK} strokeWidth={7} strokeLinecap="round" />
      <path d="M-70 -86 L-150 -60 L-140 -40 L-62 -60 Z" fill={CROW} {...edge} />
      <ellipse cx={0} cy={-90} rx={86} ry={62} fill={CROW} {...edge} />
      <path d="M-40 -110 Q0 -70 50 -96" fill="none" stroke={t.gold} strokeWidth={3} opacity={0.6} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={-30 + i * 22} cy={-78 + (i % 2) * 8} r={3.5} fill={t.gold} opacity={0.7} />
      ))}
      <g transform="translate(-10 -110) rotate(8)">
        <path d="M0 0 C-40 -10 -110 10 -120 40 C-80 40 -30 34 10 20 Z" fill={CROW2} {...edge} />
        <path d="M-40 14 L-90 30 M-30 22 L-70 34" stroke={t.gold} strokeWidth={3} opacity={0.6} />
      </g>
      <g transform="translate(66 -140)">
        <circle r={46} fill={CROW} {...edge} />
        <path d="M34 -8 L92 4 L34 8 Z" fill={BEAK} {...edge} />
        <circle cx={16} cy={-12} r={13} fill="#FFFFFF" />
        <circle cx={20} cy={-12} r={7} fill="#111" />
        <circle cx={22} cy={-15} r={2.5} fill="#FFFFFF" />
      </g>
      {vip ? (
        <g transform={`translate(-10 -96) rotate(-8) scale(${flip ? -1 : 1} 1)`}>
          <rect x={-36} y={-18} width={72} height={36} rx={8} fill={t.gold} stroke="#111" strokeWidth={4} />
          <text y={11} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill="#111">
            VIP
          </text>
        </g>
      ) : null}
    </g>
  );
};

/** Prayer flags on a sagging string. */
export const PrayerFlags: React.FC<{ x1: number; x2: number; y: number; sag: number; n?: number }> = ({ x1, x2, y, sag, n = 14 }) => {
  const t = useT();
  const cols = ["#2E5FBF", "#FBF3DF", "#D4372C", "#2D9A5B", "#F7C948"];
  return (
    <g>
      <path d={`M${x1} ${y} Q${(x1 + x2) / 2} ${y + sag * 2} ${x2} ${y}`} fill="none" stroke="#111" strokeWidth={4} />
      {Array.from({ length: n }, (_, i) => {
        const u = (i + 0.5) / n;
        const px = x1 + (x2 - x1) * u;
        const py = y + 4 * sag * u * (1 - u);
        const sway = Math.sin(i) * 5;
        return <path key={i} d={`M${px - 24} ${py} L${px + 24} ${py} L${px + 22 + sway} ${py + 56} L${px - 26 + sway} ${py + 56} Z`} fill={cols[i % 5]} {...ol(t, 0.6)} />;
      })}
    </g>
  );
};

export const Cloud: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color }) => {
  const t = useT();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-160 40 C-180 0 -130 -30 -100 -10 C-90 -60 -20 -70 0 -30 C20 -80 110 -70 110 -10 C150 -20 180 20 160 40 Z" fill={color ?? t.snow} {...ol(t)} />
      <path d="M-120 20 Q-60 4 -20 20 M30 16 Q80 0 120 20" fill="none" stroke={t.line} strokeWidth={3} opacity={0.4} />
    </g>
  );
};

export const Sparkle: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const t = useT();
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -26 L7 -7 L26 0 L7 7 L0 26 L-7 7 L-26 0 L-7 -7 Z" fill={t.gold} stroke="#111" strokeWidth={3} />;
};

/** Sunburst behind reaction close-ups. */
export const Sunburst: React.FC<{ cx: number; cy: number; r: number; n?: number }> = ({ cx, cy, r, n = 18 }) => {
  const t = useT();
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill={t.burst[0]} />
      {Array.from({ length: n }, (_, i) => {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = a0 + Math.PI / n;
        return <path key={i} d={`M0 0 L${Math.cos(a0) * r} ${Math.sin(a0) * r} L${Math.cos(a1) * r} ${Math.sin(a1) * r} Z`} fill={t.burst[1]} />;
      })}
      <circle r={r} fill="none" stroke={t.line} strokeWidth={6} />
    </g>
  );
};

/** The crimson "?" mark (channel logo glyph), centred at 0,0, ~100 px tall. */
export const QMark: React.FC<{ x?: number; y?: number; s?: number; color?: string; outline?: boolean }> = ({ x = 0, y = 0, s = 1, color, outline = true }) => {
  const t = useT();
  const c = color ?? t.accent;
  const d = "M-26 -22 C-26 -58 30 -58 30 -22 C30 4 2 6 2 30";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {outline ? <path d={d} fill="none" stroke={t.line} strokeWidth={30} strokeLinecap="round" /> : null}
      {outline ? <circle cx={2} cy={52} r={15} fill={t.line} /> : null}
      <path d={d} fill="none" stroke={c} strokeWidth={18} strokeLinecap="round" />
      <circle cx={2} cy={52} r={9} fill={c} />
    </g>
  );
};
