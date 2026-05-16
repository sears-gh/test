import { NUM_LAYERS, LCFG } from "./config";
import type { GameState, LayerState, SpUpgrades } from "./types";

export const defaultSpu: SpUpgrades = { gMul: 0, speed: 0, boost: 0, gain: 0, deep: 0 };

export function mkLayer(i: number, spu: SpUpgrades): LayerState {
  const bi = LCFG[i].t * Math.pow(0.9, spu.speed);
  const bm = 1 + spu.boost * 0.1;
  const gm = 1 + spu.gain * 0.3;
  return {
    bi,
    int: bi,
    elapsed: 0,
    cost: LCFG[i].uB,
    gain: LCFG[i].g * gm,
    bp: LCFG[i].b * bm,
    gainBonus: 0,
    pct: 0,
    flash: 0,
    evt: "",
    evtAmt: 0,
    unlocked: i === 0,
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
  };
}
