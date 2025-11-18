import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@biolab/auth";
import { prisma } from "@biolab/database";
import superjson from "superjson";

export async function createContext(opts?: CreateNextContextOptions) {
  const session = await getServerSession(authOptions);

  return {
    session,
    prisma,
  };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

// Routers
import { clientRouter } from "./routers/client";
import { dashboardRouter } from "./routers/dashboard";
import { documentRouter } from "./routers/document";
import { taskRouter } from "./routers/task";

export const appRouter = router({
  client: clientRouter,
  dashboard: dashboardRouter,
  document: documentRouter,
  task: taskRouter,
});

export type AppRouter = typeof appRouter;
