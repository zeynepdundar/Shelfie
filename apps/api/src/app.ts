import express, { type Express } from "express";
import cors from "cors";

import { env } from "./env.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { healthRouter } from "./routes/health.js";
import { booksRouter } from "./routes/books.js";

/**
 * Uygulamayı kurar ama dinlemeye başlamaz — testlerde de aynı örnek kullanılır.
 * Veritabanı ve Firebase bağlantıları tembel olduğu için burada hiçbir dış
 * servise bağlanılmaz.
 */
export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json({ limit: "1mb" }));

  app.use(healthRouter);
  app.use("/api/books", requireAuth, booksRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
