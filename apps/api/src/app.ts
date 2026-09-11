import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";

import { env } from "./env.js";
import { healthRoutes } from "./routes/health.js";
import { bookRoutes } from "./routes/books.js";

/**
 * Uygulamayı kurar ama dinlemeye başlamaz — böylece testlerde de
 * aynı örnek kullanılabilir.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: env.corsOrigins });

  await app.register(healthRoutes);
  await app.register(bookRoutes, { prefix: "/api/books" });

  return app;
}
