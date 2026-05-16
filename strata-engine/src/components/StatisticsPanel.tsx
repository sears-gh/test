import React from "react";
import type { GameState } from "../game/types";
import { LCFG, CON_LCFG, getTierExp } from "../game/config";
import { fmtN, fmtT } from "../utils/format";

interface Props {
  gs: GameState;
  onClose: () => void;
}

function pct(val: number, total: number): string {
  if (total <= 0 || val <= 0) return "0%";
  return `${Math.min(100, (val / total) * 100).toFixed(1)}%`;
}

export function StatisticsPanel({ gs, onClose }: Props) {
  const gm = gs.gmBase + gs.gmBonus;
  const ceExp = 0.1 + gs.spu.ceEff * 0.05;
  const ceMul = gs.ce > 0 ? Math.pow(1 + gs.ce, ceExp) : 1;
  const tierExpBase = getTierExp(gs.spu.deep);

  // ── Per-layer derived stats ──────────────────────────────
  type LayerStat = {
    i: number;
    fireRate: number;     // fires/s
    bonusVal: number;
    gainPerFire: number;
    resPerSec: number;
    gmAddPerSec: number;  // only for i===0
    bpAddPerSec: number;  // only for i>0
    tierExp: number;
  };

  const layerStats: LayerStat[] = gs.layers.map((l, i) => {
    const fireRate = l.unlocked ? (0.5 / l.int) : 0;
    const upgradeMul = Math.pow(l.upgrades + 1, 0.2);
    const te = Math.pow(tierExpBase, l.pct);
    const bonusVal = Math.pow((1 + l.gainBonus) * gs.resonanceMul, te);
    const gainPerFire = l.gain * bonusVal * gm * ceMul;
    const resPerSec = fireRate * gainPerFire;
    const gmAddPerSec = i === 0 ? fireRate * l.bp * upgradeMul : 0;
    const bpAddPerSec = i > 0 ? fireRate * l.bp * upgradeMul : 0;
    return { i, fireRate, bonusVal, gainPerFire, resPerSec, gmAddPerSec, bpAddPerSec, tierExp: te };
  });

  const totalResPerSec = layerStats.reduce((s, ls) => s + ls.resPerSec, 0);

  // gainBonus growth rate per target layer (sum from all boosters above it)
  const gainBonusGrowthPerSec = gs.layers.map((_, j) => {
    let rate = 0;
    for (let i = j + 1; i < gs.layers.length; i++) {
      rate += layerStats[i].bpAddPerSec;
    }
    return rate;
  });

  // Constellation stats
  const nebula = gs.conLayers[0];
  const ccPerSec = nebula?.unlocked
    ? (0.1 / nebula.int) * nebula.efficiency
    : 0;
  const cePerSec = gs.cc;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={s.header}>
          <span style={s.title}>STATISTICS</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── Section 1: res/s ── */}
        <Section label="リソース獲得速度">
          <Row label="合計 (期待値)" val={`${fmtN(totalResPerSec)}/s`} accent />
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <Th>層</Th>
                  <Th right>/s</Th>
                  <Th right>×Bonus</Th>
                  <Th right>×gm</Th>
                  <Th right>×CE</Th>
                  <Th right>比率</Th>
                </tr>
              </thead>
              <tbody>
                {gs.layers.map((l, i) => {
                  if (!l.unlocked) return null;
                  const ls = layerStats[i];
                  return (
                    <tr key={i}>
                      <Td style={{ color: LCFG[i].c }}>{LCFG[i].n}</Td>
                      <Td right>{fmtN(ls.resPerSec)}</Td>
                      <Td right dim>×{fmtN(ls.bonusVal)}</Td>
                      <Td right dim>×{gm.toFixed(3)}</Td>
                      <Td right dim>×{ceMul.toFixed(3)}</Td>
                      <Td right>{pct(ls.resPerSec, totalResPerSec)}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Section 2: gm ── */}
        <Section label="グローバル倍率">
          <Row label="合計 gm" val={`×${gm.toFixed(4)}`} accent />
          <Row label="  gmBase (SP gMul)" val={`×${gs.gmBase.toFixed(4)}`} />
          <Row label="  gmBonus (Quark蓄積)" val={`+${fmtN(gs.gmBonus)}`} />
          {gs.layers[0].unlocked && (
            <Row
              label="  Quark gm増加率"
              val={`+${fmtN(layerStats[0].gmAddPerSec)}/s`}
            />
          )}
        </Section>

        {/* ── Section 3: gainBonus ── */}
        <Section label="ゲインボーナス">
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <Th>層</Th>
                  <Th right>gainBonus</Th>
                  <Th right>tierExp</Th>
                  <Th right>bonusVal</Th>
                  <Th right>+/s</Th>
                </tr>
              </thead>
              <tbody>
                {gs.layers.map((l, i) => {
                  if (!l.unlocked) return null;
                  const ls = layerStats[i];
                  return (
                    <tr key={i}>
                      <Td style={{ color: LCFG[i].c }}>{LCFG[i].n}</Td>
                      <Td right>+{fmtN(l.gainBonus)}</Td>
                      <Td right dim>^{ls.tierExp.toFixed(3)}</Td>
                      <Td right>×{fmtN(ls.bonusVal)}</Td>
                      <Td right dim>
                        {gainBonusGrowthPerSec[i] > 0
                          ? `+${fmtN(gainBonusGrowthPerSec[i])}/s`
                          : "—"}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Boost contribution breakdown for a selected layer */}
          {gs.layers.some((_, i) => i > 0 && gs.layers[i].unlocked) && (
            <div style={s.boostNote}>
              ※ +/s = 上位全層のブースト発火の期待値合計 (各層の bp × (upgrades+1)^0.2 × 0.5/int)
            </div>
          )}
        </Section>

        {/* ── Section 3b: SP effects ── */}
        {(gs.spu.halfTrigger > 0 || gs.spu.resResidual > 0 || gs.spu.ceEff > 0) && (
          <Section label="SP効果 (アクティブ)">
            {gs.spu.halfTrigger > 0 && (
              <Row label="Dual Cascade" val="外れ効果 ×0.1 発動中" accent />
            )}
            {gs.spu.resResidual > 0 && (
              <Row
                label="Resonance Residual"
                val={`初期 ×${(1 + (gs.maxResonanceMul - 1) * 0.1).toFixed(4)} (歴代最大: ×${gs.maxResonanceMul.toFixed(4)})`}
              />
            )}
            {gs.spu.ceEff > 0 && (
              <Row label="CE効率強化" val={`Lv.${gs.spu.ceEff}  指数 ^${ceExp.toFixed(2)}`} />
            )}
          </Section>
        )}

        {/* ── Section 4: resonance ── */}
        {gs.resonanceCnt > 0 || gs.resonanceMul > 1 ? (
          <Section label="レゾナンス">
            <Row label="resonanceMul" val={`×${gs.resonanceMul.toFixed(6)}`} accent />
            <Row label="回数" val={`${gs.resonanceCnt}回`} />
            <Row label="現在の積" val={fmtN(gs.layers.reduce((a, l) => a * (1 + l.gainBonus), 1))} />
            <Row label="前回の積" val={fmtN(gs.prevResonanceProduct)} />
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr><Th>層</Th><Th right>1+gainBonus</Th><Th right>寄与率</Th></tr>
                </thead>
                <tbody>
                  {gs.layers.map((l, i) => {
                    if (!l.unlocked) return null;
                    const contrib = 1 + l.gainBonus;
                    const product = gs.layers.reduce((a, ll) => a * (1 + ll.gainBonus), 1);
                    return (
                      <tr key={i}>
                        <Td style={{ color: LCFG[i].c }}>{LCFG[i].n}</Td>
                        <Td right>×{fmtN(contrib)}</Td>
                        <Td right dim>
                          {product > 1 ? `${((Math.log(contrib) / Math.log(product)) * 100).toFixed(1)}%` : "—"}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        ) : null}

        {/* ── Section 5: constellation ── */}
        {gs.conLayers.some(cl => cl.unlocked) && (
          <Section label="星座機構">
            <Row label="Cosmic Cores (CC)" val={fmtN(gs.cc)} accent />
            <Row label="  CC生成率 (Nebula期待値)" val={`+${fmtN(ccPerSec)}/s`} />
            <Row label="Cosmic Energy (CE)" val={fmtN(gs.ce)} />
            <Row label="  CE生成率" val={`+${fmtN(cePerSec)}/s`} />
            <Row label="  CE倍率" val={`×${ceMul.toFixed(6)}`} accent />
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <Th>層</Th>
                    <Th right>間隔</Th>
                    <Th right>効率</Th>
                    <Th right>期待効果/s</Th>
                  </tr>
                </thead>
                <tbody>
                  {gs.conLayers.map((cl, i) => {
                    if (!cl.unlocked) return null;
                    const fireRate = 0.1 / cl.int; // 10% chance each tick
                    const hitsPerSec = fireRate * cl.efficiency;
                    const effectLabel = i === 0
                      ? `+${fmtN(hitsPerSec)} CC/s`
                      : `${CON_LCFG[i - 1].n} ×${(Math.pow(0.99, hitsPerSec)).toFixed(4)}/s`;
                    return (
                      <tr key={i}>
                        <Td style={{ color: CON_LCFG[i].c }}>{CON_LCFG[i].n}</Td>
                        <Td right dim>{fmtT(cl.int)}</Td>
                        <Td right>{(cl.efficiency * 100).toFixed(0)}%</Td>
                        <Td right>{effectLabel}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* ── Section 6: prestige / memory ── */}
        <Section label="プレスティージ">
          <Row label="星列崩壊回数" val={`${gs.pcnt}回`} />
          <Row label="現在ゲーム時間" val={fmtT(gs.gtime)} />
          <Row
            label="前回崩壊からの経過"
            val={fmtT(gs.gtime - gs.lastPrestigeGtime)}
          />
          {gs.memoryActive && <Row label="星列の記憶" val="発動中 (ボーナス^0.9)" accent />}
          {gs.memoryCleared && <Row label="星列の記憶" val="突破済み" accent />}
          {gs.sp > 0 || gs.pcnt > 0 ? (
            <Row label="保有 SP" val={`${gs.sp} SP`} />
          ) : null}
        </Section>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={s.section}>
      <div style={s.sectionLabel}>{label}</div>
      {children}
    </div>
  );
}

function Row({ label, val, accent }: { label: string; val: string; accent?: boolean }) {
  return (
    <div style={s.row}>
      <span style={s.rowLabel}>{label}</span>
      <span style={{ ...s.rowVal, color: accent ? "#00ffcc" : "#aaaadd" }}>{val}</span>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th style={{ ...s.th, textAlign: right ? "right" : "left" }}>{children}</th>;
}

function Td({ children, right, dim, style: extra }: {
  children: React.ReactNode;
  right?: boolean;
  dim?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <td style={{
      ...s.td,
      textAlign: right ? "right" : "left",
      color: dim ? "#666688" : "#aaaadd",
      ...extra,
    }}>
      {children}
    </td>
  );
}

// ── Styles ───────────────────────────────────────────────

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
    maxWidth: 460,
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
  section: {
    marginBottom: 16,
    borderBottom: "1px solid #1a1a3e",
    paddingBottom: 12,
  },
  sectionLabel: {
    color: "#4a4a8a",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    marginBottom: 6,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    marginBottom: 3,
  },
  rowLabel: {
    color: "#6666aa",
  },
  rowVal: {
    fontWeight: "bold",
  },
  tableWrap: {
    overflowX: "auto",
    marginTop: 6,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 10,
  },
  th: {
    color: "#4a4a8a",
    borderBottom: "1px solid #1a1a3e",
    padding: "3px 4px",
    fontWeight: "normal",
    letterSpacing: 1,
  },
  td: {
    padding: "3px 4px",
    borderBottom: "1px solid #0d0d2a",
  },
  boostNote: {
    color: "#444466",
    fontSize: 9,
    marginTop: 4,
    lineHeight: 1.4,
  },
};
