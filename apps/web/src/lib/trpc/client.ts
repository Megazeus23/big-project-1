import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@biolab/api";

export const trpc = createTRPCReact<AppRouter>();
