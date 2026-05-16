import { GP_THRESHOLD, getTierStep } from "./config";
import type { GameState, LayerState, ConstellationLayer } from "./types";
import { doPrestige } from "./actions";

export function tick(prev: GameState, dt: number): GameState {
  if (!prev.memoryCleared && (prev.res >= GP_THRESHOLD || prev.res === Infinity)) {
    return doPrestige(prev);
  }

  let res = prev.res;
  let gmBonus = prev.gmBonus;
  let ce = prev.ce;
  let cc = prev.cc;
  const gtime = prev.gtime + dt;

  const layersMut: LayerState[] = prev.layers.map(l => ({ ...l }));
  const conMut: ConstellationLayer[] = prev.conLayers.map(cl => ({ ...cl }));

  ce += cc * dt;

  const ceExp = 0.1 + prev.spu.ceEff * 0.05;
  const ceMul = ce > 0 ? Math.pow(1 + ce, ceExp) : 1;
  const tierStep = getTierStep(prev.spu.deep);
  const secStrength = prev.spu.halfTrigger > 0 ? 0.1 : 0;
  const compressMul = Math.pow(0.95, prev.compressLevel);

  for (let i = 0; i < layersMut.length; i++) {
    const layer = layersMut[i];
    layer.flash = Math.max(0, layer.flash - dt);

    if (!layer.unlocked) continue;

    layer.elapsed += dt;
    const effectiveInt = layer.int * compressMul;

    let ticks = 0;
    while (layer.elapsed >= effectiveInt && ticks < 20) {
      layer.elapsed -= effectiveInt;
      ticks++;

      const currentGm = prev.gmBase + gmBonus;
      const tierExpFull   = Math.pow(1.05, layer.pct);
      const linearBoostExp = 0.200 + tierStep * layer.pct;
      const upgradeMul = Math.pow(layer.upgrades + 1, 0.2) * (1 + 0.1 * layer.pct);
      const baseVal = (1 + layer.gainBonus) * prev.resonanceMul;
      // Bonus = baseVal^(1.01^Tier)  — applied to SC gain
      // bonusForBoost = Bonus^(0.200+0.005×Tier) = baseVal^(tierExpFull × linearBoostExp) — applied to gMult/Boost
      let bonusForGain  = Math.pow(baseVal, tierExpFull);
      let bonusForBoost = Math.pow(baseVal, tierExpFull * linearBoostExp);
      if (prev.memoryActive) {
        bonusForGain  = Math.pow(bonusForGain,  0.9);
        bonusForBoost = Math.pow(bonusForBoost, 0.9);
      }

      const isGain = layer.firstFire || Math.random() < 0.5;
      if (layer.firstFire) layer.firstFire = false;

      if (isGain) {
        // ── Gain event ──
        const gained = layer.gain * bonusForGain * currentGm * ceMul;
        res += gained;
        layer.evt = "gain";
        layer.evtAmt = gained;

        // Secondary: trigger gm/boost at 1/10 strength
        if (secStrength > 0) {
          const secBp = layer.bp * upgradeMul * bonusForBoost * secStrength;
          if (i === 0) {
            gmBonus += secBp;
          } else {
            for (let j = 0; j < i; j++) {
              if (layersMut[j].unlocked) layersMut[j].gainBonus += secBp;
            }
          }
        }
      } else {
        // ── gm / boost event ──
        if (i === 0) {
          const gmAdd = layer.bp * upgradeMul * bonusForBoost;
          gmBonus += gmAdd;
          layer.evt = "gm";
          layer.evtAmt = gmAdd;
        } else {
          const bpAdd = layer.bp * upgradeMul * bonusForBoost;
          for (let j = 0; j < i; j++) {
            if (layersMut[j].unlocked) layersMut[j].gainBonus += bpAdd;
          }
          layer.evt = "boost";
          layer.evtAmt = bpAdd;
        }

        // Secondary: trigger gain at 1/10 strength
        if (secStrength > 0) {
          res += layer.gain * bonusForGain * currentGm * ceMul * secStrength;
        }
      }

      layer.flash = 0.65;
    }

    if (layer.elapsed >= effectiveInt) layer.elapsed = 0;
  }

  // Constellation ticks
  for (let i = 0; i < conMut.length; i++) {
    const cl = conMut[i];
    if (!cl.unlocked) continue;

    cl.elapsed += dt;

    while (cl.elapsed >= cl.int) {
      cl.elapsed -= cl.int;

      if (Math.random() < 0.1) {
        const baseHits = Math.floor(cl.efficiency);
        const hits = baseHits + (Math.random() < cl.efficiency - baseHits ? 1 : 0);

        if (i === 0) {
          cc += hits;
        } else {
          const target = conMut[i - 1];
          for (let h = 0; h < hits; h++) {
            target.int *= 0.99;
            if (target.int < 0.01) {
              target.int = target.bi;
              target.efficiency += 0.05;
            }
          }
        }
      }
    }

    if (cl.elapsed >= cl.int) cl.elapsed = 0;
  }

  if (!prev.memoryCleared && (res >= GP_THRESHOLD || res === Infinity)) {
    const interim = { ...prev, res, gmBonus, layers: layersMut, conLayers: conMut, ce, cc, gtime };
    return doPrestige(interim);
  }

  return { ...prev, res, gmBonus, layers: layersMut, conLayers: conMut, ce, cc, gtime };
}
