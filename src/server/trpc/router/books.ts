import { z } from "zod";
import got from "got";
import { BooksQuery } from "~/server/googlebooks/query";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import type { BookData, BooksData } from "~/server/googlebooks/book-types";
import { TRPCError } from "@trpc/server";
import { type Context } from "../context";
import { formatTitle } from "~/components/SearchResult";
import {
  createProgressUpdateValidator,
  createReviewValidator,
} from "~/server/common/books-validators";
import { Prisma } from "@prisma/client";

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
  getReadingBooks: publicProcedure
    .input(z.object({ userId: z.string().optional() }).optional())
    .query(({ input, ctx }) => {
      const userId = input?.userId ? input.userId : ctx.session?.user?.id;
      if (userId == undefined) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      return ctx.prisma.savedBook.findMany({
        where: {
          userId,
          shelf: "reading",
        },
        include: {
          book: true,
          updates: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });
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
  createProgressUpdate: protectedProcedure
    .input(createProgressUpdateValidator)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.update.create({
        data: {
          savedBookId: input.savedBookId,
          progress: input.progress,
          content: input.content,
          userId: ctx.session.user.id,
        },
      });
    }),
  getMyLastProgressUpdateForBook: protectedProcedure
    .input(z.object({ savedBookId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.update.findFirst({
        where: {
          userId: ctx.session.user.id,
          savedBookId: input.savedBookId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  getHomePageUpdates: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.$queryRaw(
      Prisma
        .sql`with json_by_user_savedbook as (select json_object('user', json_object('id', S.id,
																																'name', S.name,
																																'image', S.image),
																						'book', json_object('id', B.id,
																																'name', B.name,
																																'authors', B.authors,
																																'pageCount', B.pageCount,
																																'thumbnailUrl', B.thumbnailUrl,
																																'createdAt', B.createdAt
																								),
																						'updates', json_group_array(json_object('id', D.id,
																																										'content', content,
																																										'progress', progress,
																																										'createdAt', D.createdAt))) as update_group_obj

												 from "Update" D
																	join User S on S.id = D.userId
																	join SavedBook SB on D.savedBookId = SB.id
																	join Book B on SB.bookId = B.id
												 group by D.userid, savedBookId
												 limit 10)

select json_group_array(json(update_group_obj)) as result
from json_by_user_savedbook;`,
    );

    const r = result as { result: string }[];
    if (r.length === 0 || r[0] === undefined || r[0].result === undefined) {
      return undefined;
    }

    return updatesValidator.parse(JSON.parse(r[0].result));
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

export const updatesValidator = z.array(
  z.object({
    user: z.object({
      id: z.string(),
      name: z.string().optional(),
      image: z.string().optional(),
    }),
    book: z.object({
      id: z.string(),
      name: z.string().optional(),
      authors: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      pageCount: z.number().optional(),
			createdAt: z.number().transform((a) => new Date(a)),
    }),
    updates: z.array(
      z.object({
        id: z.string(),
        createdAt: z.number().transform((a) => new Date(a)),
        progress: z.number(),
        content: z.string(),
      }),
    ),
  }),
);
