import React, { useState } from "react";
import type { GameState, SpUpgrades } from "./game/types";
import { mkGs, defaultSpu } from "./game/init";
import { loadSave, useSave } from "./hooks/useSave";
import { useGameLoop } from "./hooks/useGameLoop";
import { upgrade, unlock, buySP } from "./game/actions";
import { Header } from "./components/Header";
import { LayerCard } from "./components/LayerCard";
import { SpShop } from "./components/SpShop";
import { HelpPanel } from "./components/HelpPanel";
import { PrestigeFlash } from "./components/PrestigeFlash";
import { NUM_LAYERS } from "./game/config";

function App() {
  const [gs, setGs] = useState<GameState>(() => loadSave() ?? mkGs(0, defaultSpu));
  const [showSP, setShowSP] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useGameLoop(setGs);
  const { deleteSave } = useSave(gs, setGs);

  const hasSP = gs.sp > 0 || gs.pcnt > 0;

  return (
    <div style={styles.app}>
      <Header
        gs={gs}
        onOpenSP={() => setShowSP(true)}
        onOpenHelp={() => setShowHelp(true)}
      />
      <div style={styles.layers}>
        {Array.from({ length: NUM_LAYERS }, (_, i) => (
          <LayerCard
            key={i}
            gs={gs}
            i={i}
            onUpgrade={() => setGs(prev => upgrade(prev, i))}
            onUnlock={() => setGs(prev => unlock(prev, i))}
          />
        ))}
      </div>
      {hasSP && showSP && (
        <SpShop
          gs={gs}
          onBuy={(k: keyof SpUpgrades) => setGs(prev => buySP(prev, k))}
          onClose={() => setShowSP(false)}
        />
      )}
      {showHelp && (
        <HelpPanel
          onClose={() => setShowHelp(false)}
          onDeleteSave={deleteSave}
        />
      )}
      <PrestigeFlash pcnt={gs.pcnt} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #050510 0%, #080820 100%)",
    maxWidth: 480,
    margin: "0 auto",
    color: "#ccccff",
  },
  layers: {
    padding: "12px 12px 32px",
  },
};

export default App;
