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
import { Quote } from '@/types/book';
import { Button } from '@/components/ui/button';
import {
  EmptyState,
  GlassCard,
  GlassCardHeader,
  PageLoading,
  StatCard,
} from '@/components/ui/glass';

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
    return <PageLoading label={t('loading')} />;
  }

  const summaryCards = [
    { title: t('stats.favorites'), value: favoriteBooks.length, icon: Heart },
    { title: t('stats.quotes'), value: allQuotes.length, icon: QuoteIcon },
    { title: t('stats.quotedBooks'), value: quotedBooksCount, icon: Sparkles },
    { title: t('stats.books'), value: books.length, icon: BookOpen },
  ];

  return (
    <div className="sf-page">
            <div className="sf-container">
        {/* Sayfa başlığı */}
        <header className="sf-page-header">
          <div>
            <h1 className="sf-title-page">{t('title')}</h1>
            <p className="sf-page-header-sub">{t('subtitle')}</p>
          </div>

          <Button
            onClick={() => openQuoteForm()}
            size="lg"
            disabled={books.length === 0}
            className="shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('quotes.addQuote')}
          </Button>
        </header>

        {/* Özet istatistikler */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <StatCard
              key={card.title}
              label={card.title}
              value={card.value}
              icon={card.icon}
            />
          ))}
        </div>

        {/* Favori rafı */}
        <GlassCard>
          <GlassCardHeader
            icon={Heart}
            title={t('favorites.title')}
            description={t('favorites.hint')}
            action={
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/60">
                  {t('favorites.count', { count: favoriteBooks.length })}
                </span>
                {favoriteBooks.length > 2 && (
                  <div className="hidden gap-2 md:flex">
                    <button
                      type="button"
                      onClick={() => scrollShelf('left')}
                      aria-label="Scroll left"
                      className="sf-icon-button"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollShelf('right')}
                      aria-label="Scroll right"
                      className="sf-icon-button"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            }
          />

          <div>
            {favoriteBooks.length === 0 ? (
              <EmptyState
                icon={Heart}
                title={t('favorites.emptyTitle')}
                description={t('favorites.emptyBody')}
              />
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
                      className="group relative flex w-[260px] shrink-0 snap-start flex-col overflow-hidden sf-card transition-all duration-300 hover:-translate-y-1 hover:shadow-panel"
                    >
                      <div className="relative h-[300px] overflow-hidden bg-black/40">
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
                            <BookOpen className="h-12 w-12 text-white/35" />
                          </div>
                        )}

                        <div
                          aria-hidden
                          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            toggleFavorite(book.id, book.isFavorite || false)
                          }
                          title={t('favorites.remove')}
                          aria-label={t('favorites.remove')}
                          className="sf-on-dark-icon-button absolute right-3 top-3"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </button>

                        {quoteCount > 0 && (
                          <span className="sf-on-dark-chip absolute left-3 top-3">
                            <QuoteIcon className="h-3 w-3" />
                            {quoteCount}
                          </span>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white">
                            {book.title}
                          </h3>
                          <p className="mt-1 truncate text-sm text-white/75">{book.author}</p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="flex items-center justify-between">
                          <span className="sf-meta">
                            {book.pages ? `${book.pages} p.` : ' '}
                          </span>
                          {book.rating ? (
                            <span className="star-filled inline-flex items-center gap-1 text-xs font-semibold">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              {book.rating}
                            </span>
                          ) : null}
                        </div>

                        <Button
                          onClick={() => openQuoteForm(book.id)}
                          size="sm"
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
          </div>
        </GlassCard>

        {/* Alıntılar */}
        <GlassCard ref={quotesRef} className="scroll-mt-6">
          <GlassCardHeader
            icon={QuoteIcon}
            title={t('quotes.title')}
            description={t('quotes.hint')}
            action={
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/60">
                  {t('quotes.count', { count: allQuotes.length })}
                </span>
                <Button
                  onClick={() => openQuoteForm()}
                  size="sm"
                  disabled={books.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('quotes.addQuote')}
                </Button>
              </div>
            }
          />

          <div>
            {allQuotes.length === 0 ? (
              <EmptyState
                icon={QuoteIcon}
                title={t('quotes.emptyTitle')}
                description={
                  books.length === 0 ? t('modal.noBooks') : t('quotes.emptyBody')
                }
                action={
                  books.length > 0 ? (
                    <Button onClick={() => openQuoteForm()} size="lg">
                      <Plus className="mr-2 h-4 w-4" />
                      {t('quotes.addQuote')}
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="gap-5 [column-fill:balance] sm:columns-2">
                {allQuotes.map((quote) => {
                  const addedAt = formatDate(quote.dateAdded);
                  const isNew = quote.id === justAddedId;

                  return (
                    <figure
                      key={quote.id}
                      className={`mb-5 break-inside-avoid rounded-card border p-6 backdrop-blur-md transition-all duration-500 ${
                        isNew
                          ? 'border-accent-strong bg-accent-strong/15 ring-2 ring-accent-strong/40'
                          : 'border-control-border bg-control hover:bg-control-hover'
                      }`}
                    >
                      <span
                        aria-hidden
                        className="block font-serif text-5xl leading-none text-accent-ink/35"
                      >
                        &ldquo;
                      </span>

                      <blockquote className="-mt-3 text-[0.975rem] leading-relaxed text-ink/85">
                        {quote.text}
                      </blockquote>

                      {quote.notes && (
                        <p className="sf-body sf-tile mt-4">
                          <span className="font-semibold text-accent-ink">
                            {t('quotes.note')}:
                          </span>{' '}
                          {quote.notes}
                        </p>
                      )}

                      <figcaption className="mt-5 flex items-end justify-between gap-4 border-t border-hairline pt-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {quote.bookTitle}
                          </p>
                          <p className="sf-meta truncate">{quote.bookAuthor}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {quote.page ? (
                            <span className="sf-chip px-2.5">
                              {t('quotes.page', { page: quote.page })}
                            </span>
                          ) : null}
                          {addedAt ? (
                            <span
                              className={`text-xs ${isNew ? 'font-semibold text-accent-ink' : 'text-ink/45'}`}
                              title={t('modal.savedOn', { date: addedAt })}
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
          </div>
        </GlassCard>
      </div>

      {/* Alıntı ekleme modalı */}
      {showQuoteForm && (
        <div
          className="sf-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={closeQuoteForm}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="sf-modal max-w-lg"
          >
            <div className="sf-modal-header">
              <div>
                <h2 className="sf-title-section">{t('modal.title')}</h2>
                <p className="sf-muted mt-1">{t('modal.subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={closeQuoteForm}
                aria-label={t('modal.close')}
                className="sf-icon-button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {books.length === 0 ? (
              <div className="sf-body px-6 py-10 text-center">
                {t('modal.noBooks')}
              </div>
            ) : (
              <div className="sf-modal-body">
                <div className="sf-field">
                  <label htmlFor="quote-book" className="sf-label">
                    {t('modal.bookLabel')}
                  </label>
                  <select
                    id="quote-book"
                    value={selectedBookId}
                    onChange={(event) => setSelectedBookId(event.target.value)}
                    className="sf-select"
                  >
                    <option value="" disabled>
                      {t('modal.bookPlaceholder')}
                    </option>
                    {selectableBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} — {book.author}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sf-field">
                  <label htmlFor="quote-text" className="sf-label">
                    {t('modal.quoteLabel')}
                  </label>
                  <textarea
                    id="quote-text"
                    ref={quoteTextRef}
                    value={quoteText}
                    onChange={(event) => setQuoteText(event.target.value)}
                    rows={5}
                    placeholder={t('modal.quotePlaceholder')}
                    className="sf-textarea"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sf-field">
                    <label htmlFor="quote-page" className="sf-label">
                      {t('modal.pageLabel')}{' '}
                      <span className="normal-case tracking-normal text-ink/40">
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
                      className="sf-input"
                    />
                  </div>

                  <div className="sf-field">
                    <label htmlFor="quote-notes" className="sf-label">
                      {t('modal.notesLabel')}{' '}
                      <span className="normal-case tracking-normal text-ink/40">
                        ({t('modal.optional')})
                      </span>
                    </label>
                    <input
                      id="quote-notes"
                      value={quoteNotes}
                      onChange={(event) => setQuoteNotes(event.target.value)}
                      placeholder={t('modal.notesPlaceholder')}
                      className="sf-input"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="sf-modal-footer">
              <p className="sf-meta">
                {t('modal.savedOn', {
                  date: formatDate(new Date().toISOString()) || '',
                })}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={closeQuoteForm}>
                  {t('modal.cancel')}
                </Button>
                <Button
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
