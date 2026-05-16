import { GP_THRESHOLD } from "../game/config";

const SUFFIXES = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","Nd","Dc"];

export function fmtN(n: number): string {
  if (n <= 0) return "0";
  if (!isFinite(n) || n >= GP_THRESHOLD) return "∞";

  if (n < 1000) {
    if (n < 10) return n.toFixed(2);
    return Math.floor(n).toString();
  }

  for (let i = SUFFIXES.length - 1; i >= 0; i--) {
    const val = Math.pow(1000, i + 1);
    if (n >= val) {
      return (n / val).toFixed(3).slice(0, 4).replace(/\.?0+$/, "") + SUFFIXES[i];
    }
  }

  // fallback for very large numbers
  return n.toExponential(3);
}

// SP 専用フォーマット: 整数表示 + 大きい数は suffix
export function fmtSP(n: number): string {
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1e6)  return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  if (n < 1e9)  return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n < 1e12) return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
  if (n < 1e15) return (n / 1e12).toFixed(2).replace(/\.?0+$/, "") + "T";
  return n.toExponential(2);
}

export function fmtT(s: number): string {
  if (s <= 0) return "0s";
  if (s < 0.01) return `${(s * 1000).toFixed(1)}ms`;
  if (s < 1) return `${s.toFixed(3)}s`;
  if (s < 60) return `${s.toFixed(2)}s`;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}m${sec.toString().padStart(2, "0")}s`;
}
