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

export interface SpUpgrades {
  gMul:  number;
  speed: number;
  boost: number;
  gain:  number;
  deep:  number;
}

export interface GameState {
  res:     number;
  sp:      number;
  spu:     SpUpgrades;
  gmBase:  number;
  gmBonus: number;
  layers:  LayerState[];
  pcnt:    number;
}
