import { useEffect, useCallback } from "react";
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
  useEffect(() => {
    const id = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gs));
    }, 1000);
    return () => clearInterval(id);
  }, [gs]);

  const deleteSave = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    setGs(mkGs(0, defaultSpu));
  }, [setGs]);

  return { deleteSave };
}
