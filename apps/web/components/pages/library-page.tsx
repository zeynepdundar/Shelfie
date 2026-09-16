'use client';

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  Heart,
  Play,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";

import type { AuthUser } from "@/lib/authSlice";
import type { Book } from "@shelfie/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addBook, fetchUserBooks, updateBook } from "@/lib/booksSlice";
import { Button } from "@/components/ui/button";
import { AddBookModal } from "@/components/books/AddBookModal";
import { BookCard } from "@/components/books/BookCard";
import { BookCover } from "@/components/books/BookCover";
import {
  EmptyState,
  GlassCard,
  GlassCardHeader,
  PageLoading,
} from "@/components/ui/glass";

interface LibraryPageProps {
  user: AuthUser | null;
}

type ReadingFilter = "all" | "inProgress" | "completed";

const READING_FILTERS: ReadingFilter[] = ["all", "inProgress", "completed"];

/** Aksiyonlar bugünün tarihini yazar; input'larla aynı biçim. */
function today() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "-"
    : parsed.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

export function LibraryPage({ user }: LibraryPageProps) {
  const t = useTranslations("library");
  const navT = useTranslations("nav");
  const statusT = useTranslations("book.status");

  const dispatch = useAppDispatch();
  const { books, status, error } = useAppSelector((state) => state.books);

  const [filter, setFilter] = useState<ReadingFilter>("all");
  const [showWantToRead, setShowWantToRead] = useState(true);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [coverCache, setCoverCache] = useState<Record<string, string>>({});

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || "";

  useEffect(() => {
    if (user) dispatch(fetchUserBooks());
  }, [user, dispatch]);

  // Kapağı olmayan kitaplar için Google Books'tan bir kez kapak aranır.
  useEffect(() => {
    if (!apiKey || books.length === 0) return;

    books.forEach((book) => {
      if (!book.coverUrl && !coverCache[book.id]) {
        void fetchBookCover(book.title, book.author, book.id);
      }
    });
  }, [books, apiKey, coverCache]);

  const fetchBookCover = async (
    title: string,
    author: string,
    bookId: string
  ) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          `${title} ${author}`
        )}&key=${apiKey}&maxResults=1`
      );
      const data = await response.json();
      const coverUrl = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;

      if (!coverUrl) return;

      setCoverCache((prev) =>
        prev[bookId] ? prev : { ...prev, [bookId]: coverUrl }
      );
      dispatch(updateBook({ bookId, updates: { coverUrl } }));
    } catch (fetchError) {
      console.error("Cover image fetch error:", fetchError);
    }
  };

  /** İstek listesi: henüz başlanmamış kitaplar. */
  const wantToRead = useMemo(
    () => books.filter((book) => book.wantToRead && !book.isCompleted),
    [books]
  );

  /** Okunanlar: başlanmış ya da bitirilmiş her şey. */
  const reading = useMemo(
    () => books.filter((book) => !(book.wantToRead && !book.isCompleted)),
    [books]
  );

  const counts = useMemo(
    () => ({
      all: reading.length,
      inProgress: reading.filter((book) => !book.isCompleted).length,
      completed: reading.filter((book) => book.isCompleted).length,
    }),
    [reading]
  );

  const visibleReading = useMemo(() => {
    if (filter === "inProgress") return reading.filter((b) => !b.isCompleted);
    if (filter === "completed") return reading.filter((b) => b.isCompleted);
    return reading;
  }, [reading, filter]);

  /** İstek listesinden çıkarır ve okumaya başlama tarihini yazar. */
  const startReading = (bookId: string) =>
    dispatch(
      updateBook({
        bookId,
        updates: { wantToRead: false, startDate: today() },
      })
    );

  const markAsFinished = (bookId: string) =>
    dispatch(
      updateBook({
        bookId,
        updates: { isCompleted: true, endDate: today(), dateRead: today() },
      })
    );

  const toggleFavorite = (bookId: string, currentFavorite: boolean) =>
    dispatch(updateBook({ bookId, updates: { isFavorite: !currentFavorite } }));

  const handleAddBookSubmit = async (
    newBook: Omit<Book, "id" | "dateAdded">
  ) => {
    try {
      await dispatch(addBook(newBook)).unwrap();
      setShowAddBookModal(false);
    } catch (addError) {
      console.error("Kitap eklenirken hata oluştu:", addError);
    }
  };

  if (status === "loading" && books.length === 0) {
    return <PageLoading label={navT("checkingSession")} />;
  }

  return (
    <div className="sf-page">
      <div className="sf-container">
        <header className="sf-page-header">
          <div>
            <h1 className="sf-title-page">{t("title")}</h1>
            <p className="sf-page-header-sub">{t("subtitle")}</p>
          </div>

          <Button
            onClick={() => setShowAddBookModal(true)}
            size="lg"
            className="shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            {navT("addBook")}
          </Button>
        </header>

        {status === "failed" && <div className="sf-alert-error">{error}</div>}

        {/* Okumak İstediklerim — yatay raf, sayfayı uzatmasın diye katlanabilir */}
        <GlassCard>
          <GlassCardHeader
            title={t("wantToRead.title")}
            description={t("wantToRead.hint")}
            action={
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/60">
                  {t("bookCount", { count: wantToRead.length })}
                </span>
                {wantToRead.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowWantToRead((value) => !value)}
                    aria-expanded={showWantToRead}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {showWantToRead ? t("wantToRead.hide") : t("wantToRead.show")}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        showWantToRead ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>
            }
          />

          {wantToRead.length === 0 ? (
            <p className="sf-muted px-1 pb-1">{t("wantToRead.empty")}</p>
          ) : (
            showWantToRead && (
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]">
                {wantToRead.map((book) => (
                  <BookCard
                    key={book.id}
                    title={book.title}
                    author={book.author}
                    coverUrl={book.coverUrl || coverCache[book.id]}
                    primaryAction={
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => startReading(book.id)}
                      >
                        <Play className="mr-1.5 h-3.5 w-3.5" />
                        {t("wantToRead.start")}
                      </Button>
                    }
                  />
                ))}
              </div>
            )
          )}
        </GlassCard>

        {/* Okuduklarım — tablo */}
        <GlassCard>
          <GlassCardHeader
            title={t("reading.title")}
            description={t("reading.hint")}
            action={
              <div className="flex flex-wrap gap-1.5">
                {READING_FILTERS.map((key) => {
                  const isActive = key === filter;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilter(key)}
                      aria-pressed={isActive}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors duration-200 ${
                        isActive
                          ? "bg-white/15 font-medium text-white"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {t(`filters.${key}`)}
                      <span className="text-xs text-white/40">
                        {counts[key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            }
          />

          {reading.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={t("reading.empty")}
              description={books.length === 0 ? t("emptyBody") : undefined}
              action={
                books.length === 0 ? (
                  <Button onClick={() => setShowAddBookModal(true)} size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("emptyAction")}
                  </Button>
                ) : undefined
              }
            />
          ) : visibleReading.length === 0 ? (
            <EmptyState icon={BookOpen} title={t("emptyFiltered")} />
          ) : (
            <div className="space-y-3">
              <div className="hidden items-center gap-4 px-4 pb-2 md:grid md:grid-cols-[auto_minmax(0,1.5fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto_auto]">
                <div className="sf-label">{t("columns.cover")}</div>
                <div className="sf-label">{t("columns.title")}</div>
                <div className="sf-label">{t("columns.pages")}</div>
                <div className="sf-label">{t("columns.startDate")}</div>
                <div className="sf-label">{t("columns.endDate")}</div>
                <div className="sf-label">{t("columns.status")}</div>
                <div className="sf-label text-right">
                  {t("columns.favorite")}
                </div>
              </div>

              {visibleReading.map((book) => {
                const coverUrl = book.coverUrl || coverCache[book.id];

                return (
                  <div
                    key={book.id}
                    className="grid gap-4 border-b border-hairline px-4 py-4 transition-colors last:border-b-0 hover:bg-control md:grid-cols-[auto_minmax(0,1.5fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto_auto] md:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <BookCover
                        src={coverUrl}
                        alt={`${book.title} cover`}
                        size="sm"
                      />

                      <div className="min-w-0 md:hidden">
                        <p className="truncate text-base font-semibold text-ink">
                          {book.title}
                        </p>
                        <p className="sf-body truncate">{book.author}</p>
                        <p className="sf-meta truncate">
                          {book.pages} {t("columns.pages")} ·{" "}
                          {formatDate(book.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="hidden min-w-0 md:block">
                      <p className="truncate text-base font-semibold text-ink">
                        {book.title}
                      </p>
                      <p className="sf-body truncate">{book.author}</p>
                    </div>

                    <div className="sf-muted">{book.pages}</div>

                    <div className="sf-muted">{formatDate(book.startDate)}</div>

                    <div className="sf-muted">
                      {book.isCompleted ? formatDate(book.endDate) : "-"}
                    </div>

                    <div className="flex items-center">
                      {book.isCompleted ? (
                        <span className="sf-chip-success">
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {statusT("completed")}
                        </span>
                      ) : (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => markAsFinished(book.id)}
                        >
                          <Check className="mr-1.5 h-3.5 w-3.5" />
                          {t("reading.finish")}
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        onClick={() =>
                          toggleFavorite(book.id, book.isFavorite || false)
                        }
                        className="sf-icon-button h-10 w-10"
                        title={t("columns.favorite")}
                        aria-label={t("columns.favorite")}
                        aria-pressed={Boolean(book.isFavorite)}
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
