import { Project, ProjectElement, ProjectPage, PAGE_SIZES } from "@/lib/projects/types";
import { projectStore } from "@/lib/projects/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";

interface Props {
  project: Project;
  page: ProjectPage;
  element: ProjectElement | null;
}

export function PropertiesPanel({ project, page, element }: Props) {
  return (
    <div className="h-full flex flex-col bg-sidebar-background border-l">
      <div className="h-10 px-3 flex items-center border-b">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
          {element ? "Element" : "Page"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-[12.5px]">
        {element ? <ElementInspector project={project} page={page} el={element} /> : <PageInspector project={project} page={page} />}
      </div>
    </div>
  );
}

function PageInspector({ project, page }: { project: Project; page: ProjectPage }) {
  return (
    <>
      <Field label="Page name">
        <Input value={page.name} onChange={(e) => projectStore.renamePage(project.id, page.id, e.target.value)} className="h-8" />
      </Field>
      <Field label="Size">
        <div className="text-muted-foreground">
          {PAGE_SIZES[page.size].label} · {PAGE_SIZES[page.size].w}×{PAGE_SIZES[page.size].h}
        </div>
      </Field>
      <Field label="Background">
        <ColorRow value={page.background} onChange={(v) => projectStore.setPageBackground(project.id, page.id, v)} />
      </Field>
      <Field label="Elements">
        <div className="text-muted-foreground">{page.elements.length}</div>
      </Field>

      <div className="pt-3 mt-3 border-t space-y-3">
        <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Project theme</div>
        <Field label="Primary">
          <ColorRow value={project.theme.primary} onChange={(v) => projectStore.setTheme(project.id, { primary: v })} />
        </Field>
        <Field label="Accent">
          <ColorRow value={project.theme.accent} onChange={(v) => projectStore.setTheme(project.id, { accent: v })} />
        </Field>
        <Field label="Text">
          <ColorRow value={project.theme.text} onChange={(v) => projectStore.setTheme(project.id, { text: v })} />
        </Field>
      </div>
    </>
  );
}

function ElementInspector({ project, page, el }: { project: Project; page: ProjectPage; el: ProjectElement }) {
  const upd = (patch: any) => projectStore.updateElement(project.id, page.id, el.id, patch);
  const updProps = (p: any) => upd({ props: p });

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">{el.type}</div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => projectStore.bringForward(project.id, page.id, el.id, 1)} aria-label="Forward"><ArrowUp className="h-3 w-3" /></Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => projectStore.bringForward(project.id, page.id, el.id, -1)} aria-label="Backward"><ArrowDown className="h-3 w-3" /></Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => projectStore.removeElement(project.id, page.id, el.id)} aria-label="Delete"><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="X"><Input type="number" value={Math.round(el.x)} onChange={(e) => upd({ x: Number(e.target.value) })} className="h-8" /></Field>
        <Field label="Y"><Input type="number" value={Math.round(el.y)} onChange={(e) => upd({ y: Number(e.target.value) })} className="h-8" /></Field>
        <Field label="W"><Input type="number" value={Math.round(el.w)} onChange={(e) => upd({ w: Number(e.target.value) })} className="h-8" /></Field>
        <Field label="H"><Input type="number" value={Math.round(el.h)} onChange={(e) => upd({ h: Number(e.target.value) })} className="h-8" /></Field>
      </div>

      {(el.type === "heading" || el.type === "text") && (
        <>
          <Field label="Text">
            <Textarea value={el.props.text} onChange={(e) => updProps({ text: e.target.value })} rows={4} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            {el.type === "heading" && (
              <Field label="Level">
                <Select value={String(el.props.level)} onValueChange={(v) => updProps({ level: Number(v) })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">H1</SelectItem>
                    <SelectItem value="2">H2</SelectItem>
                    <SelectItem value="3">H3</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
            {el.type === "text" && (
              <Field label="Size"><Input type="number" value={el.props.size} onChange={(e) => updProps({ size: Number(e.target.value) })} className="h-8" /></Field>
            )}
            <Field label="Align">
              <Select value={el.props.align} onValueChange={(v) => updProps({ align: v })}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Color">
            <ColorRow value={el.props.color ?? "#0F172A"} onChange={(v) => updProps({ color: v })} />
          </Field>
        </>
      )}

      {el.type === "kpi" && (
        <>
          <Field label="Label"><Input value={el.props.label} onChange={(e) => updProps({ label: e.target.value })} className="h-8" /></Field>
          <Field label="Value"><Input value={el.props.value} onChange={(e) => updProps({ value: e.target.value })} className="h-8" /></Field>
          <Field label="Delta"><Input value={el.props.delta ?? ""} onChange={(e) => updProps({ delta: e.target.value })} className="h-8" /></Field>
          <Field label="Trend">
            <Select value={el.props.trend ?? "flat"} onValueChange={(v) => updProps({ trend: v })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="up">Up</SelectItem>
                <SelectItem value="down">Down</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Accent"><ColorRow value={el.props.accent ?? "#2563EB"} onChange={(v) => updProps({ accent: v })} /></Field>
        </>
      )}

      {el.type === "shape" && (
        <>
          <Field label="Shape">
            <Select value={el.props.shape} onValueChange={(v) => updProps({ shape: v })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rect">Rectangle</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Fill"><ColorRow value={el.props.fill} onChange={(v) => updProps({ fill: v })} /></Field>
          <Field label="Radius"><Input type="number" value={el.props.radius} onChange={(e) => updProps({ radius: Number(e.target.value) })} className="h-8" /></Field>
        </>
      )}

      {el.type === "divider" && (
        <>
          <Field label="Color"><ColorRow value={el.props.color} onChange={(v) => updProps({ color: v })} /></Field>
          <Field label="Thickness"><Input type="number" value={el.props.thickness} onChange={(e) => updProps({ thickness: Number(e.target.value) })} className="h-8" /></Field>
        </>
      )}

      {el.type === "image" && (
        <>
          <Field label="Image URL"><Input value={el.props.src} onChange={(e) => updProps({ src: e.target.value })} className="h-8" placeholder="https://..." /></Field>
          <Field label="Upload">
            <input
              type="file"
              accept="image/*"
              className="text-xs"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => updProps({ src: String(reader.result) });
                reader.readAsDataURL(f);
              }}
            />
          </Field>
          <Field label="Fit">
            <Select value={el.props.fit} onValueChange={(v) => updProps({ fit: v })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Radius"><Input type="number" value={el.props.radius} onChange={(e) => updProps({ radius: Number(e.target.value) })} className="h-8" /></Field>
        </>
      )}

      {el.type === "chart" && (
        <>
          <Field label="Title"><Input value={el.props.title ?? ""} onChange={(e) => updProps({ title: e.target.value })} className="h-8" /></Field>
          <Field label="Type">
            <Select value={el.props.kind} onValueChange={(v) => updProps({ kind: v })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Image (optional)">
            <input
              type="file"
              accept="image/*"
              className="text-xs"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => updProps({ src: String(reader.result) });
                reader.readAsDataURL(f);
              }}
            />
          </Field>
        </>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10.5px] uppercase tracking-wider text-muted-foreground/70 font-semibold">{label}</Label>
      {children}
    </div>
  );
}

function ColorRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 rounded border cursor-pointer" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 font-mono text-xs" />
    </div>
  );
}
