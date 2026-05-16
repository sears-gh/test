import React from "react";
import type { GameState } from "../game/types";
import { resonanceProduct, canResonate } from "../game/actions";

interface Props {
  gs: GameState;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResonanceModal({ gs, onConfirm, onCancel }: Props) {
  const product = resonanceProduct(gs);
  const newMul = Math.pow(product, 1 / (16 - gs.spu.resExp));
  const ok = canResonate(gs);

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        <div style={styles.title}>◈ RESONANCE</div>

        <div style={styles.section}>
          <div style={styles.label}>gm × Π( (1+bonus)^(1.05^Tier) )</div>
          <div style={styles.value}>{product.toExponential(4)}</div>
          {!ok && (
            <div style={styles.warn}>
              前回の積 ({gs.prevResonanceProduct.toExponential(4)}) 以下のため発動不可
            </div>
          )}
        </div>

        <div style={styles.arrow}>▼</div>

        <div style={styles.section}>
          <div style={styles.label}>新しい Resonance 倍率</div>
          <div style={{ ...styles.value, color: "#00ffcc", fontSize: 28 }}>
            ×{newMul.toFixed(6)}
          </div>
          {gs.resonanceCnt > 0 && (
            <div style={styles.prev}>
              現在: ×{gs.resonanceMul.toFixed(6)}
            </div>
          )}
        </div>

        <div style={styles.resetWarn}>
          ⚠ 全リセット: res / 全階層 / gmBonus がリセットされます。
          SP・SP 強化・Resonance 倍率は保持されます。
        </div>

        <div style={styles.btnRow}>
          <button style={styles.cancelBtn} onClick={onCancel}>キャンセル</button>
          <button
            style={{ ...styles.confirmBtn, opacity: ok ? 1 : 0.4, cursor: ok ? "pointer" : "not-allowed" }}
            onClick={ok ? onConfirm : undefined}
            disabled={!ok}
          >
            発動
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "#00000099",
    zIndex: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    background: "linear-gradient(135deg, #0a0a1a, #0d1a2b)",
    border: "1px solid #00ffcc66",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 380,
    fontFamily: "'Courier New', monospace",
    boxShadow: "0 0 32px #00ffcc22",
  },
  title: {
    color: "#00ffcc",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 20,
    textShadow: "0 0 16px #00ffcc88",
  },
  section: {
    textAlign: "center",
    marginBottom: 8,
  },
  label: {
    color: "#6666aa",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    color: "#aaaadd",
    fontSize: 18,
    fontWeight: "bold",
  },
  prev: {
    color: "#555599",
    fontSize: 11,
    marginTop: 4,
  },
  warn: {
    color: "#ff6666",
    fontSize: 11,
    marginTop: 6,
  },
  arrow: {
    textAlign: "center",
    color: "#00ffcc44",
    fontSize: 16,
    margin: "4px 0",
  },
  resetWarn: {
    background: "#ff444411",
    border: "1px solid #ff444433",
    borderRadius: 6,
    padding: "8px 10px",
    color: "#ff8888",
    fontSize: 11,
    lineHeight: 1.6,
    margin: "16px 0",
  },
  btnRow: {
    display: "flex",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    background: "transparent",
    border: "1px solid #4a4a8a",
    color: "#8888cc",
    borderRadius: 6,
    padding: "8px",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
  },
  confirmBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #003322, #004433)",
    border: "1px solid #00ffcc",
    color: "#00ffcc",
    borderRadius: 6,
    padding: "8px",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    fontWeight: "bold",
  },
};
