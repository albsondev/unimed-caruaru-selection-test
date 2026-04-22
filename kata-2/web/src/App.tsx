import { useEffect, useState } from "react";

import { TaskForm } from "./components/TaskForm";
import { StatusFilter } from "./components/StatusFilter";
import { TaskList } from "./components/TaskList";
import { createTask, deleteTask, listTasks, updateTask } from "./lib/api";
import type { Task, TaskStatus } from "./types";

type FilterValue = TaskStatus | "all";

function App() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadTasks(filter);
  }, [filter]);

  async function loadTasks(currentFilter: FilterValue) {
    try {
      setLoading(true);
      setError(null);
      const nextTasks = await listTasks(currentFilter);
      setTasks(nextTasks);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(title: string) {
    try {
      setBusy(true);
      setError(null);
      await createTask(title);
      await loadTasks(filter);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteTask(id: string) {
    try {
      setBusy(true);
      setError(null);
      await deleteTask(id);
      await loadTasks(filter);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleStatus(task: Task) {
    try {
      setBusy(true);
      setError(null);
      await updateTask(task.id, {
        status: task.status === "completed" ? "pending" : "completed",
      });
      await loadTasks(filter);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const completedCount = tasks.filter((task) => task.status === "completed").length;

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Kata 2 · Painel de Tarefas</p>
          <h1>Um painel simples, confiavel e pronto para evoluir.</h1>
          <p className="hero-copy">
            A interface foi pensada para reduzir atrito no fluxo principal: cadastrar,
            concluir, filtrar e remover tarefas com feedback rapido.
          </p>
        </div>

        <div className="metrics-card">
          <strong>Resumo atual</strong>
          <div className="metrics-grid">
            <article>
              <span>Pendentes</span>
              <b>{pendingCount}</b>
            </article>
            <article>
              <span>Concluidas</span>
              <b>{completedCount}</b>
            </article>
          </div>
        </div>
      </section>

      <section className="panel">
        <TaskForm disabled={busy} onSubmit={handleCreateTask} />
        <StatusFilter value={filter} onChange={setFilter} />

        {error ? <div className="error-banner">{error}</div> : null}

        {loading ? (
          <section className="empty-state">
            <h2>Carregando tarefas...</h2>
            <p>Aguarde enquanto buscamos os dados do painel.</p>
          </section>
        ) : (
          <TaskList
            busy={busy}
            tasks={tasks}
            onDelete={handleDeleteTask}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </section>
    </main>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
}

export default App;
