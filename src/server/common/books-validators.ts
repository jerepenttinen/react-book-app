import { z } from "zod";

export const createReviewValidator = z.object({
  bookId: z.string(),
  score: z.preprocess((input) => {
    const processed = z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .safeParse(input);
    return processed.success ? processed.data : input;
  }, z.number().min(1, "Vähintään puoli tähteä").max(10, "Enintään viisi tähteä")),
  content: z.string().max(1000, "Enintään 1000 merkkiä"),
});

export const createProgressUpdateValidator = z.object({
  savedBookId: z.string(),
  progress: z.preprocess((input) => {
    const processed = z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .safeParse(input);
    return processed.success ? processed.data : input;
  }, z.number().min(0, "Ei negatiivisia sivuja")),
  content: z.string(),
});
