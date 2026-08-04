import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PortalLayout } from "@/components/portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortalState } from "@/lib/store";
import { naira } from "@/lib/mock-data";

const dailyDonations = [
  { day: "Mon", amount: 210000 },
  { day: "Tue", amount: 340000 },
  { day: "Wed", amount: 180000 },
  { day: "Thu", amount: 420000 },
  { day: "Fri", amount: 505000 },
  { day: "Sat", amount: 290000 },
  { day: "Sun", amount: 365000 },
];

const monthlyRevenue = [
  { month: "Mar", amount: 1200000 },
  { month: "Apr", amount: 1850000 },
  { month: "May", amount: 2400000 },
  { month: "Jun", amount: 2120000 },
  { month: "Jul", amount: 3100000 },
  { month: "Aug", amount: 980000 },
];

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — FundEzer Hospital Portal" },
      {
        name: "description",
        content: "Donation trends, hospital revenue, campaign success and treatment completion reporting.",
      },
      { property: "og:title", content: "Reports — FundEzer Hospital Portal" },
      {
        property: "og:description",
        content: "Operational reporting for FundEzer partner hospitals.",
      },
    ],
  }),
  component: Reports;
});

function Reports() {
  const { applications, campaigns } = usePortalState();
  const completed = campaigns.filter((c) => c.status === "completed").length;
  const approved = applications.filter((a) => a.status === "approved").length;

  const summary = [
    ["Campaign approval rate", applications.length ? Math.round((approved / applications.length) * 100) + "%" : "0%"],
    ["Treatment completion", campaigns.length ? Math.round((completed / campaigns.length) * 100) + "%" : "0%"],
    ["Average donation", naira(46500)],
    ["Avg. processing time", "1.8 days"],
  ];

  return (
    <PortalLayout title="Reports" subtitle="Performance of your hospital on FundEzer">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(([label, value]) => (
          <div key={label} className="card-elevated p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily donations (last 7 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyDonations}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip formatter={(v: number) => naira(v)} />
                <Bar dataKey="amount" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hospital revenue recovered</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={(v) => `${v / 1000000}M`}
                />
                <Tooltip formatter={(v: number) => naira(v)} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Campaign success</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {campaigns.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-4 p-5 text-sm">
              <p className="min-w-40 flex-1 font-semibold">{c.patientName}</p>
              <p className="min-w-40 flex-1 text-muted-foreground">{c.condition}</p>
              <p className="min-w-28">{naira(c.raised)}</p>
              <p className="min-w-24 text-muted-foreground">
                {Math.round((c.raised / c.goal) * 100)}% funded
              </p>
              <p className="min-w-20 text-muted-foreground">{c.donors} donors</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
