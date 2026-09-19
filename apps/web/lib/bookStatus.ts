import type { Book } from "@shelfie/types";

export type BookStatusKey = "completed" | "wantToRead" | "inProgress";

type FinishFields = Pick<Book, "isCompleted" | "endDate" | "dateRead">;

/**
 * Kitap bitti mi? Bitiş tarihi olan kitap bitmiştir — `isCompleted` bayrağı
 * eski kayıtlarda false kalmış olsa bile. Uygulamanın her yerinde
 * "okundu" kararı bu fonksiyondan verilir.
 */
export function isBookFinished(book: FinishFields): boolean {
  return Boolean(book.isCompleted || book.endDate || book.dateRead);
}

/**
 * Kitabın tek bir durumu vardır ve sıralama önemlidir:
 * bitmişse "tamamlandı", değilse okuma listesindeyse "okumak istiyorum",
 * ikisi de değilse "devam ediyor".
 */
export function getBookStatus(
  book: FinishFields & Pick<Book, "wantToRead">
): BookStatusKey {
  if (isBookFinished(book)) return "completed";
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
