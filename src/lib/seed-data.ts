// Realistic seed data for the dashboard when no dataset is uploaded yet
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const seedRevenueTrend = months.map((m, i) => ({
  month: m,
  revenue: 45000 + i * 3200 + Math.round(Math.sin(i) * 8000),
  profit: 12000 + i * 1400 + Math.round(Math.cos(i) * 3000),
}));

export const seedCategories = [
  { category: "Software", value: 128400 },
  { category: "Services", value: 96200 },
  { category: "Hardware", value: 54100 },
  { category: "Support", value: 38900 },
  { category: "Training", value: 21500 },
];

export const seedKpis = {
  totalRevenue: 284400,
  totalProfit: 82300,
  orders: 3241,
  customers: 2847,
  growth: 24.8,
  aov: 87.75,
  monthlyRevenue: 32100,
  topProduct: "Analytics Pro",
  topRegion: "North America",
  forecast: 312000,
};
