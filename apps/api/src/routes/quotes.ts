import { Router } from "express";

import { currentUser } from "../middleware/auth.js";
import { param } from "../middleware/params.js";
import { parseBody, requireJson } from "../middleware/validate.js";
import { notFound } from "../http-error.js";
import { getPrisma } from "../prisma.js";
import { createQuoteSchema, updateQuoteSchema } from "../schemas/quote.js";

/** mergeParams: üst router'daki :bookId buraya taşınsın diye. */
export const quotesRouter = Router({ mergeParams: true });

/** Alıntıya erişmeden önce kitabın gerçekten bu kullanıcıya ait olduğunu doğrular. */
async function assertBookOwnership(userId: string, bookId: string) {
  const book = await getPrisma().book.findFirst({
    where: { id: bookId, userId },
    select: { id: true },
  });

  if (!book) throw notFound("Kitap bulunamadı");
  return book.id;
}

quotesRouter.get("/", async (req, res) => {
  const user = currentUser(req);
  const bookId = await assertBookOwnership(user.uid, param(req, "bookId"));

  const quotes = await getPrisma().quote.findMany({
    where: { bookId },
    orderBy: { createdAt: "desc" },
  });

  res.json(quotes);
});

quotesRouter.post("/", requireJson, async (req, res) => {
  const user = currentUser(req);
  const bookId = await assertBookOwnership(user.uid, param(req, "bookId"));
  const data = parseBody(createQuoteSchema, req);

  const quote = await getPrisma().quote.create({ data: { ...data, bookId } });

  res.status(201).json(quote);
});

quotesRouter.patch("/:quoteId", requireJson, async (req, res) => {
  const user = currentUser(req);
  const bookId = await assertBookOwnership(user.uid, param(req, "bookId"));
  const data = parseBody(updateQuoteSchema, req);
  const prisma = getPrisma();

  const { count } = await prisma.quote.updateMany({
    where: { id: param(req, "quoteId"), bookId },
    data,
  });

  if (count === 0) throw notFound("Alıntı bulunamadı");

  const quote = await prisma.quote.findUnique({
    where: { id: param(req, "quoteId") },
  });

  res.json(quote);
});

quotesRouter.delete("/:quoteId", async (req, res) => {
  const user = currentUser(req);
  const bookId = await assertBookOwnership(user.uid, param(req, "bookId"));

  const { count } = await getPrisma().quote.deleteMany({
    where: { id: param(req, "quoteId"), bookId },
  });

  if (count === 0) throw notFound("Alıntı bulunamadı");

  res.status(204).end();
});
