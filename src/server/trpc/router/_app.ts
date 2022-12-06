import { router } from "../trpc";
import { authRouter } from "./auth";
import { booksRouter } from "./books";
import { updatesRouter } from "./updates";
import { usersRouter } from "./users";

export const appRouter = router({
  auth: authRouter,
  books: booksRouter,
  users: usersRouter,
  updates: updatesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
