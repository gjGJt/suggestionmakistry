"use client";

import { useState } from "react";
import { useGenerateDesign } from "@/hooks/useGenerateDesign";
import { useSimulate } from "@/hooks/useSimulate";
import ModelViewer from "@/components/ModelViewer";
import { useGenerateMesh }   from "@/hooks/useGenerateMesh";
import CombinedMeshViewer from "@/components/CombinedMeshViewer";
import { toast } from "sonner";
import { useRunSimulation } from "@/hooks/useRunSimulation";
import CombinedFEAViewer from "./CombinedFEAViewer";

export default function ActionButtons({ projectId }: { projectId: string }) {
  
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [simJson, setSimJson] = useState<any | null>(null);
  const [meshUrl, setMeshUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const sim = useSimulate();
  const gen = useGenerateDesign();
  const mesh = useGenerateMesh();
  const runSim = useRunSimulation();
  
  const handleGenerate = async () => {
    try {
      const data = await gen.mutateAsync({ project_id: projectId });
      setBlobUrl(data.blob_url ?? null);
      setSimJson(null);
      setMeshUrl(null); // reset simulation and mesh URLs on new design
      toast.success("Design generated!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Generation error");
    }
  };

  const handleSimulate = async () => {
    try {
      const { simulation_json } = await sim.mutateAsync({ project_id: projectId });
      setSimJson( simulation_json );
      setMeshUrl(null); // reset mesh URL on new simulation
      toast.success("Simulation prepared!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Simulation error");
    }
  };

  const handleMeshing = async () => {                               // NEW
    try {
      const data = await mesh.mutateAsync({ project_id: projectId });
      setMeshUrl(data.glb_url);
      toast.success("Meshing complete!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Meshing error");
    }
  };
  const handleRunSimulation = async () => {
    try {
      const { results } = await runSim.mutateAsync({ project_id: projectId });
      if (results.glb) setResultUrl(results.glb);
      toast.success("Simulation finished!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Run failure");
    }
  };

  return (
    <div className="space-y-8">
      {/* buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={handleGenerate}
          disabled={gen.isPending}
        >
          {gen.isPending ? "Generating…" : "Generate Design"}
        </button>

        <button
          className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={handleSimulate}
          disabled={!blobUrl || sim.isPending}
        >
          {sim.isPending ? "Simulating…" : "Simulate"}
        </button>

        <button
          onClick={handleMeshing}
          disabled={mesh.isPending || !simJson}
          className="rounded bg-purple-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {mesh.isPending ? "Meshing…" : "Run Meshing"}
        </button>
        <button
          onClick={handleRunSimulation}
          disabled={runSim.isPending || !meshUrl}
          className="rounded bg-rose-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {runSim.isPending ? "Running…" : "Run Simulation"}
        </button>
      </div>

      {/* 3-D view */}
      {blobUrl && (
        <div>
          <h3 className="mb-2 text-lg font-medium">3-D Preview</h3>
          <ModelViewer url={blobUrl} className="h-full w-full" />
        </div>
      )}

      {/* simulation JSON */}
      {simJson && (
        <div>
          <h3 className="mb-2 text-lg font-medium">Simulation JSON</h3>
          <pre className="max-h-[60vh] overflow-auto rounded bg-zinc-100 p-4 text-sm text-zinc-900">
            {JSON.stringify(simJson, null, 2)}
          </pre>
        </div>
      )}
      {meshUrl && blobUrl && (
        <section>
          <h3 className="mb-2 text-lg font-medium">Mesh Preview</h3>
          <CombinedMeshViewer cadUrl={blobUrl} meshUrl={meshUrl} />
        </section>
      )}
      {meshUrl && blobUrl && resultUrl && (
        <section>
          <h3 className="mb-2 text-lg font-medium">Simulation Results</h3>
          <CombinedFEAViewer
            cadUrl={blobUrl}
            meshUrl={meshUrl}         // remove this prop if you don’t want wires
            heatUrl={resultUrl}
          />
        </section>
      )}
    </div>
  );
}

