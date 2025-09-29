// MeshPanel.tsx
import ConstraintsView from "./ConstraintsView";
import type { CardData } from "./BrainstormView";   // ← new line

import MeshView from "./MeshView";

interface Props {
  cards: CardData[];
  meshReady: boolean;
}

export default function MeshPanel({ cards, meshReady }: Props) {
  return (
    <div className="flex flex-col h-full gap-2 overflow-hidden">
      {/* TOP – constraints */}
      <div className="max-h-[45%] overflow-y-auto">
        <ConstraintsView cards={cards} />
      </div>

      {/* BOTTOM – visualisation */}
      <div className="flex-1 flex items-center justify-center bg-background rounded-lg border">
        {meshReady ? (
          <MeshView />
        ) : (
          <p className="text-muted-foreground px-4 text-center">
            Click <strong>Run&nbsp;Meshing</strong> to view your mesh.
          </p>
        )}
      </div>
    </div>
  );
}
