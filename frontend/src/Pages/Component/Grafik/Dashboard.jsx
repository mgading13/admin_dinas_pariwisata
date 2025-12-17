import { useState } from "react";
import SideBar from "../SideBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  CalendarDays,
  TrendingUp,
  BarChart3,
  Clock,
  Globe,
} from "lucide-react";
import DateTimeWidget from "../DateTimeWidget";

/* =======================
   DUMMY DATA
======================= */
const summaryData = [
  {
    title: "Today",
    value: 615,
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "Yesterday",
    value: 1263,
    icon: Clock,
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    title: "This Week",
    value: 3333,
    icon: TrendingUp,
    gradient: "from-green-500 to-green-600",
  },
  {
    title: "Last Week",
    value: 1238964,
    icon: BarChart3,
    gradient: "from-orange-500 to-orange-600",
  },
  {
    title: "This Month",
    value: 13906,
    icon: CalendarDays,
    gradient: "from-purple-500 to-purple-600",
  },
  {
    title: "All Days",
    value: 1247537,
    icon: Globe,
    gradient: "from-rose-500 to-rose-600",
  },
];

const chartDaily = [
  { label: "01", views: 120 },
  { label: "02", views: 300 },
  { label: "03", views: 450 },
  { label: "04", views: 200 },
  { label: "05", views: 600 },
  { label: "06", views: 350 },
  { label: "07", views: 800 },
];

const chartMonthly = [
  { label: "Jan", views: 3200 },
  { label: "Feb", views: 2800 },
  { label: "Mar", views: 4100 },
  { label: "Apr", views: 3900 },
  { label: "Mei", views: 5200 },
  { label: "Jun", views: 6100 },
];

const chartYearly = [
  { label: "2022", views: 45000 },
  { label: "2023", views: 78200 },
  { label: "2024", views: 102300 },
  { label: "2025", views: 124753 },
];

export default function Dashboard() {
  const [filter, setFilter] = useState("daily");

  const chartData =
    filter === "monthly"
      ? chartMonthly
      : filter === "yearly"
      ? chartYearly
      : chartDaily;

  return (
    <SideBar>
      <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
        {/* =====================
            SUMMARY CARDS (OPSI 1)
        ====================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
          {summaryData.map((item, i) => {
            const Icon = item.icon;
            return (
              <Card
                key={i}
                className={`text-white bg-gradient-to-br ${item.gradient} shadow-lg`}
              >
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm opacity-80">{item.title}</p>
                    <h2 className="text-3xl font-bold">
                      {item.value.toLocaleString()}
                    </h2>
                  </div>
                  <Icon className="w-10 h-10 opacity-80" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* =====================
            FILTER
        ====================== */}
        <div className="flex justify-end">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] bg-white shadow">
              <SelectValue placeholder="Pilih Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Per Hari</SelectItem>
              <SelectItem value="monthly">Per Bulan</SelectItem>
              <SelectItem value="yearly">Per Tahun</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* =====================
            CHART (OPSI 2)
        ====================== */}
        <Card className="bg-white/70 backdrop-blur-md border border-white/40 shadow-xl">
          <CardHeader>
            <CardTitle className="text-slate-800">Grafik Pengunjung</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient
                    id="viewsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#c7d2fe" />
                  </linearGradient>
                </defs>

                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="views"
                  fill="url(#viewsGradient)"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </SideBar>
  );
}
