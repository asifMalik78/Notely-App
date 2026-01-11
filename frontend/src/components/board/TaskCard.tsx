import { Calendar, Flag, Trash2, Edit2 } from "lucide-react";
import { Task } from "../../types";

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const priorityConfig = {
  low: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", label: "Low" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", label: "Medium" },
  high: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", label: "High" },
};

export default function TaskCard({ task, isDragging, onEdit, onDelete }: TaskCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const priority = priorityConfig[task.priority];

  return (
    <div
      className={`
        group bg-card rounded-lg p-3 border cursor-grab active:cursor-grabbing
        transition-all duration-150 ease-out
        ${isDragging
          ? "shadow-2xl scale-[1.02] rotate-1 ring-2 ring-primary/50 opacity-95"
          : "shadow-sm hover:shadow-md hover:-translate-y-0.5"
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm flex-1 leading-snug">{task.title}</h4>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {task.taskLabels && task.taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.taskLabels.map(({ label }) => (
            <span
              key={label.id}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${priority.bg} ${priority.text}`}
        >
          <Flag className="w-2.5 h-2.5" />
          {priority.label}
        </span>

        {task.dueDate && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${
              isOverdue
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            <Calendar className="w-2.5 h-2.5" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
