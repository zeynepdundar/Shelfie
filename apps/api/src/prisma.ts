import { PrismaClient } from "@prisma/client";

import { env, hasDatabase } from "./env.js";
import { serviceUnavailable } from "./http-error.js";

/**
 * Prisma istemcisi ilk kullanımda kurulur. Böylece DATABASE_URL yokken de
 * sunucu açılır; yalnızca veritabanına dokunan istekler 503 döner.
 * Geliştirmede tsx watch her değişiklikte modülü yeniden yüklediği için
 * istemci globalThis üzerinde saklanır, yoksa bağlantı havuzu çoğalır.
 */
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

let client: PrismaClient | undefined = globalForPrisma.prisma;

export function getPrisma(): PrismaClient {
  if (!hasDatabase) {
    throw serviceUnavailable(
      "Veritabanı yapılandırılmamış. apps/api/.env içinde DATABASE_URL tanımlayın.",
    );
  }

  if (!client) {
    client = new PrismaClient({
      log: env.isProduction ? ["error"] : ["query", "warn", "error"],
    });
    if (!env.isProduction) globalForPrisma.prisma = client;
  }

  return client;
}

export async function disconnectPrisma() {
  await client?.$disconnect();
  client = undefined;
  globalForPrisma.prisma = undefined;
}
