import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

const minimalUserSelect = {
  id: true,
  name: true,
  image: true,
};

const notificationTypes = z.enum(["friend"]);

export const usersRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.user.findFirstOrThrow({
        where: {
          id: input.id,
        },
        select: {
          ...minimalUserSelect,
          createdAt: true,
          biography: true,
          location: true,
        },
      });
    }),
  getMyFriends: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findFirstOrThrow({
      where: {
        id: ctx.session.user.id,
      },
      include: {
        friends: {
          select: minimalUserSelect,
        },
      },
    });
  }),
  getMyNotifications: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.notification.findMany({
      where: {
        toUserId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  getMyNotificationsCount: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.notification.count({
      where: {
        toUserId: ctx.session.user.id,
        handled: false,
      },
    });
  }),
  sendFriendRequest: protectedProcedure
    .input(z.object({ targetUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.id === input.targetUserId) {
        throw new TRPCError({
          message: "You can't send friend request to yourself",
          code: "FORBIDDEN",
        });
      }

      await ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: input.targetUserId,
        },
      });

      const areAlreadyFriends = await ctx.prisma.user.count({
        where: {
          id: ctx.session.user.id,
          friends: {
            some: {
              id: input.targetUserId,
            },
          },
        },
      });

      if (areAlreadyFriends !== 0) {
        throw new TRPCError({ message: "Already friends", code: "CONFLICT" });
      }

      const existingNotification = await ctx.prisma.notification.findMany({
        where: {
          fromUserId: ctx.session.user.id,
        },
      });

      if (existingNotification.length !== 0) {
        throw new TRPCError({
          message: "Friend request has already been sent",
          code: "CONFLICT",
        });
      }

      return await ctx.prisma.notification.create({
        data: {
          fromUserId: ctx.session.user.id,
          toUserId: input.targetUserId,
          type: "friend",
        },
      });
    }),
});
