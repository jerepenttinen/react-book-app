import { z } from "zod";
import { fetchBooks } from "~/server/googlebooks/fetchBooks";
import { BooksQuery } from "~/server/googlebooks/query";

import { router, publicProcedure } from "../trpc";

export const booksRouter = router({
  search: publicProcedure
    .input(
      z.object({
        term: z.string().min(1),
        page: z.number().min(0).default(0),
        pageLength: z.number().min(0).default(5),
      }),
    )
    .query(async ({ input }) => {
      return fetchBooks(
        new BooksQuery()
          .query(input.term)
          .page(input.page, input.pageLength)
          .build(),
      );
    }),
});
