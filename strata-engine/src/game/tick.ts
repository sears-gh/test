import { GP_THRESHOLD, getTierExp } from "./config";
import type { GameState, LayerState, ConstellationLayer } from "./types";
import { doPrestige } from "./actions";

export function tick(prev: GameState, dt: number): GameState {
  // Auto-prestige: disabled after memory cleared (player uses manual button)
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

  // CE accumulates from CC every tick
  ce += cc * dt;

  // CE multiplier applied to resource gain: (1 + ce)^0.1
  const ceMul = ce > 0 ? Math.pow(1 + ce, 0.1) : 1;

  const tierExpBase = getTierExp(prev.spu.deep);

  // Star layer ticks
  for (let i = 0; i < layersMut.length; i++) {
    const layer = layersMut[i];
    layer.flash = Math.max(0, layer.flash - dt);

    if (!layer.unlocked) continue;

    layer.elapsed += dt;

    let ticks = 0;
    while (layer.elapsed >= layer.int && ticks < 20) {
      layer.elapsed -= layer.int;
      ticks++;

      const currentGm = prev.gmBase + gmBonus;
      const upgradeMul = Math.pow(layer.upgrades + 1, 0.2);
      const tierExp = Math.pow(tierExpBase, layer.pct);
      let bonusVal = Math.pow((1 + layer.gainBonus) * prev.resonanceMul, tierExp);

      // 星列の記憶: all bonuses weakened by ^0.9
      if (prev.memoryActive) bonusVal = Math.pow(bonusVal, 0.9);

      if (Math.random() < 0.5) {
        const gained = layer.gain * bonusVal * currentGm * ceMul;
        res += gained;
        layer.evt = "gain";
        layer.evtAmt = gained;
      } else {
        if (i === 0) {
          const gmAdd = layer.bp * upgradeMul;
          gmBonus += gmAdd;
          layer.evt = "gm";
          layer.evtAmt = gmAdd;
        } else {
          const bpAdd = layer.bp * upgradeMul;
          for (let j = 0; j < i; j++) {
            if (layersMut[j].unlocked) {
              layersMut[j].gainBonus += bpAdd;
            }
          }
          layer.evt = "boost";
          layer.evtAmt = bpAdd;
        }
      }

      layer.flash = 0.65;
    }

    if (layer.elapsed >= layer.int) layer.elapsed = 0;
  }

  // Constellation layer ticks
  for (let i = 0; i < conMut.length; i++) {
    const cl = conMut[i];
    if (!cl.unlocked) continue;

    cl.elapsed += dt;

    while (cl.elapsed >= cl.int) {
      cl.elapsed -= cl.int;

      if (Math.random() < 0.1) {
        // Calculate hits from efficiency (floor + probabilistic extra)
        const baseHits = Math.floor(cl.efficiency);
        const fracHits = cl.efficiency - baseHits;
        const hits = baseHits + (Math.random() < fracHits ? 1 : 0);

        if (i === 0) {
          // Nebula: generate CC
          cc += hits;
        } else {
          // Pulsar+: speed up layer below
          const target = conMut[i - 1];
          for (let h = 0; h < hits; h++) {
            target.int *= 0.99;
            if (target.int < 0.01) {
              target.int = target.bi;
              // Lower layer gains efficiency on each cycle completion
              target.efficiency += 0.05;
            }
          }
        }
      }
    }

    if (cl.elapsed >= cl.int) cl.elapsed = 0;
  }

  // Check auto-prestige again after accumulation (non-memory-cleared only)
  if (!prev.memoryCleared && (res >= GP_THRESHOLD || res === Infinity)) {
    const interim = { ...prev, res, gmBonus, layers: layersMut, conLayers: conMut, ce, cc, gtime };
    return doPrestige(interim);
  }

  return { ...prev, res, gmBonus, layers: layersMut, conLayers: conMut, ce, cc, gtime };
}
