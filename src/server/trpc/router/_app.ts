import { router } from "../trpc";
import { authRouter } from "./auth";
import { booksRouter } from "./books";

export const appRouter = router({
  auth: authRouter,
  books: booksRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
