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
  { value: 'promaterial', label: 'Pro Material' },
  { value: 'artistic', label: 'Artistic' },
];

import { ColorPicker } from '@/components/ui/color-picker';

const presetThemes = [
  { name: 'Corporate Blue', primary: '#1e3a5f', secondary: '#3d5a80', accent: '#0077b6' },
  { name: 'Creative Purple', primary: '#4a148c', secondary: '#7b1fa2', accent: '#e91e63' },
  { name: 'Minimal Gray', primary: '#212529', secondary: '#6c757d', accent: '#495057' },
  { name: 'Modern Teal', primary: '#0d3b66', secondary: '#1565c0', accent: '#00b4d8' },
  { name: 'Warm Amber', primary: '#3d2817', secondary: '#8b5a2b', accent: '#d97706' },
  { name: 'Forest Green', primary: '#1b4332', secondary: '#2d6a4f', accent: '#40916c' },
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
              <SelectValue>
                {templateOptions.find(opt => opt.value === currentResumeStyle.template)?.label || currentResumeStyle.template}
              </SelectValue>
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
          <Label>Professional Themes</Label>
          <div className="grid grid-cols-2 gap-2">
            {presetThemes.map((theme) => (
              <button
                key={theme.name}
                className="w-full p-3 rounded-lg border-2 hover:border-primary transition-colors text-left"
                style={{
                  borderColor: 
                    currentResumeStyle.primaryColor === theme.primary &&
                    currentResumeStyle.accentColor === theme.accent
                      ? '#3b82f6'
                      : 'transparent',
                  backgroundColor: `${theme.secondary}15`,
                }}
                onClick={() =>
                  updateResumeStyle({
                    primaryColor: theme.primary,
                    secondaryColor: theme.secondary,
                    accentColor: theme.accent,
                  })
                }
              >
                <div className="text-xs font-medium mb-1" style={{ color: theme.primary }}>
                  {theme.name}
                </div>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.primary }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.secondary }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.accent }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Custom Colors</Label>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Primary</Label>
              <ColorPicker
                value={currentResumeStyle.primaryColor}
                onChange={(color) => updateResumeStyle({ primaryColor: color })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Secondary</Label>
              <ColorPicker
                value={currentResumeStyle.secondaryColor}
                onChange={(color) => updateResumeStyle({ secondaryColor: color })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Accent</Label>
              <ColorPicker
                value={currentResumeStyle.accentColor}
                onChange={(color) => updateResumeStyle({ accentColor: color })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}