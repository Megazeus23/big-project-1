"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@biolab/ui/components/card";
import { Users, FileCheck, CheckSquare, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Panoramica della tua attività</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Clienti Totali"
          value={stats?.totalClients || 0}
          icon={Users}
          trend="+12%"
        />
        <StatsCard
          title="Clienti Attivi"
          value={stats?.activeClients || 0}
          icon={TrendingUp}
          trend="+8%"
        />
        <StatsCard
          title="Certificazioni"
          value={stats?.totalCertifications || 0}
          icon={FileCheck}
          trend="+5%"
        />
        <StatsCard
          title="Task Pendenti"
          value={stats?.pendingTasks || 0}
          icon={CheckSquare}
          trend="-3%"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attività Recenti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivities?.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-gray-500 text-xs">
                      {activity.user?.name} - {new Date(activity.createdAt).toLocaleString("it")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prossimi Appuntamenti</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Nessun appuntamento programmato</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: number;
  icon: any;
  trend: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{trend} dal mese scorso</p>
      </CardContent>
    </Card>
  );
}
