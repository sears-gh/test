import React from "react";
import type { GameState } from "../game/types";
import { GP_THRESHOLD } from "../game/config";
import { fmtN } from "../utils/format";
import { canResonate } from "../game/actions";

interface Props {
  gs: GameState;
  onOpenSP: () => void;
  onOpenHelp: () => void;
  onOpenResonance: () => void;
  onOpenConstellation: () => void;
  onManualPrestige: () => void;
}

export function Header({ gs, onOpenSP, onOpenHelp, onOpenResonance, onOpenConstellation, onManualPrestige }: Props) {
  const hasSP = gs.sp > 0 || gs.pcnt > 0;
  const gm = gs.gmBase + gs.gmBonus;
  const cosmosUnlocked = gs.layers[7]?.unlocked ?? false;
  const resonanceReady = canResonate(gs);
  const ceMul = gs.ce > 0 ? Math.pow(1 + gs.ce, 0.1) : 1;
  const hasConstellation = hasSP;

  const logRes = gs.res > 0 ? Math.log10(Math.min(gs.res, GP_THRESHOLD)) : 0;
  const logMax = Math.log10(GP_THRESHOLD);
  const gpPct = Math.min(100, (logRes / logMax) * 100);

  // After memory cleared: show res/threshold as log ratio without clamp
  const postMemoryPct = gs.memoryCleared && gs.res > 0
    ? Math.min(100, (Math.log10(gs.res) / logMax) * 100)
    : gpPct;

  return (
    <div style={styles.header}>
      <div style={styles.resRow}>
        <span style={styles.resLabel}>RESOURCES</span>
        <span style={styles.resVal}>{fmtN(gs.res)}</span>
      </div>
      <div style={styles.gmRow}>
        <span style={styles.gmText}>
          Global ×{gm.toFixed(3)}
          {gs.resonanceMul > 1 && (
            <span style={styles.resMulBadge}> ◈×{gs.resonanceMul.toFixed(4)}</span>
          )}
          {ceMul > 1.0001 && (
            <span style={styles.ceMulBadge}> ✦×{ceMul.toFixed(3)}</span>
          )}
        </span>
        {hasSP && (
          <span style={styles.spText}>SP: <span style={styles.spVal}>{gs.sp}</span></span>
        )}
      </div>
      {gs.memoryActive && (
        <div style={styles.memoryBanner}>
          ★ 星列の記憶 発動中 — ボーナス ^0.9 ★
        </div>
      )}
      {gs.memoryCleared && (
        <div style={styles.memoryBanner}>
          ◆ 星列の記憶 突破済み — リソースXで任意崩壊可
        </div>
      )}
      <div style={styles.barWrap}>
        <div style={styles.barBg}>
          <div style={{
            ...styles.barFill,
            transform: `scaleX(${postMemoryPct / 100})`,
            background: gs.memoryCleared
              ? "linear-gradient(90deg, #ffd700, #ff6b9d)"
              : "linear-gradient(90deg, #00ffcc, #ffd700)",
          }} />
        </div>
        <span style={styles.barLabel}>
          {gs.memoryCleared ? `log ${Math.log10(Math.max(gs.res, 1)).toFixed(1)}` : `Prestige ${gpPct.toFixed(1)}%`}
        </span>
      </div>
      <div style={styles.btnRow}>
        {gs.memoryCleared && (
          <button
            style={styles.prestigeBtn}
            onClick={onManualPrestige}
          >
            ★ 崩壊 ({Math.max(1, Math.floor(Math.log10(Math.max(gs.res, 10)) / 308))} SP)
          </button>
        )}
        {hasSP && hasConstellation && (
          <button style={styles.conBtn} onClick={onOpenConstellation}>
            ✦ 星座
          </button>
        )}
        {cosmosUnlocked && (
          <button
            style={{
              ...styles.resonanceBtn,
              borderColor: resonanceReady ? "#00ffcc" : "#1a5555",
              color: resonanceReady ? "#00ffcc" : "#336666",
              boxShadow: resonanceReady ? "0 0 8px #00ffcc44" : "none",
            }}
            onClick={onOpenResonance}
          >
            ◈ RESONANCE
            {gs.resonanceCnt > 0 && <span style={styles.resCnt}> ({gs.resonanceCnt})</span>}
          </button>
        )}
        {hasSP && (
          <button style={styles.spBtn} onClick={onOpenSP}>
            ★ SP SHOP
          </button>
        )}
        <button style={styles.helpBtn} onClick={onOpenHelp}>?</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: "linear-gradient(180deg, #0a0a1a 0%, #0d0d2b 100%)",
    borderBottom: "1px solid #1a1a3e",
    padding: "12px 16px 8px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  resRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
  },
  resLabel: {
    color: "#4a4a8a",
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: "'Courier New', monospace",
  },
  resVal: {
    color: "#00ffcc",
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "'Courier New', monospace",
    textShadow: "0 0 12px #00ffcc88",
  },
  gmRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  gmText: {
    color: "#8888cc",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
  },
  resMulBadge: {
    color: "#00ffcc",
    fontWeight: "bold",
  },
  ceMulBadge: {
    color: "#e17055",
    fontWeight: "bold",
  },
  spText: {
    color: "#aaaadd",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
  },
  spVal: {
    color: "#ffd700",
    fontWeight: "bold",
  },
  memoryBanner: {
    marginTop: 4,
    padding: "2px 8px",
    background: "#1a0a0a",
    border: "1px solid #ff6b9d44",
    borderRadius: 4,
    color: "#ff6b9d",
    fontSize: 10,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
    textAlign: "center" as const,
  },
  barWrap: {
    marginTop: 6,
    display: "flex",
    alignItems: "center",
    gap: 8,
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
    transition: "transform 0.3s ease",
    boxShadow: "0 0 8px #00ffcc66",
  },
  barLabel: {
    color: "#6666aa",
    fontSize: 10,
    fontFamily: "'Courier New', monospace",
    minWidth: 80,
    textAlign: "right",
  },
  btnRow: {
    display: "flex",
    gap: 6,
    marginTop: 8,
    justifyContent: "flex-end",
    flexWrap: "wrap" as const,
  },
  prestigeBtn: {
    background: "linear-gradient(135deg, #1a0a1a, #2a0a2a)",
    border: "1px solid #ff6b9d",
    color: "#ff6b9d",
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
  },
  conBtn: {
    background: "linear-gradient(135deg, #1a0a0a, #2a1010)",
    border: "1px solid #e17055",
    color: "#e17055",
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
  },
  resonanceBtn: {
    background: "linear-gradient(135deg, #001a1a, #002a2a)",
    border: "1px solid",
    borderRadius: 4,
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
    transition: "border-color 0.3s, color 0.3s, box-shadow 0.3s",
  },
  resCnt: {
    fontSize: 10,
    opacity: 0.7,
  },
  spBtn: {
    background: "linear-gradient(135deg, #1a1a3e, #2a2a5e)",
    border: "1px solid #ffd700",
    color: "#ffd700",
    padding: "4px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
  },
  helpBtn: {
    background: "linear-gradient(135deg, #1a1a3e, #2a2a5e)",
    border: "1px solid #4a4a8a",
    color: "#8888cc",
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
  },
};
