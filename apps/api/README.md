# @shelfie/api

Shelfie'nin Node.js backend'i. Fastify + TypeScript.

## Çalıştırma

```bash
pnpm --filter @shelfie/api dev     # tsx watch ile 4000 portunda
```

`.env.example` dosyasını `.env` olarak kopyalayıp portu ve izinli origin'leri
ayarlayabilirsin.

## Durum

Şu anda yalnızca iskelet var:

- `GET /health` — çalışıyor
- `GET /api/books` — boş dizi döner
- `GET /api/books/:id` — 501

Web uygulaması kitap verisini hâlâ doğrudan Firestore'dan okuyor. Veri erişimi
buraya taşındığında istek/yanıt tipleri `@shelfie/types` paketinden gelecek,
yani sözleşme web ile ortak.
