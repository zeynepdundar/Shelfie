import type { Book } from "@shelfie/types";

/* Kitapları CSV olarak dışa aktarır. Her şey tarayıcıda olur: sunucu yok.
   Sütun adları dilden bağımsız (İngilizce) tutulur ki dosya ileride içe
   aktarmada da aynen okunabilsin. Ayrı bir durum sütunu yok: End Date doluysa
   kitap okunmuştur, boşsa hâlâ okunuyordur. */

const COLUMNS = [
  "Title",
  "Author",
  "Pages",
  "Start Date",
  "End Date",
  "Notes",
] as const;

type Cell = string | number | boolean | null | undefined;

/** YYYY-MM-DD; geçersiz ya da boşsa boş hücre. */
function isoDate(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

/**
 * Tek hücreyi CSV'ye uygun hâle getirir:
 * - "=", "+", "-", "@" ile başlayan metin Excel'de formül gibi çalışmasın
 *   diye başına tek tırnak eklenir (CSV injection).
 * - Virgül, tırnak ya da satır sonu içeren hücre tırnak içine alınır.
 */
function escapeCell(value: Cell) {
  if (value === null || value === undefined) return "";
  let text = typeof value === "boolean" ? (value ? "yes" : "no") : String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function booksToCsv(books: Book[]) {
  const rows: Cell[][] = books.map((book) => [
    book.title,
    book.author,
    book.pages || "",
    isoDate(book.startDate),
    isoDate(book.endDate || book.dateRead),
    book.notes,
  ]);

  return [COLUMNS as readonly Cell[], ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");
}

/** CSV'yi dosya olarak indirir. BOM, Excel'in Türkçe karakterleri doğru açması için. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
