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
  dateRead?: string;
  dateAdded: string;
  coverUrl?: string;
}
