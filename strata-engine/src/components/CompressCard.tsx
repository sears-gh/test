import React from "react";
import type { GameState } from "../game/types";
import { fmtN } from "../utils/format";

interface Props {
  gs: GameState;
  onBuy: () => void;
}

export function CompressCard({ gs, onBuy }: Props) {
  const { compressLevel: lv, compressCost: cost } = gs;
  const resonatorExp = Math.pow(1.02, gs.resonators);
  const mul = Math.pow(0.95, lv * resonatorExp);
  const resMul = Math.max(1, gs.resonanceMul);
  const effectiveCost = cost / resMul;
  const canBuy = gs.res >= effectiveCost;

  const lvLabel = `Lv.${lv}`;

  return (
    <div style={styles.card}>
      <div style={styles.left}>
        <span style={styles.name}>COMPRESS</span>
        <span style={styles.level}>{lvLabel}</span>
        <span style={styles.effect}>全インターバル ×{mul.toFixed(4)}</span>
      </div>
      <button
        style={{
          ...styles.btn,
          borderColor: canBuy ? "#00ffcc" : "#333",
          color:       canBuy ? "#00ffcc" : "#555",
          cursor:      canBuy ? "pointer"  : "not-allowed",
        }}
        onClick={onBuy}
        disabled={!canBuy}
      >
        {fmtN(effectiveCost)} SC
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: "1px solid #00ffcc33",
    borderRadius: 8,
    padding: "8px 12px",
    marginBottom: 8,
    fontFamily: "'Courier New', monospace",
    background: "linear-gradient(135deg, #0a0a1a, #051a1a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  left: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap" as const,
    minWidth: 0,
  },
  name: {
    color: "#00ffcc",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  level: {
    color: "#4a8a8a",
    fontSize: 11,
  },
  effect: {
    color: "#6699aa",
    fontSize: 10,
  },
  btn: {
    background: "transparent",
    border: "1px solid",
    borderRadius: 4,
    padding: "4px 10px",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
    flexShrink: 0,
  },
};
