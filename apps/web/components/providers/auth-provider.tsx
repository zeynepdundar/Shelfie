"use client";

import { useEffect, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { useAppDispatch } from "@/lib/hooks";
import { mapFirebaseUser, setStatus, setUser } from "@/lib/authSlice";

/**
 * Firebase oturumunu store'a bağlar.
 *
 * Bu olmadan oturum yalnızca giriş/çıkış thunk'larıyla değişirdi: sayfa
 * yenilendiğinde Firebase'de kayıtlı oturum dururken uygulama kullanıcıyı
 * çıkış yapmış sayardı.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setStatus("loading"));

    return onAuthStateChanged(auth, (firebaseUser) => {
      dispatch(setUser(mapFirebaseUser(firebaseUser)));
    });
  }, [dispatch]);

  return <>{children}</>;
}
