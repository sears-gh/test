import React from "react";
import type { GameState } from "../game/types";
import { LCFG, CON_LCFG, getTierStep, getResExpDenom, getCompressBase } from "../game/config";
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
  const tierStep = getTierStep(gs.spu.deep);

  type LayerStat = {
    i: number;
    fireRate: number;
    baseVal: number;
    tierExpFull: number;
    linearBoostExp: number;
    bonusForGain: number;
    bonusForBoost: number;
    upgradeMul: number;
    upgMulA: number;   // (upg+1)^0.2
    upgMulB: number;   // (1+0.1×Tier)
    gainPerFire: number;
    resPerSec: number;
    boostPerFire: number;
    boostPerSec: number;
  };

  const gmExp        = 1 + gs.resonanceMul * 0.01;
  const effectiveGm  = Math.pow(gm, gmExp);
  const resMul       = Math.max(1, gs.resonanceMul);
  const resonatorExp   = Math.pow(1.02, gs.resonators);
  const compressBase   = getCompressBase(gs.challengesDone);
  const compressEffMul = gs.activeChallenge === 0 ? 2 : 1;
  const compressMul    = Math.pow(compressBase, gs.compressLevel * resonatorExp * compressEffMul);

  const layerStats: LayerStat[] = gs.layers.map((l, i) => {
    const fireRate      = l.unlocked ? (0.5 / (l.int * compressMul)) : 0;
    const tierExpFull   = Math.pow(1.05, l.pct);
    const linearBoostExp = 0.200 + tierStep * l.pct;
    const baseVal       = (1 + l.gainBonus) * gs.resonanceMul;
    const bonusForGain  = Math.pow(baseVal, tierExpFull);
    const bonusForBoost = Math.pow(baseVal, tierExpFull * linearBoostExp);
    const upgMulA       = Math.pow(l.upgrades + 1, 0.2);
    const upgMulB       = 1 + 0.1 * l.pct;
    const upgradeMul    = upgMulA * upgMulB;
    const gainPerFire   = l.gain * bonusForGain * effectiveGm * ceMul;
    const resPerSec     = fireRate * gainPerFire;
    const boostPerFire  = l.bp * upgradeMul * bonusForBoost;
    const boostPerSec   = fireRate * boostPerFire;
    return {
      i, fireRate, baseVal, tierExpFull, linearBoostExp,
      bonusForGain, bonusForBoost, upgradeMul, upgMulA, upgMulB,
      gainPerFire, resPerSec, boostPerFire, boostPerSec,
    };
  });

  const totalResPerSec = layerStats.reduce((s, ls) => s + ls.resPerSec, 0);

  const gainBonusGrowthPerSec = gs.layers.map((_, j) => {
    let rate = 0;
    for (let i = j + 1; i < gs.layers.length; i++) {
      if (gs.layers[i].unlocked) rate += layerStats[i].boostPerSec;
    }
    return rate;
  });

  const nebula    = gs.conLayers[0];
  const ccPerSec  = nebula?.unlocked ? (0.1 / nebula.int) * nebula.efficiency : 0;
  const cePerSec  = gs.cc;

  const resExpDenom = getResExpDenom(gs.spu, gs.activeChallenge, gs.challengesDone);

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={e => e.stopPropagation()}>

        <div style={s.header}>
          <span style={s.title}>STATISTICS</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── SC 獲得速度 ── */}
        <Section label="SC 獲得速度">
          <Row label="合計 (期待値)" val={`${fmtN(totalResPerSec)} SC/s`} accent />
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <Th>層</Th>
                  <Th right>基礎gain</Th>
                  <Th right>×Bonus</Th>
                  <Th right>×gm</Th>
                  <Th right>×CE</Th>
                  <Th right>/fire</Th>
                  <Th right>SC/s</Th>
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
                      <Td right dim>{fmtN(l.gain)}</Td>
                      <Td right dim>×{fmtN(ls.bonusForGain)}</Td>
                      <Td right dim>×{effectiveGm.toFixed(3)}</Td>
                      <Td right dim>×{ceMul.toFixed(3)}</Td>
                      <Td right>{fmtN(ls.gainPerFire)}</Td>
                      <Td right>{fmtN(ls.resPerSec)}</Td>
                      <Td right dim>{pct(ls.resPerSec, totalResPerSec)}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── グローバル倍率 ── */}
        <Section label="グローバル倍率">
          <Row label="合計 gm (raw)" val={`×${gm.toFixed(4)}`} />
          <Row label="  gmBase (SP gMul)" val={`×${gs.gmBase.toFixed(4)}`} />
          <Row label="  gmBonus (Quark蓄積)" val={`+${fmtN(gs.gmBonus)}`} />
          {gs.layers[0].unlocked && (
            <Row label="  Quark gm増加率" val={`+${fmtN(layerStats[0].boostPerSec)}/s`} />
          )}
          {gs.resonanceMul > 1 && (
            <>
              <Row label="  gm指数 (◈×resMul×0.01)" val={`^${gmExp.toFixed(4)}`} />
              <Row label="  effectiveGm = gm^指数" val={`×${fmtN(effectiveGm)}`} accent />
            </>
          )}
        </Section>

        {/* ── Bonus チェーン ── */}
        <Section label="Bonus チェーン  (gain用)">
          <Note>Bonus = ((1+gainBonus) × resMul)^(1.05^Tier)</Note>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <Th>層</Th>
                  <Th right>gainBonus</Th>
                  <Th right>×resMul</Th>
                  <Th right>baseVal</Th>
                  <Th right>^(1.05^T)</Th>
                  <Th right>Bonus</Th>
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
                      <Td right dim>×{gs.resonanceMul.toFixed(4)}</Td>
                      <Td right>{fmtN(ls.baseVal)}</Td>
                      <Td right dim>^{ls.tierExpFull.toFixed(3)}</Td>
                      <Td right>{fmtN(ls.bonusForGain)}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Boost / gMult チェーン ── */}
        <Section label="Boost / gMult チェーン">
          <Note>出力 = bp × upgradeMul × Bonus^(linExp)    linExp = 0.200+0.005×Tier</Note>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <Th>層</Th>
                  <Th right>bp</Th>
                  <Th right>T</Th>
                  <Th right>upg</Th>
                  <Th right>(u+1)^0.2</Th>
                  <Th right>×(1+.1T)</Th>
                  <Th right>upgMul</Th>
                  <Th right>linExp</Th>
                  <Th right>bonusBoost</Th>
                  <Th right>/fire</Th>
                  <Th right>/s</Th>
                </tr>
              </thead>
              <tbody>
                {gs.layers.map((l, i) => {
                  if (!l.unlocked) return null;
                  const ls = layerStats[i];
                  return (
                    <tr key={i}>
                      <Td style={{ color: LCFG[i].c }}>{LCFG[i].n}</Td>
                      <Td right dim>{fmtN(l.bp)}</Td>
                      <Td right dim>{l.pct}</Td>
                      <Td right dim>{l.upgrades}</Td>
                      <Td right dim>{ls.upgMulA.toFixed(3)}</Td>
                      <Td right dim>×{ls.upgMulB.toFixed(2)}</Td>
                      <Td right>{ls.upgradeMul.toFixed(3)}</Td>
                      <Td right dim>{ls.linearBoostExp.toFixed(3)}</Td>
                      <Td right>{fmtN(ls.bonusForBoost)}</Td>
                      <Td right>{fmtN(ls.boostPerFire)}</Td>
                      <Td right dim>{fmtN(ls.boostPerSec)}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── gainBonus 成長率 ── */}
        <Section label="gainBonus 成長率">
          <Note>各層のgainBonusに対して上位層がBoost加算する速度</Note>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <Th>対象層</Th>
                  <Th right>現gainBonus</Th>
                  <Th right>+/s</Th>
                </tr>
              </thead>
              <tbody>
                {gs.layers.map((l, i) => {
                  if (!l.unlocked || i === gs.layers.length - 1) return null;
                  return (
                    <tr key={i}>
                      <Td style={{ color: LCFG[i].c }}>{LCFG[i].n}</Td>
                      <Td right>{fmtN(l.gainBonus)}</Td>
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
        </Section>

        {/* ── レゾナンス ── */}
        {(gs.resonanceCnt > 0 || gs.resonanceMul > 1) && (
          <Section label="レゾナンス">
            <Row label="resonanceMul" val={`×${gs.resonanceMul.toFixed(6)}`} accent />
            <Row label="指数" val={`1/${resExpDenom}  (Resonance Tuning Lv.${gs.spu.resExp})`} />
            <Row label="◈ effectiveGm" val={`gm^${gmExp.toFixed(4)} = ×${fmtN(effectiveGm)}`} accent />
            <Row label="◈ コスト削減" val={`÷${gs.resonanceMul.toFixed(4)}  (upgrade/unlock/compress)`} />
            <Row label="回数" val={`${gs.resonanceCnt}回`} />
            <Row label="累積SC (周回内)" val={fmtN(gs.totalSCGained)} />
            <Row label="共振子 (Resonator)" val={`${gs.resonators}個  (Compress効果 ^${resonatorExp.toFixed(4)})`} accent />
            {(() => {
              const rawGm = gs.gmBase + gs.gmBonus;
              const product = gs.layers.reduce((acc, l) => {
                return acc * Math.pow(1 + l.gainBonus, Math.pow(1.05, l.pct));
              }, rawGm);
              const logP = Math.log(Math.max(product, 1e-300));
              return (
                <>
                  <Row label="現在の積" val={fmtN(product)} />
                  <Row label="前回の積" val={fmtN(gs.prevResonanceProduct)} />
                  <div style={s.tableWrap}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          <Th>要素</Th>
                          <Th right>1+bonus</Th>
                          <Th right>^(1.05^T)</Th>
                          <Th right>寄与</Th>
                          <Th right>対数%</Th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <Td dim>rawGm</Td>
                          <Td right>×{fmtN(rawGm)}</Td>
                          <Td right dim>^1</Td>
                          <Td right>{fmtN(rawGm)}</Td>
                          <Td right dim>{logP > 0 ? `${(Math.log(rawGm) / logP * 100).toFixed(1)}%` : "—"}</Td>
                        </tr>
                        {gs.layers.map((l, i) => {
                          if (!l.unlocked) return null;
                          const te = Math.pow(1.05, l.pct);
                          const contrib = Math.pow(1 + l.gainBonus, te);
                          return (
                            <tr key={i}>
                              <Td style={{ color: LCFG[i].c }}>{LCFG[i].n}</Td>
                              <Td right>+{fmtN(l.gainBonus)}</Td>
                              <Td right dim>^{te.toFixed(3)}</Td>
                              <Td right>×{fmtN(contrib)}</Td>
                              <Td right dim>{logP > 0 ? `${(Math.log(Math.max(contrib, 1e-300)) / logP * 100).toFixed(1)}%` : "—"}</Td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </Section>
        )}

        {/* ── SP効果 ── */}
        {(gs.spu.halfTrigger > 0 || gs.spu.resResidual > 0 || gs.spu.ceEff > 0 || gs.spu.resExp > 0) && (
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
            {gs.spu.resExp > 0 && (
              <Row label="Resonance Tuning" val={`Lv.${gs.spu.resExp}  指数 ^1/${resExpDenom}`} />
            )}
            {gs.spu.ceEff > 0 && (
              <Row label="CE効率強化" val={`Lv.${gs.spu.ceEff}  指数 ^${ceExp.toFixed(2)}`} />
            )}
          </Section>
        )}

        {/* ── 星座機構 ── */}
        {gs.conLayers.some(cl => cl.unlocked) && (
          <Section label="星座機構">
            <Row label="Cosmic Cores (CC)" val={fmtN(gs.cc)} accent />
            <Row label="  CC生成率 (Nebula期待値)" val={`+${fmtN(ccPerSec)}/s`} />
            <Row label="Cosmic Energy (CE)" val={fmtN(gs.ce)} />
            <Row label="  CE生成率 (CC/s)" val={`+${fmtN(cePerSec)}/s`} />
            <Row label="  CE倍率" val={`×${ceMul.toFixed(6)}`} accent />
            <Row label="  CE指数" val={`^${ceExp.toFixed(3)}  (0.1 + ceEff×0.05)`} />
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
                    const fireRate   = 0.1 / cl.int;
                    const hitsPerSec = fireRate * cl.efficiency;
                    const effectLabel = i === 0
                      ? `+${fmtN(hitsPerSec)} CC/s`
                      : `${CON_LCFG[i - 1].n} ×${Math.pow(0.99, hitsPerSec).toFixed(4)}/s`;
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

        {/* ── Compress ── */}
        <Section label="Compress (SC購入)">
          <Row label="レベル" val={`Lv.${gs.compressLevel}`} />
          <Row label="基礎倍率/Lv" val={`${compressBase}${gs.challengesDone[2] ? " (C3報酬)" : ""}`} />
          <Row label="共振子指数" val={`1.02^${gs.resonators} = ${resonatorExp.toFixed(4)}`} />
          {compressEffMul > 1 && (
            <Row label="C1 効果倍率" val={`×${compressEffMul} (チャレンジ中)`} accent />
          )}
          <Row label="インターバル倍率" val={`${compressBase}^(Lv×${resonatorExp.toFixed(4)}${compressEffMul > 1 ? `×${compressEffMul}` : ""}) = ×${compressMul.toFixed(6)}`} accent />
          {gs.activeChallenge === 1
            ? <Row label="次のコスト" val="C2中: 購入不可" />
            : <Row label="次のコスト" val={`${fmtN(gs.compressCost / resMul / (gs.activeChallenge === 2 ? Math.log10(Math.max(gs.res, 10)) : 1))} SC`} />
          }
        </Section>

        {/* ── プレスティージ ── */}
        <Section label="プレスティージ">
          <Row label="星列崩壊回数" val={`${gs.pcnt}回`} />
          <Row label="現在ゲーム時間" val={fmtT(gs.gtime)} />
          <Row label="前回崩壊からの経過" val={fmtT(gs.gtime - gs.lastPrestigeGtime)} />
          {gs.memoryActive && <Row label="星列の記憶" val="発動中 (ボーナス^0.9)" accent />}
          {gs.memoryCleared && <Row label="星列の記憶" val="突破済み" accent />}
          {(gs.sp > 0 || gs.pcnt > 0) && <Row label="保有 SP" val={`${gs.sp} SP`} />}
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

function Note({ children }: { children: React.ReactNode }) {
  return <div style={s.note}>{children}</div>;
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
      color: dim ? "#555577" : "#aaaadd",
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
    maxWidth: 640,
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
  note: {
    color: "#444466",
    fontSize: 9,
    marginBottom: 4,
    lineHeight: 1.5,
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
    marginTop: 4,
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
};
