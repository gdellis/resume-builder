import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ResumeData,
  ResumeStyle,
  SavedResume,
  defaultResumeData,
  defaultResumeStyle,
} from '@/types/resume';
import { AIProvider, PROVIDER_DEFAULTS } from '@/lib/ai';

interface AIConfig {
  provider: AIProvider;
  model: string;
  streaming: boolean;
  temperature: number;
  maxTokens: number;
}

interface ResumeStore {
  resumes: SavedResume[];
  currentResumeId: string | null;
  currentResumeData: ResumeData;
  currentResumeStyle: ResumeStyle;
  isDirty: boolean;
  aiConfig: AIConfig;

  createNewResume: (title?: string) => string;
  loadResume: (id: string) => void;
  deleteResume: (id: string) => void;
  duplicateResume: (id: string) => string;
  renameResume: (id: string, title: string) => void;

  updateResumeData: (data: Partial<ResumeData>) => void;
  updateResumeStyle: (style: Partial<ResumeStyle>) => void;
  setCurrentResumeId: (id: string | null) => void;

  saveCurrentResume: () => void;
  exportResume: () => SavedResume;

  // AI configuration
  setAIProvider: (provider: AIProvider) => void;
  setAIModel: (model: string) => void;
  setAIStreaming: (enabled: boolean) => void;
  setAITemperature: (temperature: number) => void;
  setAIMaxTokens: (maxTokens: number) => void;
  updateAIConfig: (config: Partial<AIConfig>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultAIConfig: AIConfig = {
  provider: 'ollama',
  model: PROVIDER_DEFAULTS.ollama.model,
  streaming: true,
  temperature: 0.7,
  maxTokens: 2048,
};

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resumes: [],
      currentResumeId: null,
      currentResumeData: { ...defaultResumeData },
      currentResumeStyle: { ...defaultResumeStyle },
      isDirty: false,
      aiConfig: { ...defaultAIConfig },

      createNewResume: (title = 'Untitled Resume') => {
        const id = generateId();
        const now = new Date().toISOString();
        const newResume: SavedResume = {
          id,
          title,
          data: { ...defaultResumeData },
          style: { ...defaultResumeStyle },
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          resumes: [...state.resumes, newResume],
          currentResumeId: id,
          currentResumeData: { ...defaultResumeData },
          currentResumeStyle: { ...defaultResumeStyle },
          isDirty: false,
        }));

        return id;
      },

      loadResume: (id: string) => {
        const resume = get().resumes.find((r) => r.id === id);
        if (resume) {
          set({
            currentResumeId: id,
            currentResumeData: { ...resume.data },
            currentResumeStyle: { ...resume.style },
            isDirty: false,
          });
        }
      },

      deleteResume: (id: string) => {
        set((state) => {
          const newResumes = state.resumes.filter((r) => r.id !== id);
          const newCurrentId =
            state.currentResumeId === id
              ? newResumes[0]?.id ?? null
              : state.currentResumeId;

          let newData = state.currentResumeData;
          let newStyle = state.currentResumeStyle;
          let newDirty = state.isDirty;

          if (state.currentResumeId === id && newResumes.length > 0) {
            newData = { ...newResumes[0].data };
            newStyle = { ...newResumes[0].style };
            newDirty = false;
          } else if (newResumes.length === 0) {
            newData = { ...defaultResumeData };
            newStyle = { ...defaultResumeStyle };
          }

          return {
            resumes: newResumes,
            currentResumeId: newCurrentId,
            currentResumeData: newData,
            currentResumeStyle: newStyle,
            isDirty: newDirty,
          };
        });
      },

      duplicateResume: (id: string) => {
        const resume = get().resumes.find((r) => r.id === id);
        if (!resume) return '';

        const newId = generateId();
        const now = new Date().toISOString();
        const duplicated: SavedResume = {
          ...resume,
          id: newId,
          title: `${resume.title} (Copy)`,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          resumes: [...state.resumes, duplicated],
        }));

        return newId;
      },

      renameResume: (id: string, title: string) => {
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === id ? { ...r, title, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },

      updateResumeData: (data: Partial<ResumeData>) => {
        set((state) => ({
          currentResumeData: { ...state.currentResumeData, ...data },
          isDirty: true,
        }));
      },

      updateResumeStyle: (style: Partial<ResumeStyle>) => {
        set((state) => ({
          currentResumeStyle: { ...state.currentResumeStyle, ...style },
          isDirty: true,
        }));
      },

      setCurrentResumeId: (id: string | null) => {
        if (id) {
          get().loadResume(id);
        } else {
          set({
            currentResumeId: null,
            currentResumeData: { ...defaultResumeData },
            currentResumeStyle: { ...defaultResumeStyle },
            isDirty: false,
          });
        }
      },

      saveCurrentResume: () => {
        const { currentResumeId, currentResumeData, currentResumeStyle, resumes } =
          get();

        if (!currentResumeId) return;

        const now = new Date().toISOString();
        const existingIndex = resumes.findIndex((r) => r.id === currentResumeId);

        const updatedResume: SavedResume = {
          id: currentResumeId,
          title:
            existingIndex >= 0
              ? resumes[existingIndex].title
              : 'Untitled Resume',
          data: currentResumeData,
          style: currentResumeStyle,
          createdAt:
            existingIndex >= 0 ? resumes[existingIndex].createdAt : now,
          updatedAt: now,
        };

        let newResumes: SavedResume[];
        if (existingIndex >= 0) {
          newResumes = [...resumes];
          newResumes[existingIndex] = updatedResume;
        } else {
          newResumes = [...resumes, updatedResume];
        }

        set({
          resumes: newResumes,
          isDirty: false,
        });
      },

      exportResume: () => {
        const { currentResumeData, currentResumeStyle, currentResumeId, resumes } =
          get();

        const existing = resumes.find((r) => r.id === currentResumeId);

        return {
          id: currentResumeId || generateId(),
          title: existing?.title || 'Untitled Resume',
          data: currentResumeData,
          style: currentResumeStyle,
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      },

      // AI Configuration methods
      setAIProvider: (provider: AIProvider) => {
        set((state) => ({
          aiConfig: { ...state.aiConfig, provider },
        }));
      },

      setAIModel: (model: string) => {
        set((state) => ({
          aiConfig: { ...state.aiConfig, model },
        }));
      },

      setAIStreaming: (enabled: boolean) => {
        set((state) => ({
          aiConfig: { ...state.aiConfig, streaming: enabled },
        }));
      },

      setAITemperature: (temperature: number) => {
        set((state) => ({
          aiConfig: { ...state.aiConfig, temperature },
        }));
      },

      setAIMaxTokens: (maxTokens: number) => {
        set((state) => ({
          aiConfig: { ...state.aiConfig, maxTokens },
        }));
      },

      updateAIConfig: (config: Partial<AIConfig>) => {
        set((state) => ({
          aiConfig: { ...state.aiConfig, ...config },
        }));
      },
    }),
    {
      name: 'resume-builder-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        resumes: state.resumes,
        currentResumeId: state.currentResumeId,
        aiConfig: state.aiConfig,
      }),
    }
  )
);