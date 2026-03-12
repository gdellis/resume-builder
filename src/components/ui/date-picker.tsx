'use client';

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DatePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  placeholder?: string;
  allowPresent?: boolean;
  isPresent?: boolean;
  onPresentChange?: (present: boolean) => void;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  allowPresent = false,
  isPresent = false,
  onPresentChange,
  id = 'present-checkbox',
}: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  
  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      // Extract year and month from date input
      const [year, month] = dateValue.split('-');
      const formatted = `${year}-${month}`;
      onChange(formatted);
      if (onPresentChange) {
        onPresentChange(false);
      }
    }
    setShowCalendar(false);
  };

  const handleClear = () => {
    onChange(undefined);
    if (onPresentChange) {
      onPresentChange(false);
    }
  };

  const displayValue = isPresent
    ? 'Present'
    : value
      ? format(parseISO(value + '-01'), 'MMM yyyy')
      : placeholder;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal h-9"
            disabled={isPresent}
            onClick={() => setShowCalendar(!showCalendar)}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue}
          </Button>
          
          {showCalendar && (
            <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg p-3">
              <input
                type="month"
                value={value ? `${value}-01` : ''}
                onChange={handleDateSelect}
                className="border rounded px-2 py-1"
                autoFocus
              />
            </div>
          )}
        </div>

        {value && !isPresent && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleClear}
            title="Clear date"
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {allowPresent && onPresentChange && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={id}
            checked={isPresent}
            onChange={(e) => onPresentChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
            aria-label="Present"
          />
          <label htmlFor={id} className="text-sm font-normal cursor-pointer">
            Present
          </label>
        </div>
      )}
    </div>
  );
}
