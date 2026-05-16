import React from "react";
import type { GameState, SpUpgrades } from "../game/types";
import { SP_DEF, getSpNextCost } from "../game/config";

interface Props {
  gs: GameState;
  onBuy: (k: keyof SpUpgrades) => void;
  onClose: () => void;
}

const GROUP_LABELS: Record<string, string> = {
  core:   "── コア強化 ──",
  unlock: "── 初期解放 ──",
  con:    "── 星座機構 ──",
};

export function SpShop({ gs, onBuy, onClose }: Props) {
  const grouped = ["core", "unlock", "con"].map(g => ({
    g,
    defs: SP_DEF.filter(d => d.group === g),
  }));

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <span style={s.title}>★ SP SHOP</span>
          <span style={s.spBal}>SP: <span style={s.spVal}>{gs.sp}</span></span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {grouped.map(({ g, defs }) => (
          <div key={g}>
            <div style={s.groupLabel}>{GROUP_LABELS[g]}</div>
            <div style={s.list}>
              {defs.map(def => {
                const k = def.k as keyof SpUpgrades;
                const level = gs.spu[k];
                const unlimited = def.max === -1;
                const maxed = !unlimited && level >= def.max;
                const cost = getSpNextCost(def, level);
                const canBuy = !maxed && gs.sp >= cost;

                return (
                  <div key={def.k} style={s.item}>
                    <div style={s.itemHeader}>
                      <span style={s.itemName}>{def.name}</span>
                      <span style={s.itemLevel}>
                        {unlimited ? `Lv.${level}` : `${level}/${def.max}`}
                      </span>
                    </div>
                    <div style={s.itemInfo}>{def.info}</div>
                    <button
                      style={{
                        ...s.buyBtn,
                        borderColor: canBuy ? "#ffd700" : "#444",
                        color: canBuy ? "#ffd700" : "#555",
                        cursor: canBuy ? "pointer" : "not-allowed",
                      }}
                      onClick={() => onBuy(k)}
                      disabled={!canBuy}
                    >
                      {maxed ? "MAX" : `BUY (${fmtSP(cost)} SP)`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function fmtSP(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1e6) return (n / 1000).toFixed(1) + "K";
  if (n < 1e9) return (n / 1e6).toFixed(1) + "M";
  return n.toExponential(2);
}

const s: Record<string, React.CSSProperties> = {
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
    border: "1px solid #ffd70066",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 440,
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
    color: "#ffd700",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 2,
    flex: 1,
  },
  spBal: { color: "#aaaadd", fontSize: 13 },
  spVal: { color: "#ffd700", fontWeight: "bold" },
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
  groupLabel: {
    color: "#4a4a8a",
    fontSize: 10,
    letterSpacing: 2,
    margin: "12px 0 6px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  item: {
    border: "1px solid #1a1a4e",
    borderRadius: 8,
    padding: "8px 12px",
    background: "#0d0d2088",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  itemName: { color: "#ccccff", fontSize: 12, fontWeight: "bold" },
  itemLevel: { color: "#ffd700", fontSize: 11 },
  itemInfo: { color: "#8888aa", fontSize: 10, marginBottom: 6, lineHeight: 1.4 },
  buyBtn: {
    background: "transparent",
    border: "1px solid",
    borderRadius: 4,
    padding: "3px 10px",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
    width: "100%",
  },
};
