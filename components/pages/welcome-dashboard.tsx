'use client';
import { MyChart } from "@/components/books/chartx";
import { AuthUser } from "@/lib/authSlice";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AddBookModal } from "@/components/books/add-book-modal";
import { Book } from "@/types/book";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addBook, fetchUserBooks } from "@/lib/booksSlice";

interface WelcomeDashboardProps {
  user: AuthUser | null;
}

export function WelcomeDashboard({ user }: WelcomeDashboardProps) {
  const dispatch = useAppDispatch();
  const { books, status, error } = useAppSelector((state) => state.books);
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  // Kullanıcı giriş yaptığında kitapları getir
  useEffect(() => {
    if (user) {
      dispatch(fetchUserBooks());
    }
  }, [user, dispatch]);

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

  const getMonthlyReadBooks = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    

    const monthlyBooks = books.filter(book => {
      
      const dateToCheck = book.dateRead || book.dateAdded;
      
      if (!dateToCheck) {
        return false;
      }
      
      const bookDate = new Date(dateToCheck);
      console.log('Parsed book date:', bookDate);
      
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

  return (
    <div className="text-center w-full max-w-6xl">
      <h1 className="text-4xl font-bold text-white mb-4">
        Hoş geldin, {user?.email}!
      </h1>
      <p className="text-xl text-gray-200 mb-6">
        Okuma yolculuğuna devam etmek için kitaplarını yönet.
      </p>

      {/* Add Book Button */}
      <div className="mb-8">
        <Button
          onClick={handleAddBook}
          className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-lg text-lg font-semibold"
        >
          + Kitap Ekle
        </Button>
      </div>

      {/* Loading State */}
      {status === "loading" && (
        <div className="text-center mb-8">
          <p className="text-white">Yükleniyor...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Toplam Kitap</h3>
          <p className="text-3xl font-bold text-blue-400">{books.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Bu Ay Okunan</h3>
          <p className="text-3xl font-bold text-green-400">{monthlyBooks.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-2">Toplam Sayfa</h3>
          <p className="text-3xl font-bold text-purple-400">{totalPagesRead}</p>
        </div>
      </div>

      {/* Monthly Reading Chart */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Aylık Okuma Grafiği</h2>
        <MyChart />
      </div>

      {/* Books Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h2 className="text-2xl font-semibold text-white mb-4">Kitap Listesi</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-white font-semibold p-3">Kitap Adı</th>
                <th className="text-white font-semibold p-3">Yazar</th>
                <th className="text-white font-semibold p-3">Sayfa</th>
                <th className="text-white font-semibold p-3">Okuma Tarihi</th>
                <th className="text-white font-semibold p-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="text-gray-200 p-3">{book.title}</td>
                  <td className="text-gray-200 p-3">{book.author}</td>
                  <td className="text-gray-200 p-3">{book.pages}</td>
                  <td className="text-gray-200 p-3">
                    {new Date(book.dateRead || '').toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      book.isCompleted 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {book.isCompleted ? 'Tamamlandı' : 'Devam Ediyor'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={showAddBookModal}
        onClose={() => setShowAddBookModal(false)}
        onAddBook={handleAddBookSubmit}
      />
    </div>
  );
}
