/** requireAuth doğrulamayı geçen isteklere kullanıcıyı ekler. */
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string | null;
        displayName: string | null;
        photoUrl: string | null;
      };
    }
  }
}

export {};
