import { z } from "zod";
import got from "got";
import { BooksQuery } from "~/server/googlebooks/query";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import type { BooksData, BookData } from "~/server/googlebooks/book-types";
import { TRPCError } from "@trpc/server";
import { type Context } from "../context";
import { formatTitle } from "~/components/SearchResult";

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
      await loadBookToDatabase(ctx, input.bookId);
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
  getSavedBookById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.savedBook.findUnique({
        where: {
          bookId_userId: {
            bookId: input.id,
            userId: ctx.session.user.id,
          },
        },
      });
    }),
  updateSavedBook: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
        shelf: z.enum(["none", "shelf", "reading", "read"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const book = await loadBookToDatabase(ctx, input.bookId);
      if (input.shelf === "none") {
        await ctx.prisma.savedBook.delete({
          where: {
            bookId_userId: {
              bookId: book.id,
              userId: ctx.session.user.id,
            },
          },
        });
      } else {
        await ctx.prisma.savedBook.upsert({
          where: {
            bookId_userId: {
              bookId: book.id,
              userId: ctx.session.user.id,
            },
          },
          update: {
            shelf: input.shelf,
          },
          create: {
            shelf: input.shelf,
            userId: ctx.session.user.id,
            bookId: input.bookId,
          },
        });
      }
    }),
  getReadingBooks: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.savedBook.findMany({
      where: {
        userId: ctx.session.user.id,
        shelf: "reading",
      },
      include: {
        book: true,
      },
    });
  }),
});

async function loadBookToDatabase(ctx: Context, bookId: string) {
  let book = await ctx.prisma.book.findFirst({
    where: {
      id: bookId,
    },
  });
  if (book === null) {
    const googleBook = await got
      .get(new BooksQuery().id(bookId).build())
      .json<BookData>();
    if (googleBook !== null) {
      book = await ctx.prisma.book.create({
        data: {
          id: googleBook.id,
          name: formatTitle(googleBook),
          authors: googleBook.volumeInfo.authors?.join(", "),
          thumbnailUrl: googleBook.volumeInfo.imageLinks?.thumbnail,
        },
      });
    } else {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
  }
  return book;
}
