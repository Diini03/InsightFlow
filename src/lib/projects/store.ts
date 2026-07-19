import { useSyncExternalStore } from "react";
import { Project, ProjectElement, ProjectPage, ProjectType } from "./types";
import { createProjectFromTemplate } from "./templates";

const STORAGE_KEY = "xogarag.projects.v1";
const uid = () => Math.random().toString(36).slice(2, 10);

type Listener = () => void;
const listeners = new Set<Listener>();
let projects: Project[] = load();

// Per-project undo/redo stacks (in-memory).
const history: Record<string, { past: Project[]; future: Project[] }> = {};
const HISTORY_LIMIT = 50;

function load(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useProjects() {
  return useSyncExternalStore(subscribe, () => projects, () => projects);
}

export function useProject(id: string | undefined) {
  return useSyncExternalStore(
    subscribe,
    () => (id ? projects.find((p) => p.id === id) : undefined),
    () => (id ? projects.find((p) => p.id === id) : undefined),
  );
}

function snapshot(id: string) {
  const cur = projects.find((p) => p.id === id);
  if (!cur) return;
  const h = history[id] ?? (history[id] = { past: [], future: [] });
  h.past.push(JSON.parse(JSON.stringify(cur)));
  if (h.past.length > HISTORY_LIMIT) h.past.shift();
  h.future = [];
}

function update(id: string, updater: (p: Project) => Project, opts: { history?: boolean } = { history: true }) {
  if (opts.history !== false) snapshot(id);
  projects = projects.map((p) => (p.id === id ? { ...updater(p), updatedAt: Date.now() } : p));
  persist();
}

export const projectStore = {
  canUndo(id: string) { return (history[id]?.past.length ?? 0) > 0; },
  canRedo(id: string) { return (history[id]?.future.length ?? 0) > 0; },
  undo(id: string) {
    const h = history[id]; if (!h || !h.past.length) return;
    const cur = projects.find((p) => p.id === id); if (!cur) return;
    const prev = h.past.pop()!;
    h.future.push(JSON.parse(JSON.stringify(cur)));
    projects = projects.map((p) => (p.id === id ? prev : p));
    persist();
  },
  redo(id: string) {
    const h = history[id]; if (!h || !h.future.length) return;
    const cur = projects.find((p) => p.id === id); if (!cur) return;
    const next = h.future.pop()!;
    h.past.push(JSON.parse(JSON.stringify(cur)));
    projects = projects.map((p) => (p.id === id ? next : p));
    persist();
  },

  createFromTemplate(type: ProjectType) {
    const p = createProjectFromTemplate(type);
    projects = [p, ...projects];
    persist();
    return p;
  },
  duplicate(id: string) {
    const src = projects.find((p) => p.id === id);
    if (!src) return null;
    const copy: Project = { ...JSON.parse(JSON.stringify(src)), id: uid(), name: `${src.name} (copy)`, createdAt: Date.now(), updatedAt: Date.now() };
    projects = [copy, ...projects];
    persist();
    return copy;
  },
  remove(id: string) {
    projects = projects.filter((p) => p.id !== id);
    delete history[id];
    persist();
  },
  rename(id: string, name: string) {
    update(id, (p) => ({ ...p, name }));
  },
  setTheme(id: string, theme: Partial<Project["theme"]>) {
    update(id, (p) => ({ ...p, theme: { ...p.theme, ...theme } }));
  },
  addPage(id: string, size?: ProjectPage["size"]) {
    update(id, (p) => {
      const s = size ?? p.pages[p.pages.length - 1]?.size ?? "a4";
      const page: ProjectPage = { id: uid(), name: `Page ${p.pages.length + 1}`, size: s, background: "#FFFFFF", elements: [] };
      return { ...p, pages: [...p.pages, page] };
    });
  },
  duplicatePage(id: string, pageId: string) {
    update(id, (p) => {
      const idx = p.pages.findIndex((pg) => pg.id === pageId);
      if (idx < 0) return p;
      const src = p.pages[idx];
      const copy: ProjectPage = {
        ...JSON.parse(JSON.stringify(src)),
        id: uid(),
        name: `${src.name} copy`,
        elements: src.elements.map((e) => ({ ...e, id: uid() })),
      };
      const next = [...p.pages];
      next.splice(idx + 1, 0, copy);
      return { ...p, pages: next };
    });
  },
  removePage(id: string, pageId: string) {
    update(id, (p) => ({ ...p, pages: p.pages.length > 1 ? p.pages.filter((pg) => pg.id !== pageId) : p.pages }));
  },
  reorderPages(id: string, from: number, to: number) {
    update(id, (p) => {
      const next = [...p.pages];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...p, pages: next };
    });
  },
  renamePage(id: string, pageId: string, name: string) {
    update(id, (p) => ({ ...p, pages: p.pages.map((pg) => (pg.id === pageId ? { ...pg, name } : pg)) }));
  },
  setPageBackground(id: string, pageId: string, background: string) {
    update(id, (p) => ({ ...p, pages: p.pages.map((pg) => (pg.id === pageId ? { ...pg, background } : pg)) }));
  },
  addElement(id: string, pageId: string, el: Omit<ProjectElement, "id" | "z"> & { z?: number }): string {
    const newId = uid();
    update(id, (p) => ({
      ...p,
      pages: p.pages.map((pg) => {
        if (pg.id !== pageId) return pg;
        const z = (el.z ?? Math.max(0, ...pg.elements.map((e) => e.z)) + 1);
        return { ...pg, elements: [...pg.elements, { ...el, id: newId, z } as ProjectElement] };
      }),
    }));
    return newId;
  },
  updateElement(id: string, pageId: string, elementId: string, patch: Partial<ProjectElement>, opts: { history?: boolean } = {}) {
    update(id, (p) => ({
      ...p,
      pages: p.pages.map((pg) => {
        if (pg.id !== pageId) return pg;
        return {
          ...pg,
          elements: pg.elements.map((e) => (e.id === elementId ? ({ ...e, ...patch, props: { ...(e as any).props, ...(patch as any).props } } as ProjectElement) : e)),
        };
      }),
    }), opts);
  },
  removeElement(id: string, pageId: string, elementId: string) {
    update(id, (p) => ({
      ...p,
      pages: p.pages.map((pg) => (pg.id === pageId ? { ...pg, elements: pg.elements.filter((e) => e.id !== elementId) } : pg)),
    }));
  },
  duplicateElement(id: string, pageId: string, elementId: string): string | null {
    const cur = projects.find((p) => p.id === id);
    const pg = cur?.pages.find((x) => x.id === pageId);
    const src = pg?.elements.find((e) => e.id === elementId);
    if (!src) return null;
    const newId = uid();
    update(id, (p) => ({
      ...p,
      pages: p.pages.map((page) => {
        if (page.id !== pageId) return page;
        const z = Math.max(0, ...page.elements.map((e) => e.z)) + 1;
        const copy = { ...JSON.parse(JSON.stringify(src)), id: newId, x: src.x + 16, y: src.y + 16, z };
        return { ...page, elements: [...page.elements, copy] };
      }),
    }));
    return newId;
  },
  bringForward(id: string, pageId: string, elementId: string, dir: 1 | -1) {
    update(id, (p) => ({
      ...p,
      pages: p.pages.map((pg) => (pg.id === pageId ? { ...pg, elements: pg.elements.map((e) => (e.id === elementId ? { ...e, z: e.z + dir } : e)) } : pg)),
    }));
  },
};
