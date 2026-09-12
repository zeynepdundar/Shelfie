# @shelfie/api

Shelfie'nin backend'i. Express 5 + TypeScript, veri katmanı Prisma + PostgreSQL,
kimlik doğrulama Firebase ID token'ları üzerinden.

## Çalıştırma

```bash
cp apps/api/.env.example apps/api/.env
pnpm --filter @shelfie/api dev        # http://localhost:4000
```

Sunucu veritabanı ve Firebase kimlik bilgileri **olmadan da açılır**. Prisma
istemcisi ve Firebase uygulaması ilk kullanımda kurulur; eksik yapılandırma
sunucuyu düşürmez, yalnızca ilgili istek `503` döner. `GET /health` hangi
bağımlılığın hazır olduğunu söyler.

## Veritabanı

```bash
docker compose up -d                  # repo kökünde, yerel Postgres
pnpm --filter @shelfie/api db:migrate # şemayı uygula
pnpm --filter @shelfie/api db:studio  # Prisma Studio
```

Şema `prisma/schema.prisma` içinde: `User` (id = Firebase uid), `Book`, `Quote`.
Kitap silinince alıntıları da silinir (`onDelete: Cascade`).

## Kimlik doğrulama

Her `/api/*` isteği `Authorization: Bearer <firebase id token>` bekler. Token
doğrulanır, `req.user` doldurulur ve bütün sorgular `userId` ile daraltılır —
bir kullanıcı başkasının kaydını göremez.

Yerel geliştirmede servis hesabı olmadan denemek için `.env` içine
`DEV_USER_ID=test-user` yazmak yeterli; token aranmaz. `NODE_ENV=production`
iken bu ayar yok sayılır.

## Uçlar

| Metot | Yol | Açıklama |
| --- | --- | --- |
| GET | `/health` | Durum ve bağımlılık kontrolü (auth istemez) |
| GET | `/api/books` | Kitapları listeler. `?status=all\|completed\|inProgress\|wantToRead`, `?favorite=true\|false` |
| POST | `/api/books` | Kitap ekler |
| GET | `/api/books/:bookId` | Tek kitap (alıntılarıyla) |
| PATCH | `/api/books/:bookId` | Kitabı günceller |
| DELETE | `/api/books/:bookId` | Kitabı siler |
| GET | `/api/books/:bookId/quotes` | Alıntıları listeler |
| POST | `/api/books/:bookId/quotes` | Alıntı ekler |
| PATCH | `/api/books/:bookId/quotes/:quoteId` | Alıntıyı günceller |
| DELETE | `/api/books/:bookId/quotes/:quoteId` | Alıntıyı siler |

Gövdeler zod ile doğrulanır; hatalı istek `400` ve alan bazlı hata listesi döner.

## Durum

Web uygulaması kitap verisini hâlâ doğrudan Firestore'dan okuyor. Bir sonraki
adım `booksSlice`'ı bu uçlara bağlamak.
