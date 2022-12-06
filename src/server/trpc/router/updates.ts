import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  createProgressUpdateValidator,
} from "~/server/common/books-validators";
import { Prisma } from "@prisma/client";

export const updatesRouter = router({
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
        .sql`
with json_by_user_savedbook as (select json_object('user', json_object('id', S.id,
                                                                       'name', S.name,
                                                                       'image', S.image),
                                                   'book', json_object('id', B.id,
                                                                       'name', B.name,
                                                                       'authors', B.authors,
                                                                       'pageCount', B.pageCount,
                                                                       'thumbnailUrl', B.thumbnailUrl,
                                                                       'createdAt', B.createdAt
                                                       ),
                                                   'updates', json(json_group_array(json_object('id', D.id,
                                                                                                'content', content,
                                                                                                'progress', progress,
                                                                                                'createdAt', D.createdAt)))) as update_group_obj,
                                    max(D.createdAt) as lastUpdateCreatedAt
                                from "Update" D
                                         join User S on S.id = D.userId
                                         join SavedBook SB on D.savedBookId = SB.id
                                         join Book B on SB.bookId = B.id
                                group by D.userId, savedBookId
                                order by lastUpdateCreatedAt desc
                                limit 10)

select json_group_array(json(update_group_obj)) as result
from json_by_user_savedbook;`,
    );

    const r = result as { result: string }[];
    if (r.length === 0 || r[0] === undefined || r[0].result === undefined) {
      return undefined;
    }

    return updateBlocksValidator.parse(JSON.parse(r[0].result));
  }),
  getUpdatesByUserId: publicProcedure
	.input(z.object({userId: z.string()}))
	.query(async ({ ctx, input }) => {
    const result = await ctx.prisma.$queryRaw(
      Prisma
        .sql`
with json_by_user_savedbook as (select json_object('user', json_object('id', S.id,
                                                                       'name', S.name,
                                                                       'image', S.image),
                                                   'book', json_object('id', B.id,
                                                                       'name', B.name,
                                                                       'authors', B.authors,
                                                                       'pageCount', B.pageCount,
                                                                       'thumbnailUrl', B.thumbnailUrl,
                                                                       'createdAt', B.createdAt
                                                       ),
                                                   'updates', json(json_group_array(json_object('id', D.id,
                                                                                                'content', content,
                                                                                                'progress', progress,
                                                                                                'createdAt', D.createdAt)))) as update_group_obj,
                                    max(D.createdAt) as lastUpdateCreatedAt
                                from "Update" D
                                         join User S on S.id = D.userId
                                         join SavedBook SB on D.savedBookId = SB.id
                                         join Book B on SB.bookId = B.id
                                where D.userId = ${input.userId}
                                group by D.userId, savedBookId
                                order by lastUpdateCreatedAt desc
                                limit 10)

select json_group_array(json(update_group_obj)) as result
from json_by_user_savedbook;`,
    );

    const r = result as { result: string }[];
    if (r.length === 0 || r[0] === undefined || r[0].result === undefined) {
      return undefined;
    }

    return updateBlocksValidator.parse(JSON.parse(r[0].result));
  }),
});

export const updatesValidator = z.array(
  z.object({
    id: z.string(),
    createdAt: z.number().transform((a) => new Date(a)),
    progress: z.number(),
    content: z.string(),
  }),
);

export const updateBookValidator = z.object({
  id: z.string(),
  name: z.string().optional(),
  authors: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  pageCount: z.number().optional(),
  createdAt: z.number().transform((a) => new Date(a)),
});

export const updateBlocksValidator = z.array(
  z.object({
    user: z.object({
      id: z.string(),
      name: z.string().optional(),
      image: z.string().optional(),
    }),
    book: updateBookValidator,
    updates: updatesValidator,
  }),
);
