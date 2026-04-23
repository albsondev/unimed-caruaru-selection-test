import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  const reduceMotion = useReducedMotion();
  const itemMotionProps = reduceMotion
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 18, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -12, scale: 0.98 },
      };
  const buttonMotionProps = reduceMotion
    ? {}
    : {
        whileHover: { y: -1.5 },
        whileTap: { scale: 0.98 },
      };

  if (tasks.length === 0) {
    return (
      <section className="empty-state">
        <h2>Nenhuma tarefa encontrada</h2>
        <p>Crie uma nova tarefa ou ajuste o filtro para visualizar outros itens.</p>
      </section>
    );
  }

  return (
    <motion.ul layout className="task-list">
      <AnimatePresence initial={false}>
        {tasks.map((task) => {
          const isCompleted = task.status === "completed";

          return (
            <motion.li
              key={task.id}
              layout
              {...itemMotionProps}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className={isCompleted ? "task-card done" : "task-card"}
            >
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
                <motion.button
                  {...buttonMotionProps}
                  type="button"
                  className="secondary-button"
                  onClick={() => onToggleStatus(task)}
                  disabled={busy}
                >
                  {isCompleted ? "Reabrir" : "Concluir"}
                </motion.button>
                <motion.button
                  {...buttonMotionProps}
                  type="button"
                  className="danger-button"
                  onClick={() => onDelete(task.id)}
                  disabled={busy}
                >
                  Excluir
                </motion.button>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ul>
  );
}
