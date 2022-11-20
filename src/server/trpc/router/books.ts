import { z } from "zod";
import got from "got";
import { BooksQuery } from "~/server/googlebooks/query";
import { router, publicProcedure } from "../trpc";
import type { BooksData, BookData } from "~/server/googlebooks/book-types";

export const booksRouter = router({
  search: publicProcedure
    .input(
      z.object({
        term: z.string().min(1),
        page: z.number().min(0).default(0),
        pageLength: z.number().min(0).default(5),
      }),
    )
    .query(({ input }): Promise<BooksData> => {
      return got
        .get(
          new BooksQuery()
            .query(input.term)
            .page(input.page, input.pageLength)
            .build(),
        )
        .json();
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }): Promise<BookData> => {
      return got.get(new BooksQuery().id(input.id).build()).json();
    }),
});
