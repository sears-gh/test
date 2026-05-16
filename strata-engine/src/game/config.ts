export const NUM_LAYERS = 8;
export const GP_THRESHOLD = 1.7e308;

// 累積アップグレード数のTierしきい値: Tier n に到達するには 5×n×(n+1) 回
export function tierThreshold(tier: number): number {
  return 5 * tier * (tier + 1);
}

export interface LayerCfg {
  n: string;
  c: string;
  t: number;
  g: number;
  b: number;
  uB: number;
  uM: number;
  uc: number;
}

export const LCFG: LayerCfg[] = [
  { n: "Quark",    c: "#ff6b9d", t: 2.5,  g: 1,      b: 0.002, uB: 10,    uM: 2.0, uc: 0       },
  { n: "Atom",     c: "#ff9f43", t: 6,    g: 20,     b: 0.060, uB: 90,    uM: 2.1, uc: 30      },
  { n: "Cell",     c: "#f9ca24", t: 14,   g: 300,    b: 0.100, uB: 1200,  uM: 2.2, uc: 400     },
  { n: "Organism", c: "#6ab04c", t: 32,   g: 4500,   b: 0.155, uB: 20000, uM: 2.3, uc: 6000    },
  { n: "Planet",   c: "#22a6b3", t: 75,   g: 65000,  b: 0.225, uB: 4e5,   uM: 2.4, uc: 1e5     },
  { n: "Star",     c: "#6c5ce7", t: 180,  g: 1e6,    b: 0.310, uB: 8e6,   uM: 2.5, uc: 2e6     },
  { n: "Galaxy",   c: "#a29bfe", t: 420,  g: 1.5e7,  b: 0.420, uB: 1.5e8, uM: 2.6, uc: 5e7     },
  { n: "Cosmos",   c: "#fd79a8", t: 950,  g: 3e8,    b: 0.580, uB: 3e9,   uM: 2.7, uc: 1.5e9   },
];

export interface SpDef {
  k: string;
  name: string;
  info: string;
  cost: number;
  max: number;
}

export const SP_DEF: SpDef[] = [
  { k: "gMul",  name: "Cosmic Resonance",  info: "+0.25 グローバル倍率/レベル", cost: 1, max: 10 },
  { k: "speed", name: "Temporal Warp",     info: "全階層の基本インターバル −10%", cost: 2, max: 8  },
  { k: "boost", name: "Cascade Amplifier", info: "全ブースト加算値 +10%",        cost: 2, max: 10 },
  { k: "gain",  name: "Primal Harvest",    info: "基本リソース獲得量 +30%",      cost: 1, max: 10 },
  { k: "deep",  name: "Deep Resonance",    info: "階層プレスティージ指数 ^1.04", cost: 5, max: 1  },
];
