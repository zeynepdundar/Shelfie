'use client';

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function UserInfo() {
  const user = useSelector((state: RootState) => state.auth.user);
  const status = useSelector((state: RootState) => state.auth.status);
  const error = useSelector((state: RootState) => state.auth.error);

  if (status === 'loading') {
    return (
      <Card>
        <CardContent className="p-4">
          <p>Yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Giriş Yapılmamış</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Lütfen giriş yapın.</p>
          {error && <p className="text-red-500 mt-2">Hata: {error}</p>}
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-4">
          <p>Kullanıcı bilgisi bulunamadı.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kullanıcı Bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">E-posta:</span>
          <span>{user.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Kullanıcı ID:</span>
          <span className="text-sm text-gray-600">{user.uid}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Görünen Ad:</span>
          <span>{user.displayName || 'Belirtilmemiş'}</span>
        </div>
        {user.photoURL && (
          <div className="flex justify-between items-center">
            <span className="font-medium">Profil Fotoğrafı:</span>
            <img 
              src={user.photoURL} 
              alt="Profil" 
              className="w-8 h-8 rounded-full"
            />
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-medium">Durum:</span>
          <span className="text-green-600 font-medium">Giriş Yapıldı</span>
        </div>
      </CardContent>
    </Card>
  );
}
