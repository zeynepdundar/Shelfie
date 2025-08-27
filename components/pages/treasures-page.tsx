'use client';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { fetchUserBooks, updateBook } from '@/lib/booksSlice';
import { Book, Quote } from '@/types/book';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Quote as QuoteIcon, Star, BookOpen, Plus, X } from 'lucide-react';
import { AuthUser } from "@/lib/authSlice";

interface TreasuresPageProps {
  user: AuthUser | null;
}

export function TreasuresPage({ user }: TreasuresPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { books, status } = useSelector((state: RootState) => state.books);
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [quoteText, setQuoteText] = useState('');
  const [quotePage, setQuotePage] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');

  useEffect(() => {
    if (user) {
      dispatch(fetchUserBooks());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (books.length > 0) {
      const favorites = books.filter(book => book.isFavorite);
      setFavoriteBooks(favorites);
      
      const quotes = books
        .filter(book => book.quotes && book.quotes.length > 0)
        .flatMap(book => 
          book.quotes!.map(quote => ({
            ...quote,
            bookTitle: book.title,
            bookAuthor: book.author
          }))
        );
      setAllQuotes(quotes);
    }
  }, [books]);

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

  const addQuote = async () => {
    if (!selectedBook || !quoteText.trim()) return;

    const newQuote: Quote = {
      id: Date.now().toString(),
      text: quoteText.trim(),
      page: quotePage ? parseInt(quotePage) : undefined,
      dateAdded: new Date().toISOString(),
      notes: quoteNotes.trim() || undefined,
    };

    const updatedQuotes = [...(selectedBook.quotes || []), newQuote];

    try {
      await dispatch(updateBook({ 
        bookId: selectedBook.id, 
        updates: { quotes: updatedQuotes } 
      }));
      
      // Reset form
      setQuoteText('');
      setQuotePage('');
      setQuoteNotes('');
      setSelectedBook(null);
      setShowQuoteForm(false);
    } catch (error) {
      console.error('Error adding quote:', error);
    }
  };

  const openQuoteForm = (book: Book) => {
    setSelectedBook(book);
    setShowQuoteForm(true);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Gentle radial glow layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_400px_at_20%_15%,rgba(255,200,150,0.35),transparent_70%)]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-800 mb-4">
            📚 Your Literary Treasures
          </h1>
          <p className="text-lg text-amber-700">
            Discover your favorite books and the quotes that touched your soul
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Favorite Books Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="h-8 w-8 text-red-500 fill-current" />
              <h2 className="text-2xl font-bold text-amber-800">Favorite Books</h2>
            </div>
            
            {favoriteBooks.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                    <p className="text-amber-600 text-lg">
                      No favorite books yet. Start reading and mark your favorites!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {favoriteBooks.map((book) => (
                  <Card key={book.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                            <Heart className="h-5 w-5 text-red-500 fill-current" />
                            {book.title}
                          </CardTitle>
                          <CardDescription className="text-amber-600">
                            by {book.author}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {book.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-amber-700">{book.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-amber-600">
                        {book.genre && (
                          <span className="bg-amber-100 px-2 py-1 rounded-full">
                            {book.genre}
                          </span>
                        )}
                        {book.publishedYear && (
                          <span>{book.publishedYear}</span>
                        )}
                        {book.pages && (
                          <span>{book.pages} pages</span>
                        )}
                      </div>
                      {book.notes && (
                        <p className="mt-3 text-amber-700 text-sm italic">
                          "{book.notes}"
                        </p>
                      )}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => openQuoteForm(book)}
                          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add Quote
                        </button>
                        <button
                          onClick={() => toggleFavorite(book.id, book.isFavorite || false)}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Remove from Favorites
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quotes Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <QuoteIcon className="h-8 w-8 text-blue-500" />
              <h2 className="text-2xl font-bold text-amber-800">Memorable Quotes</h2>
            </div>
            
            {allQuotes.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <QuoteIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-amber-600 text-lg">
                      No quotes saved yet. Start collecting your favorite passages!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {allQuotes.map((quote) => (
                  <Card key={quote.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <blockquote className="text-lg text-amber-800 italic mb-4">
                        "{quote.text}"
                      </blockquote>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-amber-600">
                          <p className="font-medium">{quote.bookTitle}</p>
                          <p>by {quote.bookAuthor}</p>
                        </div>
                        <div className="text-right text-amber-500">
                          {quote.page && <p>Page {quote.page}</p>}
                          <p>{new Date(quote.dateAdded).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {quote.notes && (
                        <p className="mt-3 text-amber-700 text-sm">
                          Note: {quote.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quote Form Modal */}
        {showQuoteForm && selectedBook && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Add Quote to "{selectedBook.title}"
                  <button
                    onClick={() => setShowQuoteForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Text *
                  </label>
                  <textarea
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter your favorite quote..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page (optional)
                    </label>
                    <input
                      type="number"
                      value={quotePage}
                      onChange={(e) => setQuotePage(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Page number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your thoughts..."
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={addQuote}
                    disabled={!quoteText.trim()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Save Quote
                  </button>
                  <button
                    onClick={() => setShowQuoteForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-12">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-amber-800">{favoriteBooks.length}</div>
                  <div className="text-amber-600">Favorite Books</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">{allQuotes.length}</div>
                  <div className="text-blue-600">Saved Quotes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{books.length}</div>
                  <div className="text-green-600">Total Books</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
