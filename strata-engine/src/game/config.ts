export const NUM_LAYERS = 8;
export const GP_THRESHOLD = 1.7e308;

export function tierThreshold(tier: number): number {
  return 5 * tier * (tier + 1);
}

export function getTierExp(deep: number): number {
  return deep > 0 ? 1.04 : 1.01;
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
  cost: number;      // 初回コスト
  max: number;       // -1 = 無制限
  costMul?: number;  // 無制限時のレベルごとのコスト倍率 (デフォルト 1000)
  group: string;
}

export function getSpNextCost(def: SpDef, currentLevel: number): number {
  if (def.max === -1) return def.cost * Math.pow(def.costMul ?? 1000, currentLevel);
  return def.cost;
}

export const SP_DEF: SpDef[] = [
  // ── コア強化 ──
  { k: "gMul",        name: "Cosmic Resonance",  info: "+0.25 グローバル倍率/レベル",                   cost: 1,  max: 10, group: "core"    },
  { k: "speed",       name: "Temporal Warp",      info: "全階層の基本インターバル −10%/レベル",            cost: 2,  max: 8,  group: "core"    },
  { k: "boost",       name: "Cascade Amplifier",  info: "全ブースト加算値 +10%/レベル",                  cost: 2,  max: 10, group: "core"    },
  { k: "gain",        name: "Primal Harvest",     info: "基本リソース獲得量 +30%/レベル",                 cost: 1,  max: 10, group: "core"    },
  { k: "deep",        name: "Deep Resonance",     info: "階層プレスティージ指数 1.01→1.04",              cost: 5,  max: 1,  group: "core"    },
  { k: "halfTrigger", name: "Dual Cascade",       info: "発火時、外れた効果も1/10で発動 (全層適用)",       cost: 5,  max: 1,  group: "core"    },
  { k: "resResidual", name: "Resonance Residual", info: "周回開始時、歴代最大 resonanceMul の10%を初期適用", cost: 15, max: 1,  group: "core"    },

  // ── 初期解放 ──
  { k: "ul2", name: "Atom 解放",     info: "周回開始時 Atom を解放済みにする",     cost: 3,   max: 1, group: "unlock" },
  { k: "ul3", name: "Cell 解放",     info: "周回開始時 Cell を解放済みにする",     cost: 6,   max: 1, group: "unlock" },
  { k: "ul4", name: "Organism 解放", info: "周回開始時 Organism を解放済みにする", cost: 10,  max: 1, group: "unlock" },
  { k: "ul5", name: "Planet 解放",   info: "周回開始時 Planet を解放済みにする",   cost: 20,  max: 1, group: "unlock" },
  { k: "ul6", name: "Star 解放",     info: "周回開始時 Star を解放済みにする",     cost: 40,  max: 1, group: "unlock" },
  { k: "ul7", name: "Galaxy 解放",   info: "周回開始時 Galaxy を解放済みにする",   cost: 80,  max: 1, group: "unlock" },
  { k: "ul8", name: "Cosmos 解放",   info: "周回開始時 Cosmos を解放済みにする",   cost: 150, max: 1, group: "unlock" },

  // ── 星座機構 ──
  { k: "ceEff",    name: "CE効率強化",       info: "CE倍率の指数 +0.05 (コスト毎回 ×1000)",                     cost: 1e6, max: -1, costMul: 1000, group: "con"  },
  { k: "compress", name: "Interval Compression", info: "全星列階層のインターバル ×0.995/レベル (コスト毎回 ×10)", cost: 1, max: -1, costMul: 10,   group: "core" },
];

export interface ConLayerCfg {
  n:  string;
  c:  string;
  t:  number;
  sp: number;
}

export const CON_LCFG: ConLayerCfg[] = [
  { n: "Nebula",      c: "#e17055", t: 3,    sp: 100   },
  { n: "Pulsar",      c: "#74b9ff", t: 8,    sp: 250   },
  { n: "Quasar",      c: "#a29bfe", t: 20,   sp: 600   },
  { n: "Void",        c: "#fd79a8", t: 50,   sp: 1500  },
  { n: "Singularity", c: "#00b894", t: 120,  sp: 1e6  },
  { n: "Membrane",    c: "#fdcb6e", t: 300,  sp: 1e9  },
  { n: "Manifold",    c: "#55efc4", t: 750,  sp: 1e12 },
  { n: "Vertex",      c: "#b2bec3", t: 1800, sp: 1e15 },
];
