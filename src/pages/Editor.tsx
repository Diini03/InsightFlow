import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable";
import { useProject, projectStore } from "@/lib/projects/store";
import { ProjectExplorer } from "@/components/editor/ProjectExplorer";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { PageNavigator } from "@/components/editor/PageNavigator";
import { CommandBar } from "@/components/editor/CommandBar";
import { Canvas } from "@/components/editor/Canvas";
import { PAGE_SIZES, ProjectElement } from "@/lib/projects/types";
import { exportProjectPagesAsPng, exportPng, exportPdf } from "@/lib/projects/export";
import { toast } from "sonner";

export default function Editor() {
  const { id } = useParams();
  const project = useProject(id);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [autoFit, setAutoFit] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [snap, setSnap] = useState(true);
  const pageEls = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (project && !activePageId) setActivePageId(project.pages[0]?.id ?? null);
  }, [project, activePageId]);

  useEffect(() => setSelectedId(null), [activePageId]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const editing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) projectStore.redo(project.id);
        else projectStore.undo(project.id);
        return;
      }
      if (cmd && e.key.toLowerCase() === "y") { e.preventDefault(); projectStore.redo(project.id); return; }
      if (editing) return;
      const page = project.pages.find((p) => p.id === activePageId);
      if (!page) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        projectStore.removeElement(project.id, page.id, selectedId);
        setSelectedId(null);
      } else if (cmd && e.key.toLowerCase() === "d" && selectedId) {
        e.preventDefault();
        const nid = projectStore.duplicateElement(project.id, page.id, selectedId);
        if (nid) setSelectedId(nid);
      } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && selectedId) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const el = page.elements.find((x) => x.id === selectedId);
        if (!el) return;
        const patch: any = {};
        if (e.key === "ArrowUp") patch.y = Math.max(0, el.y - step);
        if (e.key === "ArrowDown") patch.y = el.y + step;
        if (e.key === "ArrowLeft") patch.x = Math.max(0, el.x - step);
        if (e.key === "ArrowRight") patch.x = el.x + step;
        projectStore.updateElement(project.id, page.id, selectedId, patch);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, activePageId, selectedId]);

  if (!project) return <Navigate to="/" replace />;
  const page = project.pages.find((p) => p.id === activePageId) ?? project.pages[0];
  const selected = page?.elements.find((e) => e.id === selectedId) ?? null;

  const addElement = (kind: string) => {
    if (!page) return;
    const dims = PAGE_SIZES[page.size];
    const cx = dims.w / 2, cy = dims.h / 2;
    let el: Omit<ProjectElement, "id" | "z">;
    switch (kind) {
      case "heading":
        el = { type: "heading", x: cx - 200, y: cy - 40, w: 400, h: 80, props: { text: "Heading", level: 2, align: "left" } } as any; break;
      case "text":
        el = { type: "text", x: cx - 200, y: cy - 30, w: 400, h: 60, props: { text: "Body text", size: 16, align: "left" } } as any; break;
      case "kpi":
        el = { type: "kpi", x: cx - 105, y: cy - 65, w: 210, h: 130, props: { label: "Metric", value: "1,234", delta: "+4.2%", trend: "up", accent: project.theme.accent } } as any; break;
      case "chart":
        el = { type: "chart", x: cx - 240, y: cy - 130, w: 480, h: 260, props: { title: "Chart title", kind: "bar" } } as any; break;
      case "image":
        el = { type: "image", x: cx - 160, y: cy - 100, w: 320, h: 200, props: { src: "", fit: "cover", radius: 12 } } as any; break;
      case "shape":
        el = { type: "shape", x: cx - 100, y: cy - 60, w: 200, h: 120, props: { shape: "rect", fill: project.theme.primary, radius: 12 } } as any; break;
      case "divider":
        el = { type: "divider", x: cx - 150, y: cy, w: 300, h: 8, props: { color: project.theme.primary, thickness: 3 } } as any; break;
      default: return;
    }
    const nid = projectStore.addElement(project.id, page.id, el as any);
    setSelectedId(nid);
  };

  const doExport = async (fn: "png" | "pdf") => {
    const t = toast.loading("Preparing export…");
    try {
      // Temporarily switch to autoFit=1 so pages render at native size for capture.
      // We render on hidden clones to avoid disturbing UI.
      const pages = await exportProjectPagesAsPng(project, (pid) => pageEls.current[pid] ?? null);
      if (!pages.length) throw new Error("Nothing to export");
      if (fn === "png") await exportPng(project, pages);
      else await exportPdf(project, pages);
      toast.success(`Exported as ${fn.toUpperCase()}`, { id: t });
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed", { id: t });
    }
  };

  const canUndo = projectStore.canUndo(project.id);
  const canRedo = projectStore.canRedo(project.id);

  return (
    <div className="h-dvh flex flex-col bg-background text-foreground overflow-hidden">
      <CommandBar
        project={project}
        zoom={zoom}
        autoFit={autoFit}
        onZoom={(z) => { setAutoFit(false); setZoom(z); }}
        onFit={() => setAutoFit(true)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((v) => !v)}
        snap={snap}
        onToggleSnap={() => setSnap((v) => !v)}
        onUndo={() => projectStore.undo(project.id)}
        onRedo={() => projectStore.redo(project.id)}
        canUndo={canUndo}
        canRedo={canRedo}
        onExportPng={() => doExport("png")}
        onExportPdf={() => doExport("pdf")}
      />
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={18} minSize={14} maxSize={26}>
            <ProjectExplorer
              project={project}
              activePageId={page?.id ?? ""}
              onSelectPage={setActivePageId}
              onAddElement={addElement as any}
            />
          </ResizablePanel>
          <ResizableHandle withHandle={false} />
          <ResizablePanel defaultSize={62} minSize={40}>
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                {page && (
                  <Canvas
                    project={project}
                    page={page}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    zoom={zoom}
                    onFit={setZoom}
                    autoFit={autoFit}
                    showGrid={showGrid}
                    snap={snap}
                    pageRef={(el) => { pageEls.current[page.id] = el; }}
                  />
                )}
              </div>
              <PageNavigator project={project} activeId={page?.id ?? ""} onSelect={setActivePageId} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle={false} />
          <ResizablePanel defaultSize={20} minSize={16} maxSize={30}>
            {page && <PropertiesPanel project={project} page={page} element={selected} />}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      {/* Hidden offscreen render surfaces for export (all pages at native size). */}
      <div className="fixed left-[-100000px] top-0 pointer-events-none" aria-hidden>
        {project.pages.map((pg) => {
          const dims = PAGE_SIZES[pg.size];
          return (
            <div
              key={pg.id}
              ref={(el) => { pageEls.current[pg.id] = el; }}
              style={{ width: dims.w, height: dims.h, background: pg.background, position: "relative", overflow: "hidden" }}
            >
              {[...pg.elements].sort((a, b) => a.z - b.z).map((el) => (
                <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h }}>
                  <ExportEl el={el} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { ElementView } from "@/components/editor/elements/ElementView";
function ExportEl({ el }: { el: ProjectElement }) {
  return <ElementView el={el} />;
}
