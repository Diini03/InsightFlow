import { ReactNode } from "react";
import { LucideIcon, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  eta?: string;
  features?: string[];
  preview?: ReactNode;
}

const defaultFeatures = [
  "Drag-and-drop builder with live preview",
  "Cross-filter and drill-down interactions",
  "Scheduled exports to PDF, Excel and CSV",
  "Shareable links with role-based access",
];

export function ComingSoonPage({
  title,
  description,
  icon: Icon,
  eta = "Next release",
  features = defaultFeatures,
  preview,
}: ComingSoonPageProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title={title}
        description={description}
        actions={<Badge variant="secondary" className="bg-primary-soft text-primary border-0">Coming {eta}</Badge>}
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 border-dashed">
          <CardContent className="p-8">
            <div className="h-12 w-12 rounded-xl bg-primary-soft flex items-center justify-center mb-5">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2">{title} is nearly here</h2>
            <p className="text-muted-foreground mb-6 max-w-lg">
              We're building this module with the same craft as the rest of InsightFlow.
              In the meantime, upload a dataset and explore the tools that are live today.
            </p>
            <ul className="space-y-2.5 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/datasets/new">Upload a dataset<ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-gradient-card border overflow-hidden">
          <CardContent className="p-8 h-full flex flex-col">
            {preview ?? (
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Preview</div>
                <div className="space-y-2.5">
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden"><div className="h-full w-4/5 bg-gradient-primary" /></div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden"><div className="h-full w-3/5 bg-gradient-primary opacity-70" /></div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden"><div className="h-full w-2/3 bg-gradient-primary opacity-50" /></div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden"><div className="h-full w-1/3 bg-gradient-primary opacity-30" /></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-6">
                  {[60, 90, 45].map((h, i) => (
                    <div key={i} className="rounded-md bg-muted flex items-end p-2 h-24">
                      <div className="w-full rounded bg-gradient-primary" style={{ height: `${h}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
