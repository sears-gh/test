import { LCFG, LP_MIN, SP_DEF } from "./config";
import type { GameState, SpUpgrades } from "./types";

export function upgrade(prev: GameState, i: number): GameState {
  const layer = prev.layers[i];
  if (!layer.unlocked || prev.res < layer.cost) return prev;

  const layers = prev.layers.map(l => ({ ...l }));
  const l = layers[i];

  const res = prev.res - l.cost;
  l.cost *= LCFG[i].uM;
  l.int *= 0.8;

  if (l.int < LP_MIN) {
    const expo = 1.03 + prev.spu.deep * 0.01;
    l.gain = Math.pow(l.gain, expo);
    l.bp = Math.pow(l.bp, expo);
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
