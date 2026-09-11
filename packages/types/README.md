# @shelfie/types

Web, API ve mobil uygulamaların paylaştığı tip tanımları: `Book`, `Quote`,
`GoogleBook`.

Derlenmiş çıktı üretmez — `main` ve `types` doğrudan `src/index.ts`'i
gösterir. İçinde yalnızca tip tanımı olduğu için çalışma zamanında hiçbir şey
paketlenmez.

Kullanımı:

```ts
import type { Book } from "@shelfie/types";
```
