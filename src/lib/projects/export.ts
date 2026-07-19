import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { PAGE_SIZES, Project } from "./types";

// Renders each page in a hidden offscreen container at native resolution,
// snapshots to PNG, then optionally assembles into a PDF.

async function renderPageToDataUrl(pageEl: HTMLElement): Promise<string> {
  return toPng(pageEl, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: undefined,
  });
}

export async function exportProjectPagesAsPng(
  project: Project,
  getPageElement: (pageId: string) => HTMLElement | null,
): Promise<{ pageId: string; dataUrl: string }[]> {
  const out: { pageId: string; dataUrl: string }[] = [];
  for (const page of project.pages) {
    const el = getPageElement(page.id);
    if (!el) continue;
    const dataUrl = await renderPageToDataUrl(el);
    out.push({ pageId: page.id, dataUrl });
  }
  return out;
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function exportPng(project: Project, pages: { pageId: string; dataUrl: string }[]) {
  if (pages.length === 1) {
    downloadDataUrl(pages[0].dataUrl, `${sanitize(project.name)}.png`);
    return;
  }
  pages.forEach((p, i) => downloadDataUrl(p.dataUrl, `${sanitize(project.name)}-${i + 1}.png`));
}

export async function exportPdf(project: Project, pages: { pageId: string; dataUrl: string }[]) {
  const first = project.pages[0];
  const dims = PAGE_SIZES[first.size];
  const orientation = dims.w >= dims.h ? "landscape" : "portrait";
  const pdf = new jsPDF({ unit: "px", format: [dims.w, dims.h], orientation });

  pages.forEach((p, i) => {
    const page = project.pages.find((x) => x.id === p.pageId)!;
    const d = PAGE_SIZES[page.size];
    if (i > 0) pdf.addPage([d.w, d.h], d.w >= d.h ? "landscape" : "portrait");
    pdf.addImage(p.dataUrl, "PNG", 0, 0, d.w, d.h);
  });

  pdf.save(`${sanitize(project.name)}.pdf`);
}

function sanitize(s: string) {
  return s.replace(/[^a-z0-9-_ ]/gi, "").trim() || "project";
}
