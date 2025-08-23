'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Book {
  id: string;
  title: string;
  author: string;
  pages: number;
  dateRead?: string;
  isCompleted: boolean;
}

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: Omit<Book, 'id'>) => void;
}

export function AddBookModal({ isOpen, onClose, onAddBook }: AddBookModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    pages: '',
    dateRead: new Date().toISOString().split('T')[0],
    isCompleted: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.pages) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    onAddBook({
      title: formData.title,
      author: formData.author,
      pages: parseInt(formData.pages),
      dateRead: formData.dateRead,
      isCompleted: formData.isCompleted
    });

    // Reset form
    setFormData({
      title: '',
      author: '',
      pages: '',
      dateRead: new Date().toISOString().split('T')[0],
      isCompleted: false
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Yeni Kitap Ekle</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              Okuma Tarihi
            </label>
            <input
              type="date"
              value={formData.dateRead}
              onChange={(e) => setFormData({ ...formData, dateRead: e.target.value })}
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
      </div>
    </div>
  );
}
