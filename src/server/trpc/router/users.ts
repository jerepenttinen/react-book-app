import { type Notification } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { editProfileValidator } from "~/server/common/users-validators";
import { FriendshipStatus } from "~/types/friendship-status";
import { type Context } from "../context";
import { protectedProcedure, publicProcedure, router } from "../trpc";

const minimalUserSelect = {
  id: true,
  name: true,
  image: true,
};

const notificationTypes = z.enum(["friend", "recommendation"]);

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
      include: {
        fromUser: {
          select: minimalUserSelect,
        },
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
          OR: [
            {
              fromUserId: ctx.session.user.id,
              toUserId: input.targetUserId,
              type: "friend",
            },
            {
              fromUserId: input.targetUserId,
              toUserId: ctx.session.user.id,
              type: "friend",
            },
          ],
        },
      });

      existingNotification.forEach((notification) => {
        if (notification.fromUserId === ctx.session.user.id) {
          throw new TRPCError({
            message: "Friend request has already been sent",
            code: "CONFLICT",
          });
        } else if (notification.toUserId === ctx.session.user.id) {
          acceptFriendRequest(ctx, notification);
        }
      });

      return await ctx.prisma.notification.create({
        data: {
          fromUserId: ctx.session.user.id,
          toUserId: input.targetUserId,
          type: "friend",
        },
      });
    }),
  sendBookRecommendation: protectedProcedure
    .input(z.object({ targetUserId: z.string(), bookId: z.string() }))
    .mutation(async ({ ctx, input }) => {

      await ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: input.targetUserId,
        },
      });

      return await ctx.prisma.notification.create({
        data: {
          fromUserId: ctx.session.user.id,
          toUserId: input.targetUserId,
          bookId: input.bookId,
          type: "recommendation",
        },
      });
    }),
  handleFriendRequest: protectedProcedure
    .input(z.object({ notificationId: z.string(), accept: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.prisma.notification.findFirstOrThrow({
        where: {
          id: input.notificationId,
          toUserId: ctx.session.user.id,
          type: "friend",
        },
      });

      if (!input.accept) {
        return ctx.prisma.notification.delete({
          where: {
            id: notification.id,
          },
        });
      }

      return acceptFriendRequest(ctx, notification);
    }),
  handleRecommendation: protectedProcedure
    .input(z.object({ notificationId: z.string(), accept: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.prisma.notification.findFirstOrThrow({
        where: {
          id: input.notificationId,
          toUserId: ctx.session.user.id,
          type: "recommendation",
        },
      });

      if (!input.accept) {
        return ctx.prisma.notification.delete({
          where: {
            id: notification.id,
          },
        });
      }
      return;
    }),
  getFriendshipStatus: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }): Promise<FriendshipStatus> => {
      const [areFriends, friendRequest] = await ctx.prisma.$transaction([
        ctx.prisma.user.count({
          where: {
            id: ctx.session.user.id,
            friends: {
              some: {
                id: input.userId,
              },
            },
          },
        }),
        ctx.prisma.notification.findFirst({
          where: {
            OR: [
              {
                fromUserId: ctx.session.user.id,
                toUserId: input.userId,
                type: "friend",
              },
              {
                fromUserId: input.userId,
                toUserId: ctx.session.user.id,
                type: "friend",
              },
            ],
          },
        }),
      ]);

      if (areFriends === 1) {
        return FriendshipStatus.FRIENDS;
      }

      if (friendRequest === null) {
        return FriendshipStatus.NOT_FRIENDS;
      }

      if (friendRequest.fromUserId === input.userId) {
        return FriendshipStatus.RECEIVED_REQUEST;
      }

      return FriendshipStatus.SENT_REQUEST;
    }),
  getMySentFriendRequests: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.notification.findMany({
      where: {
        fromUserId: ctx.session.user.id,
      },
      include: {
        toUser: {
          select: minimalUserSelect,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  updateMyProfile: protectedProcedure
    .input(editProfileValidator)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          biography: input.biography,
          location: input.location,
        },
      });
    }),
});

async function acceptFriendRequest(ctx: Context, notification: Notification) {
  if (!notification.fromUserId) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }

  if (notification.type !== "friend") {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }

  return await ctx.prisma.$transaction([
    ctx.prisma.user.update({
      where: {
        id: notification.fromUserId,
      },
      data: {
        friends: {
          connect: {
            id: notification.toUserId,
          },
        },
      },
    }),
    ctx.prisma.user.update({
      where: {
        id: notification.toUserId,
      },
      data: {
        friends: {
          connect: {
            id: notification.fromUserId,
          },
        },
      },
    }),
    ctx.prisma.notification.delete({
      where: {
        id: notification.id,
      },
    }),
  ]);
}
