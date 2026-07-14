import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Filter, FileText, Sparkles, TrendingUp, Database, LineChart, PieChart, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const features = [
  { icon: LineChart, title: "Interactive Dashboards", desc: "Drag-and-drop dashboards that update in real time as your data changes." },
  { icon: Filter, title: "Advanced Filtering", desc: "Slice by date, region, product, or any custom dimension in one click." },
  { icon: FileText, title: "Report Generation", desc: "Export polished PDF, Excel, and CSV reports your team will actually read." },
  { icon: Sparkles, title: "AI Business Insights", desc: "Executive summaries and recommendations generated from your data." },
  { icon: TrendingUp, title: "Forecasting", desc: "Predict revenue and growth trends with built-in statistical models." },
  { icon: Database, title: "Any Data Source", desc: "Upload CSV or Excel, or connect a database. Column types auto-detected." },
];

const testimonials = [
  { name: "Sarah Chen", role: "Head of Ops, Northlake", quote: "InsightFlow cut our monthly reporting from 3 days to 20 minutes. It's the tool I wished I had at my last three companies." },
  { name: "Marcus Ortiz", role: "Founder, Statica", quote: "The AI summary alone justifies the price. It reads a dataset and tells me exactly what changed — no more scrolling through pivot tables." },
  { name: "Priya Kumar", role: "Data Lead, Boldform", quote: "Finally a BI tool my non-technical stakeholders can actually use. Adoption went from 15% to 90% in a month." },
];

const pricing = [
  { name: "Starter", price: "$0", desc: "Perfect for solo analysts and side projects.", features: ["Up to 3 datasets", "Basic dashboards", "CSV/Excel upload", "1 AI summary / day"], cta: "Start Free" },
  { name: "Pro", price: "$29", suffix: "/mo", desc: "For teams shipping insights weekly.", features: ["Unlimited datasets", "AI insights & forecasts", "PDF & Excel exports", "Team sharing", "Priority support"], cta: "Start Pro trial", highlight: true },
  { name: "Enterprise", price: "Custom", desc: "SSO, audit logs, dedicated support.", features: ["Everything in Pro", "SSO / SAML", "Custom integrations", "Dedicated CSM", "SLA & audit logs"], cta: "Contact sales" },
];

const faqs = [
  { q: "Do I need to be technical to use InsightFlow?", a: "No. If you can drop a spreadsheet on a page, you can use InsightFlow. Our AI auto-detects column types, flags data quality issues, and writes a plain-English summary of what your data shows." },
  { q: "What file formats are supported?", a: "CSV and Excel (.xlsx, .xls) are supported today. Database connectors and Google Sheets sync are on the roadmap." },
  { q: "Is my data secure?", a: "Yes. Every dataset is stored encrypted at rest with row-level security — only you and users you invite can access your data. We never train models on customer data." },
  { q: "Can I export dashboards?", a: "Yes. Every dashboard exports to PDF, PNG, or an interactive shared link. Pro plans include scheduled email exports." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            InsightFlow
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
            <Button asChild className="shadow-glow"><Link to="/register">Start Free</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container py-20 lg:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="secondary" className="mb-6 bg-primary-soft text-primary border-0">
              <Zap className="h-3 w-3 mr-1" /> AI-powered business intelligence
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              Business intelligence <br />
              <span className="text-gradient">made simple.</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Upload your business data and instantly uncover trends, KPIs, and actionable insights. No SQL. No consultants. Just answers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="h-12 px-8 shadow-glow">
                <Link to="/register">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8">
                <Link to="/login">View Demo</Link>
              </Button>
            </div>
            <div className="mt-8 text-sm text-muted-foreground flex items-center justify-center gap-4">
              <span className="flex items-center gap-1"><Check className="h-4 w-4 text-success" /> No credit card</span>
              <span className="flex items-center gap-1"><Check className="h-4 w-4 text-success" /> Free forever plan</span>
            </div>
          </motion.div>

          {/* Hero dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <Card className="shadow-elevated overflow-hidden border-2">
              <div className="bg-muted/40 border-b px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                </div>
                <div className="text-xs text-muted-foreground ml-4">insightflow.app/dashboard</div>
              </div>
              <CardContent className="p-6 bg-gradient-card">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Revenue", value: "$284k", trend: "+12.4%" },
                    { label: "Customers", value: "2,847", trend: "+8.1%" },
                    { label: "AOV", value: "$99.7", trend: "+3.2%" },
                    { label: "Growth", value: "24.8%", trend: "+2.1pp" },
                  ].map((k) => (
                    <div key={k.label} className="rounded-lg border bg-card p-4">
                      <div className="text-xs text-muted-foreground">{k.label}</div>
                      <div className="text-2xl font-bold mt-1">{k.value}</div>
                      <div className="text-xs text-success mt-1">{k.trend}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border bg-card p-4 h-48 flex items-end gap-2">
                  {[40, 55, 48, 65, 58, 72, 68, 85, 78, 92, 88, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-primary rounded-t opacity-90 hover:opacity-100 transition" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Everything you need to turn data into decisions</h2>
            <p className="text-lg text-muted-foreground">A complete BI platform that scales from your first spreadsheet to your enterprise data warehouse.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full shadow-card hover:shadow-elevated transition-shadow border">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-lg bg-primary-soft flex items-center justify-center mb-4">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Loved by data teams</h2>
            <p className="text-lg text-muted-foreground">From two-person startups to Fortune 500 operators.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="shadow-card border">
                <CardContent className="p-6">
                  <p className="text-sm mb-6 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-medium">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((p) => (
              <Card key={p.name} className={`shadow-card border ${p.highlight ? "border-primary shadow-glow relative" : ""}`}>
                {p.highlight && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Most Popular</Badge>}
                <CardContent className="p-8">
                  <h3 className="font-semibold text-lg mb-2">{p.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{p.price}</span>
                    {p.suffix && <span className="text-muted-foreground">{p.suffix}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{p.desc}</p>
                  <Button asChild className="w-full mb-6" variant={p.highlight ? "default" : "outline"}>
                    <Link to="/register">{p.cta}</Link>
                  </Button>
                  <ul className="space-y-3 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-muted/30">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold tracking-tight mb-12 text-center">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <Card className="shadow-elevated border-2 bg-gradient-primary overflow-hidden">
            <CardContent className="p-12 lg:p-16 text-center text-primary-foreground">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">Ready to see your data clearly?</h2>
              <p className="text-lg opacity-90 mb-8">Upload your first dataset in under a minute. No credit card required.</p>
              <Button size="lg" variant="secondary" asChild className="h-12 px-8">
                <Link to="/register">Get started free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">InsightFlow</span>
            <span>· Business intelligence made simple.</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
