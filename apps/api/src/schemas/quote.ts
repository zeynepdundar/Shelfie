import { z } from "zod";

export const createQuoteSchema = z.object({
  text: z.string().trim().min(1, "Alıntı metni zorunlu"),
  page: z.number().int().min(1).optional(),
  notes: z.string().trim().optional(),
});

export const updateQuoteSchema = createQuoteSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Güncellenecek en az bir alan gönderin",
  });

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
