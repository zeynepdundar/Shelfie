import { createApp } from "./app.js";
import { env } from "./env.js";
import { disconnectPrisma } from "./prisma.js";

const app = createApp();
const server = app.listen(env.port, () => {
  console.log(`[api] http://localhost:${env.port} (${env.nodeEnv})`);
});

/** Container ortamlarında bağlantıların düzgün kapanması için. */
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => {
      void disconnectPrisma().finally(() => process.exit(0));
    });
  });
}
