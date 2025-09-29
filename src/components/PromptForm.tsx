"use client";

import { useState } from "react";
import { useBrainstorm, type BrainstormResp } from "@/hooks/useBrainstorm";
import { toast } from "sonner";

export default function PromptForm({
  onSuccess,
}: {
  onSuccess: (data: BrainstormResp) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const brainstormMutation = useBrainstorm();

  const submit = async () => {
    if (!prompt.trim()) {
      toast.error("Prompt can’t be empty");
      return;
    }
    try {
      const data = await brainstormMutation.mutateAsync(prompt);
      console.log("💡 Brainstorm response:", data);
      onSuccess(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(msg);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 rounded border p-2"
        placeholder="Describe your idea…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={submit}
        disabled={brainstormMutation.isPending}
        className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {brainstormMutation.isPending ? "Thinking…" : "Go"}
      </button>
    </div>
  );
}
