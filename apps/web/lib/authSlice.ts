import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
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
  };
}

export const signInWithEmailPassword = createAsyncThunk(
  "auth/signInWithEmailPassword",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return mapFirebaseUser(res.user);
    } catch (err: any) {
      return rejectWithValue(err?.message || "Giriş başarısız");
    }
  }
);

export const signUpWithEmailPassword = createAsyncThunk(
  "auth/signUpWithEmailPassword",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      return mapFirebaseUser(res.user);
    } catch (err: any) {
      return rejectWithValue(err?.message || "Kayıt başarısız");
    }
  }
);

export const signOutUser = createAsyncThunk("auth/signOutUser", async () => {
  await signOut(auth);
  return null;
});

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
    builder
      .addCase(signInWithEmailPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signInWithEmailPassword.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? "authenticated" : "unauthenticated";
      })
      .addCase(signInWithEmailPassword.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = (action.payload as string) || "Giriş başarısız";
      })
      .addCase(signUpWithEmailPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signUpWithEmailPassword.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? "authenticated" : "unauthenticated";
      })
      .addCase(signUpWithEmailPassword.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = (action.payload as string) || "Kayıt başarısız";
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
