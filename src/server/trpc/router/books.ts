import { z } from "zod";
import { fetchBooks } from "~/server/googlebooks/fetchBooks";
import { BooksQuery } from "~/server/googlebooks/query";

import { router, publicProcedure } from "../trpc";

export const booksRouter = router({
  search: publicProcedure
    .input(z.object({ term: z.string().min(1) }))
    .query(async ({ input }) => {
      return fetchBooks(new BooksQuery().query(input.term).page(0, 5).build());
    }),
});
