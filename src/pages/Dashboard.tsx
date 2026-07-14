import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ShoppingCart, Users, Percent, Package, Globe, LineChart as LineIcon, Sparkles, Upload, ArrowRight, FileText, Database } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, Area, AreaChart } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fmtCurrency, fmtCompact, fmtNumber } from "@/lib/format";
import { seedRevenueTrend, seedCategories, seedKpis } from "@/lib/seed-data";
import { formatDistanceToNow } from "date-fns";

interface Dataset { id: string; name: string; row_count: number; created_at: string; quality_score: number; }

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
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

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <KpiCard label="Total Revenue" value={fmtCurrency(k.totalRevenue)} icon={DollarSign} delta={12.4} loading={loading} />
        <KpiCard label="Total Profit" value={fmtCurrency(k.totalProfit)} icon={TrendingUp} delta={8.9} loading={loading} accent="success" />
        <KpiCard label="Orders" value={fmtNumber(k.orders)} icon={ShoppingCart} delta={5.2} loading={loading} />
        <KpiCard label="Customers" value={fmtNumber(k.customers)} icon={Users} delta={8.1} loading={loading} />
        <KpiCard label="Growth" value={`${k.growth}%`} icon={Percent} delta={2.3} loading={loading} accent="success" />
        <KpiCard label="Avg Order Value" value={fmtCurrency(k.aov)} icon={ShoppingCart} delta={-1.2} loading={loading} />
        <KpiCard label="Monthly Revenue" value={fmtCurrency(k.monthlyRevenue)} icon={LineIcon} delta={4.7} loading={loading} />
        <KpiCard label="Top Product" value={k.topProduct} icon={Package} hint="34% of revenue" loading={loading} />
        <KpiCard label="Top Region" value={k.topRegion} icon={Globe} hint="52% of orders" loading={loading} />
        <KpiCard label="Forecast" value={fmtCurrency(k.forecast)} icon={Sparkles} delta={9.8} loading={loading} accent="success" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Revenue & Profit</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Last 12 months</p>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={seedRevenueTrend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={fmtCompact} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => fmtCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rev)" />
                <Area type="monotone" dataKey="profit" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#prof)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Sales by Category</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Current period</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={seedCategories} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={fmtCompact} />
                <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={70} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => fmtCurrency(v)} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent + quick actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Datasets</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/datasets">View all <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : datasets.length === 0 ? (
              <div className="py-8 text-center">
                <Database className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No datasets yet. Upload your first one to see real numbers here.</p>
                <Button asChild><Link to="/datasets/new"><Upload className="h-4 w-4 mr-2" />Upload dataset</Link></Button>
              </div>
            ) : (
              <div className="space-y-2">
                {datasets.map((d) => (
                  <Link key={d.id} to={`/datasets/${d.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary-soft flex items-center justify-center">
                      <Database className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{fmtNumber(d.row_count)} rows · {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</div>
                    </div>
                    <div className="text-sm font-medium text-success">{Math.round(d.quality_score)}%</div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/datasets/new"><Upload className="h-4 w-4 mr-2" />Upload new dataset</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/reports"><FileText className="h-4 w-4 mr-2" />Create report</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/analytics"><LineIcon className="h-4 w-4 mr-2" />Explore analytics</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboards"><Sparkles className="h-4 w-4 mr-2" />Build a dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
