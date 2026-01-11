import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit2 } from 'lucide-react';
import { Board, Column as ColumnType, Task } from '../types';
import { boardsApi, tasksApi } from '../services/api';
import KanbanColumn from '../components/board/KanbanColumn';
import TaskModal from '../components/board/TaskModal';
import LabelManager from '../components/board/LabelManager';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useConfetti } from '../hooks/useConfetti';
import toast from 'react-hot-toast';

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { triggerTaskCompleteConfetti } = useConfetti();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);

  const fetchBoard = useCallback(async () => {
    if (!id) return;
    try {
      const response = await boardsApi.getOne(id);
      setBoard(response.data.board);
    } catch {
      toast.error('Failed to load board');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !board) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Find source and destination columns
    const sourceColumn = board.columns?.find((c) => c.id === source.droppableId);
    const destColumn = board.columns?.find((c) => c.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    // Create new columns array
    const newColumns = [...(board.columns || [])];
    const sourceColIndex = newColumns.findIndex((c) => c.id === source.droppableId);
    const destColIndex = newColumns.findIndex((c) => c.id === destination.droppableId);

    // Get the task being moved
    const taskToMove = sourceColumn.tasks?.find((t) => t.id === draggableId);
    if (!taskToMove) return;

    // Remove from source
    const newSourceTasks = [...(sourceColumn.tasks || [])];
    newSourceTasks.splice(source.index, 1);
    newColumns[sourceColIndex] = { ...sourceColumn, tasks: newSourceTasks };

    // Add to destination
    const newDestTasks = [...(destColumn.tasks || [])];
    const movedTask = { ...taskToMove, columnId: destination.droppableId, position: destination.index };
    newDestTasks.splice(destination.index, 0, movedTask);

    // Update positions
    newDestTasks.forEach((task, index) => {
      task.position = index;
    });

    newColumns[destColIndex] = { ...destColumn, tasks: newDestTasks };

    // Optimistically update UI
    setBoard({ ...board, columns: newColumns });

    // Check if task was moved to a "Done" column (trigger confetti!)
    const isDoneColumn = destColumn.title.toLowerCase().includes('done') ||
                         destColumn.title.toLowerCase().includes('complete') ||
                         destColumn.title.toLowerCase().includes('finished');
    const wasNotInDoneColumn = !sourceColumn.title.toLowerCase().includes('done') &&
                               !sourceColumn.title.toLowerCase().includes('complete') &&
                               !sourceColumn.title.toLowerCase().includes('finished');

    if (isDoneColumn && wasNotInDoneColumn) {
      triggerTaskCompleteConfetti();
      toast.success('Task completed! Great job! 🎉');
    }

    // Send API request
    try {
      await tasksApi.move(draggableId, {
        columnId: destination.droppableId,
        position: destination.index,
      });
    } catch {
      // Revert on error
      fetchBoard();
      toast.error('Failed to move task');
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim() || !board) return;

    setIsCreatingColumn(true);
    try {
      const response = await boardsApi.createColumn(board.id, { title: newColumnTitle });
      const newColumn: ColumnType = { ...response.data.column, tasks: [] };
      setBoard({ ...board, columns: [...(board.columns || []), newColumn] });
      setNewColumnTitle('');
      setIsAddColumnOpen(false);
      toast.success('Column created');
    } catch {
      toast.error('Failed to create column');
    } finally {
      setIsCreatingColumn(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!board) return;
    try {
      await boardsApi.deleteColumn(columnId);
      setBoard({
        ...board,
        columns: board.columns?.filter((c) => c.id !== columnId),
      });
      toast.success('Column deleted');
    } catch {
      toast.error('Failed to delete column');
    }
  };

  const handleUpdateColumnTitle = async (columnId: string, title: string) => {
    if (!board) return;
    try {
      await boardsApi.updateColumn(columnId, { title });
      setBoard({
        ...board,
        columns: board.columns?.map((c) =>
          c.id === columnId ? { ...c, title } : c
        ),
      });
    } catch {
      toast.error('Failed to update column');
    }
  };

  const handleCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setSelectedColumnId(task.columnId);
    setIsTaskModalOpen(true);
  };

  const handleTaskSaved = (task: Task) => {
    if (!board) return;

    const newColumns = board.columns?.map((column) => {
      if (column.id === task.columnId) {
        const existingTask = column.tasks?.find((t) => t.id === task.id);
        if (existingTask) {
          return {
            ...column,
            tasks: column.tasks?.map((t) => (t.id === task.id ? task : t)),
          };
        } else {
          return {
            ...column,
            tasks: [...(column.tasks || []), task],
          };
        }
      }
      // If task was moved from another column (for edit case)
      return {
        ...column,
        tasks: column.tasks?.filter((t) => t.id !== task.id),
      };
    });

    setBoard({ ...board, columns: newColumns });
    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!board) return;
    try {
      await tasksApi.delete(taskId);
      const newColumns = board.columns?.map((column) => ({
        ...column,
        tasks: column.tasks?.filter((t) => t.id !== taskId),
      }));
      setBoard({ ...board, columns: newColumns });
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleUpdateBoardTitle = async () => {
    if (!board || !editTitle.trim()) return;
    try {
      await boardsApi.update(board.id, { title: editTitle });
      setBoard({ ...board, title: editTitle });
      setIsEditingTitle(false);
      toast.success('Board title updated');
    } catch {
      toast.error('Failed to update title');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </motion.button>

          {isEditingTitle ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateBoardTitle();
              }}
              className="flex items-center gap-2 flex-1"
            >
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-lg sm:text-xl font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                autoFocus
                onBlur={handleUpdateBoardTitle}
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setEditTitle(board.title);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-2 group"
            >
              <h1 className="text-lg sm:text-2xl font-bold truncate max-w-[200px] sm:max-w-none">
                {board.title}
              </h1>
              <Edit2 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLabelManagerOpen(true)}
          >
            Labels
          </Button>
          <Button size="sm" onClick={() => setIsAddColumnOpen(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Column</span>
            <span className="sm:hidden">Column</span>
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto flex-1 min-h-0 pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {board.columns?.map((column, index) => (
            <KanbanColumn
              key={column.id}
              column={column}
              index={index}
              onCreateTask={() => handleCreateTask(column.id)}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTitle={(title) => handleUpdateColumnTitle(column.id, title)}
              onDelete={() => handleDeleteColumn(column.id)}
            />
          ))}

          {board.columns?.length === 0 && (
            <div className="flex items-center justify-center w-full">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No columns yet. Add your first column to get started.
                </p>
                <Button onClick={() => setIsAddColumnOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Add Column
                </Button>
              </div>
            </div>
          )}
        </div>
      </DragDropContext>

      <Modal
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
        title="Add Column"
        size="sm"
      >
        <form onSubmit={handleAddColumn} className="space-y-4">
          <Input
            label="Column Title"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            placeholder="e.g., To Do, In Progress, Done"
            required
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddColumnOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreatingColumn}>
              Add Column
            </Button>
          </div>
        </form>
      </Modal>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        columnId={selectedColumnId!}
        labels={board.labels || []}
        onSave={handleTaskSaved}
      />

      <LabelManager
        isOpen={isLabelManagerOpen}
        onClose={() => setIsLabelManagerOpen(false)}
        boardId={board.id}
        labels={board.labels || []}
        onLabelsChange={(labels) => setBoard({ ...board, labels })}
      />
    </div>
  );
}
