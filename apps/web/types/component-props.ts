import { ReactNode } from "react";
import { AuthUser } from "@/lib/authSlice";
import type { Book } from "@shelfie/types";

export interface HomeLayoutProps {
  children: ReactNode;
  isAuthenticated: boolean;
  showLogin: boolean;
}

export interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export interface OverviewPageProps {
  user: AuthUser | null;
}

export interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: Omit<Book, 'id'>) => void;
  /** Modal "sonra okumak istiyorum" işaretli açılsın. */
  defaultWantToRead?: boolean;
}
