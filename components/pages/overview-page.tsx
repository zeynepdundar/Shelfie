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
  ArrowUpRight,
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
      const result = await dispatch(addBook(newBook)).unwrap();
      console.log("Kitap başarıyla eklendi:", result);
      setShowAddBookModal(false);
    } catch (error) {
      console.error("Kitap eklenirken hata oluştu:", error);
      const errorDetails =
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : {
              message: String(error),
            };

      console.error("Hata detayları:", {
        ...errorDetails,
      });
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
      <div className="relative min-h-screen px-4 py-16 text-white">
        <div className="relative mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
            <span className="text-sm text-slate-200">Loading your reading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: t("stats.totalBooks"),
      value: books.length,
      icon: BookOpen,
      accent: "from-amber-400/20 to-orange-400/5",
      valueClass: "text-amber-200",
    },
    {
      title: t("completedThisYear"),
      value: selectedYearCompletedBooks.length,
      note: `${selectedYear}`,
      icon: Sparkles,
      accent: "from-emerald-400/20 to-emerald-500/5",
      valueClass: "text-emerald-200",
    },
    {
      title: t("pagesThisYear"),
      value: pagesThisSelectedYear.toLocaleString("tr-TR"),
      note: `${averagePagesPerCompletedBookInSelectedYear} avg / book`,
      icon: TrendingUp,
      accent: "from-sky-400/20 to-sky-500/5",
      valueClass: "text-sky-200",
    },
    {
      title: t("stats.favoriteBooks"),
      value: favoriteBooks.length,
      note: `${completionRate}% ${t("completionRate")}`,
      icon: Heart,
      accent: "from-rose-400/20 to-rose-500/5",
      valueClass: "text-rose-200",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-10" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-3xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  {t("welcome", { email: user?.email || "" })}
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleAddBook} size="lg" variant="glow">
                <Plus className="mr-2 h-4 w-4" />
                {navT("addBook")}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.accent} p-5 backdrop-blur-xl`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <p className="text-sm text-slate-300">{card.title}</p>
                      <p className={`text-3xl font-semibold tracking-tight ${card.valueClass}`}>
                        {card.value}
                      </p>
                      <p className="text-xs leading-relaxed text-slate-400">
                        {card.note}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white/90">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {status === "failed" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
          <Card className="overflow-hidden border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-2xl">
            <CardHeader className="border-b border-white/10 px-6 py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <CardTitle className="text-xl text-white">
                    {t("yearlyStats")}
                  </CardTitle>
                  <CardDescription className="mt-1 text-slate-300">
                    {t("yearlyStatsHint")}
                  </CardDescription>
                </div>

                <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200">
                  <CalendarDays className="h-3.5 w-3.5 text-amber-300" />
                  <span className="font-medium">{t("chartYear")}</span>
                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(Number(event.target.value))}
                    className="bg-transparent text-slate-100 outline-none"
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
            <CardContent className="px-4 py-5 sm:px-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <MyChart year={selectedYear} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-lg text-white">
                  {t("completionRate")}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {completedBooks.length} / {books.length} books completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 py-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-semibold text-amber-200">
                      {completionRate}%
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {t("stats.readThisMonth")}: {completedThisMonth.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                  </div>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-300 transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      {t("completedThisYear")}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {selectedYearCompletedBooks.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      {t("inProgressBooks")}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {Math.max(books.length - completedBooks.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-lg text-white">
                  {t("stats.totalPages")}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {averagePagesPerCompletedBook} avg pages per completed book
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 py-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-semibold text-sky-200">
                      {totalPagesRead.toLocaleString("tr-TR")}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {t("pagesThisYear")}: {pagesThisSelectedYear.toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <TrendingUp className="h-5 w-5 text-sky-300" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      {t("stats.favoriteBooks")}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {favoriteBooks.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      {t("stats.readThisMonth")}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {completedThisMonth.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="overflow-hidden border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-2xl">
          <CardHeader className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="text-xl text-white">
                  {t("recentBooks")}
                </CardTitle>
                <CardDescription className="mt-1 text-slate-300">
                  {t("recentBooksHint")}
                </CardDescription>
              </div>
              <div className="text-sm text-slate-400">
                {books.length} books tracked
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-4 py-5 sm:px-6">
            {books.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/5 px-6 py-16 text-center">
                <div className="mb-4 rounded-full border border-white/10 bg-amber-400/10 p-4">
                  <BookOpen className="h-7 w-7 text-amber-200" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {t("emptyTitle")}
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-300">
                  {t("emptyBody")}
                </p>
                <Button
                  onClick={handleAddBook}
                  className="mt-6"
                  size="lg"
                  variant="glow"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("emptyAction")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="hidden items-center gap-4 px-4 pb-2 text-xs uppercase tracking-[0.24em] text-slate-300 md:grid md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto_auto]">
                  <div>{t("cover")}</div>
                  <div>{t("title")}</div>
                  <div>{t("pages")}</div>
                  <div>{t("startDate")}</div>
                  <div>{t("endDate")}</div>
                  <div>{t("status.value")}</div>
                  <div className="text-right">{t("favorite")}</div>
                </div>

                {books.slice(0, 8).map((book) => {
                  const coverUrl = book.coverUrl || coverCache[book.id];

                  return (
                    <div
                      key={book.id}
                      className="grid gap-4 border-b border-white/10 px-4 py-4 last:border-b-0 md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto_auto] md:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl">
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
                            <BookOpen className="h-6 w-6 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 md:hidden">
                          <p className="truncate text-base font-semibold text-white">
                            {book.title}
                          </p>
                          <p className="truncate text-sm text-slate-300">
                            {book.author}
                          </p>
                          <p className="truncate text-sm text-slate-400">
                            {book.pages} {t("pages")} · {formatDate(book.startDate)} · {formatDate(book.endDate)}
                          </p>
                        </div>
                      </div>

                      <div className="hidden min-w-0 md:block">
                        <p className="truncate text-base font-semibold text-white">
                          {book.title}
                        </p>
                        <p className="truncate text-sm text-slate-300">
                          {book.author}
                        </p>
                      </div>

                      <div className="text-sm text-slate-200">
                        {book.pages} {t("pages")}
                      </div>

                      <div className="text-sm text-slate-200">
                        {formatDate(book.startDate)}
                      </div>

                      <div className="text-sm text-slate-200">
                        {formatDate(book.endDate)}
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                            book.isCompleted
                              ? "bg-emerald-400/15 text-emerald-200"
                              : "bg-amber-400/15 text-amber-200"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              book.isCompleted ? "bg-emerald-300" : "bg-amber-300"
                            }`}
                          />
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
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-200 backdrop-blur-xl transition-colors hover:border-rose-300/30 hover:bg-rose-400/15 hover:text-rose-200"
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
                              book.isFavorite
                                ? "fill-current text-rose-300"
                                : "text-slate-300"
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
