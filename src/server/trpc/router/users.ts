import { z } from "zod";
import { router, publicProcedure } from "../trpc";

const minimalUserSelect = {
  id: true,
  name: true,
  image: true,
};

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
});
