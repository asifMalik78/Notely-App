import { useState, useRef, useEffect } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { Column, Task } from "../../types";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  column: Column;
  index: number;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
}

export default function KanbanColumn({
  column,
  index,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onUpdateTitle,
  onDelete,
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleSaveTitle = () => {
    if (title.trim() && title !== column.title) {
      onUpdateTitle(title);
    } else {
      setTitle(column.title);
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="flex-shrink-0 w-72 sm:w-80 h-full"
    >
      <div className="bg-secondary/50 rounded-xl p-3 h-full flex flex-col">
        {/* Column Header */}
        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") {
                    setTitle(column.title);
                    setIsEditing(false);
                  }
                }}
                className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 group w-full text-left"
              >
                <h3 className="font-semibold truncate">{column.title}</h3>
                <span className="text-sm text-muted-foreground flex-shrink-0">
                  {column.tasks?.length || 0}
                </span>
                <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            )}
          </div>

          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-full mt-1 w-40 bg-popover rounded-lg shadow-lg border py-1 z-50"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Column
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tasks List */}
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 min-h-0 space-y-2 rounded-lg p-1 overflow-y-auto transition-all duration-200 ${
                snapshot.isDraggingOver
                  ? "bg-primary/10 ring-2 ring-primary/50 ring-dashed"
                  : ""
              }`}
            >
              {column.tasks?.map((task, taskIndex) => (
                <Draggable
                  key={task.id}
                  draggableId={task.id}
                  index={taskIndex}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={provided.draggableProps.style}
                    >
                      <TaskCard
                        task={task}
                        isDragging={snapshot.isDragging}
                        onEdit={() => onEditTask(task)}
                        onDelete={() => onDeleteTask(task.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Add Task Button */}
        <button
          onClick={onCreateTask}
          className="mt-2 w-full p-2 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5 transition-all flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>
    </motion.div>
  );
}
