import { LCFG, CON_LCFG, SP_DEF, getSpNextCost, tierThreshold, getResExpDenom } from "./config";
import type { GameState, SpUpgrades } from "./types";
import { mkGs, mkConLayer } from "./init";

export function resonanceProduct(gs: GameState): number {
  const rawGm = gs.gmBase + gs.gmBonus;
  return gs.layers.reduce((acc, l) => {
    const tierExp = Math.pow(1.05, l.pct);
    return acc * Math.pow(1 + l.gainBonus, tierExp);
  }, rawGm);
}

export function canResonate(gs: GameState): boolean {
  if (!gs.layers[7].unlocked) return false;
  return resonanceProduct(gs) > gs.prevResonanceProduct;
}

export function resonance(prev: GameState): GameState {
  if (!canResonate(prev)) return prev;
  const product = resonanceProduct(prev);
  const denom = getResExpDenom(prev.spu, prev.activeChallenge, prev.challengesDone);
  const newMul = Math.pow(product, 1 / denom);
  const newMaxMul = Math.max(prev.maxResonanceMul, newMul);

  const next = mkGs(prev.sp, prev.spu, prev.challengesDone);
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
  next.memoryActive  = prev.memoryActive;
  next.memoryCleared = prev.memoryCleared;
  next.activeChallenge = prev.activeChallenge;
  next.challengesDone  = prev.challengesDone;
  next.autoUnlock = prev.autoUnlock;

  const newResonators = Math.max(0, Math.floor(
    Math.log10(Math.max(prev.totalSCGained, 1))
  ));
  next.resonators    = prev.resonators + newResonators;
  next.totalSCGained = prev.totalSCGained;

  return next;
}

export function doPrestige(prev: GameState): GameState {
  const span = prev.gtime - prev.lastPrestigeGtime;
  const memorySuccess = prev.memoryActive;
  const willTriggerMemory = !prev.memoryActive && !prev.memoryCleared && prev.pcnt > 0 && span <= 1.0;

  const spGain = prev.memoryCleared
    ? Math.max(1, Math.floor(Math.log10(Math.max(prev.res, 10)) / 308))
    : 1;

  // Challenge completion: mark done and clear active
  const challengesDone = [...prev.challengesDone] as [boolean, boolean, boolean];
  if (prev.activeChallenge !== null) {
    challengesDone[prev.activeChallenge] = true;
  }

  const next = mkGs(prev.sp + spGain, prev.spu, challengesDone);
  next.pcnt = prev.pcnt + 1;
  next.gtime = prev.gtime;
  next.lastPrestigeGtime = prev.gtime;
  next.memoryActive = willTriggerMemory;
  next.memoryCleared = memorySuccess || prev.memoryCleared;
  next.maxResonanceMul = prev.maxResonanceMul;
  next.activeChallenge = null;
  next.challengesDone = challengesDone;
  next.autoUnlock = prev.autoUnlock;

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

export function enterChallenge(prev: GameState, i: number): GameState {
  if (prev.pcnt < 5) return prev;
  if (prev.activeChallenge !== null) return prev;

  const next = mkGs(prev.sp, prev.spu, prev.challengesDone);
  next.pcnt = prev.pcnt;
  next.gtime = prev.gtime;
  next.lastPrestigeGtime = prev.gtime;
  next.maxResonanceMul = prev.maxResonanceMul;
  next.activeChallenge = i;
  next.challengesDone = [...prev.challengesDone] as [boolean, boolean, boolean];
  next.autoUnlock = prev.autoUnlock;
  next.conLayers = prev.conLayers.map((cl, j) => ({
    ...mkConLayer(j),
    unlocked: cl.unlocked,
  }));
  next.cc = prev.conLayers[0].unlocked ? 1 : 0;
  return next;
}

export function upgrade(prev: GameState, i: number): GameState {
  const layer = prev.layers[i];
  const resMul = Math.max(1, prev.resonanceMul);
  const effectiveCost = layer.cost / resMul;
  if (!layer.unlocked || prev.res < effectiveCost) return prev;

  // C3: each layer max 1 upgrade
  if (prev.activeChallenge === 2 && layer.upgrades >= 1) return prev;

  const layers = prev.layers.map(l => ({ ...l }));
  const l = layers[i];

  const res = prev.res - effectiveCost;
  l.cost *= LCFG[i].uM;
  l.int *= 0.8;
  l.upgrades += 1;

  let gmBonus = prev.gmBonus;
  // C1: no tier-up
  if (prev.activeChallenge !== 0 && l.upgrades >= tierThreshold(l.pct + 1)) {
    gmBonus += l.gainBonus;
    l.int = l.bi;
    l.elapsed = 0;
    l.pct += 1;
  }

  return { ...prev, res, layers, gmBonus };
}

export function unlock(prev: GameState, i: number): GameState {
  const layer = prev.layers[i];
  const resMul = Math.max(1, prev.resonanceMul);
  const effectiveUc = LCFG[i].uc / resMul;
  if (layer.unlocked || prev.res < effectiveUc) return prev;

  const layers = prev.layers.map(l => ({ ...l }));
  layers[i].unlocked = true;
  layers[i].firstFire = true;

  return { ...prev, res: prev.res - effectiveUc, layers };
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
  // C2: compress disabled
  if (prev.activeChallenge === 1) return prev;

  const resMul = Math.max(1, prev.resonanceMul);
  let effectiveCost = prev.compressCost / resMul;

  // C3: cost divided by log(current SC)
  if (prev.activeChallenge === 2) {
    effectiveCost /= Math.log10(Math.max(prev.res, 10));
  }

  if (prev.res < effectiveCost) return prev;
  return {
    ...prev,
    res: prev.res - effectiveCost,
    compressLevel: prev.compressLevel + 1,
    compressCost: prev.compressCost * 10,
  };
}

export function bulkUpgrade(prev: GameState, i: number, count: number): GameState {
  let gs = prev;
  for (let n = 0; n < count; n++) {
    const next = upgrade(gs, i);
    if (next === gs) break;
    gs = next;
  }
  return gs;
}

export function bulkCompress(prev: GameState, count: number): GameState {
  let gs = prev;
  for (let n = 0; n < count; n++) {
    const next = buyCompress(gs);
    if (next === gs) break;
    gs = next;
  }
  return gs;
}

export function toggleAutoUnlock(prev: GameState): GameState {
  return { ...prev, autoUnlock: !prev.autoUnlock };
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
