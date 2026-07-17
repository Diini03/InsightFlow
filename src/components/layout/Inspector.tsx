import { PanelRightClose, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InspectorProps {
  onClose: () => void;
}

export function Inspector({ onClose }: InspectorProps) {
  return (
    <aside className="h-full flex flex-col bg-card/40 border-l">
      <div className="h-11 shrink-0 border-b px-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-[13px] font-medium">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          Inspector
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={onClose}
          aria-label="Close inspector"
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="flex h-full flex-col items-center justify-center text-center text-xs text-muted-foreground">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div className="font-medium text-foreground text-[13px] mb-1">No selection</div>
          <p className="max-w-[220px] leading-relaxed">
            Select a chart, KPI card or widget to edit its properties.
          </p>
        </div>
      </div>
    </aside>
  );
}
