import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  linkWithPopup,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

/* ============================================================================
   Kimlik doğrulama
   Üç yol var:
   1. Misafir (anonymous): kayıt formu olmadan hemen başlar. Firebase gerçek bir
      uid verir; Firestore kuralları bu uid ile çalışır.
   2. Google: tek tıkla kalıcı hesap.
   3. E-posta + şifre: yedek yol.
   Misafir kullanıcı Google ya da e-posta bağladığında (link) uid DEĞİŞMEZ;
   o ana kadar eklediği kitaplar yeni kalıcı hesapta aynen kalır.
   Hatalar Firebase hata koduyla (ör. "auth/invalid-credential") döner; metne
   çeviri arayüzde yapılır.
   ========================================================================== */

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  /** Misafir hesap mı? Kalıcı bir giriş yöntemi bağlanınca false olur. */
  isAnonymous: boolean;
  /** Bağlı giriş yöntemleri: "password", "google.com" */
  providers: string[];
}

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

function mapFirebaseUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    providers: user.providerData.map((provider) => provider.providerId),
  };
}

/** Firebase hata kodunu çıkarır; kod yoksa "auth/unknown". */
function errorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  // Firebase dışı bir hata: kodu yok, mesajını taşı ki kaybolmasın
  console.error("[auth]", error);
  return "auth/unknown";
}

function googleProvider() {
  const provider = new GoogleAuthProvider();
  // Tarayıcıda birden çok Google hesabı varsa her seferinde seçtir
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

/**
 * Bağlama sonrası profil boşsa sağlayıcıdaki ad/fotoğrafla doldurur.
 * Misafir hesaba Google bağlandığında Firebase adı kendiliğinden kopyalamaz.
 */
async function fillProfileFromProviders(user: User) {
  if (user.displayName && user.photoURL) return;
  const source = user.providerData.find((p) => p.displayName || p.photoURL);
  if (!source) return;
  await updateProfile(user, {
    displayName: user.displayName || source.displayName,
    photoURL: user.photoURL || source.photoURL,
  });
}

/** Kayıt formu olmadan misafir olarak başlar. */
export const continueAsGuest = createAsyncThunk(
  "auth/continueAsGuest",
  async (_, { rejectWithValue }) => {
    try {
      const result = await signInAnonymously(auth);
      return mapFirebaseUser(result.user);
    } catch (error) {
      return rejectWithValue(errorCode(error));
    }
  }
);

/**
 * Google ile devam eder.
 * Misafir oturum açıksa yeni hesap açmak yerine Google'ı bu hesaba bağlar:
 * uid ve kitaplar korunur. Google hesabı zaten başka bir Shelfie hesabına
 * bağlıysa "auth/credential-already-in-use" döner; arayüz bunu açıklar.
 */
export const signInWithGoogle = createAsyncThunk(
  "auth/signInWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const current = auth.currentUser;
      const result = current?.isAnonymous
        ? await linkWithPopup(current, googleProvider())
        : await signInWithPopup(auth, googleProvider());

      await fillProfileFromProviders(result.user);
      return mapFirebaseUser(result.user);
    } catch (error) {
      return rejectWithValue(errorCode(error));
    }
  }
);

export const signInWithEmailPassword = createAsyncThunk(
  "auth/signInWithEmailPassword",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return mapFirebaseUser(result.user);
    } catch (error) {
      return rejectWithValue(errorCode(error));
    }
  }
);

/**
 * E-postayla hesap oluşturur. Misafir oturum açıksa e-posta/şifreyi bu
 * hesaba bağlar (uid ve kitaplar korunur).
 */
export const signUpWithEmailPassword = createAsyncThunk(
  "auth/signUpWithEmailPassword",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const current = auth.currentUser;
      const result = current?.isAnonymous
        ? await linkWithCredential(
            current,
            EmailAuthProvider.credential(email, password)
          )
        : await createUserWithEmailAndPassword(auth, email, password);

      return mapFirebaseUser(result.user);
    } catch (error) {
      return rejectWithValue(errorCode(error));
    }
  }
);

/** Şifre sıfırlama e-postası gönderir. Oturumu değiştirmez. */
export const sendPasswordReset = createAsyncThunk(
  "auth/sendPasswordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      return rejectWithValue(errorCode(error));
    }
  }
);

/**
 * Görünen adı Firebase profilinde günceller.
 * onAuthStateChanged bu değişiklikte tetiklenmediği için dönen değerle
 * store'daki kullanıcı elle tazelenir.
 */
export const updateDisplayName = createAsyncThunk(
  "auth/updateDisplayName",
  async (displayName: string, { rejectWithValue }) => {
    try {
      const current = auth.currentUser;
      if (!current) throw new Error("Oturum bulunamadı");

      const trimmed = displayName.trim();
      await updateProfile(current, { displayName: trimmed || null });

      return trimmed || null;
    } catch (err: any) {
      return rejectWithValue(err?.message || "Görünen ad güncellenemedi");
    }
  }
);

export const signOutUser = createAsyncThunk("auth/signOutUser", async () => {
  await signOut(auth);
  return null;
});

/* Oturum açan/bağlayan thunk'lar aynı şekilde işlenir.
   pending'de status "loading" YAPILMAZ: HomeLayout loading'de sayfayı
   yükleniyor ekranıyla değiştirir; giriş formu kaybolur, hata gösterilemezdi.
   Bekleme durumunu formun kendisi tutar. */
const sessionThunks = [
  continueAsGuest,
  signInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword,
] as const;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "unauthenticated";
      state.error = null;
    },
    setStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    for (const thunk of sessionThunks) {
      builder
        .addCase(thunk.pending, (state) => {
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          if (!action.payload) return;
          state.user = action.payload;
          state.status = "authenticated";
        })
        .addCase(thunk.rejected, (state, action) => {
          // Mevcut oturum (ör. misafir) olduğu gibi kalır
          state.error = (action.payload as string) || "auth/unknown";
        });
    }

    builder
      .addCase(updateDisplayName.pending, (state) => {
        state.error = null;
      })
      .addCase(updateDisplayName.fulfilled, (state, action) => {
        if (state.user) state.user.displayName = action.payload;
      })
      .addCase(updateDisplayName.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Görünen ad güncellenemedi";
      })
      .addCase(signOutUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      });
  },
});

export const { setUser, setStatus, setError } = authSlice.actions;
export { mapFirebaseUser };
export default authSlice.reducer;
