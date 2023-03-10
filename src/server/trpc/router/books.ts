import { z } from "zod";
import got from "got";
import { BooksQuery } from "~/server/googlebooks/query";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import type { BookData, BooksData } from "~/server/googlebooks/book-types";
import { TRPCError } from "@trpc/server";
import { type Context } from "../context";
import { formatTitle } from "~/components/SearchResult";
import {
  createReviewValidator,
} from "~/server/common/books-validators";

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
    .input(createReviewValidator)
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
  getMyBookReview: protectedProcedure
    .input(z.object({ bookId: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.review.findFirst({
        where: {
          userId: ctx.session.user.id,
          bookId: input.bookId,
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
  getBookAverageScoreById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.review.aggregate({
        _count: {
          score: true,
        },
        _avg: {
          score: true,
        },
        where: {
          bookId: {
            equals: input.id,
          },
        },
      });
    }),
  getSavedBooks: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.savedBook.findMany({
        where: {
          userId: input.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          book: {
            include: {
              reviews: {
                where: {
                  userId: input.userId,
                },
              },
            },
          },
        },
      });
    }),
  getLibraryPreviewBooks: publicProcedure
    .input(z.object({ userId: z.string(), bookCount: z.number().min(0) }))
    .query(({ ctx, input }) => {
      return ctx.prisma.savedBook.findMany({
        where: {
          userId: input.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.bookCount,
        include: {
          book: true,
        },
      });
    }),
  getFavoriteBooks: publicProcedure
    .input(z.object({ userId: z.string(), bookCount: z.number().min(0) }))
    .query(({ ctx, input }) => {
      return ctx.prisma.review.findMany({
        where: {
          userId: input.userId,
        },
        orderBy: [
          {
            score: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        take: input.bookCount,
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
          pageCount: googleBook.volumeInfo.pageCount,
        },
      });
    } else {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
  }
  return book;
}

