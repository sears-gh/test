import React from "react";
import type { GameState } from "../game/types";
import { GP_THRESHOLD } from "../game/config";
import { fmtN } from "../utils/format";
import { canResonate } from "../game/actions";

interface Props {
  gs: GameState;
  sidebar: boolean;
  onOpenSP: () => void;
  onOpenHelp: () => void;
  onOpenResonance: () => void;
  onOpenConstellation: () => void;
  onOpenStats: () => void;
  onManualPrestige: () => void;
}

export function Header({
  gs, sidebar,
  onOpenSP, onOpenHelp, onOpenResonance,
  onOpenConstellation, onOpenStats, onManualPrestige,
}: Props) {
  const hasSP = gs.sp > 0 || gs.pcnt > 0;
  const gm = gs.gmBase + gs.gmBonus;
  const cosmosUnlocked = gs.layers[7]?.unlocked ?? false;
  const resonanceReady = canResonate(gs);
  const ceMul = gs.ce > 0 ? Math.pow(1 + gs.ce, 0.1) : 1;

  const logRes = gs.res > 0 ? Math.log10(Math.min(gs.res, GP_THRESHOLD)) : 0;
  const logMax = Math.log10(GP_THRESHOLD);
  const gpPct = Math.min(100, (logRes / logMax) * 100);
  const postMemoryPct = gs.memoryCleared && gs.res > 0
    ? Math.min(100, (Math.log10(gs.res) / logMax) * 100)
    : gpPct;

  // Sidebar: extra stats visible at all times
  const sidebarStats = sidebar && (
    <div style={styles.sideStats}>
      <StatLine label="gm内訳" val={`base ${gs.gmBase.toFixed(2)} + acc ${fmtN(gs.gmBonus)}`} />
      {gs.resonanceMul > 1 && (
        <StatLine label="resonance" val={`◈×${gs.resonanceMul.toFixed(4)}`} />
      )}
      {ceMul > 1.001 && (
        <StatLine label="CE倍率" val={`✦×${ceMul.toFixed(4)}`} />
      )}
      {gs.conLayers[0].unlocked && (
        <StatLine label="CC / CE" val={`${fmtN(gs.cc)} / ${fmtN(gs.ce)}`} />
      )}
      {gs.memoryActive && (
        <div style={styles.memoryBadge}>★ 記憶発動中 (^0.9)</div>
      )}
      {gs.memoryCleared && (
        <div style={{ ...styles.memoryBadge, borderColor: "#ffd70044", color: "#ffd700" }}>
          ◆ 記憶突破済み
        </div>
      )}
    </div>
  );

  return (
    <div style={sidebar ? styles.sidebarWrap : styles.headerWrap}>
      {/* Resource */}
      <div style={styles.resRow}>
        <span style={styles.resLabel}>RESOURCES</span>
        <span style={{ ...styles.resVal, fontSize: sidebar ? 22 : 28 }}>{fmtN(gs.res)}</span>
      </div>

      {/* gm row — compact on top-bar mode */}
      <div style={styles.gmRow}>
        <span style={styles.gmText}>
          Global ×{gm.toFixed(3)}
          {!sidebar && gs.resonanceMul > 1 && (
            <span style={styles.resMulBadge}> ◈×{gs.resonanceMul.toFixed(4)}</span>
          )}
          {!sidebar && ceMul > 1.001 && (
            <span style={styles.ceMulBadge}> ✦×{ceMul.toFixed(3)}</span>
          )}
        </span>
        {hasSP && (
          <span style={styles.spText}>SP: <span style={styles.spVal}>{gs.sp}</span></span>
        )}
      </div>

      {/* Extra side-stats in sidebar mode */}
      {sidebarStats}

      {/* Prestige bar */}
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
          {gs.memoryCleared
            ? `log ${Math.log10(Math.max(gs.res, 1)).toFixed(1)}`
            : `${gpPct.toFixed(1)}%`}
        </span>
      </div>

      {/* pcnt + resonance cnt row in sidebar */}
      {sidebar && (
        <div style={styles.countRow}>
          <span style={styles.countItem}>崩壊 {gs.pcnt}回</span>
          {gs.resonanceCnt > 0 && (
            <span style={styles.countItem}>◈ {gs.resonanceCnt}回</span>
          )}
        </div>
      )}

      {/* Buttons */}
      <div style={sidebar ? styles.sideBtnGrid : styles.btnRow}>
        {gs.memoryCleared && (
          <button style={styles.prestigeBtn} onClick={onManualPrestige}>
            ★ 崩壊
            <span style={{ fontSize: 9, display: "block", opacity: 0.8 }}>
              {Math.max(1, Math.floor(Math.log10(Math.max(gs.res, 10)) / 308))} SP
            </span>
          </button>
        )}
        {hasSP && (
          <button style={styles.conBtn} onClick={onOpenConstellation}>✦ 星座</button>
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
            ◈ RES{gs.resonanceCnt > 0 ? ` (${gs.resonanceCnt})` : ""}
          </button>
        )}
        {hasSP && (
          <button style={styles.spBtn} onClick={onOpenSP}>★ SP</button>
        )}
        <button style={styles.statsBtn} onClick={onOpenStats}>≡</button>
        <button style={styles.helpBtn} onClick={onOpenHelp}>?</button>
      </div>
    </div>
  );
}

