'use client';

import { useEffect, useMemo, useState } from "react";
import { AuthUser } from "@/lib/authSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddBookModal } from "@/components/books/AddBookModal";
import { Book } from "@/types/book";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addBook, fetchUserBooks, updateBook } from "@/lib/booksSlice";
import {
  BookOpen,
  CalendarDays,
  Heart,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { MyChart } from "../books/chartx";

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
  const currentMonth = new Date().getMonth();
  const selectedYearCompletedBooks = completedBooks.filter((book) => {
    const bookDate = getBookDate(book);
    return bookDate !== null && bookDate.getFullYear() === selectedYear;
  });
  const completedThisMonth = completedBooks.filter((book) => {
    const relevantDate = getRelevantDate(book);
    if (!relevantDate) {
      return false;
    }

    const date = new Date(relevantDate);
    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === currentYear &&
      date.getMonth() === currentMonth
    );
  });

  const pagesThisSelectedYear = selectedYearCompletedBooks.reduce(
    (sum, book) => sum + (book.pages || 0),
    0
  );
  const totalPagesRead = completedBooks.reduce(
    (sum, book) => sum + (book.pages || 0),
    0
  );
  const completionRate = books.length
    ? Math.round((completedBooks.length / books.length) * 100)
    : 0;
  const averagePagesPerCompletedBook = completedBooks.length
    ? Math.round(totalPagesRead / completedBooks.length)
    : 0;
  const averagePagesPerCompletedBookInSelectedYear = selectedYearCompletedBooks.length
    ? Math.round(pagesThisSelectedYear / selectedYearCompletedBooks.length)
    : 0;

  if (status === "loading") {
    return (
      <div className="sf-page px-4 py-16">
        <div className="relative mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="sf-loading-pill">
            <span className="sf-spinner" />
            <span className="sf-muted">Loading your reading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: t("stats.totalBooks"),
      value: books.length,
      note: `${books.length - completedBooks.length} ${t("inProgressBooks")}`,
      icon: BookOpen,
    },
    {
      title: t("completedThisYear"),
      value: selectedYearCompletedBooks.length,
      note: `${selectedYear}`,
      icon: Sparkles,
    },
    {
      title: t("pagesThisYear"),
      value: pagesThisSelectedYear.toLocaleString("tr-TR"),
      note: `${averagePagesPerCompletedBookInSelectedYear} avg / book`,
      icon: TrendingUp,
    },
    {
      title: t("stats.favoriteBooks"),
      value: favoriteBooks.length,
      note: `${completionRate}% ${t("completionRate")}`,
      icon: Heart,
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
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.title} className="sf-stat">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="sf-stat-label">{card.title}</p>
                    <p className="sf-stat-value">{card.value}</p>
                    <p className="sf-stat-note">{card.note}</p>
                  </div>
                  <span className="sf-icon-badge">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {status === "failed" && <div className="sf-alert-error">{error}</div>}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
          {/* Yıllık grafik */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <CardTitle>{t("yearlyStats")}</CardTitle>
                  <CardDescription className="mt-1">
                    {t("yearlyStatsHint")}
                  </CardDescription>
                </div>

                <label className="sf-chip gap-3 px-4 py-2">
                  <CalendarDays className="h-3.5 w-3.5 text-accent-strong" />
                  <span>{t("chartYear")}</span>
                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(Number(event.target.value))}
                    className="bg-transparent font-semibold text-ink outline-none"
                    aria-label={t("chartYear")}
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </CardHeader>
            <CardContent>
              <div className="sf-tile p-4">
                <MyChart year={selectedYear} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {/* Tamamlama oranı */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("completionRate")}</CardTitle>
                <CardDescription>
                  {completedBooks.length} / {books.length} books completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-semibold tracking-tight text-brand-ink">
                      {completionRate}%
                    </p>
                    <p className="sf-muted mt-1">
                      {t("stats.readThisMonth")}: {completedThisMonth.length}
                    </p>
                  </div>
                  <span className="sf-icon-badge">
                    <Sparkles className="h-5 w-5" />
                  </span>
                </div>

                <div className="sf-progress-track">
                  <div
                    className="sf-progress-bar"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sf-tile">
                    <p className="sf-stat-sm-label">{t("completedThisYear")}</p>
                    <p className="sf-stat-sm-value">
                      {selectedYearCompletedBooks.length}
                    </p>
                  </div>
                  <div className="sf-tile">
                    <p className="sf-stat-sm-label">{t("inProgressBooks")}</p>
                    <p className="sf-stat-sm-value">
                      {Math.max(books.length - completedBooks.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Toplam sayfa */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("stats.totalPages")}</CardTitle>
                <CardDescription>
                  {averagePagesPerCompletedBook} avg pages per completed book
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-semibold tracking-tight text-brand-ink">
                      {totalPagesRead.toLocaleString("tr-TR")}
                    </p>
                    <p className="sf-muted mt-1">
                      {t("pagesThisYear")}: {pagesThisSelectedYear.toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <span className="sf-icon-badge">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sf-tile">
                    <p className="sf-stat-sm-label">{t("stats.favoriteBooks")}</p>
                    <p className="sf-stat-sm-value">{favoriteBooks.length}</p>
                  </div>
                  <div className="sf-tile">
                    <p className="sf-stat-sm-label">{t("stats.readThisMonth")}</p>
                    <p className="sf-stat-sm-value">{completedThisMonth.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Son kitaplar */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>{t("recentBooks")}</CardTitle>
                <CardDescription className="mt-1">
                  {t("recentBooksHint")}
                </CardDescription>
              </div>
              <div className="sf-muted">{books.length} books tracked</div>
            </div>
          </CardHeader>

          <CardContent>
            {books.length === 0 ? (
              <div className="sf-empty">
                <span className="sf-icon-badge mb-4 rounded-full p-4">
                  <BookOpen className="h-7 w-7" />
                </span>
                <h3 className="sf-title-section">{t("emptyTitle")}</h3>
                <p className="sf-body mt-2 max-w-lg">{t("emptyBody")}</p>
                <Button onClick={handleAddBook} className="mt-6" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("emptyAction")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="hidden items-center gap-4 px-4 pb-2 md:grid md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto_auto]">
                  <div className="sf-label">{t("cover")}</div>
                  <div className="sf-label">{t("title")}</div>
                  <div className="sf-label">{t("pages")}</div>
                  <div className="sf-label">{t("startDate")}</div>
                  <div className="sf-label">{t("endDate")}</div>
                  <div className="sf-label">{t("status.value")}</div>
                  <div className="sf-label text-right">{t("favorite")}</div>
                </div>

                {books.slice(0, 8).map((book) => {
                  const coverUrl = book.coverUrl || coverCache[book.id];

                  return (
                    <div
                      key={book.id}
                      className="grid gap-4 border-b border-hairline px-4 py-4 transition-colors last:border-b-0 hover:bg-control md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto_auto] md:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="sf-cover-thumb">
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt={`${book.title} cover`}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                const target = event.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          ) : (
                            <BookOpen className="h-6 w-6 text-ink/40" />
                          )}
                        </div>

                        <div className="min-w-0 md:hidden">
                          <p className="truncate text-base font-semibold text-ink">
                            {book.title}
                          </p>
                          <p className="sf-body truncate">{book.author}</p>
                          <p className="sf-meta truncate">
                            {book.pages} {t("pages")} · {formatDate(book.startDate)} · {formatDate(book.endDate)}
                          </p>
                        </div>
                      </div>

                      <div className="hidden min-w-0 md:block">
                        <p className="truncate text-base font-semibold text-ink">
                          {book.title}
                        </p>
                        <p className="sf-body truncate">{book.author}</p>
                      </div>

                      <div className="sf-muted">
                        {book.pages} {t("pages")}
                      </div>

                      <div className="sf-muted">{formatDate(book.startDate)}</div>

                      <div className="sf-muted">{formatDate(book.endDate)}</div>

                      <div className="flex items-center gap-3">
                        <span
                          className={
                            book.isCompleted ? "sf-chip-success" : "sf-chip-accent"
                          }
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {book.isCompleted
                            ? t("status.completed")
                            : t("status.inProgress")}
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
          </CardContent>
        </Card>
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
