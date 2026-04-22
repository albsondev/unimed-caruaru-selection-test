import { z } from "zod";

export const taskStatusSchema = z.enum(["pending", "completed"]);

export const listTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
});

export const createTaskBodySchema = z.object({
  title: z.string(),
});

export const updateTaskBodySchema = z
  .object({
    title: z.string().optional(),
    status: taskStatusSchema.optional(),
  })
  .refine((value) => value.title !== undefined || value.status !== undefined, {
    message: "At least one field must be informed.",
  });
