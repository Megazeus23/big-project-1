import { z } from "zod";
import { router, protectedProcedure } from "..";

export const documentRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        clientId: z.string().optional(),
        type: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.document.findMany({
        where: {
          clientId: input.clientId,
          type: input.type as any,
        },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { companyName: true } },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        originalName: z.string(),
        type: z.string(),
        mimeType: z.string(),
        size: z.number(),
        url: z.string(),
        path: z.string(),
        clientId: z.string().optional(),
        folderId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.document.create({
        data: {
          ...input,
          type: input.type as any,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.document.delete({
        where: { id: input.id },
      });
    }),
});
