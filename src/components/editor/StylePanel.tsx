import React from 'react';
import { useResumeStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Palette, Type, Layout, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fontOptions = [
  { value: 'inter', label: 'Inter (Sans-serif)' },
  { value: 'serif', label: 'Times New Roman (Serif)' },
  { value: 'mono', label: 'Courier (Monospace)' },
];

const templateOptions = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'creative', label: 'Creative' },
  { value: 'enhancv', label: 'Enhancv' },
];

const presetColors = [
  { primary: '#1e293b', secondary: '#475569', accent: '#3b82f6' },
  { primary: '#0f172a', secondary: '#334155', accent: '#8b5cf6' },
  { primary: '#1f2937', secondary: '#4b5563', accent: '#10b981' },
  { primary: '#2d3748', secondary: '#4a5568', accent: '#f59e0b' },
  { primary: '#1a1a2e', secondary: '#4a4a6a', accent: '#e94560' },
  { primary: '#1e3a5f', secondary: '#3d5a80', accent: '#ee6c4d' },
  { primary: '#2c3e50', secondary: '#7f8c8d', accent: '#e74c3c' },
  { primary: '#0d1b2a', secondary: '#415a77', accent: '#00b4d8' },
];

export function StylePanel() {
  const { currentResumeStyle, updateResumeStyle } = useResumeStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Style & Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Template
          </Label>
          <Select
            value={currentResumeStyle.template}
            onValueChange={(value: any) => updateResumeStyle({ template: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {templateOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Font Family
          </Label>
          <Select
            value={currentResumeStyle.fontFamily}
            onValueChange={(value: any) => updateResumeStyle({ fontFamily: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Font Size</Label>
          <Select
            value={currentResumeStyle.fontSize}
            onValueChange={(value: any) => updateResumeStyle({ fontSize: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Section Spacing</Label>
          <Select
            value={currentResumeStyle.sectionSpacing}
            onValueChange={(value: any) => updateResumeStyle({ sectionSpacing: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="relaxed">Relaxed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Color Presets</Label>
          <div className="grid grid-cols-4 gap-2">
            {presetColors.map((preset, idx) => (
              <button
                key={idx}
                className="w-full aspect-square rounded-lg border-2 hover:border-primary transition-colors relative overflow-hidden"
                style={{
                  borderColor: 
                    currentResumeStyle.primaryColor === preset.primary &&
                    currentResumeStyle.accentColor === preset.accent
                      ? '#3b82f6'
                      : 'transparent',
                }}
                onClick={() =>
                  updateResumeStyle({
                    primaryColor: preset.primary,
                    secondaryColor: preset.secondary,
                    accentColor: preset.accent,
                  })
                }
              >
                <div 
                  className="absolute inset-0"
                  style={{ backgroundColor: preset.primary }}
                />
                <div 
                  className="absolute right-0 bottom-0 w-1/2 h-1/2"
                  style={{ backgroundColor: preset.accent }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Custom Colors</Label>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Primary</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={currentResumeStyle.primaryColor}
                  onChange={(e) => updateResumeStyle({ primaryColor: e.target.value })}
                  className="w-8 h-8 p-1"
                />
                <Input
                  value={currentResumeStyle.primaryColor}
                  onChange={(e) => updateResumeStyle({ primaryColor: e.target.value })}
                  className="w-24 h-8 text-xs"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Secondary</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={currentResumeStyle.secondaryColor}
                  onChange={(e) => updateResumeStyle({ secondaryColor: e.target.value })}
                  className="w-8 h-8 p-1"
                />
                <Input
                  value={currentResumeStyle.secondaryColor}
                  onChange={(e) => updateResumeStyle({ secondaryColor: e.target.value })}
                  className="w-24 h-8 text-xs"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Accent</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={currentResumeStyle.accentColor}
                  onChange={(e) => updateResumeStyle({ accentColor: e.target.value })}
                  className="w-8 h-8 p-1"
                />
                <Input
                  value={currentResumeStyle.accentColor}
                  onChange={(e) => updateResumeStyle({ accentColor: e.target.value })}
                  className="w-24 h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}