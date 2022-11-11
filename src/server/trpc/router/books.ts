import { z } from "zod";
import { fetchBooks, fetchBook } from "~/server/googlebooks/fetchBooks";
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
    .query(({ input }) => {
      return fetchBooks(
        new BooksQuery()
          .query(input.term)
          .page(input.page, input.pageLength)
          .build(),
      );
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return fetchBook(new BooksQuery().id(input.id));
    }),
});
