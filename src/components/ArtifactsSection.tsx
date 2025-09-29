import { useState } from "react";
import { Lightbulb, Palette, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import BrainstormView from "./artifacts/BrainstormView";
import DesignView from "./artifacts/DesignView";
import MeshPanel from "./artifacts/MeshPanel";
import SimulationPanel from "./artifacts/SimulationPanel";
import type { BrainstormJSON } from "@/hooks/useBrainstorm";
import { useGenerateDesign } from "@/hooks/useGenerateDesign";

/* ──────────────────────────────────────────────────────────────────── */
/* helper types                                                        */

type TabKey = "brainstorm" | "design" | "simulation";
type SimSub = "mesh" | "simulation";

interface ArtifactsSectionProps {
  isExpanded: boolean;
  projectId: string | null;
  brainstorm: BrainstormJSON | null;
}

/* ──────────────────────────────────────────────────────────────────── */

export function ArtifactsSection({ isExpanded, projectId, brainstorm }: ArtifactsSectionProps) {
  /* -------------------- state ------------------------------------- */
  const [mainTab, setMainTab] = useState<TabKey>("brainstorm");
  const [simSubTab, setSimSubTab] = useState<SimSub>("mesh");

  const [meshReady, setMeshReady] = useState(false);
  const [simReady, setSimReady] = useState(false);
  const genDesign = useGenerateDesign();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  /* lock / unlock flow for main tabs */
  const [tabLock, setTabLock] = useState<Record<TabKey, boolean>>({
    brainstorm: false,
    design: true,
    simulation: true,
  });

  /* -------------------- dummy data -------------------------------- */

  const constraintCards = []

  /* -------------------- actions ----------------------------------- */
  const handleGenerate = async () => {
    if (!projectId) return;
    try {
      const data = await genDesign.mutateAsync({ project_id: projectId });
      setBlobUrl(data.blob_url);
      // unlock and switch to design tab
      setTabLock((l) => ({ ...l, design: false }));
      setMainTab("design");
    } catch (e) {
      console.error("Generate design error", e);
    }
  };

  const handlePrepareSim = () => {
    setTabLock((l) => ({ ...l, simulation: false }));
    setMainTab("simulation");
  };

  const handleMeshing = () => {
    setMeshReady(true);            // unlocks Simulation sub-tab
  };

  const handleRunSimulation = () => {
    setSimReady(true);
  };

  /* -------------------- panel helpers ----------------------------- */
  const renderMainPanel = () => {
    switch (mainTab) {
      case "brainstorm":
        return <BrainstormView brainstorm={brainstorm} />;

      case "design":
        return (
          <DesignView blobUrl={blobUrl} />
        );

      case "simulation":
        return (
          <div className="flex flex-col h-full">
            {/* ── sub-tab bar ─────────────────────────── */}
            <Tabs value={simSubTab} onValueChange={(v) => setSimSubTab(v as SimSub)}>
              <TabsList className="grid w-full grid-cols-2 mb-0 flex-shrink-0">
                <TabsTrigger value="mesh" className="text-sm">
                  Mesh
                </TabsTrigger>
                <TabsTrigger
                  value="simulation"
                  className="text-sm"
                  disabled={!meshReady}      /* ← LOCK until meshing done */
                >
                  Simulation
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* extra padding under the bar */}
            <div className="pb-4" />

            {/* ── sub-tab panel ───────────────────────── */}
            <div className="flex-1 overflow-hidden">
              {simSubTab === "mesh" ? (
                <MeshPanel cards={constraintCards} meshReady={meshReady} />
              ) : (
                <SimulationPanel cards={constraintCards} simReady={simReady} />
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ─────────────────────── JSX ──────────────────────────────────── */

  return (
    <div
      className={`${
        isExpanded ? "w-full" : "w-[65%]"
      } bg-primary-light flex flex-col min-h-full relative`}
    >
      {/* ── MAIN TAB BAR ──────────────────────────────────────────── */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as TabKey)}>
        <TabsList className="grid w-full grid-cols-3 m-4 mb-5 flex-shrink-0">
          <TabsTrigger value="brainstorm" disabled={tabLock.brainstorm}>
            <Lightbulb className="w-4 h-4 mr-1" /> Brainstorm
          </TabsTrigger>
          <TabsTrigger value="design" disabled={tabLock.design}>
            <Palette className="w-4 h-4 mr-1" /> Design
          </TabsTrigger>
          <TabsTrigger value="simulation" disabled={tabLock.simulation}>
            <Play className="w-4 h-4 mr-1" /> Simulation
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── ACTIVE MAIN PANEL ─────────────────────────────────────── */}
      <div className="flex-1 px-4 pb-20 overflow-hidden">{renderMainPanel()}</div>

      {/* ── ACTION BUTTONS ────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 right-4">
        {mainTab === "brainstorm" && (
          <Button
            onClick={handleGenerate}
            className="w-full bg-cta hover:bg-cta/90 text-cta-foreground"
            size="lg"
          >
            {genDesign.isPending ? "Generating…" : "Generate Design"}
          </Button>
        )}

        {mainTab === "design" && (
          <Button
            onClick={handlePrepareSim}
            className="w-full bg-cta hover:bg-cta/90 text-cta-foreground"
            size="lg"
          >
            Prepare Simulation
          </Button>
        )}

        {mainTab === "simulation" && (
          <>
            {simSubTab === "mesh" && (
              <Button
                onClick={handleMeshing}
                className="w-full bg-cta hover:bg-cta/90 text-cta-foreground"
                size="lg"
              >
                Run Meshing
              </Button>
            )}

            {simSubTab === "simulation" && (
              <Button
                onClick={handleRunSimulation}
                className="w-full bg-cta hover:bg-cta/90 text-cta-foreground"
                size="lg"
              >
                Run Simulation
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
