import { NUM_LAYERS, LCFG, CON_LCFG } from "./config";
import type { GameState, LayerState, ConstellationLayer, SpUpgrades } from "./types";

export const defaultSpu: SpUpgrades = {
  gMul: 0, speed: 0, boost: 0, gain: 0, deep: 0,
  halfTrigger: 0, resResidual: 0, resExp: 0,
  ul2: 0, ul3: 0, ul4: 0, ul5: 0, ul6: 0, ul7: 0, ul8: 0,
  ceEff: 0,
};

const PRE_UNLOCK_KEYS = ["ul2","ul3","ul4","ul5","ul6","ul7","ul8"] as const;

export function mkLayer(i: number, spu: SpUpgrades): LayerState {
  const bi = LCFG[i].t * Math.pow(0.9, spu.speed);
  const bm = 1 + spu.boost * 0.1;
  const gm = 1 + spu.gain * 0.3;
  const preUnlocked = i > 0 && i <= 7 && spu[PRE_UNLOCK_KEYS[i - 1]] > 0;
  return {
    bi,
    int: bi,
    elapsed: 0,
    cost: LCFG[i].uB,
    gain: LCFG[i].g * gm,
    bp: LCFG[i].b * bm,
    gainBonus: 0,
    pct: 0,
    upgrades: 0,
    flash: 0,
    evt: "",
    evtAmt: 0,
    unlocked: i === 0 || preUnlocked,
    firstFire: i === 0 || preUnlocked,
  };
}

export function mkConLayer(i: number): ConstellationLayer {
  return {
    unlocked: false,
    int: CON_LCFG[i].t,
    bi: CON_LCFG[i].t,
    elapsed: 0,
    efficiency: 1.0,
  };
}

export function mkGs(sp: number, spu: SpUpgrades): GameState {
  return {
    res: 0,
    sp,
    spu,
    gmBase: 1 + spu.gMul * 0.25,
    gmBonus: 0,
    layers: Array.from({ length: NUM_LAYERS }, (_, i) => mkLayer(i, spu)),
    pcnt: 0,
    resonanceMul: 1,
    prevResonanceProduct: 0,
    resonanceCnt: 0,
    maxResonanceMul: 1,
    cc: 0,
    ce: 0,
    conLayers: Array.from({ length: NUM_LAYERS }, (_, i) => mkConLayer(i)),
    gtime: 0,
    lastPrestigeGtime: 0,
    memoryActive: false,
    memoryCleared: false,
    compressLevel: 0,
    compressCost: 1,
  };
}
