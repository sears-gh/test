export interface LayerState {
  bi:        number;
  int:       number;
  elapsed:   number;
  cost:      number;
  gain:      number;
  bp:        number;
  gainBonus: number;
  pct:       number;
  upgrades:  number;
  flash:     number;
  evt:       string;
  evtAmt:    number;
  unlocked:  boolean;
}

export interface ConstellationLayer {
  unlocked:   boolean;
  int:        number;
  bi:         number;
  elapsed:    number;
  efficiency: number;
}

export interface SpUpgrades {
  gMul:        number;
  speed:       number;
  boost:       number;
  gain:        number;
  deep:        number;
  halfTrigger: number; // 発火時に外れた効果も1/10で発動
  resResidual: number; // 歴代最大resonanceMulの10%を初期適用
  ul2:         number; // Atom 初期解放
  ul3:         number; // Cell 初期解放
  ul4:         number; // Organism 初期解放
  ul5:         number; // Planet 初期解放
  ul6:         number; // Star 初期解放
  ul7:         number; // Galaxy 初期解放
  ul8:         number; // Cosmos 初期解放
  ceEff:       number; // CE効率強化 (無制限)
  compress:    number; // 全星列インターバル ×0.995/レベル (コスト ×10 逓増)
}

export interface GameState {
  res:                  number;
  sp:                   number;
  spu:                  SpUpgrades;
  gmBase:               number;
  gmBonus:              number;
  layers:               LayerState[];
  pcnt:                 number;
  resonanceMul:         number;
  prevResonanceProduct: number;
  resonanceCnt:         number;
  maxResonanceMul:      number; // 歴代最大のresonanceMul (resResidual用)
  cc:                   number;
  ce:                   number;
  conLayers:            ConstellationLayer[];
  gtime:                number;
  lastPrestigeGtime:    number;
  memoryActive:         boolean;
  memoryCleared:        boolean;
}
