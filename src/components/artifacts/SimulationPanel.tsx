// MeshPanel.tsx
import ConstraintsView from "./ConstraintsView";
import type { CardData } from "./BrainstormView";   // ← new line

import ResultsView from "./ResultsView";

interface Props {
  cards: CardData[];
  simReady: boolean;
}

export default function SimulationPanel({ cards, simReady }: Props) {
  return (
    <div className="flex flex-col h-full gap-2 overflow-hidden">
      {/* TOP – constraints */}
      <div className="max-h-[45%] overflow-y-auto">
        <ConstraintsView cards={cards} />
      </div>

      {/* BOTTOM – visualisation */}
      <div className="flex-1 flex items-center justify-center bg-background rounded-lg border">
        {simReady ? (
          <ResultsView />
        ) : (
          <p className="text-muted-foreground px-4 text-center">
            Click <strong>Run&nbsp;Simulation</strong> to view your results.
          </p>
        )}
      </div>
    </div>
  );
}
