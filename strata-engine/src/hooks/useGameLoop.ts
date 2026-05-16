import { useEffect, useRef } from "react";
import type { GameState } from "../game/types";
import { tick } from "../game/tick";

export function useGameLoop(
  setGs: React.Dispatch<React.SetStateAction<GameState>>
) {
  const lastRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const loop = (ts: number) => {
      if (lastRef.current !== null) {
        const rawDt = (ts - lastRef.current) / 1000;
        const dt = Math.min(rawDt, 0.5);
        setGs(prev => tick(prev, dt));
      }
      lastRef.current = ts;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [setGs]);
}
