import type { Task } from "../types";

interface TaskListProps {
  busy?: boolean;
  tasks: Task[];
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (task: Task) => Promise<void>;
}

export function TaskList({
  busy = false,
  tasks,
  onDelete,
  onToggleStatus,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section className="empty-state">
        <h2>Nenhuma tarefa encontrada</h2>
        <p>Crie uma nova tarefa ou ajuste o filtro para visualizar outros itens.</p>
      </section>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => {
        const isCompleted = task.status === "completed";

        return (
          <li key={task.id} className={isCompleted ? "task-card done" : "task-card"}>
            <div className="task-card__content">
              <span className={isCompleted ? "task-badge done" : "task-badge pending"}>
                {isCompleted ? "Concluida" : "Pendente"}
              </span>
              <h3>{task.title}</h3>
              <p>
                Atualizada em{" "}
                {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(task.updatedAt))}
              </p>
            </div>

            <div className="task-card__actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => onToggleStatus(task)}
                disabled={busy}
              >
                {isCompleted ? "Reabrir" : "Concluir"}
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => onDelete(task.id)}
                disabled={busy}
              >
                Excluir
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
