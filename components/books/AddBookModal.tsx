'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleBook } from "@/types/book";
import { AddBookModalProps } from "@/types/component-props";
import { BookCover } from "@/components/books/BookCover";
import { Search, X } from "lucide-react";

export function AddBookModal({
  isOpen,
  onClose,
  onAddBook,
  defaultWantToRead = false,
}: AddBookModalProps) {
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
    dateRead: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isCompleted: false,
    isFavorite: false,
    wantToRead: defaultWantToRead
  });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      pages: '',
      dateRead: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      isCompleted: false,
      isFavorite: false,
      wantToRead: defaultWantToRead
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
      author: selectedBook.volumeInfo.authors?.join(', ') || 'Bilinmeyen Yazar',
      pages: selectedBook.volumeInfo.pageCount || 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      dateRead: formData.isCompleted ? formData.endDate : null,
      isCompleted: formData.isCompleted,
      wantToRead: formData.wantToRead,
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
      setFormError('Lütfen kitap adı, yazar ve sayfa sayısını doldurun.');
      return;
    }

    const bookData = {
      title: formData.title,
      author: formData.author,
      pages: parseInt(formData.pages),
      dateRead: formData.dateRead || null,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isCompleted: formData.isCompleted,
      isFavorite: formData.isFavorite,
      wantToRead: formData.wantToRead,
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

  return (
    <div className="sf-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sf-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="sf-modal-header">
          <div>
            <h2 className="sf-title-section">Yeni Kitap Ekle</h2>
            <p className="sf-muted mt-1">
              Elle ekle ya da Google Books&apos;ta ara.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
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
                      {selectedBook.volumeInfo.authors?.join(', ') || 'Bilinmeyen Yazar'}
                    </p>
                    {selectedBook.volumeInfo.pageCount && (
                      <p className="sf-meta">
                        {selectedBook.volumeInfo.pageCount} sayfa
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <form id="date-form" onSubmit={handleDateFormSubmit} className="space-y-4">
                <div className="sf-field">
                  <label htmlFor="sd-start" className="sf-label">
                    Okuma Başlangıç Tarihi *
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

                <div className="sf-field">
                  <label htmlFor="sd-end" className="sf-label">
                    Okuma Bitiş Tarihi
                  </label>
                  <input
                    id="sd-end"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="sf-input"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm text-ink/80">
                    <input
                      type="checkbox"
                      checked={formData.isCompleted}
                      onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
                      className="sf-checkbox"
                    />
                    Kitabı tamamladım
                  </label>

                  <label className="flex items-center gap-3 text-sm text-ink/80">
                    <input
                      type="checkbox"
                      checked={formData.wantToRead}
                      onChange={(e) => setFormData({ ...formData, wantToRead: e.target.checked })}
                      className="sf-checkbox"
                    />
                    Sonra okumak istiyorum
                  </label>
                </div>
              </form>
            </div>

            <div className="sf-modal-footer sm:justify-end">
              <Button type="button" variant="outline" onClick={handleBackToSearch}>
                Geri
              </Button>
              <Button type="submit" form="date-form">
                Kitabı Ekle
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
                  Manuel Ekle
                </button>
                <button type="button" onClick={() => setActiveTab('search')} className={tabClass('search')}>
                  Arama Yap
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
                      <label htmlFor="mf-title" className="sf-label">Kitap Adı *</label>
                      <input
                        id="mf-title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="sf-input"
                        placeholder="Kitap adını girin"
                      />
                    </div>

                    <div className="sf-field">
                      <label htmlFor="mf-author" className="sf-label">Yazar *</label>
                      <input
                        id="mf-author"
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="sf-input"
                        placeholder="Yazar adını girin"
                      />
                    </div>

                    <div className="sf-field">
                      <label htmlFor="mf-pages" className="sf-label">Sayfa Sayısı *</label>
                      <input
                        id="mf-pages"
                        type="number"
                        min="1"
                        value={formData.pages}
                        onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                        className="sf-input"
                        placeholder="Sayfa sayısını girin"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sf-field">
                        <label htmlFor="mf-start" className="sf-label">Başlangıç Tarihi</label>
                        <input
                          id="mf-start"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="sf-input"
                        />
                      </div>

                      <div className="sf-field">
                        <label htmlFor="mf-end" className="sf-label">Bitiş Tarihi</label>
                        <input
                          id="mf-end"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="sf-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <label className="flex items-center gap-3 text-sm text-ink/80">
                        <input
                          type="checkbox"
                          checked={formData.isCompleted}
                          onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
                          className="sf-checkbox"
                        />
                        Kitabı tamamladım
                      </label>

                      <label className="flex items-center gap-3 text-sm text-ink/80">
                        <input
                          type="checkbox"
                          checked={formData.isFavorite}
                          onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                          className="sf-checkbox"
                        />
                        Favori kitabım
                      </label>

                      <label className="flex items-center gap-3 text-sm text-ink/80">
                        <input
                          type="checkbox"
                          checked={formData.wantToRead}
                          onChange={(e) => setFormData({ ...formData, wantToRead: e.target.checked })}
                          className="sf-checkbox"
                        />
                        Sonra okumak istiyorum
                      </label>
                    </div>
                  </form>
                </div>

                <div className="sf-modal-footer sm:justify-end">
                  <Button type="button" variant="outline" onClick={onClose}>
                    İptal
                  </Button>
                  <Button type="submit" form="manual-form">
                    Kitap Ekle
                  </Button>
                </div>
              </>
            )}

            {/* Arama */}
            {activeTab === 'search' && (
              <>
                <div className="sf-modal-body">
                  <form onSubmit={handleSearchSubmit} className="sf-field">
                    <label htmlFor="sf-search" className="sf-label">Kitap Ara</label>
                    <div className="flex gap-2">
                      <input
                        id="sf-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="sf-input flex-1"
                        placeholder="Kitap adı veya yazar girin"
                      />
                      <Button type="submit" disabled={isSearching} className="shrink-0">
                        <Search className="mr-2 h-4 w-4" />
                        {isSearching ? 'Aranıyor...' : 'Ara'}
                      </Button>
                    </div>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="space-y-3">
                      <p className="sf-label">Arama Sonuçları</p>
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
                                {book.volumeInfo.authors?.join(', ') || 'Bilinmeyen Yazar'}
                              </p>
                              {book.volumeInfo.pageCount && (
                                <p className="sf-meta">{book.volumeInfo.pageCount} sayfa</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.length === 0 && searchQuery && !isSearching && (
                    <p className="sf-muted py-4 text-center">Kitap bulunamadı</p>
                  )}
                </div>

                <div className="sf-modal-footer sm:justify-end">
                  <Button type="button" variant="outline" onClick={onClose}>
                    İptal
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
