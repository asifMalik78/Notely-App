import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flag, Tag, X } from 'lucide-react';
import { Task, Label } from '../../types';
import { tasksApi } from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { DatePicker } from '../ui/DatePicker';
import toast from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  columnId: string;
  labels: Label[];
  onSave: (task: Task) => void;
}

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
] as const;

export default function TaskModal({
  isOpen,
  onClose,
  task,
  columnId,
  labels,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setSelectedLabels(task.taskLabels?.map((tl) => tl.labelId) || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(undefined);
      setSelectedLabels([]);
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const data = {
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate ? dueDate.toISOString() : null,
        labelIds: selectedLabels,
      };

      let response;
      if (task) {
        response = await tasksApi.update(task.id, data);
        toast.success('Task updated');
      } else {
        response = await tasksApi.create(columnId, data);
        toast.success('Task created');
      }

      onSave(response.data.task);
    } catch {
      toast.error(task ? 'Failed to update task' : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
          autoFocus
        />

        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-[100px] resize-none"
            placeholder="Add a description..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Priority
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <motion.button
                  key={p.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    priority === p.value
                      ? `${p.color} text-white`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {p.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Due Date</label>
            <DatePicker
              date={dueDate}
              onDateChange={setDueDate}
              placeholder="Select due date"
            />
          </div>
        </div>

        {labels.length > 0 && (
          <div>
            <label className="label flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <motion.button
                  key={label.id}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleLabel(label.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                    selectedLabels.includes(label.id)
                      ? 'text-white ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                  {selectedLabels.includes(label.id) && (
                    <X className="w-3 h-3" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
