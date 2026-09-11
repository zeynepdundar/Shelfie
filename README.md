# Shelfie

Okuma takip uygulaması. Monorepo olarak pnpm workspaces ile yönetiliyor.

```
apps/
  web/        Next.js 15 uygulaması (mevcut arayüz)
  api/        Node.js backend — Fastify + TypeScript
  mobile/     Expo uygulaması (henüz kurulmadı)
packages/
  types/      Book, Quote, GoogleBook — üç uygulamanın paylaştığı tipler
```

## Kurulum

```bash
pnpm install          # kökten, bütün workspace'ler için
```

## Çalıştırma

```bash
pnpm dev:web          # Next.js — http://localhost:3000
pnpm dev:api          # Fastify  — http://localhost:4000

pnpm build            # bütün paketleri derler
pnpm typecheck        # bütün paketleri tip kontrolünden geçirir
```

Tek bir workspace'e komut göndermek için:

```bash
pnpm --filter @shelfie/web <komut>
```

## Notlar

- Paylaşılan tipler `@shelfie/types` paketinden gelir. Paket derlenmiş çıktı
  değil doğrudan TypeScript kaynağı yayınlar; içinde çalışma zamanı kodu
  olmadığı için Next ve Node bunu ek ayar olmadan kullanabiliyor. İleride
  pakete çalışma zamanı kodu girerse web tarafında `transpilePackages`
  gerekecek.
- `.npmrc` içindeki `node-linker=hoisted`, Expo/React Native'in sembolik
  linklerle sorun yaşamaması için baştan ayarlandı.
