import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Task } from "../domain/task";
import type { TaskRepository } from "../application/task-repository";

export class FileTaskRepository implements TaskRepository {
  private writeQueue: Promise<void> = Promise.resolve();

  public constructor(private readonly storageFilePath: string) {}

  public async findAll(): Promise<Task[]> {
    const tasks = await this.readTasks();
    return tasks.map((task) => ({ ...task }));
  }

  public async findById(id: string): Promise<Task | null> {
    const tasks = await this.readTasks();
    return tasks.find((task) => task.id === id) ?? null;
  }

  public async save(task: Task): Promise<void> {
    await this.enqueueWrite(async () => {
      const tasks = await this.readTasks();
      const index = tasks.findIndex((currentTask) => currentTask.id === task.id);

      if (index === -1) {
        tasks.push(task);
      } else {
        tasks[index] = task;
      }

      await this.writeTasks(tasks);
    });
  }

  public async remove(id: string): Promise<boolean> {
    let removed = false;

    await this.enqueueWrite(async () => {
      const tasks = await this.readTasks();
      const remainingTasks = tasks.filter((task) => task.id !== id);
      removed = remainingTasks.length !== tasks.length;

      if (removed) {
        await this.writeTasks(remainingTasks);
      }
    });

    return removed;
  }

  private async enqueueWrite(task: () => Promise<void>): Promise<void> {
    this.writeQueue = this.writeQueue.then(task, task);
    await this.writeQueue;
  }

  private async ensureStorageFile(): Promise<void> {
    const directory = path.dirname(this.storageFilePath);
    await mkdir(directory, { recursive: true });

    try {
      await readFile(this.storageFilePath, "utf-8");
    } catch {
      await writeFile(this.storageFilePath, "[]", "utf-8");
    }
  }

  private async readTasks(): Promise<Task[]> {
    await this.ensureStorageFile();
    const fileContent = await readFile(this.storageFilePath, "utf-8");
    const parsedContent = JSON.parse(fileContent) as Task[];
    return parsedContent;
  }

  private async writeTasks(tasks: Task[]): Promise<void> {
    const tempFilePath = `${this.storageFilePath}.tmp`;
    await writeFile(tempFilePath, JSON.stringify(tasks, null, 2), "utf-8");
    await rename(tempFilePath, this.storageFilePath);
  }
}
