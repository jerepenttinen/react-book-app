import {z} from "zod";

export const editProfileValidator = z.object({
  location: z.string().max(32, "Enintään 32 merkkiä"),
  biography: z.string().max(1000, "Enintään 1000 merkkiä"),
});
