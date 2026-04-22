import type { Task } from "../domain/task";

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
  remove(id: string): Promise<boolean>;
}
