import { useEffect, useRef, useCallback } from "react";
import type { GameState } from "../game/types";
import { mkGs, defaultSpu, mkConLayer } from "../game/init";
import { LCFG, NUM_LAYERS } from "../game/config";

const SAVE_KEY = "strata-save";

export function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const gs = JSON.parse(raw) as GameState;

    const bm = 1 + gs.spu.boost * 0.1;
    gs.layers.forEach((l, i) => { l.bp = LCFG[i].b * bm; });

    // Migrate new SpUpgrades fields
    const spu = gs.spu as unknown as Record<string, number>;
    const newSpuFields: (keyof typeof defaultSpu)[] = [
      "halfTrigger", "resResidual",
      "ul2", "ul3", "ul4", "ul5", "ul6", "ul7", "ul8",
      "ceEff",
    ];
    for (const k of newSpuFields) {
      if (spu[k] === undefined) spu[k] = 0;
    }

    // Migrate new GameState fields
    gs.cc = gs.cc ?? 0;
    gs.ce = gs.ce ?? 0;
    gs.gtime = gs.gtime ?? 0;
    gs.lastPrestigeGtime = gs.lastPrestigeGtime ?? 0;
    gs.memoryActive = gs.memoryActive ?? false;
    gs.memoryCleared = gs.memoryCleared ?? false;
    gs.maxResonanceMul = gs.maxResonanceMul ?? (gs.resonanceMul ?? 1);
    gs.compressLevel = gs.compressLevel ?? 0;
    gs.compressCost  = gs.compressCost  ?? 1;

    if (!gs.conLayers || gs.conLayers.length !== NUM_LAYERS) {
      gs.conLayers = Array.from({ length: NUM_LAYERS }, (_, i) => mkConLayer(i));
    }

    return gs;
  } catch {
    return null;
  }
}

export function useSave(
  gs: GameState,
  setGs: React.Dispatch<React.SetStateAction<GameState>>
) {
  const gsRef = useRef(gs);
  gsRef.current = gs;

  useEffect(() => {
    const id = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gsRef.current));
    }, 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const deleteSave = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    setGs(mkGs(0, defaultSpu));
  }, [setGs]);

  return { deleteSave };
}
