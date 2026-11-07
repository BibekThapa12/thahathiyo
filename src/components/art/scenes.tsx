// Composed folk-art scenes for the website (static SVG).
import React from "react";
import { FOLK as t } from "./themes";
import { Cloud, Crow, Defs, Diya, Dog, Garland, House, Mascot, Mountains, Pagoda, PrayerFlags, QMark, Sparkle, Sunburst, ol, type Mood } from "./art";

const Stars: React.FC<{ w: number; h: number; n?: number }> = ({ w, h, n = 22 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = (i * 197) % w;
      const y = ((i * 83) % h) * 0.9 + 20;
      return <circle key={i} className={i % 3 === 0 ? "twinkle" : undefined} cx={x} cy={y} r={i % 4 === 0 ? 5 : 3} fill={t.stars} />;
    })}
  </g>
);

/** Hero diorama: Himalaya, pagoda, Newari houses, prayer flags, diyas, thaha waving, crow on a roof. */
export const HeroScene: React.FC<{ title?: string }> = ({ title = "थाहा, थाहा थियो? च्यानलको मस्कट, काठमाडौंको दरबार क्षेत्रमा हात हल्लाउँदै" }) => (
  <svg viewBox="0 0 1080 1000" role="img" aria-label={title} className="scene hero-scene" preserveAspectRatio="xMidYMax slice">
    <Defs />
    <rect width={1080} height={1000} fill="url(#sky-folk)" />
    <rect width={1080} height={1000} fill="url(#folkDots-folk)" opacity={0.12} />
    <Stars w={1080} h={360} />
    <circle cx={860} cy={150} r={70} fill={t.snow} {...ol(t)} />
    <circle cx={885} cy={135} r={62} fill={t.sky[0]} />
    <Cloud x={200} y={250} s={0.6} />
    <Mountains y={720} color={t.far} snow peaks={[[-60, 420], [140, 300], [320, 440], [520, 260], [720, 420], [900, 320], [1120, 460]]} />
    <Mountains y={760} color={t.near} peaks={[[-40, 600], [200, 520], [430, 610], [700, 540], [960, 600], [1140, 560]]} />
    <g transform="translate(560 860) scale(0.62)">
      <Pagoda />
    </g>
    <g transform="translate(-30 880)">
      <House w={260} h={340} />
    </g>
    <g transform="translate(860 880)">
      <House w={260} h={300} />
    </g>
    <g transform="translate(990 594) scale(0.55)">
      <Crow vip flip />
    </g>
    <PrayerFlags x1={-20} x2={1100} y={430} sag={60} n={18} />
    <rect y={860} width={1080} height={140} fill={t.ground[0]} {...ol(t)} />
    <rect y={860} width={1080} height={140} fill="url(#folkZig-folk)" opacity={0.2} />
    {[70, 200, 880, 1010].map((x) => (
      <Diya key={x} x={x} y={950} s={0.9} />
    ))}
    <g transform="translate(330 985) scale(0.72)">
      <Mascot mood="smile" wave />
    </g>
    <Sparkle x={150} y={560} s={0.9} />
    <Sparkle x={500} y={300} s={0.7} />
    <QMark x={480} y={560} s={0.9} />
    <Garland x1={-20} x2={1100} y={-6} sag={30} n={24} />
  </svg>
);

