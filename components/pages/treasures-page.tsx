'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Heart,
  Quote as QuoteIcon,
  Plus,
  Sparkles,
  Star,
  X,
} from 'lucide-react';

import { AppDispatch, RootState } from '@/lib/store';
import { fetchUserBooks, updateBook } from '@/lib/booksSlice';
import { AuthUser } from '@/lib/authSlice';
import { Book, Quote } from '@/types/book';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TreasuresPageProps {
  user: AuthUser | null;
}

type QuoteWithBook = Quote & { bookTitle?: string; bookAuthor?: string };

function formatDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function TreasuresPage({ user }: TreasuresPageProps) {
  const t = useTranslations('treasures');
  const dispatch = useDispatch<AppDispatch>();
  const { books, status } = useSelector((state: RootState) => state.books);

  const shelfRef = useRef<HTMLDivElement>(null);
  const quotesRef = useRef<HTMLDivElement>(null);
  const quoteTextRef = useRef<HTMLTextAreaElement>(null);

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [quotePage, setQuotePage] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserBooks());
    }
  }, [dispatch, user]);

  const favoriteBooks = useMemo(
    () => books.filter((book) => book.isFavorite),
    [books],
  );

  const selectableBooks = useMemo(
    () => [...books].sort((a, b) => a.title.localeCompare(b.title)),
    [books],
  );

  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedBookId) || null,
    [books, selectedBookId],
  );

  const allQuotes = useMemo<QuoteWithBook[]>(() => {
    return books
      .filter((book) => book.quotes && book.quotes.length > 0)
      .flatMap((book) =>
        book.quotes!.map((quote) => ({
          ...quote,
          bookTitle: book.title,
          bookAuthor: book.author,
        })),
      )
      .sort(
        (a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
      );
  }, [books]);

  const quotedBooksCount = useMemo(
    () => books.filter((book) => book.quotes && book.quotes.length > 0).length,
    [books],
  );

  const openQuoteForm = useCallback((bookId?: string) => {
    setSelectedBookId(bookId || '');
    setShowQuoteForm(true);
  }, []);

  const closeQuoteForm = useCallback(() => {
    setShowQuoteForm(false);
    setSelectedBookId('');
    setQuoteText('');
    setQuotePage('');
    setQuoteNotes('');
  }, []);

  useEffect(() => {
    if (!showQuoteForm) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeQuoteForm();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (selectedBookId) {
      quoteTextRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [showQuoteForm, selectedBookId, closeQuoteForm]);

  useEffect(() => {
    if (!justAddedId) return;
    const timeout = window.setTimeout(() => setJustAddedId(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [justAddedId]);

  const scrollShelf = (direction: 'left' | 'right') => {
    const node = shelfRef.current;
    if (!node) return;
    node.scrollBy({
      left: direction === 'left' ? -340 : 340,
      behavior: 'smooth',
    });
  };

  const toggleFavorite = async (bookId: string, currentFavorite: boolean) => {
    try {
      await dispatch(
        updateBook({ bookId, updates: { isFavorite: !currentFavorite } }),
      );
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  const addQuote = async () => {
    if (!selectedBook || !quoteText.trim()) return;

    const parsedPage = Number.parseInt(quotePage, 10);
    const newQuote: Quote = {
      id: Date.now().toString(),
      text: quoteText.trim(),
      page: Number.isNaN(parsedPage) ? undefined : parsedPage,
      dateAdded: new Date().toISOString(),
      notes: quoteNotes.trim() || undefined,
    };

    setIsSaving(true);
    try {
      await dispatch(
        updateBook({
          bookId: selectedBook.id,
          updates: { quotes: [...(selectedBook.quotes || []), newQuote] },
        }),
      );
      closeQuoteForm();
      setJustAddedId(newQuote.id);
      window.setTimeout(() => {
        quotesRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 60);
    } catch (error) {
      console.error('Error adding quote:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="relative min-h-screen px-4 py-16 text-white">
        <div className="relative mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
            <span className="text-sm text-slate-200">{t('loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: t('stats.favorites'),
      value: favoriteBooks.length,
      icon: Heart,
      accent: 'from-rose-400/20 to-rose-500/5',
      valueClass: 'text-rose-200',
    },
    {
      title: t('stats.quotes'),
      value: allQuotes.length,
      icon: QuoteIcon,
      accent: 'from-sky-400/20 to-sky-500/5',
      valueClass: 'text-sky-200',
    },
    {
      title: t('stats.quotedBooks'),
      value: quotedBooksCount,
      icon: Sparkles,
      accent: 'from-emerald-400/20 to-emerald-500/5',
      valueClass: 'text-emerald-200',
    },
    {
      title: t('stats.books'),
      value: books.length,
      icon: BookOpen,
      accent: 'from-amber-400/20 to-orange-400/5',
      valueClass: 'text-amber-200',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-10"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Hero */}
        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-3xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-amber-200">
                <Sparkles className="h-3.5 w-3.5" />
                Shelfie
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {t('title')}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {t('subtitle')}
              </p>
            </div>

            <Button
              onClick={() => openQuoteForm()}
              size="lg"
              variant="glow"
              disabled={books.length === 0}
              className="shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('quotes.addQuote')}
            </Button>
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
                      <p
                        className={`text-3xl font-semibold tracking-tight ${card.valueClass}`}
                      >
                        {card.value}
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

        {/* Favorites shelf */}
        <Card className="overflow-hidden border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-2xl">
          <CardHeader className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-white/10 bg-rose-400/10 p-2.5">
                  <Heart className="h-5 w-5 fill-current text-rose-300" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">
                    {t('favorites.title')}
                  </CardTitle>
                  <CardDescription className="mt-1 text-slate-300">
                    {t('favorites.hint')}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">
                  {t('favorites.count', { count: favoriteBooks.length })}
                </span>
                {favoriteBooks.length > 2 && (
                  <div className="hidden gap-2 md:flex">
                    <button
                      type="button"
                      onClick={() => scrollShelf('left')}
                      aria-label="Scroll left"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-colors hover:bg-white/15 hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollShelf('right')}
                      aria-label="Scroll right"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-colors hover:bg-white/15 hover:text-white"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-4 py-5 sm:px-6">
            {favoriteBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/5 px-6 py-14 text-center">
                <div className="mb-4 rounded-full border border-white/10 bg-rose-400/10 p-4">
                  <Heart className="h-7 w-7 text-rose-200" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {t('favorites.emptyTitle')}
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-300">
                  {t('favorites.emptyBody')}
                </p>
              </div>
            ) : (
              <div
                ref={shelfRef}
                className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]"
              >
                {favoriteBooks.map((book) => {
                  const quoteCount = book.quotes?.length || 0;

                  return (
                    <article
                      key={book.id}
                      className="group relative flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
                    >
                      <div className="relative h-[300px] overflow-hidden bg-gradient-to-br from-slate-700/60 to-slate-900/60">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={`${book.title} cover`}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            onError={(event) => {
                              const target = event.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen className="h-12 w-12 text-slate-500" />
                          </div>
                        )}

                        <div
                          aria-hidden
                          className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            toggleFavorite(book.id, book.isFavorite || false)
                          }
                          title={t('favorites.remove')}
                          aria-label={t('favorites.remove')}
                          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-slate-950/50 text-rose-300 backdrop-blur-md transition-colors hover:border-rose-300/40 hover:bg-rose-500/25 hover:text-rose-100"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </button>

                        {quoteCount > 0 && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/50 px-2.5 py-1 text-xs text-sky-200 backdrop-blur-md">
                            <QuoteIcon className="h-3 w-3" />
                            {quoteCount}
                          </span>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white">
                            {book.title}
                          </h3>
                          <p className="mt-1 truncate text-sm text-slate-300">
                            {book.author}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{book.pages ? `${book.pages} p.` : ' '}</span>
                          {book.rating ? (
                            <span className="inline-flex items-center gap-1 text-amber-200">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              {book.rating}
                            </span>
                          ) : null}
                        </div>

                        <Button
                          onClick={() => openQuoteForm(book.id)}
                          size="sm"
                          variant="glow"
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {t('favorites.addQuote')}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quotes */}
        <Card
          ref={quotesRef}
          className="scroll-mt-6 overflow-hidden border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-2xl"
        >
          <CardHeader className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-white/10 bg-sky-400/10 p-2.5">
                  <QuoteIcon className="h-5 w-5 text-sky-300" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">
                    {t('quotes.title')}
                  </CardTitle>
                  <CardDescription className="mt-1 text-slate-300">
                    {t('quotes.hint')}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">
                  {t('quotes.count', { count: allQuotes.length })}
                </span>
                <Button
                  onClick={() => openQuoteForm()}
                  size="sm"
                  variant="glow"
                  disabled={books.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('quotes.addQuote')}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-4 py-5 sm:px-6">
            {allQuotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/5 px-6 py-14 text-center">
                <div className="mb-4 rounded-full border border-white/10 bg-sky-400/10 p-4">
                  <QuoteIcon className="h-7 w-7 text-sky-200" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {t('quotes.emptyTitle')}
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-300">
                  {books.length === 0
                    ? t('modal.noBooks')
                    : t('quotes.emptyBody')}
                </p>
                {books.length > 0 && (
                  <Button
                    onClick={() => openQuoteForm()}
                    size="lg"
                    variant="glow"
                    className="mt-6"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('quotes.addQuote')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="gap-5 [column-fill:balance] sm:columns-2">
                {allQuotes.map((quote) => {
                  const addedAt = formatDate(quote.dateAdded);
                  const isNew = quote.id === justAddedId;

                  return (
                    <figure
                      key={quote.id}
                      className={`mb-5 break-inside-avoid rounded-[1.75rem] border bg-white/5 p-6 backdrop-blur-xl transition-all duration-500 hover:bg-white/10 ${
                        isNew
                          ? 'border-amber-300/50 bg-amber-300/10 ring-2 ring-amber-300/30'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span
                        aria-hidden
                        className="block font-serif text-5xl leading-none text-white/15"
                      >
                        &ldquo;
                      </span>

                      <blockquote className="-mt-3 text-[0.975rem] leading-relaxed text-slate-100">
                        {quote.text}
                      </blockquote>

                      {quote.notes && (
                        <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-slate-300">
                          <span className="text-amber-200">
                            {t('quotes.note')}:
                          </span>{' '}
                          {quote.notes}
                        </p>
                      )}

                      <figcaption className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {quote.bookTitle}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {quote.bookAuthor}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {quote.page ? (
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">
                              {t('quotes.page', { page: quote.page })}
                            </span>
                          ) : null}
                          {addedAt ? (
                            <span
                              className={`text-xs ${isNew ? 'text-amber-200' : 'text-slate-500'}`}
                              title={
                                addedAt
                                  ? t('modal.savedOn', { date: addedAt })
                                  : undefined
                              }
                            >
                              {addedAt}
                            </span>
                          ) : null}
                        </div>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quote modal */}
      {showQuoteForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={closeQuoteForm}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-900/85 shadow-2xl shadow-black/40 backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {t('modal.title')}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {t('modal.subtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={closeQuoteForm}
                aria-label={t('modal.close')}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/15 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {books.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-300">
                {t('modal.noBooks')}
              </div>
            ) : (
              <div className="space-y-4 px-6 py-5">
                <div className="space-y-2">
                  <label
                    htmlFor="quote-book"
                    className="text-xs uppercase tracking-[0.24em] text-slate-400"
                  >
                    {t('modal.bookLabel')}
                  </label>
                  <select
                    id="quote-book"
                    value={selectedBookId}
                    onChange={(event) => setSelectedBookId(event.target.value)}
                    className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition-colors focus:border-amber-300/40 focus:bg-white/10"
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-300">
                      {t('modal.bookPlaceholder')}
                    </option>
                    {selectableBooks.map((book) => (
                      <option
                        key={book.id}
                        value={book.id}
                        className="bg-slate-900 text-slate-100"
                      >
                        {book.title} — {book.author}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="quote-text"
                    className="text-xs uppercase tracking-[0.24em] text-slate-400"
                  >
                    {t('modal.quoteLabel')}
                  </label>
                  <textarea
                    id="quote-text"
                    ref={quoteTextRef}
                    value={quoteText}
                    onChange={(event) => setQuoteText(event.target.value)}
                    rows={5}
                    placeholder={t('modal.quotePlaceholder')}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-white/10"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="quote-page"
                      className="text-xs uppercase tracking-[0.24em] text-slate-400"
                    >
                      {t('modal.pageLabel')}{' '}
                      <span className="normal-case tracking-normal text-slate-500">
                        ({t('modal.optional')})
                      </span>
                    </label>
                    <input
                      id="quote-page"
                      type="number"
                      min={1}
                      max={selectedBook?.pages || undefined}
                      value={quotePage}
                      onChange={(event) => setQuotePage(event.target.value)}
                      placeholder={t('modal.pagePlaceholder')}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="quote-notes"
                      className="text-xs uppercase tracking-[0.24em] text-slate-400"
                    >
                      {t('modal.notesLabel')}{' '}
                      <span className="normal-case tracking-normal text-slate-500">
                        ({t('modal.optional')})
                      </span>
                    </label>
                    <input
                      id="quote-notes"
                      value={quoteNotes}
                      onChange={(event) => setQuoteNotes(event.target.value)}
                      placeholder={t('modal.notesPlaceholder')}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-white/10"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                {t('modal.savedOn', { date: formatDate(new Date().toISOString()) || '' })}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  onClick={closeQuoteForm}
                  className="text-slate-200 hover:bg-white/10 hover:text-white"
                >
                  {t('modal.cancel')}
                </Button>
                <Button
                  variant="glow"
                  onClick={addQuote}
                  disabled={!selectedBook || !quoteText.trim() || isSaving}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('modal.save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
