'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useResumeStore } from '@/lib/store';
import { Sidebar, BasicsEditor, WorkEditor, EducationEditor, SkillsEditor, LanguagesEditor, InterestsEditor } from '@/components/editor/Sidebar';
import { StylePanel } from '@/components/editor/StylePanel';
import { templates } from '@/components/templates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';
import { AIAssistant } from './AIAssistant';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const { currentResumeData, currentResumeStyle, currentResumeId, resumes, createNewResume } = useResumeStore();
  const [activeTab, setActiveTab] = useState('editor');
  const [showAI, setShowAI] = useState(false);
  const [mounted, setMounted] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!currentResumeId && resumes.length === 0) {
      createNewResume('My Resume');
    }
  }, []);

  const TemplateComponent = templates[currentResumeStyle.template];

  const handleExportPDF = async () => {
    if (!previewRef.current) return;

    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = previewRef.current;
    const opt = {
      margin: 10,
      filename: 'resume.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onExportPDF={handleExportPDF} onOpenAI={() => setShowAI(true)} />
      
      <div className="flex-1 flex">
        <div className="w-96 border-r bg-card overflow-hidden flex flex-col relative">
          <div className="absolute top-2 right-2 z-10">
            <ThemeToggle />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="border-b px-4">
              <TabsList className="w-full my-3">
                <TabsTrigger value="editor" className="flex-1">Editor</TabsTrigger>
                <TabsTrigger value="styles" className="flex-1">Styles</TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4">
                <TabsContent value="editor" className="mt-0 space-y-4">
                  <BasicsEditor />
                  <WorkEditor />
                  <EducationEditor />
                  <SkillsEditor />
                  <LanguagesEditor />
                  <InterestsEditor />
                </TabsContent>
                
                <TabsContent value="styles" className="mt-0">
                  <StylePanel />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        <div className="flex-1 p-8 overflow-auto bg-muted">
          <div className="max-w-[210mm] mx-auto bg-white shadow-lg" style={{ minHeight: '297mm' }}>
            <div ref={previewRef} className="w-full" style={{ minHeight: '297mm' }}>
              <TemplateComponent data={currentResumeData} style={currentResumeStyle} />
            </div>
          </div>
        </div>
      </div>

      {showAI && (
        <AIAssistant 
          onClose={() => setShowAI(false)} 
          resumeData={currentResumeData}
        />
      )}

      <Toaster />
    </div>
  );
}