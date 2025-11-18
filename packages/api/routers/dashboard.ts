import { router, protectedProcedure } from "..";
import { ClientStatus } from "@biolab/database";

export const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [totalClients, activeClients, totalCertifications, pendingTasks, recentActivities] =
      await Promise.all([
        ctx.prisma.client.count(),
        ctx.prisma.client.count({ where: { status: ClientStatus.ACTIVE } }),
        ctx.prisma.certification.count(),
        ctx.prisma.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } }),
        ctx.prisma.activity.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, email: true } },
            client: { select: { companyName: true } },
          },
        }),
      ]);

    return {
      totalClients,
      activeClients,
      totalCertifications,
      pendingTasks,
      recentActivities,
    };
  }),

  revenue: protectedProcedure.query(async ({ ctx }) => {
    const invoices = await ctx.prisma.invoice.groupBy({
      by: ["status"],
      _sum: { total: true },
      _count: true,
    });

    return invoices;
  }),
});
