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

      if (Math.random() < 0.5) {
        const gained = layer.gain * (1 + layer.gainBonus) * currentGm;
        res += gained;
        layer.evt = "gain";
        layer.evtAmt = gained;
      } else {
        if (i === 0) {
          gmBonus += 0.002;
          layer.evt = "gm";
          layer.evtAmt = 0.002;
        } else {
          for (let j = 0; j < i; j++) {
            if (layersMut[j].unlocked) {
              layersMut[j].gainBonus += layer.bp;
            }
          }
          layer.evt = "boost";
          layer.evtAmt = layer.bp;
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
