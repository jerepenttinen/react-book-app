import { z } from "zod";
import got from "got";
import { BooksQuery } from "~/server/googlebooks/query";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import type { BooksData, BookData } from "~/server/googlebooks/book-types";
import { TRPCError } from "@trpc/server";

const selectSafeUser = {
  id: true,
  name: true,
  image: true,
};

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
  createReview: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
        score: z.number().min(-1).max(10),
        content: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: this to function!
      //////////////////////////
      let book = await ctx.prisma.book.findFirst({
        where: {
          id: input.bookId,
        },
      });
      if (book === null) {
        const googleBook = await got
          .get(new BooksQuery().id(input.bookId).build())
          .json<BookData>();
        if (googleBook !== null) {
          book = await ctx.prisma.book.create({
            data: {
              id: googleBook.id,
              name: googleBook.volumeInfo.title,
              authors: googleBook.volumeInfo.authors?.join(", "),
            },
          });
        } else {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
      }
      //////////////////////////
      return await ctx.prisma.review.upsert({
        where: {
          bookId_userId: {
            bookId: input.bookId,
            userId: ctx.session.user.id,
          },
        },
        update: {
          score: input.score,
          content: input.content,
        },
        create: {
          bookId: input.bookId,
          userId: ctx.session.user.id,
          score: input.score,
          content: input.content,
        },
      });
    }),
  getBookReviews: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.review.findMany({
        where: {
          bookId: input.id,
        },
        include: {
          user: {
            select: selectSafeUser,
          },
        },
      });
    }),
});
