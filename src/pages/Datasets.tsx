import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Database, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fmtNumber, fmtBytes } from "@/lib/format";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Dataset {
  id: string; name: string; description: string | null; row_count: number;
  column_count: number; size_bytes: number; quality_score: number; created_at: string;
}

export default function Datasets() {
  const { user } = useAuth();
  const [items, setItems] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("datasets").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems((data ?? []) as Dataset[]);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("datasets").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dataset deleted");
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const filtered = items.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Datasets"
        description="Upload, explore, and manage your business data."
        actions={<Button asChild><Link to="/datasets/new"><Upload className="h-4 w-4 mr-2" />Upload dataset</Link></Button>}
      />

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No datasets yet"
          description="Upload a CSV or Excel file to get instant insights. Column types, quality scores, and AI summaries are automatically generated."
          action={<Button asChild size="lg"><Link to="/datasets/new"><Upload className="h-4 w-4 mr-2" />Upload your first dataset</Link></Button>}
        />
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search datasets…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filtered.map((d) => (
                  <div key={d.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group">
                    <Link to={`/datasets/${d.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{d.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {fmtNumber(d.row_count)} rows · {d.column_count} cols · {fmtBytes(d.size_bytes)} · {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </Link>
                    <Badge variant={d.quality_score >= 80 ? "default" : d.quality_score >= 60 ? "secondary" : "destructive"} className={d.quality_score >= 80 ? "bg-success text-success-foreground" : ""}>
                      {Math.round(d.quality_score)}%
                    </Badge>
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition" onClick={() => onDelete(d.id, d.name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No datasets match "{q}"</div>}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}
