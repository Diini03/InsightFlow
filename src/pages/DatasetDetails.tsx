import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Database, Sparkles, Loader2, RefreshCw, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { fmtNumber, fmtBytes } from "@/lib/format";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ColMeta { name: string; type: string; nullCount: number; uniqueCount: number; }
interface Dataset {
  id: string; name: string; description: string | null; row_count: number;
  column_count: number; size_bytes: number; quality_score: number;
  columns: ColMeta[]; created_at: string;
}
interface Insight { id: string; content: string; created_at: string; }

export default function DatasetDetails() {
  const { id } = useParams();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: ds }, { data: rowsData }, { data: ins }] = await Promise.all([
      supabase.from("datasets").select("*").eq("id", id).single(),
      supabase.from("dataset_rows").select("rows").eq("dataset_id", id).eq("batch_index", 0).maybeSingle(),
      supabase.from("insights").select("*").eq("dataset_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (ds) setDataset(ds as unknown as Dataset);
    if (rowsData) setPreview(((rowsData as any).rows ?? []).slice(0, 50));
    if (ins) setInsight(ins as Insight);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const generateInsight = async () => {
    if (!id) return;
    setGenLoading(true);
    try {
      const { error } = await supabase.functions.invoke("generate-insights", { body: { dataset_id: id } });
      if (error) throw error;
      toast.success("AI insight generated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate insight");
    } finally {
      setGenLoading(false);
    }
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }
  if (!dataset) return <div>Dataset not found. <Link to="/datasets" className="text-primary">Back to datasets</Link></div>;

  const numeric = dataset.columns.filter((c) => c.type === "number");
  const categorical = dataset.columns.filter((c) => c.type === "string");

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Link to="/datasets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Datasets
      </Link>

      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-primary-soft flex items-center justify-center">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{dataset.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {dataset.description || `Uploaded ${formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })}`}
            </p>
          </div>
        </div>
        <Badge className={dataset.quality_score >= 80 ? "bg-success text-success-foreground" : dataset.quality_score >= 60 ? "" : "bg-destructive text-destructive-foreground"}>
          Quality {Math.round(dataset.quality_score)}%
        </Badge>
      </div>

      {/* Profile stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetaCard label="Rows" value={fmtNumber(dataset.row_count)} />
        <MetaCard label="Columns" value={String(dataset.column_count)} />
        <MetaCard label="Size" value={fmtBytes(dataset.size_bytes)} />
        <MetaCard label="Missing" value={fmtNumber(dataset.columns.reduce((s, c) => s + c.nullCount, 0))} />
      </div>

      {/* AI insight */}
      <Card className="mb-8 shadow-card border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Executive Summary</CardTitle>
              <p className="text-xs text-muted-foreground">Generated by InsightFlow AI</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={generateInsight} disabled={genLoading}>
            {genLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {insight ? "Regenerate" : "Generate"}
          </Button>
        </CardHeader>
        <CardContent>
          {insight ? (
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm leading-relaxed">{insight.content}</div>
          ) : (
            <p className="text-sm text-muted-foreground">No summary yet. Click Generate to have AI analyze your dataset and highlight what matters.</p>
          )}
        </CardContent>
      </Card>

      {/* Columns */}
      <Card className="mb-8">
        <CardHeader><CardTitle className="text-lg">Columns</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {dataset.columns.map((c) => (
              <div key={c.name} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30">
                <div className="font-mono text-sm flex-1 min-w-0 truncate">{c.name}</div>
                <Badge variant="secondary" className="text-xs">{c.type}</Badge>
                <div className="text-xs text-muted-foreground w-24 text-right">{fmtNumber(c.uniqueCount)} unique</div>
                <div className="text-xs text-muted-foreground w-24 text-right">{fmtNumber(c.nullCount)} null</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" />Data preview</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">First 50 of {fmtNumber(dataset.row_count)} rows</p>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                {dataset.columns.map((c) => (
                  <th key={c.name} className="text-left px-3 py-2 font-medium whitespace-nowrap border-b">{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-b hover:bg-muted/30">
                  {dataset.columns.map((c) => (
                    <td key={c.name} className="px-3 py-2 whitespace-nowrap text-muted-foreground">{String(row[c.name] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <Card><CardContent className="p-5">
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold mt-1 tabular-nums">{value}</div>
    </CardContent></Card>
  );
}
