import { z } from "zod";
import { router, protectedProcedure } from "..";

export const clientRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
        status: z.enum(["LEAD", "PROSPECT", "ACTIVE", "INACTIVE", "CHURNED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const clients = await ctx.prisma.client.findMany({
        take: input.limit + 1,
        where: input.status ? { status: input.status } : undefined,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          consultant: { select: { id: true, name: true, email: true } },
          _count: {
            select: { documents: true, certifications: true },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (clients.length > input.limit) {
        const nextItem = clients.pop();
        nextCursor = nextItem!.id;
      }

      return { clients, nextCursor };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.client.findUnique({
        where: { id: input.id },
        include: {
          consultant: true,
          certifications: true,
          documents: { take: 10, orderBy: { createdAt: "desc" } },
          quotes: { take: 5, orderBy: { createdAt: "desc" } },
          inspections: { take: 5, orderBy: { scheduledDate: "desc" } },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(1),
        contactPerson: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        vatNumber: z.string().optional(),
        certificationTypes: z.array(z.string()),
        consultantId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.client.create({
        data: {
          ...input,
          certificationTypes: input.certificationTypes as any,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        companyName: z.string().optional(),
        contactPerson: z.string().optional(),
        email: z.string().email().optional(),
        status: z.enum(["LEAD", "PROSPECT", "ACTIVE", "INACTIVE", "CHURNED"]).optional(),
        leadScore: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.client.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.client.delete({
        where: { id: input.id },
      });
    }),
});
