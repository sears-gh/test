import { LCFG, CON_LCFG, SP_DEF, getSpNextCost, tierThreshold } from "./config";
import type { GameState, SpUpgrades } from "./types";
import { mkGs, mkConLayer } from "./init";

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
  const newMaxMul = Math.max(prev.maxResonanceMul, newMul);

  const next = mkGs(prev.sp, prev.spu);
  next.pcnt = prev.pcnt;
  next.resonanceMul = newMul;
  next.prevResonanceProduct = product;
  next.resonanceCnt = prev.resonanceCnt + 1;
  next.maxResonanceMul = newMaxMul;
  next.cc = prev.cc;
  next.ce = prev.ce;
  next.conLayers = prev.conLayers.map(cl => ({ ...cl }));
  next.gtime = prev.gtime;
  next.lastPrestigeGtime = prev.lastPrestigeGtime;
  next.memoryActive = prev.memoryActive;
  next.memoryCleared = prev.memoryCleared;
  return next;
}

export function doPrestige(prev: GameState): GameState {
  const span = prev.gtime - prev.lastPrestigeGtime;
  const memorySuccess = prev.memoryActive;
  const willTriggerMemory = !prev.memoryActive && !prev.memoryCleared && prev.pcnt > 0 && span <= 1.0;

  const spGain = prev.memoryCleared
    ? Math.max(1, Math.floor(Math.log10(Math.max(prev.res, 10)) / 308))
    : 1;

  const next = mkGs(prev.sp + spGain, prev.spu);
  next.pcnt = prev.pcnt + 1;
  next.gtime = prev.gtime;
  next.lastPrestigeGtime = prev.gtime;
  next.memoryActive = willTriggerMemory;
  next.memoryCleared = memorySuccess || prev.memoryCleared;
  next.maxResonanceMul = prev.maxResonanceMul;

  // Apply resonance residual: start with 10% of historical max
  if (prev.spu.resResidual > 0 && prev.maxResonanceMul > 1) {
    next.resonanceMul = 1 + (prev.maxResonanceMul - 1) * 0.1;
  }

  next.conLayers = prev.conLayers.map((cl, i) => ({
    ...mkConLayer(i),
    unlocked: cl.unlocked,
  }));
  next.cc = prev.conLayers[0].unlocked ? 1 : 0;
  next.ce = 0;
  return next;
}

export function manualPrestige(prev: GameState): GameState {
  if (!prev.memoryCleared) return prev;
  return doPrestige(prev);
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

export function unlockConLayer(prev: GameState, i: number): GameState {
  if (prev.conLayers[i].unlocked) return prev;
  if (prev.sp < CON_LCFG[i].sp) return prev;

  const conLayers = prev.conLayers.map(cl => ({ ...cl }));
  conLayers[i].unlocked = true;

  let cc = prev.cc;
  if (i === 0) cc += 1;

  return { ...prev, sp: prev.sp - CON_LCFG[i].sp, conLayers, cc };
}

export function buyCompress(prev: GameState): GameState {
  if (prev.res < prev.compressCost) return prev;
  return {
    ...prev,
    res: prev.res - prev.compressCost,
    compressLevel: prev.compressLevel + 1,
    compressCost: prev.compressCost * 10,
  };
}

export function buySP(prev: GameState, k: keyof SpUpgrades): GameState {
  const spDef = SP_DEF.find(d => d.k === k);
  if (!spDef) return prev;

  const currentLevel = prev.spu[k];
  const isMaxed = spDef.max !== -1 && currentLevel >= spDef.max;
  const cost = getSpNextCost(spDef, currentLevel);
  if (isMaxed || prev.sp < cost) return prev;

  const spu = { ...prev.spu, [k]: currentLevel + 1 };
  let gmBase = prev.gmBase;
  if (k === "gMul") gmBase = 1 + spu.gMul * 0.25;

  return { ...prev, sp: prev.sp - cost, spu, gmBase };
}
