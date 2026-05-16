import React from "react";
import type { GameState } from "../game/types";
import { CON_LCFG, NUM_LAYERS } from "../game/config";
import { fmtN, fmtT } from "../utils/format";

interface Props {
  gs: GameState;
  onUnlock: (i: number) => void;
  onClose: () => void;
}

export function ConstellationPanel({ gs, onUnlock, onClose }: Props) {
  const ceMul = gs.ce > 0 ? Math.pow(1 + gs.ce, 0.1) : 1;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>✦ 星座機構</span>
          <span style={styles.spBal}>SP: <span style={styles.spVal}>{gs.sp}</span></span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.stats}>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Cosmic Cores</span>
            <span style={styles.statVal}>{fmtN(gs.cc)}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Cosmic Energy</span>
            <span style={styles.statVal}>{fmtN(gs.ce)}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>CE 倍率</span>
            <span style={{ ...styles.statVal, color: "#00ffcc" }}>×{ceMul.toFixed(4)}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>CE 生成</span>
            <span style={styles.statVal}>{fmtN(gs.cc)}/s</span>
          </div>
        </div>

        <div style={styles.list}>
          {Array.from({ length: NUM_LAYERS }, (_, i) => {
            const cfg = CON_LCFG[i];
            const cl = gs.conLayers[i];
            const canUnlock = !cl.unlocked && gs.sp >= cfg.sp;
            const prevUnlocked = i === 0 || gs.conLayers[i - 1].unlocked;

            if (!cl.unlocked) {
              return (
                <div key={i} style={{ ...styles.item, borderColor: cfg.c + "33" }}>
                  <div style={styles.itemHeader}>
                    <span style={{ ...styles.itemName, color: cfg.c + "88" }}>
                      🔒 {cfg.n}
                    </span>
                    <span style={styles.itemCost}>{cfg.sp} SP</span>
                  </div>
                  <div style={styles.itemDesc}>
                    {i === 0
                      ? "CC 生成: 毎ティック10%でCC+1。解放時に即座に+1CC。"
                      : `${CON_LCFG[i - 1].n}のインターバルを毎ティック10%で−1%。0.01s到達でリセット+効率+5%。`}
                  </div>
                  <button
                    style={{
                      ...styles.unlockBtn,
                      borderColor: canUnlock && prevUnlocked ? cfg.c : "#333",
                      color: canUnlock && prevUnlocked ? cfg.c : "#444",
                      cursor: canUnlock && prevUnlocked ? "pointer" : "not-allowed",
                    }}
                    onClick={() => onUnlock(i)}
                    disabled={!canUnlock || !prevUnlocked}
                  >
                    {!prevUnlocked ? "前の層を解放してください" : `UNLOCK (${cfg.sp} SP)`}
                  </button>
                </div>
              );
            }

            const cl2 = gs.conLayers[i];
            const progress = Math.min(1, cl2.elapsed / cl2.int);
            const effPct = (cl2.efficiency * 100).toFixed(0);

            return (
              <div key={i} style={{ ...styles.item, borderColor: cfg.c + "66" }}>
                <div style={styles.itemHeader}>
                  <span style={{ ...styles.itemName, color: cfg.c }}>{cfg.n}</span>
                  <span style={{ color: "#aaaadd", fontSize: 10 }}>
                    効率 <span style={{ color: cl2.efficiency > 1 ? "#ffd700" : "#8888aa" }}>
                      {effPct}%
                    </span>
                  </span>
                </div>
                <div style={styles.barWrap}>
                  <div style={styles.barBg}>
                    <div style={{
                      ...styles.barFill,
                      transform: `scaleX(${progress})`,
                      background: `linear-gradient(90deg, ${cfg.c}88, ${cfg.c})`,
                    }} />
                  </div>
                  <span style={styles.timerText}>{fmtT(Math.max(0, cl2.int - cl2.elapsed))}</span>
                </div>
                <div style={styles.itemDesc}>
                  {i === 0
                    ? `毎ティック10%でCC+${cl2.efficiency > 1 ? (cl2.efficiency).toFixed(2) + "×" : "1"}。間隔: ${fmtT(cl2.int)}`
                    : `${CON_LCFG[i - 1].n}のインターバルを縮小中 (現在 ${fmtT(gs.conLayers[i - 1].int)})`}
                </div>
              </div>
            );
          })}
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
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    background: "linear-gradient(135deg, #0a0a1a, #0d0d2b)",
    border: "1px solid #e1705566",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 420,
    maxHeight: "85vh",
    overflowY: "auto",
    fontFamily: "'Courier New', monospace",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  title: {
    color: "#e17055",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 2,
    flex: 1,
  },
  spBal: {
    color: "#aaaadd",
    fontSize: 12,
  },
  spVal: {
    color: "#ffd700",
    fontWeight: "bold",
  },
  closeBtn: {
    background: "transparent",
    border: "1px solid #4a4a8a",
    color: "#8888cc",
    borderRadius: 4,
    padding: "2px 8px",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
  },
  stats: {
    background: "#0d0d2088",
    border: "1px solid #1a1a4e",
    borderRadius: 8,
    padding: "8px 12px",
    marginBottom: 12,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4px 8px",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
  },
  statLabel: {
    color: "#6666aa",
  },
  statVal: {
    color: "#aaaadd",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  item: {
    border: "1px solid",
    borderRadius: 8,
    padding: "8px 12px",
    background: "#0d0d2088",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  itemCost: {
    color: "#ffd700",
    fontSize: 11,
  },
  itemDesc: {
    color: "#6666aa",
    fontSize: 10,
    marginBottom: 6,
    lineHeight: 1.5,
  },
  barWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  barBg: {
    flex: 1,
    height: 6,
    background: "#1a1a3e",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    height: "100%",
    borderRadius: 3,
    transformOrigin: "left",
    willChange: "transform",
  },
  timerText: {
    color: "#8888cc",
    fontSize: 10,
    minWidth: 40,
    textAlign: "right",
  },
  unlockBtn: {
    background: "transparent",
    border: "1px solid",
    borderRadius: 4,
    padding: "4px 10px",
    fontSize: 10,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
    width: "100%",
  },
};
