import { Router } from "express";

import { currentUser } from "../middleware/auth.js";
import { param } from "../middleware/params.js";
import { parseBody, requireJson } from "../middleware/validate.js";
import { notFound } from "../http-error.js";
import { getPrisma } from "../prisma.js";
import {
  bookQuerySchema,
  createBookSchema,
  updateBookSchema,
} from "../schemas/book.js";
import { ensureUser } from "../services/users.js";
import { quotesRouter } from "./quotes.js";

export const booksRouter = Router();

/** Listelemede kullanılan filtre. userId her zaman var — sahiplik buradan gelir. */
type BookFilter = {
  userId: string;
  isCompleted?: boolean;
  wantToRead?: boolean;
  isFavorite?: boolean;
};

/** Kitap yalnızca sahibine görünür; her sorgu userId ile daraltılır. */
function ownedBook(userId: string, bookId: string) {
  return { id: bookId, userId };
}

const withQuotes = { quotes: { orderBy: { createdAt: "desc" } } } as const;

booksRouter.get("/", async (req, res) => {
  const user = currentUser(req);
  const query = bookQuerySchema.parse(req.query);

  const where: BookFilter = { userId: user.uid };

  if (query.status === "completed") where.isCompleted = true;
  if (query.status === "wantToRead") {
    where.isCompleted = false;
    where.wantToRead = true;
  }
  if (query.status === "inProgress") {
    where.isCompleted = false;
    where.wantToRead = false;
  }
  if (query.favorite) where.isFavorite = query.favorite === "true";

  const books = await getPrisma().book.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: withQuotes,
  });

  res.json(books);
});

booksRouter.post("/", requireJson, async (req, res) => {
  const user = currentUser(req);
  const data = parseBody(createBookSchema, req);

  await ensureUser(user);

  const book = await getPrisma().book.create({
    data: { ...data, userId: user.uid },
    include: { quotes: true },
  });

  res.status(201).json(book);
});

booksRouter.get("/:bookId", async (req, res) => {
  const user = currentUser(req);

  const book = await getPrisma().book.findFirst({
    where: ownedBook(user.uid, param(req, "bookId")),
    include: withQuotes,
  });

  if (!book) throw notFound("Kitap bulunamadı");

  res.json(book);
});

booksRouter.patch("/:bookId", requireJson, async (req, res) => {
  const user = currentUser(req);
  const bookId = param(req, "bookId");
  const data = parseBody(updateBookSchema, req);
  const prisma = getPrisma();

  // updateMany kullanılıyor çünkü update yalnızca benzersiz alanla çalışır ve
  // sahiplik kontrolünü aynı sorguda yapmak istiyoruz.
  const { count } = await prisma.book.updateMany({
    where: ownedBook(user.uid, bookId),
    data,
  });

  if (count === 0) throw notFound("Kitap bulunamadı");

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: withQuotes,
  });

  res.json(book);
});

booksRouter.delete("/:bookId", async (req, res) => {
  const user = currentUser(req);

  const { count } = await getPrisma().book.deleteMany({
    where: ownedBook(user.uid, param(req, "bookId")),
  });

  if (count === 0) throw notFound("Kitap bulunamadı");

  res.status(204).end();
});

// /api/books/:bookId/quotes
booksRouter.use("/:bookId/quotes", quotesRouter);
