import type { TaskStatus } from "../types";

type FilterValue = TaskStatus | "all";

interface StatusFilterProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

const filters: Array<{ label: string; value: FilterValue }> = [
  { label: "Todas", value: "all" },
  { label: "Pendentes", value: "pending" },
  { label: "Concluidas", value: "completed" },
];

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="filter-group" aria-label="Filtros de tarefa">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className={filter.value === value ? "filter-chip active" : "filter-chip"}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
