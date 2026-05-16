import { LCFG, SP_DEF, tierThreshold } from "./config";
import type { GameState, SpUpgrades } from "./types";
import { mkGs } from "./init";

export function resonanceProduct(gs: GameState): number {
  return gs.layers.reduce((acc, l) => acc * (1 + l.gainBonus), 1);
}

export function canResonate(gs: GameState): boolean {
  if (!gs.layers[7].unlocked) return false;
  return resonanceProduct(gs) > gs.prevResonanceProduct;
}

export function resonance(prev: GameState): GameState {
  if (!canResonate(prev)) return prev;
  const product = resonanceProduct(prev);
  const newMul = Math.pow(product, 1 / 16);
  const next = mkGs(prev.sp, prev.spu);
  next.pcnt = prev.pcnt;
  next.resonanceMul = newMul;
  next.prevResonanceProduct = product;
  next.resonanceCnt = prev.resonanceCnt + 1;
  return next;
}

export function upgrade(prev: GameState, i: number): GameState {
  const layer = prev.layers[i];
  if (!layer.unlocked || prev.res < layer.cost) return prev;

  const layers = prev.layers.map(l => ({ ...l }));
  const l = layers[i];

  const res = prev.res - l.cost;
  l.cost *= LCFG[i].uM;
  l.int *= 0.8;
  l.upgrades += 1;

  if (l.upgrades >= tierThreshold(l.pct + 1)) {
    l.int = l.bi;
    l.elapsed = 0;
    l.pct += 1;
  }

  return { ...prev, res, layers };
}

export function unlock(prev: GameState, i: number): GameState {
  const layer = prev.layers[i];
  if (layer.unlocked || prev.res < LCFG[i].uc) return prev;

  const layers = prev.layers.map(l => ({ ...l }));
  layers[i].unlocked = true;

  return { ...prev, res: prev.res - LCFG[i].uc, layers };
}

export function buySP(prev: GameState, k: keyof SpUpgrades): GameState {
  const spDef = SP_DEF.find(d => d.k === k);
  if (!spDef) return prev;

  const currentLevel = prev.spu[k];
  if (prev.sp < spDef.cost || currentLevel >= spDef.max) return prev;

  const spu = { ...prev.spu, [k]: currentLevel + 1 };
  let gmBase = prev.gmBase;
  if (k === "gMul") {
    gmBase = 1 + spu.gMul * 0.25;
  }

  return { ...prev, sp: prev.sp - spDef.cost, spu, gmBase };
}
