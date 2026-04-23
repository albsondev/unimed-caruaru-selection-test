import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();

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
  const heroStatus = getHeroStatus({
    totalCount,
    pendingCount,
    completedCount,
    loading,
  });
  const nextActionMessage = getNextActionMessage({
    pendingCount,
    completedCount,
    totalCount,
    loading,
  });

  return (
    <main className="shell">
      <section className="hero">
        <motion.div
          className="hero-copyblock"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p className="eyebrow">Central de tarefas</p>
          <h1>Organize o dia com clareza, ritmo e prioridades visiveis.</h1>
          <p className="hero-copy">
            Crie, filtre e conclua atividades em poucos toques. O painel destaca o
            que pede atencao agora e ajuda a equipe a manter o fluxo em movimento.
          </p>

          <div className="hero-inline">
            <div className="hero-pill hero-pill--status">
              <span className="hero-pill__label">Momento atual</span>
              <strong>{heroStatus}</strong>
            </div>
            <div className="hero-pill">
              <span className="hero-pill__label">Ultima atualizacao</span>
              <strong>
                {latestTask
                  ? formatDateTime(latestTask.updatedAt)
                  : "Nenhuma atividade registrada"}
              </strong>
            </div>
          </div>
        </motion.div>

        <motion.aside
          className="metrics-card"
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={reduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
        >
          <div className="metrics-card__glow" aria-hidden="true" />

          <div className="metrics-card__header">
            <div>
              <span className="metrics-card__eyebrow">Resumo do painel</span>
              <strong>{nextActionMessage}</strong>
            </div>
            <span className="metrics-card__pulse" aria-hidden="true" />
          </div>

          <div className="metrics-card__spotlight">
            <div className="metrics-card__spotlight-copy">
              <span>Progresso de conclusao</span>
              <b>{completionRate}%</b>
            </div>
            <div className="progress-track" aria-hidden="true">
              <motion.div
                className="progress-fill"
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>

          <div className="metrics-grid">
            <article>
              <span>Total</span>
              <b>{totalCount}</b>
            </article>
            <article>
              <span>Em aberto</span>
              <b>{pendingCount}</b>
            </article>
            <article>
              <span>Concluidas</span>
              <b>{completedCount}</b>
            </article>
          </div>

          <div className="metrics-card__footer">
            <span className="metrics-card__label">Proxima leitura rapida</span>
            <p>
              {latestTask
                ? `"${latestTask.title}" foi a ultima tarefa movimentada.`
                : "Assim que a primeira tarefa entrar, o painel passa a mostrar a atividade mais recente."}
            </p>
          </div>
        </motion.aside>
      </section>

      <motion.section
        className="panel"
        initial={reduceMotion ? false : { opacity: 0, y: 22 }}
        animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.14 }}
      >
        <div className="panel-head">
          <div>
            <p className="panel-kicker">Seus itens</p>
            <h2>Painel de acompanhamento</h2>
          </div>
          <div className="panel-summary">
            <span>{getFilterLabel(filter)}</span>
            <strong>{totalCount} tarefa(s) exibida(s)</strong>
          </div>
        </div>

        <TaskForm disabled={busy} onSubmit={handleCreateTask} />
        <StatusFilter value={filter} onChange={setFilter} />

        {error ? (
          <motion.div
            className="error-banner"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        ) : null}

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
      </motion.section>
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
    return "Mostrando pendentes";
  }

  if (filter === "completed") {
    return "Mostrando concluidas";
  }

  return "Mostrando todas";
}

function getHeroStatus({
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
    return "Atualizando o painel";
  }

  if (totalCount === 0) {
    return "Pronto para comecar";
  }

  if (pendingCount === 0) {
    return "Tudo concluido no momento";
  }

  if (completedCount > pendingCount) {
    return "Fluxo sob controle";
  }

  return "Ha demandas pedindo atencao";
}

function getNextActionMessage({
  pendingCount,
  completedCount,
  totalCount,
  loading,
}: {
  pendingCount: number;
  completedCount: number;
  totalCount: number;
  loading: boolean;
}): string {
  if (loading) {
    return "Lendo o ritmo do time";
  }

  if (totalCount === 0) {
    return "Adicione a primeira tarefa para iniciar o acompanhamento";
  }

  if (pendingCount === 0) {
    return "Nenhum item em aberto agora";
  }

  if (completedCount === 0) {
    return "Comece pela primeira entrega pendente";
  }

  if (pendingCount === 1) {
    return "Falta so uma tarefa para limpar a fila";
  }

  return `${pendingCount} tarefas seguem em aberto`;
}

export default App;
