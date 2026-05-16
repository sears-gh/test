import { useEffect, useRef, useCallback } from "react";
import type { GameState } from "../game/types";
import { mkGs, defaultSpu } from "../game/init";
import { LCFG } from "../game/config";

const SAVE_KEY = "strata-save";

export function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const gs = JSON.parse(raw) as GameState;
    // bp は config から常に決定できるので再計算してセーブの古い値を上書き
    const bm = 1 + gs.spu.boost * 0.1;
    gs.layers.forEach((l, i) => { l.bp = LCFG[i].b * bm; });
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
  }, []); // 依存配列を空にし、インターバルを一度だけ生成する

  const deleteSave = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    setGs(mkGs(0, defaultSpu));
  }, [setGs]);

  return { deleteSave };
}
