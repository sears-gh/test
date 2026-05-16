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
  efficiency: number; // starts at 1.0 (100%), increases by 0.05 per reset cycle
}

export interface SpUpgrades {
  gMul:  number;
  speed: number;
  boost: number;
  gain:  number;
  deep:  number;
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
  // Constellation system
  cc:                   number;  // Cosmic Cores
  ce:                   number;  // Cosmic Energy (accumulated at cc/s)
  conLayers:            ConstellationLayer[];
  // Memory event tracking
  gtime:                number;  // total game time in seconds
  lastPrestigeGtime:    number;
  memoryActive:         boolean; // 星列の記憶 in progress
  memoryCleared:        boolean; // 星列の記憶 succeeded; new prestige rules apply
}
