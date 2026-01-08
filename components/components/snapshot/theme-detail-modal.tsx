import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CallCard } from "./call-card";
import { OutlookCall } from "@/types/outlook";

interface ThemeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  calls: OutlookCall[];
}

export function ThemeDetailModal({ isOpen, onClose, theme, calls }: ThemeDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scroll on body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Simple portal to body
  // Ensure we are in a client environment
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        ref={overlayRef}
        className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{theme}</h2>
            <p className="text-muted-foreground text-sm">{calls.length} relevant outlooks</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {calls.length > 0 ? (
            calls.map((call) => (
              <CallCard key={call.id} call={call} />
            ))
          ) : (
             <div className="text-center py-10 text-muted-foreground">
               No specific calls found for this theme.
             </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
