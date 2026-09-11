/** Ortam değişkenleri tek yerden okunur; eksikse makul varsayılana düşer. */
export const env = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
} as const;
