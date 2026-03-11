import React from 'react';
import { useResumeStore } from '@/lib/store';
import { ResumeData, ResumeStyle, SavedResume } from '@/types/resume';
import { 
  Briefcase, 
  GraduationCap, 
  Award, 
  Languages, 
  Heart, 
  User,
  Plus,
  Trash2,
  Copy,
  FileDown,
  Sparkles,
  Settings,
  Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface SidebarProps {
  onExportPDF?: () => void;
  onOpenAI?: () => void;
}

export function Sidebar({ onExportPDF, onOpenAI }: SidebarProps) {
  const { 
    resumes, 
    currentResumeId, 
    createNewResume, 
    loadResume, 
    deleteResume,
    duplicateResume,
    renameResume,
    saveCurrentResume,
    isDirty,
    currentResumeData
  } = useResumeStore();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');

  const handleNewResume = () => {
    const id = createNewResume();
    toast.success('New resume created');
  };

  const handleRename = (id: string) => {
    const resume = resumes.find(r => r.id === id);
    if (resume && editTitle.trim()) {
      renameResume(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDuplicate = (id: string) => {
    duplicateResume(id);
    toast.success('Resume duplicated');
  };

  const handleDelete = (id: string) => {
    deleteResume(id);
    toast.success('Resume deleted');
  };

  const handleSave = () => {
    saveCurrentResume();
    toast.success('Resume saved');
  };

  return (
    <div className="w-72 h-screen bg-slate-50 border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Layout className="w-5 h-5" />
          Resume Builder
        </h1>
      </div>

      <div className="p-4 space-y-3">
        <Button onClick={handleNewResume} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Resume
        </Button>
        
        {isDirty && (
          <Button onClick={handleSave} variant="secondary" className="w-full" size="sm">
            Save Changes
          </Button>
        )}
      </div>

      <Separator />

      <ScrollArea className="flex-1 p-4" style={{ maxHeight: '100%' }}>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Your Resumes</h3>
          {resumes.length === 0 ? (
            <p className="text-sm text-slate-400">No resumes yet. Create one to get started.</p>
          ) : (
            resumes.map((resume) => (
              <Card 
                key={resume.id}
                className={`cursor-pointer transition-colors ${
                  currentResumeId === resume.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => loadResume(resume.id)}
              >
                <CardContent className="p-3">
                  {editingId === resume.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleRename(resume.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(resume.id)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="h-8"
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{resume.title}</span>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setEditingId(resume.id);
                            setEditTitle(resume.title);
                          }}
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDuplicate(resume.id)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(resume.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4 space-y-2">
        {onExportPDF && (
          <Button onClick={onExportPDF} variant="outline" className="w-full" size="sm">
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        )}
        {onOpenAI && (
          <Button onClick={onOpenAI} variant="outline" className="w-full" size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
        )}
      </div>
    </div>
  );
}

export function BasicsEditor() {
  const { currentResumeData, updateResumeData } = useResumeStore();
  const { basics } = currentResumeData;

  const handleChange = (field: string, value: string) => {
    updateResumeData({
      basics: { ...basics, [field]: value },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={basics.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="label">Job Title</Label>
            <Input
              id="label"
              value={basics.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              placeholder="Software Engineer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={basics.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={basics.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">Website</Label>
          <Input
            id="url"
            value={basics.url || ''}
            onChange={(e) => handleChange('url', e.target.value)}
            placeholder="https://johndoe.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            value={basics.summary || ''}
            onChange={(e) => handleChange('summary', e.target.value)}
            placeholder="A brief summary of your professional background..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkEditor() {
  const { currentResumeData, updateResumeData } = useResumeStore();
  const { work } = currentResumeData;

  const addWork = () => {
    const newWork = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      position: '',
      startDate: '',
      endDate: '',
      summary: '',
      highlights: [''],
    };
    updateResumeData({ work: [...work, newWork] });
  };

  const updateWork = (index: number, field: string, value: any) => {
    const updated = [...work];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeData({ work: updated });
  };

  const removeWork = (index: number) => {
    updateResumeData({ work: work.filter((_, i) => i !== index) });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Work Experience
        </CardTitle>
        <Button onClick={addWork} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {work.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No work experience added yet. Click &quot;Add&quot; to get started.
          </p>
        ) : (
          work.map((job, index) => (
            <div key={job.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">Position {index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500"
                  onClick={() => removeWork(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={job.name}
                    onChange={(e) => updateWork(index, 'name', e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input
                    value={job.position}
                    onChange={(e) => updateWork(index, 'position', e.target.value)}
                    placeholder="Your Role"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    value={job.startDate}
                    onChange={(e) => updateWork(index, 'startDate', e.target.value)}
                    placeholder="2020-01"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    value={job.endDate || ''}
                    onChange={(e) => updateWork(index, 'endDate', e.target.value)}
                    placeholder="2023-01 or Present"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Summary</Label>
                <Textarea
                  value={job.summary || ''}
                  onChange={(e) => updateWork(index, 'summary', e.target.value)}
                  placeholder="Brief description of your role..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Highlights (one per line)</Label>
                <Textarea
                  value={job.highlights.join('\n')}
                  onChange={(e) => updateWork(index, 'highlight', e.target.value.split('\n').filter(Boolean))}
                  placeholder={"Led team of 5 engineers\nIncreased revenue by 20%"}
                  rows={4}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function EducationEditor() {
  const { currentResumeData, updateResumeData } = useResumeStore();
  const { education } = currentResumeData;

  const addEducation = () => {
    const newEducation: any = {
      id: Math.random().toString(36).substring(2, 9),
      institution: '',
      area: '',
      startDate: '',
      endDate: '',
    };
    updateResumeData({ education: [...education, newEducation] });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeData({ education: updated });
  };

  const removeEducation = (index: number) => {
    updateResumeData({ education: education.filter((_, i) => i !== index) });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Education
        </CardTitle>
        <Button onClick={addEducation} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {education.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No education added yet. Click &quot;Add&quot; to get started.
          </p>
        ) : (
          education.map((edu, index) => (
            <div key={edu.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">Education {index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500"
                  onClick={() => removeEducation(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Institution</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    placeholder="University Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <Input
                    value={edu.area}
                    onChange={(e) => updateEducation(index, 'area', e.target.value)}
                    placeholder="Computer Science"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    value={edu.startDate || ''}
                    onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                    placeholder="2016-09"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    value={edu.endDate || ''}
                    onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                    placeholder="2020-06"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function SkillsEditor() {
  const { currentResumeData, updateResumeData } = useResumeStore();
  const { skills } = currentResumeData;

  const addSkill = () => {
    const newSkill = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      keywords: [],
    };
    updateResumeData({ skills: [...skills, newSkill] });
  };

  const updateSkill = (index: number, field: string, value: any) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeData({ skills: updated });
  };

  const removeSkill = (index: number) => {
    updateResumeData({ skills: skills.filter((_, i) => i !== index) });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Skills
        </CardTitle>
        <Button onClick={addSkill} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {skills.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No skills added yet. Click &quot;Add&quot; to get started.
          </p>
        ) : (
          skills.map((skill, index) => (
            <div key={skill.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">Skill {index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500"
                  onClick={() => removeSkill(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Skill Name</Label>
                <Input
                  value={skill.name}
                  onChange={(e) => updateSkill(index, 'name', e.target.value)}
                  placeholder="JavaScript"
                />
              </div>

              <div className="space-y-2">
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={skill.keywords.join(', ')}
                  onChange={(e) => updateSkill(index, 'keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function LanguagesEditor() {
  const { currentResumeData, updateResumeData } = useResumeStore();
  const { languages } = currentResumeData;

  const addLanguage = () => {
    const newLang = {
      id: Math.random().toString(36).substring(2, 9),
      language: '',
      fluency: '',
    };
    updateResumeData({ languages: [...languages, newLang] });
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeData({ languages: updated });
  };

  const removeLanguage = (index: number) => {
    updateResumeData({ languages: languages.filter((_, i) => i !== index) });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5" />
          Languages
        </CardTitle>
        <Button onClick={addLanguage} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {languages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No languages added yet. Click &quot;Add&quot; to get started.
          </p>
        ) : (
          languages.map((lang, index) => (
            <div key={lang.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">Language {index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500"
                  onClick={() => removeLanguage(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input
                    value={lang.language}
                    onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                    placeholder="English"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Proficiency</Label>
                  <Input
                    value={lang.fluency || ''}
                    onChange={(e) => updateLanguage(index, 'fluency', e.target.value)}
                    placeholder="Native"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function InterestsEditor() {
  const { currentResumeData, updateResumeData } = useResumeStore();
  const { interests } = currentResumeData;

  const addInterest = () => {
    const newInterest = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      keywords: [],
    };
    updateResumeData({ interests: [...interests, newInterest] });
  };

  const updateInterest = (index: number, field: string, value: any) => {
    const updated = [...interests];
    updated[index] = { ...updated[index], [field]: value };
    updateResumeData({ interests: updated });
  };

  const removeInterest = (index: number) => {
    updateResumeData({ interests: interests.filter((_, i) => i !== index) });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Interests
        </CardTitle>
        <Button onClick={addInterest} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {interests.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No interests added yet. Click &quot;Add&quot; to get started.
          </p>
        ) : (
          interests.map((interest, index) => (
            <div key={interest.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">Interest {index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500"
                  onClick={() => removeInterest(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Interest Name</Label>
                <Input
                  value={interest.name}
                  onChange={(e) => updateInterest(index, 'name', e.target.value)}
                  placeholder="Photography"
                />
              </div>

              <div className="space-y-2">
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={interest.keywords?.join(', ') || ''}
                  onChange={(e) => updateInterest(index, 'keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                  placeholder="Nature, Hiking, Travel"
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}