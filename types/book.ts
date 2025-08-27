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
  bookTitle?: string;
  bookAuthor?: string;
}

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    pageCount?: number;
    imageLinks?: {
      thumbnail?: string;
    };
  };
}
