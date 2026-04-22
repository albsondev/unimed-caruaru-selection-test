import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";

import { TaskService } from "./application/task-service";
import { FileTaskRepository } from "./infrastructure/file-task-repository";
import { registerTaskRoutes } from "./presentation/task-routes";

export interface BuildAppOptions {
  storageFilePath: string;
}

export async function buildApp(options: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false,
  });

  await app.register(cors, {
    origin: true,
  });

  const repository = new FileTaskRepository(options.storageFilePath);
  const service = new TaskService(repository);

  await registerTaskRoutes(app, service);

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const statusCode =
      typeof (error as { statusCode?: unknown }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : 500;
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    void reply.status(statusCode).send({
      error: {
        message,
      },
    });
  });

  return app;
}
