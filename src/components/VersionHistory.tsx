import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { GitBranch, Clock } from "lucide-react";

interface VersionHistoryProps {
  isVisible: boolean;
}

export function VersionHistory({ isVisible }: VersionHistoryProps) {
  const versions = [
    { id: "v1.3", name: "Added simulation constraints", timestamp: "2 hours ago", isCurrent: true },
    { id: "v1.2", name: "Updated design parameters", timestamp: "5 hours ago", isCurrent: false },
    { id: "v1.1", name: "Initial brainstorm completed", timestamp: "1 day ago", isCurrent: false },
    { id: "v1.0", name: "Project created", timestamp: "2 days ago", isCurrent: false }
  ];

  if (!isVisible) return null;

  return (
    <div className="w-[35%] bg-background flex flex-col h-full border-r border-border">
      <div className="p-4 border-b border-border flex-shrink-0">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          Version History
        </h2>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  version.isCurrent
                    ? "bg-primary/5 border-primary"
                    : "bg-card border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">{version.id}</span>
                  {version.isCurrent && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{version.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {version.timestamp}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-4 border-t border-border flex-shrink-0">
        <Button variant="outline" className="w-full">
          Create New Version
        </Button>
      </div>
    </div>
  );
}