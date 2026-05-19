import React from "react";
import type { GameState } from "../game/types";
import { fmtN } from "../utils/format";

interface Props {
  gs: GameState;
  onBuy: () => void;
  onBulkBuy: () => void;
  onToggleAutoUnlock: () => void;
}

export function CompressCard({ gs, onBuy, onBulkBuy, onToggleAutoUnlock }: Props) {
  const { compressLevel: lv, compressCost: cost } = gs;
  const resonatorExp = Math.pow(1.02, gs.resonators);
  const mul = Math.pow(0.95, lv * resonatorExp);
  const resMul = Math.max(1, gs.resonanceMul);
  const effectiveCost = cost / resMul;
  const canBuy = gs.res >= effectiveCost;

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.left}>
          <span style={styles.name}>COMPRESS</span>
          <span style={styles.level}>Lv.{lv}</span>
          <span style={styles.effect}>全インターバル ×{mul.toFixed(4)}</span>
        </div>
        <div style={styles.btnRow}>
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
          {gs.pcnt >= 2 && (
            <button
              style={{
                ...styles.btn,
                borderColor: canBuy ? "#00ffcc99" : "#333",
                color:       canBuy ? "#00ffcc99" : "#555",
                cursor:      canBuy ? "pointer"   : "not-allowed",
                padding: "4px 7px",
              }}
              onClick={onBulkBuy}
              disabled={!canBuy}
            >
              ×10
            </button>
          )}
        </div>
      </div>
      {gs.pcnt >= 3 && (
        <button
          style={{
            ...styles.btn,
            width: "100%",
            marginTop: 4,
            borderColor: gs.autoUnlock ? "#88aaff" : "#333",
            color:       gs.autoUnlock ? "#88aaff" : "#555",
            cursor: "pointer",
            textAlign: "center",
          }}
          onClick={onToggleAutoUnlock}
        >
          AUTO-UNLOCK: {gs.autoUnlock ? "ON" : "OFF"}
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    marginBottom: 8,
  },
  card: {
    border: "1px solid #00ffcc33",
    borderRadius: 8,
    padding: "8px 12px",
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
  btnRow: {
    display: "flex",
    gap: 4,
    flexShrink: 0,
  },
  btn: {
    background: "transparent",
    border: "1px solid",
    borderRadius: 4,
    padding: "4px 10px",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
  },
};
