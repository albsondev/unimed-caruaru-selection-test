import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "../src/app";

describe("Task API", () => {
  let temporaryDirectory: string;
  let storageFilePath: string;

  beforeAll(async () => {
    temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "kata-2-api-"));
    storageFilePath = path.join(temporaryDirectory, "tasks.json");
  });

  afterAll(async () => {
    // No cleanup is required in the temporary directory for the test scenario.
  });

  it("creates, filters, updates and deletes tasks through the HTTP layer", async () => {
    const app = await buildApp({ storageFilePath });

    const createResponse = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: {
        title: "Revisar arquitetura da API",
      },
    });

    expect(createResponse.statusCode).toBe(201);

    const createdTask = createResponse.json().data as { id: string; status: string };

    const updateResponse = await app.inject({
      method: "PATCH",
      url: `/tasks/${createdTask.id}`,
      payload: {
        status: "completed",
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json().data.status).toBe("completed");

    const filteredResponse = await app.inject({
      method: "GET",
      url: "/tasks?status=completed",
    });

    expect(filteredResponse.statusCode).toBe(200);
    expect(filteredResponse.json().data).toHaveLength(1);

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/tasks/${createdTask.id}`,
    });

    expect(deleteResponse.statusCode).toBe(204);

    await app.close();
  });

  it("persists tasks atomically to the configured storage file", async () => {
    const localStorageFilePath = path.join(temporaryDirectory, "atomic-tasks.json");
    const app = await buildApp({ storageFilePath: localStorageFilePath });

    await app.inject({
      method: "POST",
      url: "/tasks",
      payload: {
        title: "Planejar observabilidade",
      },
    });

    await app.close();

    const persistedContent = JSON.parse(
      await readFile(localStorageFilePath, "utf-8"),
    ) as Array<{ title: string }>;

    expect(persistedContent).toHaveLength(1);
    expect(persistedContent[0]?.title).toBe("Planejar observabilidade");
  });
});
