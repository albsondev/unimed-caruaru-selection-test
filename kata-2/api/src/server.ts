import path from "node:path";

import { buildApp } from "./app";

async function startServer(): Promise<void> {
  const storageFilePath = path.resolve(process.cwd(), "data", "tasks.json");
  const app = await buildApp({ storageFilePath });
  const port = Number(process.env.PORT ?? 3001);

  try {
    await app.listen({
      host: "0.0.0.0",
      port,
    });
    console.log(`Task API running at http://localhost:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void startServer();
