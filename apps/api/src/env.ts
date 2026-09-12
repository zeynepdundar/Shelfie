/**
 * Ortam değişkenleri tek yerden okunur. Hiçbiri zorunlu değil — API veritabanı
 * ve Firebase kimlik bilgileri olmadan da ayağa kalkar, eksik olan yalnızca o
 * bağımlılığa ihtiyaç duyan istekte hata döndürür.
 */
const isProduction = process.env.NODE_ENV === "production";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction,
  port: Number(process.env.PORT ?? 4000),

  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  databaseUrl: process.env.DATABASE_URL ?? "",

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
    // .env içinde tek satır olsun diye \n kaçışlı yazılır
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  },

  /**
   * Yerel geliştirmede Firebase kimlik bilgisi olmadan çalışabilmek için.
   * Üretimde bilerek yok sayılır.
   */
  devUserId: isProduction ? "" : (process.env.DEV_USER_ID ?? ""),
} as const;

export const hasFirebaseCredentials = Boolean(
  env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey,
);

export const hasDatabase = Boolean(env.databaseUrl);
