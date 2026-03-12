import { ResumeData, ResumeStyle, SavedResume } from '@/types/resume';

export const exampleResumeData: ResumeData = {
  basics: {
    name: 'Alex Rivera',
    label: 'Senior Software Engineer',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 123-4567',
    url: 'https://alexrivera.dev',
    summary: 'Passionate full-stack developer with 8+ years of experience building scalable web applications. Expert in React, Node.js, and cloud technologies. Proven track record of leading teams and delivering high-impact features that improved user engagement by 40%.',
    location: {
      city: 'San Francisco',
      region: 'CA',
    },
    profiles: [
      {
        network: 'LinkedIn',
        username: 'alexrivera',
        url: 'https://linkedin.com/in/alexrivera',
      },
      {
        network: 'GitHub',
        username: 'arivera',
        url: 'https://github.com/arivera',
      },
    ],
  },
  work: [
    {
      id: 'work1',
      name: 'TechCorp Inc.',
      position: 'Senior Software Engineer',
      startDate: '2021-03',
      endDate: '',
      summary: 'Leading a team of 5 engineers to build the next-generation e-commerce platform serving 2M+ daily users.',
      highlights: [
        'Architected and deployed microservices infrastructure reducing server costs by 35%',
        'Mentored junior developers, resulting in 3 promotions within 18 months',
        'Implemented CI/CD pipeline that reduced deployment time from 2 hours to 15 minutes',
        'Led migration from monolithic app to microservices, improving scalability by 300%',
      ],
    },
    {
      id: 'work2',
      name: 'StartupXYZ',
      position: 'Full Stack Developer',
      startDate: '2018-06',
      endDate: '2021-02',
      summary: 'Built and maintained the core product platform used by 50,000+ customers.',
      highlights: [
        'Developed React frontend with TypeScript, improving code quality and reducing bugs by 45%',
        'Designed RESTful APIs handling 1M+ requests daily with 99.9% uptime',
        'Implemented real-time collaboration features using WebSockets',
        'Contributed to open-source projects, gaining 500+ GitHub stars',
      ],
    },
    {
      id: 'work3',
      name: 'Digital Agency Pro',
      position: 'Web Developer',
      startDate: '2016-09',
      endDate: '2018-05',
      summary: 'Created responsive websites and web applications for diverse clients across multiple industries.',
      highlights: [
        'Delivered 20+ projects on time and within budget',
        'Reduced page load times by 60% through optimization techniques',
        'Introduced automated testing, catching 90% of bugs before production',
      ],
    },
  ],
  education: [
    {
      id: 'edu1',
      institution: 'University of California, Berkeley',
      area: 'Computer Science',
      studyType: 'Bachelor of Science',
      startDate: '2012-09',
      endDate: '2016-05',
    },
    {
      id: 'edu2',
      institution: 'Stanford Online',
      area: 'Machine Learning',
      studyType: 'Certificate',
      startDate: '2020-01',
      endDate: '2020-06',
    },
  ],
  skills: [
    {
      id: 'skill1',
      name: 'JavaScript',
      level: 'Expert',
      keywords: ['ES6+', 'TypeScript', 'Node.js'],
    },
    {
      id: 'skill2',
      name: 'Frontend',
      level: 'Expert',
      keywords: ['React', 'Next.js', 'Vue.js', 'Tailwind CSS'],
    },
    {
      id: 'skill3',
      name: 'Backend',
      level: 'Advanced',
      keywords: ['Node.js', 'Express', 'Python', 'PostgreSQL'],
    },
    {
      id: 'skill4',
      name: 'Cloud & DevOps',
      level: 'Advanced',
      keywords: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    },
    {
      id: 'skill5',
      name: 'Tools',
      level: 'Expert',
      keywords: ['Git', 'Jest', 'Figma', 'Jira'],
    },
  ],
  projects: [
    {
      id: 'proj1',
      name: 'Open Source Dashboard',
      description: 'A real-time analytics dashboard for monitoring system performance',
      highlights: [
        'Built with React and D3.js for data visualization',
        'Supports real-time updates via WebSocket connections',
        'Used by 10,000+ developers worldwide',
      ],
      keywords: ['React', 'D3.js', 'WebSocket'],
      startDate: '2022-01',
      url: 'https://github.com/arivera/dashboard',
    },
  ],
  awards: [
    {
      id: 'award1',
      title: 'Employee of the Year',
      date: '2023-12',
      awarder: 'TechCorp Inc.',
      summary: 'Recognized for exceptional leadership and technical contributions',
    },
  ],
  certificates: [
    {
      id: 'cert1',
      name: 'AWS Solutions Architect',
      date: '2022-06',
      issuer: 'Amazon Web Services',
      url: 'https://aws.amazon.com/certification',
    },
  ],
  languages: [
    {
      id: 'lang1',
      language: 'English',
      fluency: 'Native',
    },
    {
      id: 'lang2',
      language: 'Spanish',
      fluency: 'Fluent',
    },
    {
      id: 'lang3',
      language: 'Mandarin',
      fluency: 'Conversational',
    },
  ],
  interests: [
    {
      id: 'interest1',
      name: 'Photography',
      keywords: ['Landscape', 'Street', 'Film'],
    },
    {
      id: 'interest2',
      name: 'Open Source',
      keywords: ['Contributing', 'Mentoring'],
    },
  ],
  references: [],
};

export const exampleResumeStyle: ResumeStyle = {
  primaryColor: '#1e293b',
  secondaryColor: '#64748b',
  accentColor: '#3b82f6',
  fontFamily: 'inter',
  fontSize: 'medium',
  sectionSpacing: 'normal',
  template: 'enhancv',
};

export const createExampleResume = (): SavedResume => ({
  id: 'example-resume-001',
  title: 'Example Resume - Alex Rivera',
  data: exampleResumeData,
  style: exampleResumeStyle,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const getEmptyResumeData = (): ResumeData => ({
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
});
