"use client";

import ModelViewer from "@/components/ModelViewer";
import DesignSuggestionsOverlay from "@/components/DesignSuggestionsOverlay";
import { useMemo, useState } from "react";

export default function DesignView({ blobUrl }: { blobUrl: string | null }) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentDesign, setCurrentDesign] = useState('');

  // Empty state ----------------------------------------------------
  if (!blobUrl) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">3D Design Viewer</h3>
          <p className="text-gray-500">
            No design generated yet. Click &quot;Generate Design&quot;
          </p>
        </div>
      </div>
    );
  }

  const handleSuggestionSelect = (suggestion: string) => {
    console.log('Selected suggestion:', suggestion);
    // Here you could implement logic to apply the suggestion
    // For now, just log it
  };

  /* ----------------------------------------------------------------
   * Goal: Visually center the model in the Artifacts panel, regardless
   * of panel aspect. We do this by creating a flex container that
   * centers a *square* viewport (largest square that fits the height or
   * width, whichever is smaller). The square prevents the object from
   * hugging one side in extreme aspect ratios.
   * ---------------------------------------------------------------- */
  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden relative">
      {/* square canvas region */}
      <div className="relative w-full h-full max-w-full max-h-full aspect-square">
        <ModelViewer url={blobUrl} className="absolute inset-0" />
        
        {/* Design Suggestions Overlay */}
        {showSuggestions && (
          <DesignSuggestionsOverlay
            currentDesign={currentDesign}
            context="3D model viewer with current design"
            onSuggestionSelect={handleSuggestionSelect}
            onClose={() => setShowSuggestions(false)}
          />
        )}
      </div>
    </div>
  );
}
