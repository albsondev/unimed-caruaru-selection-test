import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

import { AppError } from "../application/errors";
import { TaskService } from "../application/task-service";
import type { UpdateTaskInput } from "../domain/task";
import {
  createTaskBodySchema,
  listTasksQuerySchema,
  updateTaskBodySchema,
} from "./task-schemas";

export async function registerTaskRoutes(
  app: FastifyInstance,
  taskService: TaskService,
): Promise<void> {
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  app.get("/tasks", async (request, reply) => {
    try {
      const query = listTasksQuerySchema.parse(request.query);
      const tasks = await taskService.list(query.status);
      return reply.status(200).send({ data: tasks });
    } catch (error) {
      throw mapToHttpError(error);
    }
  });

  app.post("/tasks", async (request, reply) => {
    try {
      const body = createTaskBodySchema.parse(request.body);
      const task = await taskService.create(body);
      return reply.status(201).send({ data: task });
    } catch (error) {
      throw mapToHttpError(error);
    }
  });

  app.patch("/tasks/:id", async (request, reply) => {
    try {
      const taskId = String((request.params as Record<string, unknown>).id);
      const body = updateTaskBodySchema.parse(request.body);
      const updateInput: UpdateTaskInput = {};

      if (body.title !== undefined) {
        updateInput.title = body.title;
      }

      if (body.status !== undefined) {
        updateInput.status = body.status;
      }

      const task = await taskService.update(taskId, updateInput);
      return reply.status(200).send({ data: task });
    } catch (error) {
      throw mapToHttpError(error);
    }
  });

  app.delete("/tasks/:id", async (request, reply) => {
    try {
      const taskId = String((request.params as Record<string, unknown>).id);
      await taskService.remove(taskId);
      return reply.status(204).send();
    } catch (error) {
      throw mapToHttpError(error);
    }
  });
}

function mapToHttpError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new AppError(error.issues[0]?.message ?? "Invalid request payload.", 400);
  }

  return new AppError("Unexpected server error.", 500);
}
