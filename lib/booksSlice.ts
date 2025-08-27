import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { auth } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publishedYear?: number;
  genre?: string;
  rating?: number;
  notes?: string;
  isCompleted: boolean;
  pages: number;
  dateRead?: string | null;
  startDate?: string;
  endDate?: string;
  dateAdded: string;
  coverUrl?: string;
  isFavorite?: boolean;
  quotes?: Quote[];
}

export interface Quote {
  id: string;
  text: string;
  page?: number;
  dateAdded: string;
  notes?: string;
}

interface BooksState {
  books: Book[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: BooksState = {
  books: [],
  status: "idle",
  error: null,
};

// Kitap ekleme
export const addBook = createAsyncThunk(
  "books/addBook",
  async (bookData: Omit<Book, "id" | "dateAdded">, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Kullanıcı giriş yapmamış");
      }

      const bookId = Date.now().toString();
      const newBook: Book = {
        ...bookData,
        id: bookId,
        dateAdded: new Date().toISOString(),
      };

      const userBookRef = doc(db, "users", user.uid, "books", bookId);
      await setDoc(userBookRef, newBook);

      return newBook;
    } catch (err: any) {
      return rejectWithValue(err?.message || "Kitap eklenemedi");
    }
  }
);

// Kullanıcının kitaplarını getirme
export const fetchUserBooks = createAsyncThunk(
  "books/fetchUserBooks",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Kullanıcı giriş yapmamış");
      }

      const booksRef = collection(db, "users", user.uid, "books");
      const querySnapshot = await getDocs(booksRef);
      
      const books: Book[] = [];
      querySnapshot.forEach((doc) => {
        books.push(doc.data() as Book);
      });

      return books;
    } catch (err: any) {
      return rejectWithValue(err?.message || "Kitaplar getirilemedi");
    }
  }
);

// Kitap güncelleme
export const updateBook = createAsyncThunk(
  "books/updateBook",
  async ({ bookId, updates }: { bookId: string; updates: Partial<Book> }, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Kullanıcı giriş yapmamış");
      }

      const bookRef = doc(db, "users", user.uid, "books", bookId);
      await updateDoc(bookRef, updates);

      return { bookId, updates };
    } catch (err: any) {
      return rejectWithValue(err?.message || "Kitap güncellenemedi");
    }
  }
);

// Kitap silme
export const deleteBook = createAsyncThunk(
  "books/deleteBook",
  async (bookId: string, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Kullanıcı giriş yapmamış");
      }

      const bookRef = doc(db, "users", user.uid, "books", bookId);
      await deleteDoc(bookRef);

      return bookId;
    } catch (err: any) {
      return rejectWithValue(err?.message || "Kitap silinemedi");
    }
  }
);

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    clearBooks(state) {
      state.books = [];
      state.status = "idle";
      state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Book
      .addCase(addBook.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.books.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(addBook.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Kitap eklenemedi";
      })
      // Fetch Books
      .addCase(fetchUserBooks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserBooks.fulfilled, (state, action) => {
        state.books = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchUserBooks.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Kitaplar getirilemedi";
      })
      // Update Book
      .addCase(updateBook.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        const { bookId, updates } = action.payload;
        const bookIndex = state.books.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
          state.books[bookIndex] = { ...state.books[bookIndex], ...updates };
        }
        state.status = "succeeded";
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Kitap güncellenemedi";
      })
      // Delete Book
      .addCase(deleteBook.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = state.books.filter(book => book.id !== action.payload);
        state.status = "succeeded";
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Kitap silinemedi";
      });
  },
});

export const { clearBooks, setError } = booksSlice.actions;
export default booksSlice.reducer;
