
"use client";

import * as React from "react";
import { ChevronRight, ChevronLeft, Play, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DemoSection = "intro" | "snapshot" | "delta" | "qa";

const SECTIONS: DemoSection[] = ["intro", "snapshot", "delta", "qa"];

export function DemoController() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);

  // Toggle visibility with keyboard shortcut (e.g., Ctrl+.)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === ".") {
        setIsVisible((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsVisible(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentSection = SECTIONS[currentSectionIndex];

  const navigate = (direction: "next" | "prev") => {
    if (direction === "next" && currentSectionIndex < SECTIONS.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      handleRouting(SECTIONS[nextIndex]);
    } else if (direction === "prev" && currentSectionIndex > 0) {
      const prevIndex = currentSectionIndex - 1;
      setCurrentSectionIndex(prevIndex);
      handleRouting(SECTIONS[prevIndex]);
    }
  };

  const handleRouting = (section: DemoSection) => {
    switch (section) {
      case "intro":
        window.location.href = "/";
        break;
      case "snapshot":
        window.location.href = "/snapshot";
        break;
      case "delta":
        window.location.href = "/delta";
        break;
      case "qa":
        window.location.href = "/explorer"; // Good for open Q&A
        break;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Card className="p-2 flex items-center gap-4 bg-background/95 backdrop-blur shadow-2xl border-primary/20">
        <div className="flex items-center gap-2 mr-4 border-r pr-4">
          <Badge variant="outline" className="font-mono">
            LIVE DEMO
          </Badge>
          <div className="flex items-center gap-1 font-mono text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatTime(elapsedTime)}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setIsActive(!isActive)}
          >
            <Play className={`w-3 h-3 ${isActive ? "text-green-500" : ""}`} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("prev")}
            disabled={currentSectionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Prev
          </Button>
          
          <div className="px-4 min-w-[120px] text-center font-bold text-sm uppercase tracking-wider">
            {currentSection}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("next")}
            disabled={currentSectionIndex === SECTIONS.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="ml-2 h-6 w-6"
          onClick={() => setIsVisible(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </Card>
      
      {/* Script Overlay Hint */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50 bg-black/20 px-2 py-1 rounded">
        Press Ctrl + . to toggle
      </div>
    </div>
  );
}
