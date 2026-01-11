import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { Label } from '../../types';
import { boardsApi } from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

interface LabelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  labels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

const predefinedColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
];

export default function LabelManager({
  isOpen,
  onClose,
  boardId,
  labels,
  onLabelsChange,
}: LabelManagerProps) {
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(predefinedColors[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    setIsCreating(true);
    try {
      const response = await boardsApi.createLabel(boardId, {
        name: newLabelName,
        color: newLabelColor,
      });
      onLabelsChange([...labels, response.data.label]);
      setNewLabelName('');
      setNewLabelColor(predefinedColors[0]);
      setIsAddingLabel(false);
      toast.success('Label created');
    } catch {
      toast.error('Failed to create label');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    setDeletingId(labelId);
    try {
      await boardsApi.deleteLabel(labelId);
      onLabelsChange(labels.filter((l) => l.id !== labelId));
      toast.success('Label deleted');
    } catch {
      toast.error('Failed to delete label');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Labels" size="md">
      <div className="space-y-4">
        <AnimatePresence>
          {labels.length === 0 && !isAddingLabel && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-500 dark:text-gray-400 py-4"
            >
              No labels yet. Create one to get started.
            </motion.p>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <AnimatePresence>
            {labels.map((label) => (
              <motion.div
                key={label.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {label.name}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteLabel(label.id)}
                  disabled={deletingId === label.id}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  {deletingId === label.id ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full"
                    />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isAddingLabel ? (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateLabel}
              className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <Input
                label="Label Name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="e.g., Bug, Feature, Urgent"
                required
                autoFocus
              />

              <div>
                <label className="label">Color</label>
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map((color) => (
                    <motion.button
                      key={color}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setNewLabelColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newLabelColor === color
                          ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingLabel(false)}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isCreating}>
                  Create Label
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAddingLabel(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4" />
                Add Label
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