/** Small art card for a video (used when a thumbnail is missing / video not out yet). */
export const VideoArt: React.FC<{ art?: string; label?: string }> = ({ art = "mascot", label }) => {
  const scene = (() => {
    switch (art) {
      case "dog":
        return (
          <g transform="translate(270 770) scale(1.2)">
            <Dog />
          </g>
        );
      case "crow":
        return (
          <>
            <g transform="translate(250 690) scale(1.5)">
              <Crow vip />
            </g>
            <Diya x={90} y={760} s={1} />
            <Diya x={450} y={760} s={1} />
          </>
        );
      case "lake":
        return (
          <>
            <Mountains y={720} color={t.far} snow x0={-40} x1={600} peaks={[[-20, 420], [140, 330], [300, 460], [430, 300], [600, 440]]} />
            <rect x={-10} y={640} width={560} height={400} fill="#2E5FBF" {...ol(t)} />
            <rect x={-10} y={640} width={560} height={400} fill="url(#folkFish-folk)" opacity={0.6} />
            <g transform="translate(270 640) scale(0.4)">
              <Pagoda />
            </g>
          </>
        );
      case "diya":
        return (
          <>
            <circle cx={270} cy={520} r={220} fill="url(#diyaGlow-folk)" />
            <Diya x={270} y={660} s={3.2} />
            <Sparkle x={110} y={420} />
            <Sparkle x={430} y={360} s={0.8} />
          </>
        );
      case "flag":
        return (
          <g transform="translate(150 260)">
            <rect x={-8} y={0} width={16} height={700} fill={t.wood} {...ol(t)} />
            <path d="M8 0 L290 230 L120 230 L290 450 L8 450 Z" fill="#D4372C" stroke="#2E3F8F" strokeWidth={22} strokeLinejoin="round" />
            <circle cx={84} cy={150} r={34} fill={t.snow} />
            <circle cx={84} cy={330} r={40} fill={t.snow} />
          </g>
        );
      case "calendar":
        return (
          <g transform="translate(270 560)">
            <rect x={-190} y={-220} width={380} height={420} rx={20} fill={t.snow} {...ol(t)} />
            <rect x={-190} y={-220} width={380} height={110} rx={20} fill={t.brick} {...ol(t)} />
            <text y={90} textAnchor="middle" fontFamily="Mukta" fontWeight={800} fontSize={150} fill="#111">२०८३</text>
          </g>
        );
      case "cans":
        return (
          <>
            {[150, 390].map((x, i) => (
              <g key={x} transform={`translate(${x} 760)`}>
                <rect x={-80} y={-420} width={160} height={420} rx={26} fill={i ? "#2E5FBF" : t.gold} {...ol(t)} />
                <rect x={-80} y={-300} width={160} height={120} fill={i ? t.gold : t.brick} {...ol(t, 0.6)} />
              </g>
            ))}
            <text x={270} y={330} textAnchor="middle" fontFamily="Mukta" fontWeight={800} fontSize={110} fill={t.gold} stroke="#111" strokeWidth={6} paintOrder="stroke">VS</text>
          </>
        );
      default:
        return (
          <>
            <Sunburst cx={270} cy={500} r={280} />
            <g transform="translate(270 820) scale(0.82)">
              <Mascot mood="wonder" />
            </g>
          </>
        );
    }
  })();
  return (
    <svg viewBox="0 0 540 960" role="img" aria-label={label ?? "Folk-art illustration"} className="scene video-art" preserveAspectRatio="xMidYMid slice">
      <Defs />
      <rect width={540} height={960} fill="url(#sky-folk)" />
      <rect width={540} height={960} fill="url(#folkDots-folk)" opacity={0.14} />
      {scene}
      <QMark x={466} y={180} s={0.7} />
    </svg>
  );
};

/** Mascot on a sunburst for empty states, about, 404. */
export const MascotBurst: React.FC<{ mood?: Mood; label?: string; crow?: boolean }> = ({ mood = "smile", label = "थाहा, थाहा थियो? को मस्कट", crow }) => (
  <svg viewBox="0 0 600 660" role="img" aria-label={label} className="scene mascot-burst">
    <Defs />
    <Sunburst cx={300} cy={330} r={290} n={20} />
    <g transform="translate(300 640) scale(1.0)">
      <Mascot mood={mood} wave={mood === "smile"} />
    </g>
    {crow ? (
      <g transform="translate(330 120) scale(0.45)">
        <Crow />
      </g>
    ) : null}
    <QMark x={90} y={120} s={0.9} />
    <QMark x={520} y={180} s={0.6} />
  </svg>
);

/** Logo mark: थाहा's face on a gold disc (header, footer, and the favicon via pages/favicon.svg.ts). */
export const LogoMark: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" className="logo-mark">
    <Defs />
    <clipPath id="logo-disc">
      <circle cx={60} cy={60} r={52} />
    </clipPath>
    <circle cx={60} cy={60} r={54} fill={t.gold} />
    {/* head centre sits at y=-386 in Mascot's own coordinates */}
    <g clipPath="url(#logo-disc)">
      <g transform="translate(60 64) scale(0.3) translate(0 386)">
        <Mascot />
      </g>
    </g>
    <circle cx={60} cy={60} r={54} fill="none" stroke="#111" strokeWidth={8} />
  </svg>
);
