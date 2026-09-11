# @shelfie/mobile

Henüz kurulmadı. Expo uygulaması buraya gelecek.

Kurulduğunda:

```bash
pnpm create expo-app apps/mobile --template
```

Paket adı `@shelfie/mobile` olmalı ve `@shelfie/types` bağımlılığı
`workspace:*` olarak eklenmeli — web ve api ile aynı tip tanımlarını
kullanabilmesi için.

Kök dizindeki `.npmrc` zaten `node-linker=hoisted` içeriyor; Expo'nun metro
bundler'ı pnpm'in sembolik linkli düzeniyle sorun yaşamasın diye.
