import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      // Parse the date correctly to avoid timezone issues
      const [year, month, day] = value.split('-').map(Number);
      onDateChange(new Date(year, month - 1, day));
    } else {
      onDateChange(undefined);
    }
  };

  const handleClear = () => {
    onDateChange(undefined);
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="absolute left-3 pointer-events-none text-muted-foreground">
        <CalendarIcon className="h-4 w-4" />
      </div>
      <input
        type="date"
        value={date ? formatDateForInput(date) : ""}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
          "[&::-webkit-calendar-picker-indicator]:opacity-0",
          "[&::-webkit-calendar-picker-indicator]:absolute",
          "[&::-webkit-calendar-picker-indicator]:inset-0",
          "[&::-webkit-calendar-picker-indicator]:w-full",
          "[&::-webkit-calendar-picker-indicator]:h-full",
          !date && "text-muted-foreground"
        )}
        style={{ colorScheme: "dark light" }}
      />
      {date && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 rounded-sm opacity-70 hover:opacity-100 hover:bg-accent p-0.5"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
