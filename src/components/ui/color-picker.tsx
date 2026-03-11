'use client';

import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
        style={{ backgroundColor: value }}
        onClick={() => setShowPicker(!showPicker)}
      />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 h-8 text-xs"
        placeholder="#000000"
      />
      {showPicker && (
        <div className="absolute z-50 mt-2">
          <div className="bg-white p-2 rounded-lg shadow-lg border">
            <HexColorPicker color={value} onChange={onChange} />
            <Button
              size="sm"
              variant="ghost"
              className="w-full mt-2"
              onClick={() => setShowPicker(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
