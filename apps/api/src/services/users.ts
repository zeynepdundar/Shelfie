import { getPrisma } from "../prisma.js";

type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
};

/**
 * Kullanıcı kaydı Firebase'de oluşuyor; Postgres tarafında ilk yazma anında
 * açılır. Kitap eklerken yabancı anahtar hatası almamak için çağrılır.
 */
export async function ensureUser(user: AuthUser) {
  return getPrisma().user.upsert({
    where: { id: user.uid },
    create: {
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
    },
    update: {
      email: user.email ?? undefined,
      displayName: user.displayName ?? undefined,
      photoUrl: user.photoUrl ?? undefined,
    },
  });
}
