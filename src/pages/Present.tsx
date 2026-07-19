import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProject } from "@/lib/projects/store";
import { PAGE_SIZES } from "@/lib/projects/types";
import { ElementView } from "@/components/editor/elements/ElementView";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function Present() {
  const { id } = useParams();
  const nav = useNavigate();
  const project = useProject(id);
  const [i, setI] = useState(0);
  const [scale, setScale] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project) return;
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    return () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
  }, [project]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!project) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") setI((v) => Math.min(project.pages.length - 1, v + 1));
      else if (e.key === "ArrowLeft" || e.key === "PageUp") setI((v) => Math.max(0, v - 1));
      else if (e.key === "Home") setI(0);
      else if (e.key === "End") setI(project.pages.length - 1);
      else if (e.key === "Escape") nav(`/editor/${id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, id, nav]);

  const page = project?.pages[i];
  const dims = page ? PAGE_SIZES[page.size] : { w: 1, h: 1 };

  useLayoutEffect(() => {
    if (!wrapRef.current || !page) return;
    const el = wrapRef.current;
    const compute = () => {
      const s = Math.min(el.clientWidth / dims.w, el.clientHeight / dims.h);
      setScale(s * 0.95);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dims.w, dims.h, page]);

  if (!project || !page) return null;

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col">
      <div ref={wrapRef} className="flex-1 flex items-center justify-center overflow-hidden">
        <div
          className="relative shadow-2xl"
          style={{
            width: dims.w * scale,
            height: dims.h * scale,
          }}
        >
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{ width: dims.w, height: dims.h, transform: `scale(${scale})`, background: page.background }}
          >
            {[...page.elements].sort((a, b) => a.z - b.z).map((el) => (
              <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.w, height: el.h, zIndex: el.z }}>
                <ElementView el={el} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-14 shrink-0 flex items-center justify-between px-4 border-t border-white/10">
        <div className="text-sm tabular-nums text-white/70">{i + 1} / {project.pages.length}</div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-9 w-9 text-white hover:bg-white/10" onClick={() => setI((v) => Math.max(0, v - 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="h-9 w-9 text-white hover:bg-white/10" onClick={() => setI((v) => Math.min(project.pages.length - 1, v + 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button size="sm" variant="ghost" className="h-9 text-white hover:bg-white/10" onClick={() => nav(`/editor/${id}`)}>
          <X className="h-4 w-4 mr-1.5" /> Exit
        </Button>
      </div>
    </div>
  );
}
