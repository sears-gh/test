import { GP_THRESHOLD } from "./config";
import type { GameState, LayerState } from "./types";
import { mkGs } from "./init";

export function tick(prev: GameState, dt: number): GameState {
  if (prev.res >= GP_THRESHOLD || prev.res === Infinity) {
    const next = mkGs(prev.sp + 1, prev.spu);
    next.pcnt = prev.pcnt + 1;
    return next;
  }

  let res = prev.res;
  let gmBonus = prev.gmBonus;
  const layersMut: LayerState[] = prev.layers.map(l => ({ ...l }));

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

      if (Math.random() < 0.5) {
        const gained = layer.gain * (1 + layer.gainBonus) * layer.tierMul * prev.resonanceMul * currentGm;
        res += gained;
        layer.evt = "gain";
        layer.evtAmt = gained;
      } else {
        if (i === 0) {
          const gmAdd = layer.bp * upgradeMul * layer.tierMul;
          gmBonus += gmAdd;
          layer.evt = "gm";
          layer.evtAmt = gmAdd;
        } else {
          const bpAdd = layer.bp * upgradeMul * layer.tierMul;
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

  if (res >= GP_THRESHOLD || res === Infinity) {
    const next = mkGs(prev.sp + 1, prev.spu);
    next.pcnt = prev.pcnt + 1;
    return next;
  }

  return { ...prev, res, gmBonus, layers: layersMut };
}
