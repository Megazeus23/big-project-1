import { z } from "zod";
import { router, protectedProcedure } from "..";

export const taskRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CANCELLED"]).optional(),
        assignedToId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.task.findMany({
        where: {
          status: input.status,
          assignedToId: input.assignedToId,
        },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        include: {
          assignedTo: { select: { name: true, email: true } },
          createdBy: { select: { name: true } },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
        assignedToId: z.string().optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.task.create({
        data: {
          ...input,
          createdById: (ctx.session.user as any).id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CANCELLED"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.task.update({
        where: { id },
        data,
      });
    }),
});
