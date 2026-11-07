// Folk-art palette — identical to the video kit (template-folk/src/folk/themes.ts, FOLK theme).
export type Theme = {
  id: "folk";
  sky: [string, string];
  stars: string;
  far: string;
  snow: string;
  near: string;
  brick: string;
  brick2: string;
  roof: string;
  roofEdge: string;
  wood: string;
  window: string;
  gold: string;
  ground: [string, string];
  diya: string;
  flame: string;
  marigold: string;
  marigold2: string;
  skin: string;
  cheek: string;
  hair: string;
  topi: string;
  topi2: string;
  topi3: string;
  daura: string;
  dauraTrim: string;
  suruwal: string;
  glasses: string;
  dog: string;
  dogDark: string;
  dogLight: string;
  tika: string;
  accent: string;
  burst: [string, string];
  line: string;
  lw: number;
};

export const FOLK: Theme = {
  id: "folk",
  sky: ["#1F2A6B", "#2E3F8F"],
  stars: "#F7C948",
  far: "#2D7A6B",
  snow: "#FBF3DF",
  near: "#1F5C52",
  brick: "#D4372C",
  brick2: "#A8261F",
  roof: "#1A1A1A",
  roofEdge: "#F7C948",
  wood: "#7A2E16",
  window: "#F7C948",
  gold: "#F7C948",
  ground: ["#E9873A", "#C96A24"],
  diya: "#A8261F",
  flame: "#F7C948",
  marigold: "#F28C28",
  marigold2: "#F7C948",
  skin: "#F2B98A",
  cheek: "#E35D5D",
  hair: "#111111",
  topi: "#D4372C",
  topi2: "#F7C948",
  topi3: "#2D7A6B",
  daura: "#FBF3DF",
  dauraTrim: "#D4372C",
  suruwal: "#F3E7CB",
  glasses: "#111111",
  dog: "#E0A040",
  dogDark: "#8A4A1A",
  dogLight: "#FBE3B5",
  tika: "#D4372C",
  accent: "#D4372C",
  burst: ["#F28C28", "#F7C948"],
  line: "#111111",
  lw: 6,
};
