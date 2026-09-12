import { z } from "zod";

/** "2026-01-31" ya da ISO tarih; boş/null gönderilirse alan temizlenir. */
const dateField = z
  .union([z.string().min(1), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new z.ZodError([
        { code: "custom", path: [], message: "Geçersiz tarih" },
      ]);
    }
    return parsed;
  });

export const createBookSchema = z.object({
  title: z.string().trim().min(1, "Kitap adı zorunlu"),
  author: z.string().trim().min(1, "Yazar zorunlu"),
  pages: z.number().int().min(0).default(0),
  isbn: z.string().trim().optional(),
  publishedYear: z.number().int().min(0).max(3000).optional(),
  genre: z.string().trim().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().trim().optional(),
  coverUrl: z.string().url().optional(),
  isCompleted: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
  wantToRead: z.boolean().default(false),
  startDate: dateField,
  endDate: dateField,
  dateRead: dateField,
});

/** Güncellemede bütün alanlar isteğe bağlı, ama en az biri gönderilmeli. */
export const updateBookSchema = createBookSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Güncellenecek en az bir alan gönderin",
  });

export const bookQuerySchema = z.object({
  status: z.enum(["all", "completed", "inProgress", "wantToRead"]).default("all"),
  favorite: z.enum(["true", "false"]).optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
