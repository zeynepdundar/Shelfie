'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { GoogleBook } from "@shelfie/types";
import { AddBookModalProps } from "@/types/component-props";
import { BookCover } from "@/components/books/BookCover";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BookStatusKey } from "@/lib/bookStatus";

export function AddBookModal({
  isOpen,
  onClose,
  onAddBook,
  defaultWantToRead = false,
}: AddBookModalProps) {
  const t = useTranslations("addBook");
  const statusT = useTranslations("book.status");
  const [activeTab, setActiveTab] = useState<'form' | 'search'>('form');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null);
  const [showDateForm, setShowDateForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    pages: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isFavorite: false,
    status: (defaultWantToRead ? "wantToRead" : "inProgress") as BookStatusKey
  });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      pages: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      isFavorite: false,
      status: (defaultWantToRead ? "wantToRead" : "inProgress") as BookStatusKey
    });
    setFormError(null);
  };

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&key=${apiKey}&maxResults=4`
      );
      const data = await response.json();

      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Kitap arama hatası:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchBooks();
  };

  const handleSelectBook = (book: GoogleBook) => {
    setSelectedBook(book);
    setShowDateForm(true);
  };

  const handleDateFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBook) return;

    const bookData = {
      title: selectedBook.volumeInfo.title,
      author: selectedBook.volumeInfo.authors?.join(', ') || t("unknownAuthor"),
      pages: selectedBook.volumeInfo.pageCount || 0,
      ...(formData.status !== "wantToRead" && { startDate: formData.startDate }),
      ...(formData.status === "completed" && { endDate: formData.endDate }),
      dateRead: formData.status === "completed" ? formData.endDate : null,
      isCompleted: formData.status === "completed",
      wantToRead: formData.status === "wantToRead",
      coverUrl: selectedBook.volumeInfo.imageLinks?.thumbnail || undefined,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    try {
      onAddBook(bookData);
    } catch (error) {
      console.error('onAddBook çağrısında hata:', error);
    }

    setSelectedBook(null);
    setShowDateForm(false);
    setSearchQuery('');
    setSearchResults([]);
    resetForm();
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.author || !formData.pages) {
      setFormError(t("requiredError"));
      return;
    }

    const bookData = {
      title: formData.title,
      author: formData.author,
      pages: parseInt(formData.pages),
      dateRead: formData.status === "completed" ? formData.endDate : null,
      ...(formData.status !== "wantToRead" && { startDate: formData.startDate }),
      ...(formData.status === "completed" && { endDate: formData.endDate }),
      isCompleted: formData.status === "completed",
      isFavorite: formData.isFavorite,
      wantToRead: formData.status === "wantToRead",
      dateAdded: new Date().toISOString().split('T')[0]
    };

    try {
      onAddBook(bookData);
    } catch (error) {
      console.error('onAddBook çağrısında hata:', error);
    }

    resetForm();
    onClose();
  };

  const handleBackToSearch = () => {
    setSelectedBook(null);
    setShowDateForm(false);
  };

  if (!isOpen) return null;

  const tabClass = (tab: 'form' | 'search') =>
    `flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
      activeTab === tab
        ? 'bg-accent-strong text-on-accent shadow-sm'
        : 'text-ink/55 hover:text-ink'
    }`;

  const statusOptions: BookStatusKey[] = ["wantToRead", "inProgress", "completed"];

  const statusClass = (value: BookStatusKey) =>
    `flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
      formData.status === value
        ? 'bg-accent-strong text-on-accent shadow-sm'
        : 'text-ink/55 hover:text-ink'
    }`;

  /** Kitabın hangi bölüme ekleneceğini seçtiren üçlü kontrol. */
  const renderStatusPicker = () => (
    <div className="sf-field">
      <span className="sf-label">{t("fields.status")}</span>
      <div className="flex gap-1 sf-tile rounded-full p-1">
        {statusOptions.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={formData.status === value}
            onClick={() => setFormData({ ...formData, status: value })}
            className={statusClass(value)}
          >
            {statusT(value)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="sf-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sf-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="sf-modal-header">
          <div>
            <h2 className="sf-title-section">{t("title")}</h2>
            <p className="sf-muted mt-1">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="sf-icon-button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Seçilen kitap için tarih formu */}
        {showDateForm && selectedBook && (
          <>
            <div className="sf-modal-body">
              <div className="sf-tile">
                <div className="flex gap-3">
                  <BookCover
                    src={selectedBook.volumeInfo.imageLinks?.thumbnail}
                    alt={selectedBook.volumeInfo.title}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate">{selectedBook.volumeInfo.title}</h3>
                    <p className="sf-body truncate">
                      {selectedBook.volumeInfo.authors?.join(', ') || t("unknownAuthor")}
                    </p>
                    {selectedBook.volumeInfo.pageCount && (
                      <p className="sf-meta">
                        {t("pageCount", { count: selectedBook.volumeInfo.pageCount })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <form id="date-form" onSubmit={handleDateFormSubmit} className="space-y-4">
                {renderStatusPicker()}

                {formData.status !== "wantToRead" && (
                  <div className="sf-field">
                    <label htmlFor="sd-start" className="sf-label">
                      {t("fields.readingStartDate")}
                    </label>
                    <input
                      id="sd-start"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="sf-input"
                      required
                    />
                  </div>
                )}

                {formData.status === "completed" && (
                  <div className="sf-field">
                    <label htmlFor="sd-end" className="sf-label">
                      {t("fields.readingEndDate")}
                    </label>
                    <input
                      id="sd-end"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="sf-input"
                    />
                  </div>
                )}
              </form>
            </div>

            <div className="sf-modal-footer sm:justify-end">
              <Button type="button" variant="outline" onClick={handleBackToSearch}>
                {t("back")}
              </Button>
              <Button type="submit" form="date-form">
                {t("submit")}
              </Button>
            </div>
          </>
        )}

        {/* Ana içerik */}
        {!showDateForm && (
          <>
            <div className="px-6 pt-5">
              <div className="flex gap-1 sf-tile rounded-full p-1">
                <button type="button" onClick={() => setActiveTab('form')} className={tabClass('form')}>
                  {t("tabs.manual")}
                </button>
                <button type="button" onClick={() => setActiveTab('search')} className={tabClass('search')}>
                  {t("tabs.search")}
                </button>
              </div>
            </div>

            {/* Manuel ekleme */}
            {activeTab === 'form' && (
              <>
                <div className="sf-modal-body">
                  {formError && <div className="sf-alert-error">{formError}</div>}

                  <form id="manual-form" onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="sf-field">
                      <label htmlFor="mf-title" className="sf-label">{t("fields.bookTitle")} *</label>
                      <input
                        id="mf-title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="sf-input"
                        placeholder={t("fields.bookTitlePlaceholder")}
                      />
                    </div>

                    <div className="sf-field">
                      <label htmlFor="mf-author" className="sf-label">{t("fields.author")} *</label>
                      <input
                        id="mf-author"
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="sf-input"
                        placeholder={t("fields.authorPlaceholder")}
                      />
                    </div>

                    <div className="sf-field">
                      <label htmlFor="mf-pages" className="sf-label">{t("fields.pages")} *</label>
                      <input
                        id="mf-pages"
                        type="number"
                        min="1"
                        value={formData.pages}
                        onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                        className="sf-input"
                        placeholder={t("fields.pagesPlaceholder")}
                      />
                    </div>

                    {renderStatusPicker()}

                    {formData.status !== "wantToRead" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sf-field">
                          <label htmlFor="mf-start" className="sf-label">{t("fields.startDate")}</label>
                          <input
                            id="mf-start"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="sf-input"
                          />
                        </div>

                        {formData.status === "completed" && (
                          <div className="sf-field">
                            <label htmlFor="mf-end" className="sf-label">{t("fields.endDate")}</label>
                            <input
                              id="mf-end"
                              type="date"
                              value={formData.endDate}
                              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                              className="sf-input"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <label className="flex items-center gap-3 pt-1 text-sm text-ink/80">
                      <input
                        type="checkbox"
                        checked={formData.isFavorite}
                        onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                        className="sf-checkbox"
                      />
                      {t("fields.favorite")}
                    </label>
                                    </form>
                </div>

                <div className="sf-modal-footer sm:justify-end">
                  <Button type="button" variant="outline" onClick={onClose}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" form="manual-form">
                    {t("submit")}
                  </Button>
                </div>
              </>
            )}

            {/* Arama */}
            {activeTab === 'search' && (
              <>
                <div className="sf-modal-body">
                  <form onSubmit={handleSearchSubmit} className="sf-field">
                    <label htmlFor="sf-search" className="sf-label">{t("search.label")}</label>
                    <div className="flex gap-2">
                      <input
                        id="sf-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="sf-input flex-1"
                        placeholder={t("search.placeholder")}
                      />
                      <Button type="submit" disabled={isSearching} className="shrink-0">
                        <Search className="mr-2 h-4 w-4" />
                        {isSearching ? t("search.searching") : t("search.submit")}
                      </Button>
                    </div>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="space-y-3">
                      <p className="sf-label">{t("search.results")}</p>
                      {searchResults.map((book) => (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => handleSelectBook(book)}
                          className="sf-tile w-full cursor-pointer text-left transition-colors duration-200 hover:bg-control-hover"
                        >
                          <div className="flex gap-3">
                            <BookCover
                              src={book.volumeInfo.imageLinks?.thumbnail}
                              alt={book.volumeInfo.title}
                              size="md"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate">{book.volumeInfo.title}</h3>
                              <p className="sf-body truncate">
                                {book.volumeInfo.authors?.join(', ') || t("unknownAuthor")}
                              </p>
                              {book.volumeInfo.pageCount && (
                                <p className="sf-meta">
                                  {t("pageCount", { count: book.volumeInfo.pageCount })}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.length === 0 && searchQuery && !isSearching && (
                    <p className="sf-muted py-4 text-center">{t("search.noResults")}</p>
                  )}
                </div>

                <div className="sf-modal-footer sm:justify-end">
                  <Button type="button" variant="outline" onClick={onClose}>
                    {t("cancel")}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
