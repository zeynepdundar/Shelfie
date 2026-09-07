import { Book } from "@/types/book";

export type BookStatusKey = "completed" | "wantToRead" | "inProgress";

/**
 * Kitabın tek bir durumu vardır ve sıralama önemlidir:
 * bitmişse "tamamlandı", değilse okuma listesindeyse "okumak istiyorum",
 * ikisi de değilse "devam ediyor".
 */
export function getBookStatus(
  book: Pick<Book, "isCompleted" | "wantToRead">
): BookStatusKey {
  if (book.isCompleted) return "completed";
  if (book.wantToRead) return "wantToRead";
  return "inProgress";
}

/** Durumun cam kartlardaki renk tonu. */
export const BOOK_STATUS_TONE: Record<
  BookStatusKey,
  "success" | "accent" | "neutral"
> = {
  completed: "success",
  inProgress: "accent",
  wantToRead: "neutral",
};
