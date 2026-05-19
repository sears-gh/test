import React, { useEffect, useRef, useState } from "react";

interface Props {
  pcnt: number;
}

export function PrestigeFlash({ pcnt }: Props) {
  const prevPcnt = useRef(pcnt);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pcnt > prevPcnt.current) {
      setVisible(true);
      const id = setTimeout(() => setVisible(false), 1800);
      prevPcnt.current = pcnt;
      return () => clearTimeout(id);
    }
    prevPcnt.current = pcnt;
  }, [pcnt]);

  if (!visible) return null;

  return (
    <div style={styles.flash}>
      <div style={styles.text}>
        <div style={styles.title}>PRESTIGE!</div>
        <div style={styles.sub}>SP +1 獲得</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  flash: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(ellipse at center, #ffd70044 0%, #00ffcc22 40%, transparent 70%)",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    animation: "prestige-fade 1.8s ease-out forwards",
  },
  text: {
    textAlign: "center",
    fontFamily: "'Courier New', monospace",
  },
  title: {
    color: "#ffd700",
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: 8,
    textShadow: "0 0 40px #ffd700, 0 0 80px #ffd70088",
  },
  sub: {
    color: "#00ffcc",
    fontSize: 18,
    letterSpacing: 4,
    marginTop: 8,
    textShadow: "0 0 20px #00ffcc",
  },
};
