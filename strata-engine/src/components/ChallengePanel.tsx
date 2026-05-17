import React from "react";
import type { GameState } from "../game/types";

interface Props {
  gs: GameState;
  onEnter: (i: number) => void;
  onClose: () => void;
}

const CHALLENGES = [
  {
    id: 0,
    name: "C1  無階層化",
    color: "#ff9f43",
    restriction: "Tier上昇が出来ない（各階層の速度は購入毎に低下し続ける）",
    benefit:     "Compressの効果が2倍になる（0.95^lv → 0.95^(2×lv)）",
    reward:      "全星列の基礎速度が永続的に2倍になる",
  },
  {
    id: 1,
    name: "C2  圧縮禁止",
    color: "#a29bfe",
    restriction: "Compressを購入できない",
    benefit:     "Resonanceの倍率計算が^1/14になる（通常^1/16）",
    reward:      "Resonanceの倍率計算を^1/15に永続改善する",
  },
  {
    id: 2,
    name: "C3  一回限り",
    color: "#00b894",
    restriction: "各星列のアップグレードが1回しか購入できない",
    benefit:     "Compressの購入価格が常に÷log₁₀(現在SC)される",
    reward:      "Compressの基礎倍率を0.93/lvに永続改善する（通常0.95）",
  },
];

export function ChallengePanel({ gs, onEnter, onClose }: Props) {
  const inChallenge = gs.activeChallenge !== null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <span style={s.title}>CHALLENGE MODE</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {inChallenge && (
          <div style={{ ...s.activeBanner, borderColor: CHALLENGES[gs.activeChallenge!].color + "88" }}>
            <span style={{ color: CHALLENGES[gs.activeChallenge!].color }}>
              {CHALLENGES[gs.activeChallenge!].name}
            </span>
            <span style={s.activeSub}> 挑戦中 — 星列崩壊でクリア</span>
          </div>
        )}

        {CHALLENGES.map(ch => {
          const done = gs.challengesDone[ch.id];
          const isActive = gs.activeChallenge === ch.id;
          const canEnter = !inChallenge;

          return (
            <div
              key={ch.id}
              style={{
                ...s.card,
                borderColor: done ? ch.color + "66" : isActive ? ch.color : "#2a2a5e",
                background: isActive
                  ? `linear-gradient(135deg, #0a0a1a, ${ch.color}11)`
                  : "linear-gradient(135deg, #0a0a1a, #0d0d2b)",
              }}
            >
              <div style={s.cardHeader}>
                <span style={{ ...s.challengeName, color: ch.color }}>{ch.name}</span>
                {done && <span style={{ ...s.badge, borderColor: ch.color + "66", color: ch.color }}>CLEAR</span>}
                {isActive && <span style={{ ...s.badge, borderColor: ch.color, color: ch.color }}>実行中</span>}
              </div>

              <div style={s.row}>
                <span style={s.rowLabel}>制約</span>
                <span style={s.rowVal}>{ch.restriction}</span>
              </div>
              <div style={s.row}>
                <span style={s.rowLabel}>恩恵</span>
                <span style={{ ...s.rowVal, color: "#aaffcc" }}>{ch.benefit}</span>
              </div>
              <div style={{ ...s.row, marginBottom: 8 }}>
                <span style={s.rowLabel}>報酬</span>
                <span style={{ ...s.rowVal, color: done ? ch.color : "#888" }}>
                  {done ? "✓ " : ""}{ch.reward}
                </span>
              </div>

              {!isActive && (
                <button
                  style={{
                    ...s.enterBtn,
                    borderColor: canEnter ? ch.color : "#333",
                    color: canEnter ? ch.color : "#555",
                    cursor: canEnter ? "pointer" : "not-allowed",
                  }}
                  onClick={() => canEnter && onEnter(ch.id)}
                  disabled={!canEnter}
                >
                  {inChallenge ? "別のチャレンジ実行中" : done ? "再挑戦" : "突入"}
                </button>
              )}
            </div>
          );
        })}

        <div style={s.note}>
          チャレンジは通常の周回をリセットして開始します。星列崩壊でクリアになります。
        </div>
      </div>
    </div>
  );
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
    border: "1px solid #2a2a5e",
    borderRadius: 12,
    padding: 20,
    width: "96%",
    maxWidth: 540,
    maxHeight: "88vh",
    overflowY: "auto",
    fontFamily: "'Courier New', monospace",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    color: "#8888cc",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 3,
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
  activeBanner: {
    border: "1px solid",
    borderRadius: 6,
    padding: "6px 10px",
    marginBottom: 12,
    fontSize: 11,
    background: "#ffffff08",
  },
  activeSub: {
    color: "#666699",
  },
  card: {
    border: "1px solid",
    borderRadius: 8,
    padding: "10px 12px",
    marginBottom: 10,
    transition: "border-color 0.2s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  challengeName: {
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1,
    flex: 1,
  },
  badge: {
    border: "1px solid",
    borderRadius: 3,
    padding: "1px 5px",
    fontSize: 9,
    letterSpacing: 1,
  },
  row: {
    display: "flex",
    gap: 8,
    fontSize: 10,
    marginBottom: 3,
    alignItems: "flex-start",
  },
  rowLabel: {
    color: "#4a4a8a",
    minWidth: 30,
    flexShrink: 0,
  },
  rowVal: {
    color: "#8888cc",
    lineHeight: 1.4,
  },
  enterBtn: {
    background: "transparent",
    border: "1px solid",
    borderRadius: 4,
    padding: "4px 12px",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
    width: "100%",
  },
  note: {
    color: "#444466",
    fontSize: 9,
    marginTop: 8,
    lineHeight: 1.5,
  },
};
