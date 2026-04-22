import type { Task, TaskStatus } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

interface ApiResponse<T> {
  data: T;
}

export async function listTasks(status: TaskStatus | "all"): Promise<Task[]> {
  const query = status === "all" ? "" : `?status=${status}`;
  const response = await fetch(`${API_BASE_URL}/tasks${query}`);
  return parseResponse<ApiResponse<Task[]>>(response).then((payload) => payload.data);
}

export async function createTask(title: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  return parseResponse<ApiResponse<Task>>(response).then((payload) => payload.data);
}

export async function updateTask(
  id: string,
  input: Partial<Pick<Task, "title" | "status">>,
): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return parseResponse<ApiResponse<Task>>(response).then((payload) => payload.data);
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseResponse(response);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;

  throw new Error(payload?.error?.message ?? "Nao foi possivel concluir a requisicao.");
}
