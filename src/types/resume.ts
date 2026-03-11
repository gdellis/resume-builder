export interface ResumeBasics {
  name: string;
  label?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  photo?: string;
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    countryCode?: string;
  };
  profiles?: {
    network: string;
    username?: string;
    url?: string;
  }[];
}

export interface ResumeWork {
  id: string;
  name: string;
  position: string;
  url?: string;
  startDate: string;
  endDate?: string;
  summary?: string;
  highlights: string[];
  highlights2?: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  area: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  courses?: string[];
}

export interface ResumeSkill {
  id: string;
  name: string;
  level?: string;
  keywords: string[];
}

export interface ResumeProject {
  id: string;
  name: string;
  description?: string;
  highlights: string[];
  keywords?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
}

export interface ResumeAward {
  id: string;
  title: string;
  date?: string;
  awarder?: string;
  summary?: string;
}

export interface ResumeCertificate {
  id: string;
  name: string;
  date?: string;
  issuer?: string;
  url?: string;
}

export interface ResumeLanguage {
  id: string;
  language: string;
  fluency?: string;
}

export interface ResumeInterest {
  id: string;
  name: string;
  keywords?: string[];
}

export interface ResumeReference {
  id: string;
  name: string;
  reference?: string;
}

export interface ResumeData {
  basics: ResumeBasics;
  work: ResumeWork[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  projects: ResumeProject[];
  awards: ResumeAward[];
  certificates: ResumeCertificate[];
  languages: ResumeLanguage[];
  interests: ResumeInterest[];
  references: ResumeReference[];
}

export interface ResumeStyle {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  sectionSpacing: 'compact' | 'normal' | 'relaxed';
  template: 'modern' | 'classic' | 'creative' | 'enhancv';
}

export interface SavedResume {
  id: string;
  title: string;
  data: ResumeData;
  style: ResumeStyle;
  createdAt: string;
  updatedAt: string;
}

export const defaultResumeData: ResumeData = {
  basics: {
    name: '',
    label: '',
    email: '',
    phone: '',
    url: '',
    summary: '',
    location: {},
    profiles: [],
  },
  work: [],
  education: [],
  skills: [],
  projects: [],
  awards: [],
  certificates: [],
  languages: [],
  interests: [],
  references: [],
};

export const defaultResumeStyle: ResumeStyle = {
  primaryColor: '#1e293b',
  secondaryColor: '#475569',
  accentColor: '#3b82f6',
  fontFamily: 'inter',
  fontSize: 'medium',
  sectionSpacing: 'normal',
  template: 'modern',
};