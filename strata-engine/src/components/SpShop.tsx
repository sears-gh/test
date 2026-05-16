import React from "react";
import type { GameState, SpUpgrades } from "../game/types";
import { SP_DEF } from "../game/config";

interface Props {
  gs: GameState;
  onBuy: (k: keyof SpUpgrades) => void;
  onClose: () => void;
}

export function SpShop({ gs, onBuy, onClose }: Props) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>★ SP SHOP</span>
          <span style={styles.spBal}>SP: <span style={styles.spVal}>{gs.sp}</span></span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.list}>
          {SP_DEF.map(def => {
            const k = def.k as keyof SpUpgrades;
            const level = gs.spu[k];
            const maxed = level >= def.max;
            const canBuy = !maxed && gs.sp >= def.cost;
            return (
              <div key={def.k} style={styles.item}>
                <div style={styles.itemHeader}>
                  <span style={styles.itemName}>{def.name}</span>
                  <span style={styles.itemLevel}>
                    {level}/{def.max}
                  </span>
                </div>
                <div style={styles.itemInfo}>{def.info}</div>
                <button
                  style={{
                    ...styles.buyBtn,
                    borderColor: canBuy ? "#ffd700" : "#444",
                    color: canBuy ? "#ffd700" : "#555",
                    cursor: canBuy ? "pointer" : "not-allowed",
                  }}
                  onClick={() => onBuy(k)}
                  disabled={!canBuy}
                >
                  {maxed ? "MAX" : `BUY (${def.cost} SP)`}
                </button>
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
    border: "1px solid #ffd70066",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 420,
    maxHeight: "80vh",
    overflowY: "auto",
    fontFamily: "'Courier New', monospace",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  title: {
    color: "#ffd700",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 2,
    flex: 1,
  },
  spBal: {
    color: "#aaaadd",
    fontSize: 13,
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
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  item: {
    border: "1px solid #1a1a4e",
    borderRadius: 8,
    padding: "10px 12px",
    background: "#0d0d2088",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemName: {
    color: "#ccccff",
    fontSize: 13,
    fontWeight: "bold",
  },
  itemLevel: {
    color: "#ffd700",
    fontSize: 12,
  },
  itemInfo: {
    color: "#8888aa",
    fontSize: 11,
    marginBottom: 8,
  },
  buyBtn: {
    background: "transparent",
    border: "1px solid",
    borderRadius: 4,
    padding: "4px 12px",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
    width: "100%",
  },
};
