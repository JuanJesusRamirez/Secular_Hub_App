
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";

export function DemoScript() {
  // Simple implementation: could be expanded to show context-sensitive notes
  // depending on the current URL.
  
  const [notes, setNotes] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Determine notes based on path
    const path = window.location.pathname;
    if (path === '/') {
        setNotes("- Welcome & Context: 'Data from 970 calls, 89 institutions'\n- Show: Live stats logic\n- Transition: 'Let's look at 2026 Consensus'");
    } else if (path.includes('snapshot')) {
        setNotes("- Read specific AI summary\n- Click top 3 themes in Treemap\n- Highlight sentiment split");
    } else if (path.includes('delta')) {
        setNotes("- Explain the Sankey flow (left to right)\n- Show 'What Changed' narrative\n- Pick one institution pivot example");
    } else {
        setNotes(null);
    }
  }, []); // Needs to listen to route changes in real app, but this is simple version

  if (!notes) return null;

  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300">
      <Card className="p-4 bg-yellow-50/90 text-yellow-900 border-yellow-200 shadow-lg text-sm font-sans whitespace-pre-wrap">
        <h4 className="font-bold mb-2 text-xs uppercase tracking-wider text-yellow-700">Presenter Notes</h4>
        {notes}
      </Card>
    </div>
  );
}
