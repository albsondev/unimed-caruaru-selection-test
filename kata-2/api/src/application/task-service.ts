import { randomUUID } from "node:crypto";

import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from "../domain/task";
import { AppError } from "./errors";
import type { TaskRepository } from "./task-repository";

export class TaskService {
  public constructor(private readonly repository: TaskRepository) {}

  public async list(status?: TaskStatus): Promise<Task[]> {
    const tasks = await this.repository.findAll();

    const filteredTasks = status
      ? tasks.filter((task) => task.status === status)
      : tasks;

    return filteredTasks.sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    );
  }

  public async create(input: CreateTaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const title = normalizeTitle(input.title);

    const task: Task = {
      id: randomUUID(),
      title,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    await this.repository.save(task);

    return task;
  }

  public async update(id: string, input: UpdateTaskInput): Promise<Task> {
    if (input.title === undefined && input.status === undefined) {
      throw new AppError("At least one field must be provided for update.", 400);
    }

    const currentTask = await this.repository.findById(id);

    if (!currentTask) {
      throw new AppError("Task not found.", 404);
    }

    const updatedTask: Task = {
      ...currentTask,
      title: input.title === undefined ? currentTask.title : normalizeTitle(input.title),
      status: input.status ?? currentTask.status,
      updatedAt: new Date().toISOString(),
    };

    await this.repository.save(updatedTask);

    return updatedTask;
  }

  public async remove(id: string): Promise<void> {
    const removed = await this.repository.remove(id);

    if (!removed) {
      throw new AppError("Task not found.", 404);
    }
  }
}

function normalizeTitle(title: string): string {
  const normalizedTitle = title.trim().replace(/\s+/g, " ");

  if (normalizedTitle.length < 3) {
    throw new AppError("Title must have at least 3 characters.", 400);
  }

  if (normalizedTitle.length > 140) {
    throw new AppError("Title must have at most 140 characters.", 400);
  }

  return normalizedTitle;
}
