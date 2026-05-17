import React, { useState } from "react";
import type { GameState, SpUpgrades } from "./game/types";
import { mkGs, defaultSpu } from "./game/init";
import { loadSave, useSave } from "./hooks/useSave";
import { useGameLoop } from "./hooks/useGameLoop";
import { useWindowWidth } from "./hooks/useWindowWidth";
import { upgrade, unlock, buySP, resonance, unlockConLayer, manualPrestige, buyCompress, bulkUpgrade, bulkCompress, toggleAutoUnlock, enterChallenge } from "./game/actions";
import { Header } from "./components/Header";
import { LayerCard } from "./components/LayerCard";
import { SpShop } from "./components/SpShop";
import { HelpPanel } from "./components/HelpPanel";
import { PrestigeFlash } from "./components/PrestigeFlash";
import { ResonanceModal } from "./components/ResonanceModal";
import { ConstellationPanel } from "./components/ConstellationPanel";
import { CompressCard } from "./components/CompressCard";
import { StatisticsPanel } from "./components/StatisticsPanel";
import { ChallengePanel } from "./components/ChallengePanel";
import { NUM_LAYERS } from "./game/config";

function App() {
  const [gs, setGs] = useState<GameState>(() => loadSave() ?? mkGs(0, defaultSpu));
  const [showSP, setShowSP] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showResonance, setShowResonance] = useState(false);
  const [showConstellation, setShowConstellation] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);

  useGameLoop(setGs);
  const { deleteSave } = useSave(gs, setGs);

  const windowWidth = useWindowWidth();
  const isMedium = windowWidth >= 768;
  const isWide = windowWidth >= 1280;

  const hasSP = gs.sp > 0 || gs.pcnt > 0;

  const headerProps = {
    gs,
    onOpenSP: () => setShowSP(true),
    onOpenHelp: () => setShowHelp(true),
    onOpenResonance: () => setShowResonance(true),
    onOpenConstellation: () => setShowConstellation(true),
    onOpenStats: () => setShowStats(true),
    onManualPrestige: () => setGs(prev => manualPrestige(prev)),
    onOpenChallenge: () => setShowChallenge(true),
  };

  const layerCols = isWide ? "repeat(2, 1fr)" : "1fr";
  const sidebarWidth = isMedium ? (isWide ? 300 : 280) : 0;

  const layers = (
    <div>
    <div style={{ padding: isMedium ? "12px 14px 0" : "12px 12px 0" }}>
      <CompressCard
        gs={gs}
        onBuy={() => setGs(prev => buyCompress(prev))}
        onBulkBuy={() => setGs(prev => bulkCompress(prev, 10))}
        onToggleAutoUnlock={() => setGs(prev => toggleAutoUnlock(prev))}
      />
    </div>
    <div style={{
      display: "grid",
      gridTemplateColumns: layerCols,
      gap: 8,
      padding: isMedium ? "4px 14px 32px" : "4px 12px 32px",
      alignItems: "start",
    }}>
      {Array.from({ length: NUM_LAYERS }, (_, i) => (
        <LayerCard
          key={i}
          gs={gs}
          i={i}
          onUpgrade={() => setGs(prev => upgrade(prev, i))}
          onUnlock={() => setGs(prev => unlock(prev, i))}
          onBulkUpgrade={() => setGs(prev => bulkUpgrade(prev, i, 10))}
        />
      ))}
    </div>
    </div>
  );

  const modals = (
    <>
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
      {showResonance && (
        <ResonanceModal
          gs={gs}
          onConfirm={() => { setGs(prev => resonance(prev)); setShowResonance(false); }}
          onCancel={() => setShowResonance(false)}
        />
      )}
      {showStats && (
        <StatisticsPanel gs={gs} onClose={() => setShowStats(false)} />
      )}
      {showConstellation && (
        <ConstellationPanel
          gs={gs}
          onUnlock={i => setGs(prev => unlockConLayer(prev, i))}
          onClose={() => setShowConstellation(false)}
        />
      )}
      {showChallenge && (
        <ChallengePanel
          gs={gs}
          onEnter={i => { setGs(prev => enterChallenge(prev, i)); setShowChallenge(false); }}
          onClose={() => setShowChallenge(false)}
        />
      )}
      <PrestigeFlash pcnt={gs.pcnt} />
    </>
  );

  // ── Wide layout: fixed sidebar + scrollable main ─────────
  if (isMedium) {
    return (
      <div style={styles.wideRoot}>
        <aside style={{ ...styles.sidebar, width: sidebarWidth }}>
          <Header {...headerProps} sidebar />
        </aside>
        <main style={styles.wideMain}>
          {layers}
        </main>
        {modals}
      </div>
    );
  }

  // ── Narrow layout: sticky header + scrolling content ─────
  return (
    <div style={styles.narrowRoot}>
      <Header {...headerProps} sidebar={false} />
      {layers}
      {modals}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  narrowRoot: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #050510 0%, #080820 100%)",
    maxWidth: 480,
    margin: "0 auto",
    color: "#ccccff",
  },
  wideRoot: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    background: "#050510",
    color: "#ccccff",
  },
  sidebar: {
    flexShrink: 0,
    overflowY: "auto",
    background: "linear-gradient(180deg, #0a0a1a 0%, #0d0d2b 100%)",
    borderRight: "1px solid #1a1a3e",
    height: "100vh",
  },
  wideMain: {
    flex: 1,
    overflowY: "auto",
    background: "linear-gradient(180deg, #050510 0%, #080820 100%)",
  },
};

export default App;
