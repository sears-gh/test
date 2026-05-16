import React from "react";
import type { GameState } from "../game/types";
import { LCFG, tierThreshold, getTierStep } from "../game/config";
import { fmtN, fmtT } from "../utils/format";

interface Props {
  gs: GameState;
  i: number;
  onUpgrade: () => void;
  onUnlock: () => void;
}

export function LayerCard({ gs, i, onUpgrade, onUnlock }: Props) {
  const layer = gs.layers[i];
  const cfg = LCFG[i];
  const gm = gs.gmBase + gs.gmBonus;

  if (!layer.unlocked) {
    const canUnlock = gs.res >= cfg.uc;
    return (
      <div style={{ ...styles.card, borderColor: cfg.c + "44" }}>
        <div style={{ ...styles.lockedName, color: cfg.c + "88" }}>
          🔒 {cfg.n}
        </div>
        <div style={styles.lockedCost}>
          Unlock: <span style={{ color: "#00ffcc" }}>{fmtN(cfg.uc)} SC</span>
        </div>
        <button
          style={{
            ...styles.btn,
            borderColor: canUnlock ? cfg.c : "#333",
            color: canUnlock ? cfg.c : "#555",
            cursor: canUnlock ? "pointer" : "not-allowed",
          }}
          onClick={onUnlock}
          disabled={!canUnlock}
        >
          UNLOCK
        </button>
      </div>
    );
  }

  const compressMul = Math.pow(0.995, gs.compressLevel);
  const effectiveInt = layer.int * compressMul;
  const progress = Math.min(1, layer.elapsed / effectiveInt);
  const remaining = Math.max(0, effectiveInt - layer.elapsed);
  const tierStep = getTierStep(gs.spu.deep);
  const tierExpFull    = Math.pow(1.05, layer.pct);
  const linearBoostExp = 0.200 + tierStep * layer.pct;
  const upgradeMul = Math.pow(layer.upgrades + 1, 0.2) * (1 + 0.1 * layer.pct);
  const baseVal       = (1 + layer.gainBonus) * gs.resonanceMul;
  const bonusForGain  = Math.pow(baseVal, tierExpFull);
  const bonusForBoost = Math.pow(baseVal, tierExpFull * linearBoostExp);
  const ceExp = 0.1 + gs.spu.ceEff * 0.05;
  const ceMul = gs.ce > 0 ? Math.pow(1 + gs.ce, ceExp) : 1;
  const effectiveGain = layer.gain * bonusForGain * gm * ceMul;
  const effectiveBp = layer.bp * upgradeMul * bonusForBoost;
  const canUpgrade = gs.res >= layer.cost;
  const nextTierAt = tierThreshold(layer.pct + 1);
  const tierProgress = Math.min(1, layer.upgrades / nextTierAt);

  const flashAlpha = layer.flash > 0 ? layer.flash / 0.65 : 0;
  const glowColor = cfg.c + Math.floor(flashAlpha * 0x66).toString(16).padStart(2, "0");

  let evtText = "";
  if (layer.flash > 0.4) {
    if (layer.evt === "gain") evtText = `+${fmtN(layer.evtAmt)}`;
    else if (layer.evt === "boost") evtText = `+${layer.evtAmt.toFixed(3)} bonus`;
    else if (layer.evt === "gm") evtText = `+${layer.evtAmt.toFixed(4)} gMult`;
  }

  return (
    <div
      style={{
        ...styles.card,
        borderColor: layer.flash > 0 ? cfg.c : cfg.c + "44",
        background: layer.flash > 0
          ? `linear-gradient(135deg, #0a0a1a, ${glowColor})`
          : "linear-gradient(135deg, #0a0a1a, #0d0d2b)",
        boxShadow: layer.flash > 0 ? `0 0 16px ${cfg.c}44` : "none",
      }}
    >
      <div style={styles.cardHeader}>
        <span style={{ ...styles.layerName, color: cfg.c }}>
          {cfg.n}
          {layer.pct > 0 && (
            <span style={styles.pctBadge}>★{layer.pct}</span>
          )}
        </span>
        {evtText && (
          <span style={{ ...styles.evtText, color: layer.evt === "gain" ? "#00ffcc" : cfg.c }}>
            {evtText}
          </span>
        )}
      </div>

      <div style={styles.barWrap}>
        <div style={styles.barBg}>
          <div
            style={{
              ...styles.barFill,
              transform: `scaleX(${progress})`,
              background: `linear-gradient(90deg, ${cfg.c}88, ${cfg.c})`,
              boxShadow: layer.flash > 0 ? `0 0 8px ${cfg.c}` : "none",
            }}
          />
        </div>
        <span style={styles.timerText}>{fmtT(remaining)}</span>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Gain/tick</span>
          <span style={styles.statVal}>{fmtN(effectiveGain)}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>{i === 0 ? "gMult total" : "Boost+"}</span>
          <span style={styles.statVal}>
            {i === 0 ? `×${gm.toFixed(3)}` : `+${effectiveBp.toFixed(3)}`}
          </span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Bonus</span>
          <span style={styles.statVal}>×{(1 + layer.gainBonus).toFixed(3)}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Interval</span>
          <span style={styles.statVal}>{fmtT(effectiveInt)}</span>
        </div>
      </div>

      <div style={styles.tierRow}>
        <div style={styles.tierBarBg}>
          <div style={{ ...styles.tierBarFill, width: `${tierProgress * 100}%`, background: cfg.c + "99" }} />
        </div>
        <span style={styles.tierLabel}>{layer.upgrades}/{nextTierAt} → ★{layer.pct + 1}</span>
      </div>

      <div style={styles.upgradeRow}>
        <button
          style={{
            ...styles.btn,
            borderColor: canUpgrade ? cfg.c : "#333",
            color: canUpgrade ? cfg.c : "#555",
            cursor: canUpgrade ? "pointer" : "not-allowed",
            flex: 1,
          }}
          onClick={onUpgrade}
          disabled={!canUpgrade}
        >
          UPGRADE <span style={{ color: canUpgrade ? "#00ffcc" : "#444" }}>{fmtN(layer.cost)} SC</span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: "1px solid",
    borderRadius: 8,
    padding: "10px 12px",
    marginBottom: 8,
    fontFamily: "'Courier New', monospace",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  layerName: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  pctBadge: {
    marginLeft: 6,
    fontSize: 11,
    color: "#ffd700",
  },
  evtText: {
    fontSize: 11,
    fontWeight: "bold",
    animation: "none",
  },
  lockedName: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "'Courier New', monospace",
  },
  lockedCost: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontFamily: "'Courier New', monospace",
  },
  barWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  barBg: {
    flex: 1,
    height: 8,
    background: "#1a1a3e",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    transformOrigin: "left",
    willChange: "transform",
  },
  timerText: {
    color: "#8888cc",
    fontSize: 11,
    minWidth: 50,
    textAlign: "right",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2px 8px",
    marginBottom: 8,
  },
  stat: {
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
  tierRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  tierBarBg: {
    flex: 1,
    height: 4,
    background: "#1a1a3e",
    borderRadius: 2,
    overflow: "hidden",
  },
  tierBarFill: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.1s linear",
  },
  tierLabel: {
    color: "#6666aa",
    fontSize: 10,
    fontFamily: "'Courier New', monospace",
    whiteSpace: "nowrap" as const,
  },
  upgradeRow: {
    display: "flex",
    gap: 8,
  },
  btn: {
    background: "transparent",
    border: "1px solid",
    borderRadius: 4,
    padding: "4px 10px",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
    transition: "opacity 0.2s",
  },
};
