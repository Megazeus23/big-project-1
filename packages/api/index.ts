import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@biolab/auth";
import { prisma } from "@biolab/database";
import superjson from "superjson";
import { onError } from "./middleware/trpc-error-logger";
import { requestLoggerMiddleware } from "./middleware/request-logger";
import { AuthenticationError, toTRPCError } from "./middleware/error-handler";

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
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Add custom error metadata if needed
      },
    };
  },
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure.use(requestLoggerMiddleware);

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw toTRPCError(new AuthenticationError());
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure
  .use(requestLoggerMiddleware)
  .use(isAuthed);

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
