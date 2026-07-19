import { Link, useNavigate } from "react-router-dom";
import { Project } from "@/lib/projects/types";
import { projectStore } from "@/lib/projects/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Play, Minus, Plus, Undo2, Redo2, Grid3x3, Magnet, FileImage, FileText } from "lucide-react";
import { LogoMark } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

interface Props {
  project: Project;
  zoom: number;
  autoFit: boolean;
  onZoom: (z: number) => void;
  onFit: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  snap: boolean;
  onToggleSnap: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExportPng: () => void;
  onExportPdf: () => void;
}

export function CommandBar({
  project, zoom, autoFit, onZoom, onFit, showGrid, onToggleGrid, snap, onToggleSnap,
  onUndo, onRedo, canUndo, canRedo, onExportPng, onExportPdf,
}: Props) {
  const nav = useNavigate();
  return (
    <header className="h-12 shrink-0 border-b bg-background flex items-center gap-2 px-2.5">
      <Link to="/" className="inline-flex items-center gap-2 px-2 h-8 rounded-md hover:bg-muted" aria-label="Back to home">
        <ArrowLeft className="h-3.5 w-3.5" />
        <LogoMark size={20} />
      </Link>

      <div className="h-5 w-px bg-border mx-1" />

      <Input
        value={project.name}
        onChange={(e) => projectStore.rename(project.id, e.target.value)}
        className="h-8 max-w-[280px] bg-transparent border-0 focus-visible:ring-1 text-[13px] font-medium"
        aria-label="Project name"
      />

      <div className="flex items-center gap-0.5 ml-1">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onUndo} disabled={!canUndo} aria-label="Undo"><Undo2 className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onRedo} disabled={!canRedo} aria-label="Redo"><Redo2 className="h-3.5 w-3.5" /></Button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Toggle pressed={showGrid} onPressedChange={onToggleGrid} size="sm" className="h-8 w-8 p-0" aria-label="Toggle grid"><Grid3x3 className="h-3.5 w-3.5" /></Toggle>
        <Toggle pressed={snap} onPressedChange={onToggleSnap} size="sm" className="h-8 w-8 p-0" aria-label="Toggle snap"><Magnet className="h-3.5 w-3.5" /></Toggle>

        <div className="h-5 w-px bg-border mx-1" />

        <div className="flex items-center gap-0.5 mr-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onZoom(Math.max(0.2, zoom - 0.1))} aria-label="Zoom out"><Minus className="h-3.5 w-3.5" /></Button>
          <button onClick={onFit} className={cn("h-8 min-w-[52px] px-2 text-[12px] tabular-nums rounded-md hover:bg-muted", autoFit && "text-primary")}>
            {autoFit ? "Fit" : `${Math.round(zoom * 100)}%`}
          </button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onZoom(Math.min(3, zoom + 0.1))} aria-label="Zoom in"><Plus className="h-3.5 w-3.5" /></Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportPng}><FileImage className="h-3.5 w-3.5 mr-2" /> PNG (per page)</DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPdf}><FileText className="h-3.5 w-3.5 mr-2" /> PDF (all pages)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" className="h-8" onClick={() => nav(`/present/${project.id}`)}>
          <Play className="h-3.5 w-3.5 mr-1.5" /> Present
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
