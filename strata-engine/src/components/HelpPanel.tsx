import React from "react";

interface Props {
  onClose: () => void;
  onDeleteSave: () => void;
}

export function HelpPanel({ onClose, onDeleteSave }: Props) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>HELP</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.body}>
          <h3 style={styles.h3}>基本ルール</h3>
          <p style={styles.p}>各階層はタイマーが満了するたびに発火します。発火時に50%の確率でリソース獲得、または特殊効果が発動します。</p>

          <h3 style={styles.h3}>発火効果</h3>
          <p style={styles.p}><span style={styles.accent}>Quark (L1)</span>: リソース獲得 or グローバル倍率 +0.002</p>
          <p style={styles.p}><span style={styles.accent}>L2〜L8</span>: リソース獲得 or 下位全層のボーナス加算</p>

          <h3 style={styles.h3}>強化</h3>
          <p style={styles.p}>コストを消費してインターバルを20%短縮します。インターバルが0.01秒未満になると<span style={styles.gold}>階層プレスティージ</span>が発動し、Gainとブースト値がべき乗で跳ね上がります。</p>

          <h3 style={styles.h3}>グローバルプレスティージ</h3>
          <p style={styles.p}>リソースが<span style={styles.accent}>1.7×10³⁰⁸</span>に達すると全リセットが発動し、<span style={styles.gold}>SP（プレスティージポイント）</span>を1獲得します。SPはショップで強化に使えます。</p>

          <h3 style={styles.h3}>SP ショップ</h3>
          <p style={styles.p}>初回SP獲得後に出現。グローバル倍率・速度・ブースト・ゲイン・プレスティージ指数を強化できます。</p>

          <h3 style={styles.h3}>セーブ</h3>
          <p style={styles.p}>1秒ごとに自動保存されます。ブラウザを閉じても続きから遊べます。</p>
        </div>
        <button
          style={styles.deleteBtn}
          onClick={() => {
            if (confirm("セーブデータを削除してリセットしますか？")) {
              onDeleteSave();
              onClose();
            }
          }}
        >
          セーブ削除
        </button>
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
    border: "1px solid #4a4a8a",
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#8888cc",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 2,
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
  body: {
    marginBottom: 16,
  },
  h3: {
    color: "#aaaadd",
    fontSize: 13,
    margin: "12px 0 4px",
    letterSpacing: 1,
  },
  p: {
    color: "#7777aa",
    fontSize: 12,
    lineHeight: 1.6,
    margin: "2px 0",
  },
  accent: {
    color: "#00ffcc",
  },
  gold: {
    color: "#ffd700",
  },
  deleteBtn: {
    width: "100%",
    background: "transparent",
    border: "1px solid #ff4444",
    color: "#ff6666",
    borderRadius: 6,
    padding: "8px",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
  },
};
