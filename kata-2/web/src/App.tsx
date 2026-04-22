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
  const totalCount = tasks.length;
  const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const latestTask = [...tasks].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  )[0];
  const statusMessage = getStatusMessage({
    totalCount,
    pendingCount,
    completedCount,
    loading,
  });

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copyblock">
          <p className="eyebrow">Kata 2 - Painel de Tarefas</p>
          <h1>Um painel simples, confiavel e pronto para evoluir.</h1>
          <p className="hero-copy">
            A interface foi pensada para reduzir atrito no fluxo principal: cadastrar,
            concluir, filtrar e remover tarefas com feedback rapido.
          </p>

          <div className="hero-highlights" aria-label="Destaques da interface">
            <article>
              <span className="highlight-kicker">Fluxo direto</span>
              <strong>Cadastro e acao em um unico painel</strong>
            </article>
            <article>
              <span className="highlight-kicker">Feedback rapido</span>
              <strong>Estados, erros e filtros sempre visiveis</strong>
            </article>
            <article>
              <span className="highlight-kicker">Base escalavel</span>
              <strong>Frontend desacoplado de uma API em ASP.NET Core</strong>
            </article>
          </div>
        </div>

        <div className="metrics-card">
          <div className="metrics-card__header">
            <div>
              <span className="metrics-card__eyebrow">Resumo atual</span>
              <strong>{statusMessage}</strong>
            </div>
            <span className="metrics-card__pulse" aria-hidden="true" />
          </div>

          <div className="metrics-card__spotlight">
            <div>
              <span>Taxa de conclusao</span>
              <b>{completionRate}%</b>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${completionRate}%` }} />
            </div>
          </div>

          <div className="metrics-grid">
            <article>
              <span>Total</span>
              <b>{totalCount}</b>
            </article>
            <article>
              <span>Pendentes</span>
              <b>{pendingCount}</b>
            </article>
            <article>
              <span>Concluidas</span>
              <b>{completedCount}</b>
            </article>
          </div>

          <div className="metrics-card__footer">
            <span className="metrics-card__label">Ultima movimentacao</span>
            <p>
              {latestTask
                ? `"${latestTask.title}" atualizada em ${formatDateTime(latestTask.updatedAt)}`
                : "Assim que uma tarefa for criada, o painel mostrara o ultimo evento aqui."}
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">Operacao central</p>
            <h2>Controle rapido da fila de trabalho</h2>
          </div>
          <div className="panel-summary">
            <span>{getFilterLabel(filter)}</span>
            <strong>{totalCount} item(ns) visivel(is)</strong>
          </div>
        </div>

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

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getFilterLabel(filter: FilterValue): string {
  if (filter === "pending") {
    return "Filtro: pendentes";
  }

  if (filter === "completed") {
    return "Filtro: concluidas";
  }

  return "Filtro: todas";
}

function getStatusMessage({
  totalCount,
  pendingCount,
  completedCount,
  loading,
}: {
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  loading: boolean;
}): string {
  if (loading) {
    return "Carregando panorama operacional";
  }

  if (totalCount === 0) {
    return "Painel pronto para receber a primeira tarefa";
  }

  if (pendingCount === 0) {
    return "Tudo em dia no momento";
  }

  if (completedCount > pendingCount) {
    return "Execucao saudavel e sob controle";
  }

  return "Ha espaco claro para proxima acao";
}

export default App;
