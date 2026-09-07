'use client';

import { useEffect, useMemo, useState } from "react";
import { AuthUser } from "@/lib/authSlice";
import { Button } from "@/components/ui/button";
import { AddBookModal } from "@/components/books/AddBookModal";
import { BookCover } from "@/components/books/BookCover";
import { Book } from "@/types/book";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addBook, fetchUserBooks, updateBook } from "@/lib/booksSlice";
import { getBookStatus } from "@/lib/bookStatus";
import {
  BookOpen,
  CalendarDays,
  Heart,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { MyChart } from "../books/chartx";
import {
  EmptyState,
  GlassCard,
  GlassCardHeader,
  GlassInset,
  PageLoading,
  StatCard,
} from "@/components/ui/glass";

interface OverviewPageProps {
  user: AuthUser | null;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRelevantDate(book: Book) {
  return book.endDate || book.dateRead || book.dateAdded;
}

function getBookDate(book: Book) {
  const relevantDate = getRelevantDate(book);

  if (!relevantDate) {
    return null;
  }

  const parsedDate = new Date(relevantDate);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function OverviewPage({ user }: OverviewPageProps) {
  const t = useTranslations("overview");
  const navT = useTranslations("nav");

  const dispatch = useAppDispatch();
  const { books, status, error } = useAppSelector((state) => state.books);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [coverCache, setCoverCache] = useState<Record<string, string>>({});
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || "";
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (user) {
      dispatch(fetchUserBooks());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (books.length > 0 && apiKey) {
      books.forEach((book) => {
        if (!book.coverUrl && !coverCache[book.id]) {
          void fetchBookCover(book.title, book.author, book.id);
        }
      });
    }
  }, [books, apiKey, coverCache]);

  const availableYears = useMemo(() => {
    const years = new Set<number>([currentYear]);

    books.forEach((book) => {
      const bookDate = getBookDate(book);
      if (bookDate) {
        years.add(bookDate.getFullYear());
      }
    });

    return Array.from(years).sort((left, right) => right - left);
  }, [books, currentYear]);

  const fetchBookCover = async (
    title: string,
    author: string,
    bookId: string
  ) => {
    try {
      const searchQuery = `${title} ${author}`;
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&key=${apiKey}&maxResults=1`
      );
      const data = await response.json();

      if (data.items && data.items[0]?.volumeInfo?.imageLinks?.thumbnail) {
        const coverUrl = data.items[0].volumeInfo.imageLinks.thumbnail;

        setCoverCache((prev) =>
          prev[bookId] ? prev : { ...prev, [bookId]: coverUrl }
        );

        dispatch(
          updateBook({
            bookId,
            updates: { coverUrl },
          })
        );
      }
    } catch (fetchError) {
      console.error("Cover image fetch error:", fetchError);
    }
  };

  const handleAddBook = () => {
    setShowAddBookModal(true);
  };

  const handleAddBookSubmit = async (
    newBook: Omit<Book, "id" | "dateAdded">
  ) => {
    try {
      await dispatch(addBook(newBook)).unwrap();
      setShowAddBookModal(false);
    } catch (error) {
      console.error("Kitap eklenirken hata oluştu:", error);
    }
  };

  const toggleFavorite = async (bookId: string, currentFavorite: boolean) => {
    try {
      await dispatch(
        updateBook({
          bookId,
          updates: { isFavorite: !currentFavorite },
        })
      );
    } catch (toggleError) {
      console.error("Error updating favorite status:", toggleError);
    }
  };

  const completedBooks = books.filter((book) => book.isCompleted);
  const favoriteBooks = books.filter((book) => book.isFavorite);
  const selectedYearCompletedBooks = completedBooks.filter((book) => {
    const bookDate = getBookDate(book);
    return bookDate !== null && bookDate.getFullYear() === selectedYear;
  });

  const pagesThisSelectedYear = selectedYearCompletedBooks.reduce(
    (sum, book) => sum + (book.pages || 0),
    0
  );
  const completionRate = books.length
    ? Math.round((completedBooks.length / books.length) * 100)
    : 0;
  const averagePagesPerCompletedBookInSelectedYear = selectedYearCompletedBooks.length
    ? Math.round(pagesThisSelectedYear / selectedYearCompletedBooks.length)
    : 0;

  if (status === "loading") {
    return <PageLoading label="Loading your reading dashboard..." />;
  }

  const summaryCards = [
    {
      title: t("stats.totalBooks"),
      value: books.length,
      note: `${books.length - completedBooks.length} ${t("inProgressBooks")}`,
    },
    {
      title: t("completedThisYear"),
      value: selectedYearCompletedBooks.length,
      note: `${selectedYear}`,
    },
    {
      title: t("pagesThisYear"),
      value: pagesThisSelectedYear.toLocaleString("tr-TR"),
      note: `${averagePagesPerCompletedBookInSelectedYear} avg / book`,
    },
    {
      title: t("stats.favoriteBooks"),
      value: favoriteBooks.length,
      note: `${completionRate}% ${t("completionRate")}`,
    },
  ];

  return (
    <div className="sf-page">
      <div className="sf-container">
        {/* Sayfa başlığı */}
        <header className="sf-page-header">
          <div>
            <h1 className="sf-title-page">{navT("overview")}</h1>
            <p className="sf-page-header-sub">{t("subtitle")}</p>
          </div>

          <Button onClick={handleAddBook} size="lg" className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            {navT("addBook")}
          </Button>
        </header>

        {/* Özet istatistikler */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <StatCard
              key={card.title}
              label={card.title}
              value={card.value}
              note={card.note}
            />
          ))}
        </div>

        {status === "failed" && <div className="sf-alert-error">{error}</div>}

        {/* Yıllık grafik */}
        <GlassCard>
          <GlassCardHeader
            title={t("yearlyStats")}
            description={t("yearlyStatsHint")}
            action={
              <label className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white/80">
                <CalendarDays className="h-3.5 w-3.5 text-accent-strong" />
                <span>{t("chartYear")}</span>
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                  className="bg-transparent font-semibold text-white outline-none"
                  aria-label={t("chartYear")}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year} className="bg-stone-900 text-white">
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            }
          />
          <GlassInset>
            <MyChart year={selectedYear} />
          </GlassInset>
        </GlassCard>

        {/* Son kitaplar */}
        <GlassCard>
          <GlassCardHeader
            title={t("recentBooks")}
            description={t("recentBooksHint")}
            action={
              <div className="text-sm text-white/60">
                {books.length} books tracked
              </div>
            }
          />

          <div>
            {books.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title={t("emptyTitle")}
                description={t("emptyBody")}
                action={
                  <Button onClick={handleAddBook} size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("emptyAction")}
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                <div className="hidden items-center gap-4 px-4 pb-2 md:grid md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto_auto]">
                  <div className="text-xs font-medium text-white/60">{t("cover")}</div>
                  <div className="text-xs font-medium text-white/60">{t("title")}</div>
                  <div className="text-xs font-medium text-white/60">{t("pages")}</div>
                  <div className="text-xs font-medium text-white/60">{t("startDate")}</div>
                  <div className="text-xs font-medium text-white/60">{t("endDate")}</div>
                  <div className="text-xs font-medium text-white/60">{t("status.value")}</div>
                  <div className="text-xs font-medium text-white/60 text-right">{t("favorite")}</div>
                </div>

                {books.slice(0, 8).map((book) => {
                  const coverUrl = book.coverUrl || coverCache[book.id];

                  return (
                    <div
                      key={book.id}
                      className="grid gap-4 border-b border-white/10 px-4 py-4 transition-colors last:border-b-0 hover:bg-white/[0.05] md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto_auto] md:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <BookCover
                          src={coverUrl}
                          alt={`${book.title} cover`}
                          size="sm"
                        />

                        <div className="min-w-0 md:hidden">
                          <p className="truncate text-base font-semibold text-white">
                            {book.title}
                          </p>
                          <p className="text-sm text-white/70 truncate">{book.author}</p>
                          <p className="text-xs text-white/50 truncate">
                            {book.pages} {t("pages")} · {formatDate(book.startDate)} · {formatDate(book.endDate)}
                          </p>
                        </div>
                      </div>

                      <div className="hidden min-w-0 md:block">
                        <p className="truncate text-base font-semibold text-white">
                          {book.title}
                        </p>
                        <p className="text-sm text-white/70 truncate">{book.author}</p>
                      </div>

                      <div className="text-sm text-white/60">
                        {book.pages} {t("pages")}
                      </div>

                      <div className="text-sm text-white/60">{formatDate(book.startDate)}</div>

                      <div className="text-sm text-white/60">{formatDate(book.endDate)}</div>

                      <div className="flex items-center gap-3">
                        <span
                          className={
                            {
                              completed: "sf-chip-success",
                              inProgress: "sf-chip-accent",
                              wantToRead: "sf-chip",
                            }[getBookStatus(book)]
                          }
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {t(`status.${getBookStatus(book)}`)}
                        </span>
                      </div>

                      <div className="flex items-center justify-end">
                        <button
                          onClick={() =>
                            toggleFavorite(book.id, book.isFavorite || false)
                          }
                          className="sf-icon-button h-10 w-10"
                          title={
                            book.isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          aria-label={
                            book.isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              book.isFavorite ? "fill-current text-accent-ink" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {showAddBookModal && (
        <AddBookModal
          isOpen={showAddBookModal}
          onClose={() => setShowAddBookModal(false)}
          onAddBook={handleAddBookSubmit}
        />
      )}
    </div>
  );
}
