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
  resExp:      number;
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
  compressLevel:        number;
  compressCost:         number;
  totalSCGained:        number;
  resonators:           number;
  autoUnlock:           boolean;
  activeChallenge:      number | null;  // null=通常, 0=C1, 1=C2, 2=C3
  challengesDone:       [boolean, boolean, boolean];
}
