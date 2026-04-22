import { useState, type FormEvent } from "react";

interface TaskFormProps {
  disabled?: boolean;
  onSubmit: (title: string) => Promise<void>;
}

export function TaskForm({ disabled = false, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isDisabled = disabled || submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(title);
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Nova tarefa</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex.: Validar resposta do processo seletivo"
          maxLength={140}
          disabled={isDisabled}
        />
      </label>
      <button type="submit" className="primary-button" disabled={isDisabled}>
        {submitting ? "Salvando..." : "Adicionar"}
      </button>
    </form>
  );
}
