import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Users, Percent, Sparkles, Upload, ArrowRight, FileText, Database, AlertTriangle, LineChart as LineIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, Area, AreaChart } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fmtCurrency, fmtCompact, fmtNumber } from "@/lib/format";
import { seedRevenueTrend, seedCategories, seedKpis } from "@/lib/seed-data";
import { formatDistanceToNow } from "date-fns";

interface Dataset { id: string; name: string; row_count: number; created_at: string; quality_score: number; }

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "var(--shadow-md)",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("datasets")
      .select("id, name, row_count, created_at, quality_score")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setDatasets(data as Dataset[]);
        setLoading(false);
      });
  }, [user]);

  const k = seedKpis;
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || "there";
  const lowQuality = datasets.filter((d) => d.quality_score < 70);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8">
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Here's what's happening with your business today."
        actions={
          <>
            <Button variant="outline" asChild><Link to="/datasets"><Database className="h-4 w-4 mr-2" />All datasets</Link></Button>
            <Button asChild><Link to="/datasets/new"><Upload className="h-4 w-4 mr-2" />Upload data</Link></Button>
          </>
        }
      />

      {/* KPI row — focused on the four executive metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={fmtCurrency(k.totalRevenue)} icon={DollarSign} delta={12.4} loading={loading} hint="vs last period" />
        <KpiCard label="Total Profit" value={fmtCurrency(k.totalProfit)} icon={TrendingUp} delta={8.9} loading={loading} accent="success" hint="29% margin" />
        <KpiCard label="Customers" value={fmtNumber(k.customers)} icon={Users} delta={8.1} loading={loading} hint={`AOV ${fmtCurrency(k.aov)}`} />
        <KpiCard label="Growth" value={`${k.growth}%`} icon={Percent} delta={2.3} loading={loading} accent="success" hint="YoY" />
      </div>

      {/* Trends */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Revenue & Profit</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Last 12 months</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Profit</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={seedRevenueTrend} margin={{ left: -10, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={fmtCompact} tickLine={false} axisLine={false} width={44} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rev)" />
                <Area type="monotone" dataKey="profit" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#prof)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Sales by Category</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Current period</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={seedCategories} layout="vertical" margin={{ left: 0, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={fmtCompact} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={72} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtCurrency(v)} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Attention + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Needs your attention</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Datasets and metrics worth reviewing</p>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {loading ? (
              <div className="space-y-2">{[1,2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : lowQuality.length === 0 ? (
              <div className="flex items-start gap-3 rounded-lg border bg-success/5 border-success/20 p-4">
                <div className="h-8 w-8 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">Everything looks healthy</div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    All active datasets are above 70% quality. Revenue is trending +12.4% vs last period.
                  </div>
                </div>
              </div>
            ) : (
              lowQuality.map((d) => (
                <Link key={d.id} to={`/datasets/${d.id}`} className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3 hover:bg-warning/10 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.name} has {Math.round(d.quality_score)}% quality</div>
                    <div className="text-xs text-muted-foreground">Review missing values or duplicate rows to improve confidence.</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">Quick actions</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-2">
            <Button variant="outline" className="w-full justify-start h-10" asChild>
              <Link to="/datasets/new"><Upload className="h-4 w-4 mr-2" />Upload new dataset</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start h-10" asChild>
              <Link to="/reports"><FileText className="h-4 w-4 mr-2" />Create a report</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start h-10" asChild>
              <Link to="/analytics"><LineIcon className="h-4 w-4 mr-2" />Explore analytics</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start h-10" asChild>
              <Link to="/dashboards"><Sparkles className="h-4 w-4 mr-2" />Build a dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent datasets */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Recent datasets</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Your latest uploads</p>
          </div>
          <Button variant="ghost" size="sm" asChild><Link to="/datasets">View all <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : datasets.length === 0 ? (
            <div className="py-10 text-center border border-dashed rounded-lg">
              <Database className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No datasets yet. Upload your first one to see real numbers here.</p>
              <Button asChild><Link to="/datasets/new"><Upload className="h-4 w-4 mr-2" />Upload dataset</Link></Button>
            </div>
          ) : (
            <div className="divide-y">
              {datasets.map((d) => (
                <Link key={d.id} to={`/datasets/${d.id}`} className="flex items-center gap-4 py-3 first:pt-1 last:pb-1 hover:bg-muted/40 -mx-2 px-2 rounded-md transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{d.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {fmtNumber(d.row_count)} rows · {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      d.quality_score >= 80
                        ? "bg-success/10 text-success hover:bg-success/10"
                        : d.quality_score >= 60
                        ? "bg-warning/10 text-warning hover:bg-warning/10"
                        : "bg-destructive/10 text-destructive hover:bg-destructive/10"
                    }
                  >
                    {Math.round(d.quality_score)}%
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
