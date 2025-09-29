import { useState } from "react";
import { ChevronDown, History, Sidebar, Upload, Share2, Gauge, Bot, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  onToggleVersionHistory: () => void;
  onToggleSidebar: () => void;
  isSidebarVisible: boolean;
  isVersionHistoryVisible: boolean;
  tokensPercentage: number;
  projectName: string | null;
}

export function TopBar({ 
  onToggleVersionHistory, 
  onToggleSidebar, 
  isSidebarVisible, 
  isVersionHistoryVisible,
  tokensPercentage,
  projectName, 
}: TopBarProps) {
  const navigate = useNavigate();
  return (
    <div className="h-16 bg-background border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src="/Makistry.png" alt="Makistry" className="h-10 w-auto" />
        </div> 
        <div className="flex items-center gap-1">
          <span className="text-foreground">
            {projectName ?? "Untitled Project"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Rename Project</DropdownMenuItem>
              <DropdownMenuItem>Duplicate Project</DropdownMenuItem>
              <DropdownMenuItem>Delete Project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Mid: Version + Sidebar Toggles */}
        <div
          className="absolute top-4 -translate-x-full flex items-center gap-2 z-10"
          style={{ left: "35%"}}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVersionHistory}
            className={isVersionHistoryVisible ? "bg-accent" : ""}
            title="Version History"
          >
            <History className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className={!isSidebarVisible ? "bg-accent" : ""}
            title={isSidebarVisible ? "Hide Chat" : "Show Chat"}
          >
            <Sidebar className="w-8 h-8" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <TokenMeter percentage={tokensPercentage} size={36} stroke={4}/>
        <Button variant="outline" size="sm" onClick={() => navigate('/assistant')}>
          <Bot className="w-4 h-4 mr-1" />
          Assistant
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
          <Settings className="w-4 h-4 mr-1" />
          Settings
        </Button>
        <Button variant="outline" size="sm">
          Upgrade
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-1" />
          Export
        </Button>
      </div>
    </div>
  );
}

interface TokenMeterProps {
  percentage: number; // 0-100
  size?: number;      // px, default 32
  stroke?: number;    // px, default 3
}

function TokenMeter({ percentage, size = 32, stroke = 3 }: TokenMeterProps) {
  const pct = Math.max(0, Math.min(100, percentage));
  const r = (size - stroke) / 2;            // radius so stroke stays inside viewBox
  const c = 2 * Math.PI * r;                // circumference
  const dash = (pct / 100) * c;             // visible arc length
  const dashArray = `${dash} ${c - dash}`;  // stroke-dasharray trick

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      title={`Token usage: ${pct}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"  // start at top (12 o'clock)
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="text-muted stroke-current"
          stroke="currentColor"
          fill="none"
          opacity={0.25}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="text-primary stroke-current"
          stroke="currentColor"
          fill="none"
          strokeDasharray={dashArray}
          strokeLinecap="round"
        />
      </svg>
      {/* Center label */}
      <span className="absolute text-[10px] font-medium leading-none">
        {pct}%
      </span>
    </div>
  );
}
