'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GoogleBook } from "@/types/book";
import { AddBookModalProps } from "@/types/component-props";


export function AddBookModal({ isOpen, onClose, onAddBook }: AddBookModalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'search'>('form');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null);
  const [showDateForm, setShowDateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    pages: '',
    dateRead: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isCompleted: false,
    isFavorite: false
  });

  // Google Books API anahtarınızı buraya ekleyin
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      console.log('API Key:', apiKey ? 'Mevcut' : 'Eksik');
      console.log('Aranan kitap:', searchQuery);
      
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&key=${apiKey}&maxResults=4`
      );
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.items) {
        setSearchResults(data.items);
        console.log('Bulunan kitaplar:', data.items.length);
      } else {
        setSearchResults([]);
        console.log('Kitap bulunamadı');
      }
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
    console.log('Kitap seçildi:', book.volumeInfo.title);
    setSelectedBook(book);
    setShowDateForm(true);
    console.log('showDateForm set to true');
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
      coverUrl: selectedBook.volumeInfo.imageLinks?.thumbnail || undefined,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    console.log('Kitap ekleniyor:', bookData);
    onAddBook(bookData);
    
    // Reset states
    setSelectedBook(null);
    setShowDateForm(false);
    setSearchQuery('');
    setSearchResults([]);
    setFormData({
      title: '',
      author: '',
      pages: '',
      dateRead: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      isCompleted: false,
      isFavorite: false
    });
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.pages) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    onAddBook({
      title: formData.title,
      author: formData.author,
      pages: parseInt(formData.pages),
      dateRead: formData.dateRead || null, // Boş string yerine null kullan
      startDate: formData.startDate,
      endDate: formData.endDate,
      isCompleted: formData.isCompleted,
      isFavorite: formData.isFavorite,
      dateAdded: new Date().toISOString().split('T')[0]
    });

    // Reset form
    setFormData({
      title: '',
      author: '',
      pages: '',
      dateRead: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      isCompleted: false,
      isFavorite: false
    });

    onClose();
  };

  const handleBackToSearch = () => {
    setSelectedBook(null);
    setShowDateForm(false);
  };

  useEffect(() => {
    console.log('showDateForm değişti:', showDateForm);
  }, [showDateForm]);

  useEffect(() => {
    console.log('selectedBook değişti:', selectedBook);
  }, [selectedBook]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Yeni Kitap Ekle</h2>
        
        {/* Date Form for Selected Book */}
        {showDateForm && selectedBook && (
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-3 mb-4">
              <div className="flex gap-3">
                {selectedBook.volumeInfo.imageLinks?.thumbnail && (
                  <img
                    src={selectedBook.volumeInfo.imageLinks.thumbnail}
                    alt={selectedBook.volumeInfo.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">
                    {selectedBook.volumeInfo.title}
                  </h4>
                  <p className="text-gray-300 text-xs">
                    {selectedBook.volumeInfo.authors?.join(', ') || 'Bilinmeyen Yazar'}
                  </p>
                  {selectedBook.volumeInfo.pageCount && (
                    <p className="text-gray-400 text-xs">
                      {selectedBook.volumeInfo.pageCount} sayfa
                    </p>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleDateFormSubmit} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Okuma Başlangıç Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Okuma Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isCompleted"
                  checked={formData.isCompleted}
                  onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isCompleted" className="ml-2 text-white text-sm">
                  Kitabı tamamladım
                </label>
              </div>

                              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-lg text-lg font-semibold"
                >
                  Kitabı Ekle
                </Button>
                <Button
                  type="button"
                  onClick={handleBackToSearch}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Geri
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Main Modal Content */}
        {!showDateForm && (
          <>
            {/* Tab Buttons */}
            <div className="flex mb-4 bg-gray-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'form'
                    ? 'bg-amber-400 text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Manuel Ekle
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'bg-amber-400 text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Arama Yap
              </button>
            </div>

            {/* Form Tab */}
            {activeTab === 'form' && (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Kitap Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                    placeholder="Kitap adını girin"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Yazar *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                    placeholder="Yazar adını girin"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Sayfa Sayısı *
                  </label>
                  <input
                    type="number"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                    placeholder="Sayfa sayısını girin"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Okuma Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Okuma Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isCompleted"
                    checked={formData.isCompleted}
                    onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isCompleted" className="ml-2 text-white text-sm">
                    Kitabı tamamladım
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFavorite"
                    checked={formData.isFavorite}
                    onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isFavorite" className="ml-2 text-white text-sm">
                    Favori kitabım
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-lg text-lg font-semibold"
                  >
                    Kitap Ekle
                  </Button>
                  <Button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    İptal
                  </Button>
                </div>
              </form>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="space-y-4">
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Kitap Ara
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                        placeholder="Kitap adı veya yazar girin"
                      />
                      <Button
                        type="submit"
                        disabled={isSearching}
                        className="bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
                      >
                        {isSearching ? 'Aranıyor...' : 'Ara'}
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white font-medium">Arama Sonuçları:</h3>
                    {searchResults.map((book) => (
                      <div
                        key={book.id}
                        className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                        onClick={() => handleSelectBook(book)}
                      >
                        <div className="flex gap-3">
                          {book.volumeInfo.imageLinks?.thumbnail && (
                            <img
                              src={book.volumeInfo.imageLinks.thumbnail}
                              alt={book.volumeInfo.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">
                              {book.volumeInfo.title}
                            </h4>
                            <p className="text-gray-300 text-xs">
                              {book.volumeInfo.authors?.join(', ') || 'Bilinmeyen Yazar'}
                            </p>
                            {book.volumeInfo.pageCount && (
                              <p className="text-gray-400 text-xs">
                                {book.volumeInfo.pageCount} sayfa
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <p className="text-gray-400 text-center py-4">
                    Kitap bulunamadı
                  </p>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    İptal
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
