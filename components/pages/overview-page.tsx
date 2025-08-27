'use client';
import { MyChart } from "@/components/books/Chartx";
import { AuthUser } from "@/lib/authSlice";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AddBookModal } from "@/components/books/AddBookModal";
import { Book } from "@/types/book";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addBook, fetchUserBooks, updateBook } from "@/lib/booksSlice";
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OverviewPageProps {
  user: AuthUser | null;
}

export function OverviewPage({ user }: OverviewPageProps) {
  const t = useTranslations('overview');
  const navT = useTranslations('nav');

  const dispatch = useAppDispatch();
  const { books, status, error } = useAppSelector((state) => state.books);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [coverCache, setCoverCache] = useState<Record<string, string>>({});

  // Google Books API anahtarınızı buraya ekleyin
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';

  // Kullanıcı giriş yaptığında kitapları getir
  useEffect(() => {
    if (user) {
      dispatch(fetchUserBooks());
    }
  }, [user, dispatch]);

  // Fetch cover images for books without covers
  useEffect(() => {
    if (books.length > 0 && apiKey) {
      books.forEach(book => {
        if (!book.coverUrl && !coverCache[book.id]) {
          fetchBookCover(book.title, book.author, book.id);
        }
      });
    }
  }, [books, apiKey]);

  const fetchBookCover = async (title: string, author: string, bookId: string) => {
    try {
      const searchQuery = `${title} ${author}`;
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&key=${apiKey}&maxResults=1`
      );
      const data = await response.json();
      
      if (data.items && data.items[0]?.volumeInfo?.imageLinks?.thumbnail) {
        const coverUrl = data.items[0].volumeInfo.imageLinks.thumbnail;
        
        // Cache the cover URL
        setCoverCache(prev => ({
          ...prev,
          [bookId]: coverUrl
        }));

        // Update the book in the database with the cover URL
        dispatch(updateBook({
          bookId,
          updates: { coverUrl }
        }));
      }
    } catch (error) {
      console.error('Cover image fetch error:', error);
    }
  };

  const handleAddBook = () => {
    setShowAddBookModal(true);
  };

  const handleAddBookSubmit = async (newBook: Omit<Book, 'id' | 'dateAdded'>) => {
    try {
      await dispatch(addBook(newBook)).unwrap();
      setShowAddBookModal(false);
    } catch (error) {
      console.error('Kitap eklenirken hata oluştu:', error);
    }
  };

  const toggleFavorite = async (bookId: string, currentFavorite: boolean) => {
    try {
      await dispatch(updateBook({ 
        bookId, 
        updates: { isFavorite: !currentFavorite } 
      }));
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  const getMonthlyReadBooks = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    

    const monthlyBooks = books.filter(book => {
      
      const dateToCheck = book.dateRead || book.dateAdded;
      
      if (!dateToCheck) {
        return false;
      }
      
      const bookDate = new Date(dateToCheck);
      
      // Geçersiz tarih kontrolü
      if (isNaN(bookDate.getTime())) {
        return false;
      }
      
      const bookMonth = bookDate.getMonth();
      const bookYear = bookDate.getFullYear();
      const isCurrentMonth = bookMonth === currentMonth && bookYear === currentYear;
      
      
      const shouldInclude = book.isCompleted && isCurrentMonth;
      
      return shouldInclude;
    });
  
    
    return monthlyBooks;
  };

  const monthlyBooks = getMonthlyReadBooks();
  const totalPagesRead = books.filter(book => book.isCompleted).reduce((sum, book) => sum + book.pages, 0);

  // Loading State - use same spinner as treasures page
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Soft radial overlays that don't cover entire page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.35),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-24 h-64 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.22),transparent_70%)]"
      />
      <div className="text-center w-full">
      <h1 className="text-4xl font-bold text-white mb-4">
        {t('welcome', { email: user?.email || '' })}
      </h1>
      <p className="text-xl text-gray-200 mb-6">
        {t('subtitle')}
      </p>

      {/* Add Book Button */}
      <div className="mb-8">
        <Button
          onClick={handleAddBook}
          className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-lg text-lg font-semibold"
        >
          {/* nav.addBook burada yeterli */}
          {navT('addBook')}
        </Button>
      </div>



      {/* Error State */}
      {status === "failed" && (
        <div className="text-center mb-8">
          <p className="text-red-400">Hata: {error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">{t('stats.totalBooks')}</h3>
          <p className="text-3xl font-bold text-amber-400">{books.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">{t('stats.readThisMonth')}</h3>
          <p className="text-3xl font-bold text-green-400">{monthlyBooks.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">{t('stats.totalPages')}</h3>
          <p className="text-3xl font-bold text-blue-400">{totalPagesRead}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">{t('stats.favoriteBooks')}</h3>
          <p className="text-3xl font-bold text-red-400">{books.filter(book => book.isFavorite).length}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">{t('yearlyStats')}</h3>
        <MyChart />
      </div>

      {/* Recent Books Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">{t('recentBooks')}</h3>

        {books.length === 0 ? (
          <p className="text-gray-300">{t('noBooks')}</p>
        ) : (
          <div className="w-full">
            {/* Header */}
            <div className="hidden md:grid grid-cols-8 gap-4 text-left text-gray-200 text-sm pb-3 border-b border-white/20">
              <div>{t('cover')}</div>
              <div>{t('title')}</div>
              <div>{t('author')}</div>
              <div>{t('pages')}</div>
              <div>{t('startDate')}</div>
              <div>{t('endDate')}</div>
              <div>{t('status')}</div>
              <div>{t('favorite')}</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/10">
              {books.slice(0, 10).map((b) => {
                const coverUrl = b.coverUrl || coverCache[b.id];
                
                return (
                  <div
                    key={b.id}
                    className="grid grid-cols-1 md:grid-cols-8 gap-2 md:gap-4 py-3 text-white"
                  >
                    <div className="flex items-center justify-center">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={`${b.title} kapak`}
                          className="w-12 h-16 object-cover rounded shadow-md"
                          onError={(e) => {
                            // Fallback to a default book icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-600 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      {/* Fallback icon (hidden by default) */}
                      <div className="w-12 h-16 bg-gray-600 rounded flex items-center justify-center hidden">
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="font-medium">{b.title}</div>
                    <div className="text-gray-200">{b.author}</div>
                    <div className="text-gray-200">{b.pages}</div>
                    <div className="text-gray-300">
                      {b.startDate ? new Date(b.startDate).toLocaleDateString('tr-TR') : "-"}
                    </div>
                    <div className="text-gray-300">
                      {b.endDate ? new Date(b.endDate).toLocaleDateString('tr-TR') : "-"}
                    </div>
                    <div className={b.isCompleted ? "text-green-400" : "text-amber-300"}>
                      {b.isCompleted ? t('status.completed') : t('status.inProgress')}
                    </div>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => toggleFavorite(b.id, b.isFavorite || false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title={b.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart 
                          className={`h-5 w-5 ${
                            b.isFavorite 
                              ? 'text-red-500 fill-current' 
                              : 'text-gray-400 hover:text-red-400'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {/* Mobile view - show favorites below book info */}
                    <div className="md:hidden col-span-1 mt-2 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Favori:</span>
                        <button
                          onClick={() => toggleFavorite(b.id, b.isFavorite || false)}
                          className="p-1 hover:bg-white/10 rounded-full transition-colors"
                          title={b.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart 
                            className={`h-4 w-4 ${
                              b.isFavorite 
                                ? 'text-red-500 fill-current' 
                                : 'text-gray-400 hover:text-red-400'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      {showAddBookModal && (
        <AddBookModal
          isOpen={showAddBookModal}
          onClose={() => setShowAddBookModal(false)}
          onAddBook={handleAddBookSubmit}
        />
      )}
      </div>
    </div>
  );
}
