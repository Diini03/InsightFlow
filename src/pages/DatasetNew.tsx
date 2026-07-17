import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { NadiifiBanner } from "@/components/layout/NadiifiBanner";
import { useAuth } from "@/hooks/useAuth";
import { parseFile, qualityScore, duplicateCount, type ParsedDataset } from "@/lib/parse-data";
import { fmtNumber, fmtBytes } from "@/lib/format";
import { toast } from "sonner";

const BATCH_SIZE = 500;

export default function DatasetNew() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedDataset | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDrop: async (files) => {
      const f = files[0];
      if (!f) return;
      setFile(f);
      setName(f.name.replace(/\.[^/.]+$/, ""));
      setParsing(true);
      try {
        const p = await parseFile(f);
        setParsed(p);
        if (p.rows.length === 0) toast.warning("File parsed but contained no rows");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to parse file");
        setFile(null);
      } finally {
        setParsing(false);
      }
    },
  });

  const reset = () => { setFile(null); setParsed(null); setName(""); setDescription(""); };

  const onUpload = async () => {
    if (!parsed || !file || !user) return;
    if (!name.trim()) return toast.error("Please give your dataset a name");
    setUploading(true);
    setProgress(5);

    try {
      const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("datasets").upload(path, file);
      if (upErr) throw upErr;
      setProgress(25);

      const score = qualityScore(parsed.rows, parsed.columns);
      const { data: ds, error: dsErr } = await supabase
        .from("datasets")
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          file_path: path,
          row_count: parsed.rows.length,
          column_count: parsed.columns.length,
          columns: parsed.columns as any,
          quality_score: score,
          size_bytes: file.size,
        })
        .select()
        .single();
      if (dsErr) throw dsErr;
      setProgress(45);

      // Insert rows in batches
      const total = Math.ceil(parsed.rows.length / BATCH_SIZE);
      for (let i = 0; i < total; i++) {
        const batch = parsed.rows.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        await supabase.from("dataset_rows").insert({ dataset_id: ds.id, batch_index: i, rows: batch as any });
        setProgress(45 + Math.round(((i + 1) / total) * 45));
      }

      await supabase.from("notifications").insert({
        user_id: user.id, type: "dataset_uploaded",
        title: `${name} uploaded`,
        body: `${fmtNumber(parsed.rows.length)} rows analyzed. Quality score: ${score}%.`,
      });

      // Kick off AI insight generation (fire-and-forget)
      supabase.functions.invoke("generate-insights", { body: { dataset_id: ds.id } });

      setProgress(100);
      toast.success("Dataset uploaded!");
      nav(`/datasets/${ds.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const preview = parsed?.rows.slice(0, 50) ?? [];
  const nulls = parsed ? parsed.columns.reduce((s, c) => s + c.nullCount, 0) : 0;
  const dupes = parsed ? duplicateCount(parsed.rows) : 0;
  const score = parsed ? qualityScore(parsed.rows, parsed.columns) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Upload dataset" description="Drop a CSV or Excel file to get an instant profile and AI-generated insights." />

      <div className="mb-5">
        <NadiifiBanner />
      </div>


      {!file ? (
        <Card {...getRootProps()} className={`border-2 border-dashed cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary-soft" : "hover:border-primary/50"}`}>
          <CardContent className="py-20 flex flex-col items-center text-center">
            <input {...getInputProps()} />
            <div className="h-16 w-16 rounded-2xl bg-primary-soft flex items-center justify-center mb-4">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{isDragActive ? "Drop file to upload" : "Drop a CSV or Excel file here"}</h3>
            <p className="text-sm text-muted-foreground mt-1">or click to browse · Up to 50MB</p>
            <div className="flex gap-2 mt-4">
              <Badge variant="secondary">CSV</Badge>
              <Badge variant="secondary">XLSX</Badge>
              <Badge variant="secondary">XLS</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary-soft flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">{fmtBytes(file.size)}</div>
              </div>
              {parsing ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> :
                <><CheckCircle2 className="h-5 w-5 text-success" />
                <Button size="icon" variant="ghost" onClick={reset} disabled={uploading}><X className="h-4 w-4" /></Button></>}
            </CardContent>
          </Card>

          {parsed && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <Card><CardContent className="p-5">
                  <Label htmlFor="ds-name">Dataset name</Label>
                  <Input id="ds-name" value={name} onChange={(e) => setName(e.target.value)} disabled={uploading} className="mt-1.5" />
                </CardContent></Card>
                <Card><CardContent className="p-5">
                  <Label htmlFor="ds-desc">Description (optional)</Label>
                  <Textarea id="ds-desc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={uploading} placeholder="e.g. Q3 sales export from Salesforce" className="mt-1.5 min-h-[40px] resize-none" rows={1} />
                </CardContent></Card>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Rows" value={fmtNumber(parsed.rows.length)} />
                <StatCard label="Columns" value={String(parsed.columns.length)} />
                <StatCard label="Missing values" value={fmtNumber(nulls)} />
                <StatCard label="Quality score" value={`${score}%`} accent={score >= 80 ? "success" : "warning"} />
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div>
                      <div className="font-medium">Preview</div>
                      <div className="text-xs text-muted-foreground">First 50 of {fmtNumber(parsed.rows.length)} rows</div>
                    </div>
                  </div>
                  <div className="overflow-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          {parsed.columns.map((c) => (
                            <th key={c.name} className="text-left px-3 py-2 font-medium whitespace-nowrap">
                              <div>{c.name}</div>
                              <div className="text-xs text-muted-foreground font-normal">{c.type}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-t hover:bg-muted/30">
                            {parsed.columns.map((c) => (
                              <td key={c.name} className="px-3 py-2 whitespace-nowrap text-muted-foreground">{String(row[c.name] ?? "")}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {uploading && (
                <Card><CardContent className="p-5 space-y-2">
                  <div className="flex justify-between text-sm"><span>Uploading dataset…</span><span>{progress}%</span></div>
                  <Progress value={progress} />
                </CardContent></Card>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={reset} disabled={uploading}>Cancel</Button>
                <Button onClick={onUpload} disabled={uploading || !name.trim()}>
                  {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save dataset
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, accent = "default" }: { label: string; value: string; accent?: "default" | "success" | "warning" }) {
  return (
    <Card><CardContent className="p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${accent === "success" ? "text-success" : accent === "warning" ? "text-warning" : ""}`}>{value}</div>
    </CardContent></Card>
  );
}