function StatLine({ label, val }: { label: string; val: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
      <span style={{ color: "#4a4a8a" }}>{label}</span>
      <span style={{ color: "#8888cc" }}>{val}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  headerWrap: {
    background: "linear-gradient(180deg, #0a0a1a 0%, #0d0d2b 100%)",
    borderBottom: "1px solid #1a1a3e",
    padding: "12px 16px 8px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  sidebarWrap: {
    padding: "20px 16px 16px",
    minHeight: "100%",
    boxSizing: "border-box" as const,
  },
  resRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 2,
  },
  resLabel: {
    color: "#4a4a8a",
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "'Courier New', monospace",
  },
  resVal: {
    color: "#00ffcc",
    fontWeight: "bold",
    fontFamily: "'Courier New', monospace",
    textShadow: "0 0 12px #00ffcc88",
  },
  gmRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  gmText: {
    color: "#8888cc",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
  },
  resMulBadge: { color: "#00ffcc", fontWeight: "bold" },
  ceMulBadge:  { color: "#e17055", fontWeight: "bold" },
  spText: {
    color: "#aaaadd",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
  },
  spVal: { color: "#ffd700", fontWeight: "bold" },
  sideStats: {
    background: "#0d0d2088",
    border: "1px solid #1a1a3e",
    borderRadius: 6,
    padding: "6px 8px",
    marginBottom: 8,
    fontFamily: "'Courier New', monospace",
  },
  memoryBadge: {
    marginTop: 4,
    padding: "2px 6px",
    border: "1px solid #ff6b9d44",
    borderRadius: 4,
    color: "#ff6b9d",
    fontSize: 9,
    letterSpacing: 1,
    textAlign: "center" as const,
  },
  barWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
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
    minWidth: 44,
    textAlign: "right",
  },
  countRow: {
    display: "flex",
    gap: 12,
    marginBottom: 10,
  },
  countItem: {
    color: "#4a4a8a",
    fontSize: 10,
    fontFamily: "'Courier New', monospace",
  },
  // Buttons in top-bar: single row, right-aligned
  btnRow: {
    display: "flex",
    gap: 6,
    marginTop: 6,
    justifyContent: "flex-end",
    flexWrap: "wrap" as const,
  },
  // Buttons in sidebar: 2-column grid
  sideBtnGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6,
    marginTop: 4,
  },
  prestigeBtn: {
    background: "linear-gradient(135deg, #1a0a1a, #2a0a2a)",
    border: "1px solid #ff6b9d",
    color: "#ff6b9d",
    padding: "6px 8px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
    lineHeight: 1.2,
  },
  conBtn: {
    background: "linear-gradient(135deg, #1a0a0a, #2a1010)",
    border: "1px solid #e17055",
    color: "#e17055",
    padding: "6px 8px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
  },
  resonanceBtn: {
    background: "linear-gradient(135deg, #001a1a, #002a2a)",
    border: "1px solid",
    borderRadius: 4,
    padding: "6px 8px",
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
    transition: "border-color 0.3s, color 0.3s, box-shadow 0.3s",
  },
  spBtn: {
    background: "linear-gradient(135deg, #1a1a3e, #2a2a5e)",
    border: "1px solid #ffd700",
    color: "#ffd700",
    padding: "6px 8px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
  },
  statsBtn: {
    background: "linear-gradient(135deg, #1a1a3e, #2a2a5e)",
    border: "1px solid #4a4a8a",
    color: "#8888cc",
    padding: "6px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
  },
  helpBtn: {
    background: "linear-gradient(135deg, #1a1a3e, #2a2a5e)",
    border: "1px solid #4a4a8a",
    color: "#8888cc",
    padding: "6px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
  },
};
