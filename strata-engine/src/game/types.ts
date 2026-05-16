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
  firstFire: boolean; // 解禁後の最初の発火は必ずSCを出す
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
  halfTrigger: number;
  resResidual: number;
  ul2:         number;
  ul3:         number;
  ul4:         number;
  ul5:         number;
  ul6:         number;
  ul7:         number;
  ul8:         number;
  ceEff:       number;
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
  maxResonanceMul:      number;
  cc:                   number;
  ce:                   number;
  conLayers:            ConstellationLayer[];
  gtime:                number;
  lastPrestigeGtime:    number;
  memoryActive:         boolean;
  memoryCleared:        boolean;
  compressLevel:        number; // SC購入のInterval圧縮レベル
  compressCost:         number; // 次のCompress購入コスト
}
