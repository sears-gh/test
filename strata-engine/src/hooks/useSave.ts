import { useEffect, useRef, useCallback } from "react";
import type { GameState } from "../game/types";
import { mkGs, defaultSpu } from "../game/init";

const SAVE_KEY = "strata-save";

export function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
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
