import type { FastifyInstance } from "fastify";
import type { Book } from "@shelfie/types";

/**
 * Şimdilik iskelet: kitaplar hâlâ web tarafında doğrudan Firestore'dan
 * okunuyor. Backend'e taşındığında bu handler'ların içi doldurulacak,
 * tipler paylaşılan pakete bağlı olduğu için sözleşme baştan sabit.
 */
export async function bookRoutes(app: FastifyInstance) {
  app.get("/", async (): Promise<Book[]> => []);

  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    return reply.code(501).send({
      message: "Henüz uygulanmadı",
      bookId: request.params.id,
    });
  });
}
