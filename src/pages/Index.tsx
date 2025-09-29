import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { InitialInput } from "@/components/InitialInput";
import { ChatSection } from "@/components/ChatSection";
import { VersionHistory } from "@/components/VersionHistory";
import { ArtifactsSection } from "@/components/ArtifactsSection";
import { useBrainstorm, type BrainstormResp } from "@/hooks/useBrainstorm";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"input" | "workspace">("input");
  const [userQuery, setUserQuery] = useState("");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isVersionHistoryVisible, setIsVersionHistoryVisible] = useState(false);
  const [tokensPercentage] = useState(73); // Mock token usage
  const [brainstorm, setBrainstorm] = useState<BrainstormResp | null>(null);
  const brainstormMutation = useBrainstorm();

  const handleInitialSubmit = async (query: string) => {
    setUserQuery(query);
    try {
      const data = await brainstormMutation.mutateAsync(query);
      setBrainstorm(data);
      setCurrentStep("workspace");
    } catch (error) {
      console.error("Error during brainstorming:", error);
    }
    
  };

  const handleToggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
    if (isVersionHistoryVisible) {
      setIsVersionHistoryVisible(false);
    }
  };

  const handleToggleVersionHistory = () => {
    setIsVersionHistoryVisible(!isVersionHistoryVisible);
    if (!isSidebarVisible) {
      setIsSidebarVisible(true);
    }
  };

  if (currentStep === "input") {
    return <InitialInput onSubmit={handleInitialSubmit} />;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <TopBar
        onToggleVersionHistory={handleToggleVersionHistory}
        onToggleSidebar={handleToggleSidebar}
        isSidebarVisible={isSidebarVisible}
        isVersionHistoryVisible={isVersionHistoryVisible}
        tokensPercentage={tokensPercentage}
        projectName={brainstorm?.brainstorm.project_name ?? null}
      />
      
      <div className="flex-1 flex min-h-0">
        {isVersionHistoryVisible ? (
          <VersionHistory isVisible={true} />
        ) : (
          <ChatSection 
            initialQuery={userQuery} 
            projectId={brainstorm?.project_id ?? null}
            isVisible={isSidebarVisible} 
          />
        )}
        
        <ArtifactsSection 
          isExpanded={!isSidebarVisible}
          projectId={brainstorm?.project_id ?? null}
          brainstorm={brainstorm?.brainstorm ?? null} 
        />
      </div>
    </div>
  );
};

export default Index;