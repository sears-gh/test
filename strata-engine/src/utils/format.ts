import { GP_THRESHOLD } from "../game/config";

export function fmtN(n: number): string {
  if (n <= 0) return "0";
  if (!isFinite(n) || n >= GP_THRESHOLD) return "∞";

  const exp = Math.floor(Math.log10(n));
  const mantissa = n / Math.pow(10, exp);
  const expStr = exp >= 0
    ? `e+${String(exp).padStart(3, "0")}`
    : `e-${String(-exp).padStart(3, "0")}`;
  return `${mantissa.toFixed(2)}${expStr}`;
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
