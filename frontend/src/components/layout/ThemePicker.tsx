import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Sun, Moon } from 'lucide-react';
import { useTheme, colorThemes } from '../../context/ThemeContext';

export default function ThemePicker() {
  const { mode, colorTheme, toggleMode, setColorTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
        aria-label="Theme settings"
      >
        <Palette className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-popover border rounded-xl shadow-lg z-50 p-3"
            >
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Mode</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { toggleMode(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      mode === 'light'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-accent'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>
                  <button
                    onClick={() => { toggleMode(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      mode === 'dark'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-accent'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Color Theme</p>
                <div className="grid grid-cols-5 gap-2">
                  {colorThemes.map((theme) => (
                    <motion.button
                      key={theme.value}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setColorTheme(theme.value)}
                      className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                      style={{ backgroundColor: theme.color }}
                      title={theme.label}
                    >
                      {colorTheme === theme.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
