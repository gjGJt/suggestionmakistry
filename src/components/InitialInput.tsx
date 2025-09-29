import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InitialInputProps {
  onSubmit: (query: string) => void;
  loading?: boolean;                     // ← new
}

export function InitialInput({ onSubmit, loading = false }: InitialInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
    }
  };

  return (
    <div className="min-h-screen bg-primary-light flex items-center justify-center p-8">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-primary text-center mb-12">
          What are we making today?
        </h1>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            type="text"
            placeholder="Describe your product idea..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 h-14 text-lg bg-background border-primary/20 focus:border-primary"
            autoFocus
          />

          <Button
            type="submit"
            size="lg"
            className="h-14 px-6 bg-primary hover:bg-primary-medium"
            disabled={loading || !query.trim()}
          >
            {loading ? "Thinking…" : <ArrowRight className="w-5 h-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
