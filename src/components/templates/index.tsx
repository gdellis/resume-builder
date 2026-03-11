import React from 'react';
import { ResumeData, ResumeStyle } from '@/types/resume';

interface TemplateProps {
  data: ResumeData;
  style: ResumeStyle;
}

const fontFamilies: Record<string, string> = {
  inter: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
};

const fontSizes = {
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base',
};

const spacing = {
  compact: 'space-y-2',
  normal: 'space-y-4',
  relaxed: 'space-y-6',
};

export function ModernTemplate({ data, style }: TemplateProps) {
  const { basics, work, education, skills, languages, interests } = data;
  const fontFamily = fontFamilies[style.fontFamily] || 'font-sans';
  const fontSize = fontSizes[style.fontSize];
  const sectionSpace = spacing[style.sectionSpacing];

  return (
    <div 
      className={`w-full h-full p-8 bg-white ${fontFamily} ${fontSize}`}
      style={{ 
        '--primary': style.primaryColor,
        '--secondary': style.secondaryColor,
        '--accent': style.accentColor,
      } as React.CSSProperties}
    >
      <header className="border-b-2 pb-4 mb-6" style={{ borderColor: style.primaryColor }}>
        <h1 
          className="text-3xl font-bold"
          style={{ color: style.primaryColor }}
        >
          {basics.name || 'Your Name'}
        </h1>
        {basics.label && (
          <p className="text-lg mt-1" style={{ color: style.secondaryColor }}>
            {basics.label}
          </p>
        )}
        <div className="flex flex-wrap gap-4 mt-3 text-sm" style={{ color: style.secondaryColor }}>
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.url && <span>• {basics.url}</span>}
        </div>
      </header>

      {basics.summary && (
        <section className={sectionSpace}>
          <h2 
            className="text-lg font-semibold uppercase tracking-wider"
            style={{ color: style.primaryColor }}
          >
            Summary
          </h2>
          <p style={{ color: style.secondaryColor }}>{basics.summary}</p>
        </section>
      )}

      {work.length > 0 && (
        <section className={sectionSpace}>
          <h2 
            className="text-lg font-semibold uppercase tracking-wider"
            style={{ color: style.primaryColor }}
          >
            Experience
          </h2>
          {work.map((job, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold" style={{ color: style.primaryColor }}>
                  {job.position}
                </h3>
                <span className="text-sm" style={{ color: style.secondaryColor }}>
                  {job.startDate} - {job.endDate || 'Present'}
                </span>
              </div>
              <p style={{ color: style.accentColor }}>{job.name}</p>
              {job.summary && (
                <p className="mt-1" style={{ color: style.secondaryColor }}>{job.summary}</p>
              )}
              {job.highlights.length > 0 && (
                <ul className="mt-2 list-disc list-inside" style={{ color: style.secondaryColor }}>
                  {job.highlights.filter(Boolean).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section className={sectionSpace}>
          <h2 
            className="text-lg font-semibold uppercase tracking-wider"
            style={{ color: style.primaryColor }}
          >
            Education
          </h2>
          {education.map((edu, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold" style={{ color: style.primaryColor }}>
                  {edu.institution}
                </h3>
                <span className="text-sm" style={{ color: style.secondaryColor }}>
                  {edu.startDate} - {edu.endDate || 'Present'}
                </span>
              </div>
              <p style={{ color: style.secondaryColor }}>
                {edu.area} {edu.studyType && `in ${edu.studyType}`}
              </p>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section className={sectionSpace}>
          <h2 
            className="text-lg font-semibold uppercase tracking-wider"
            style={{ color: style.primaryColor }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: `${style.accentColor}15`,
                  color: style.accentColor 
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {languages.length > 0 && (
        <section className={sectionSpace}>
          <h2 
            className="text-lg font-semibold uppercase tracking-wider"
            style={{ color: style.primaryColor }}
          >
            Languages
          </h2>
          <div className="flex flex-wrap gap-4" style={{ color: style.secondaryColor }}>
            {languages.map((lang, idx) => (
              <span key={idx}>
                <strong>{lang.language}</strong>: {lang.fluency}
              </span>
            ))}
          </div>
        </section>
      )}

      {interests.length > 0 && (
        <section className={sectionSpace}>
          <h2 
            className="text-lg font-semibold uppercase tracking-wider"
            style={{ color: style.primaryColor }}
          >
            Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: `${style.secondaryColor}15`,
                  color: style.secondaryColor 
                }}
              >
                {interest.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function ClassicTemplate({ data, style }: TemplateProps) {
  const { basics, work, education, skills, languages } = data;
  const fontFamily = fontFamilies[style.fontFamily] || 'font-sans';
  const fontSize = fontSizes[style.fontSize];
  const sectionSpace = spacing[style.sectionSpacing];

  return (
    <div 
      className={`w-full h-full p-8 bg-white ${fontFamily} ${fontSize}`}
      style={{ 
        '--primary': style.primaryColor,
        '--secondary': style.secondaryColor,
      } as React.CSSProperties}
    >
      <header className="text-center border-b border-gray-300 pb-4 mb-6">
        <h1 
          className="text-2xl font-bold uppercase"
          style={{ color: style.primaryColor }}
        >
          {basics.name || 'Your Name'}
        </h1>
        {basics.label && (
          <p className="text-sm mt-1" style={{ color: style.secondaryColor }}>
            {basics.label}
          </p>
        )}
        <div className="flex justify-center gap-3 mt-2 text-xs" style={{ color: style.secondaryColor }}>
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>| {basics.phone}</span>}
          {basics.url && <span>| {basics.url}</span>}
        </div>
      </header>

      {basics.summary && (
        <section className={sectionSpace}>
          <h2 
            className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-3"
            style={{ color: style.primaryColor, borderColor: style.primaryColor }}
          >
            Professional Summary
          </h2>
          <p style={{ color: style.secondaryColor }}>{basics.summary}</p>
        </section>
      )}

      {work.length > 0 && (
        <section className={sectionSpace}>
          <h2 
            className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-3"
            style={{ color: style.primaryColor, borderColor: style.primaryColor }}
          >
            Work Experience
          </h2>
          {work.map((job, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold" style={{ color: style.primaryColor }}>
                  {job.position}
                </h3>
                <span className="text-xs" style={{ color: style.secondaryColor }}>
                  {job.startDate} - {job.endDate || 'Present'}
                </span>
              </div>
              <p className="text-xs italic" style={{ color: style.secondaryColor }}>
                {job.name}
              </p>
              {job.highlights.length > 0 && (
                <ul className="mt-1 list-disc list-inside text-xs" style={{ color: style.secondaryColor }}>
                  {job.highlights.filter(Boolean).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section className={sectionSpace}>
          <h2 
            className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-3"
            style={{ color: style.primaryColor, borderColor: style.primaryColor }}
          >
            Education
          </h2>
          {education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-sm" style={{ color: style.primaryColor }}>
                  {edu.institution}
                </h3>
                <span className="text-xs" style={{ color: style.secondaryColor }}>
                  {edu.startDate} - {edu.endDate || 'Present'}
                </span>
              </div>
              <p className="text-xs" style={{ color: style.secondaryColor }}>
                {edu.area} {edu.studyType && `in ${edu.studyType}`}
              </p>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section className={sectionSpace}>
          <h2 
            className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-3"
            style={{ color: style.primaryColor, borderColor: style.primaryColor }}
          >
            Skills
          </h2>
          <div className="text-xs" style={{ color: style.secondaryColor }}>
            {skills.map((skill, idx) => (
              <span key={idx}>
                {skill.name}
                {idx < skills.length - 1 ? ' • ' : ''}
              </span>
            ))}
          </div>
        </section>
      )}

      {languages.length > 0 && (
        <section className={sectionSpace}>
          <h2 
            className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-3"
            style={{ color: style.primaryColor, borderColor: style.primaryColor }}
          >
            Languages
          </h2>
          <div className="text-xs" style={{ color: style.secondaryColor }}>
            {languages.map((lang, idx) => (
              <span key={idx}>
                {lang.language}: {lang.fluency}
                {idx < languages.length - 1 ? ' • ' : ''}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function CreativeTemplate({ data, style }: TemplateProps) {
  const { basics, work, education, skills, languages, interests } = data;
  const fontFamily = fontFamilies[style.fontFamily] || 'font-sans';
  const fontSize = fontSizes[style.fontSize];
  const sectionSpace = spacing[style.sectionSpacing];

  return (
    <div 
      className={`w-full h-full p-6 bg-white ${fontFamily} ${fontSize}`}
      style={{ 
        '--primary': style.primaryColor,
        '--secondary': style.secondaryColor,
        '--accent': style.accentColor,
      } as React.CSSProperties}
    >
      <div 
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: style.accentColor }}
      />

      <header className="pl-6 mb-6">
        <h1 
          className="text-3xl font-bold"
          style={{ color: style.primaryColor }}
        >
          {basics.name || 'Your Name'}
        </h1>
        {basics.label && (
          <p 
            className="text-lg mt-1 font-medium"
            style={{ color: style.accentColor }}
          >
            {basics.label}
          </p>
        )}
        <div className="flex flex-wrap gap-3 mt-3 text-sm" style={{ color: style.secondaryColor }}>
          {basics.email && <span>✉ {basics.email}</span>}
          {basics.phone && <span>☎ {basics.phone}</span>}
          {basics.url && <span>🌐 {basics.url}</span>}
        </div>
      </header>

      {basics.summary && (
        <section className={`${sectionSpace} pl-6`}>
          <h2 
            className="text-lg font-bold"
            style={{ color: style.primaryColor }}
          >
            ✦ About Me
          </h2>
          <p style={{ color: style.secondaryColor }}>{basics.summary}</p>
        </section>
      )}

      {work.length > 0 && (
        <section className={`${sectionSpace} pl-6`}>
          <h2 
            className="text-lg font-bold"
            style={{ color: style.primaryColor }}
          >
            ✦ Experience
          </h2>
          {work.map((job, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold" style={{ color: style.primaryColor }}>
                  {job.position}
                </h3>
                <span 
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ 
                    backgroundColor: style.accentColor,
                    color: 'white'
                  }}
                >
                  {job.startDate} - {job.endDate || 'Present'}
                </span>
              </div>
              <p 
                className="text-sm font-medium mt-0.5"
                style={{ color: style.accentColor }}
              >
                {job.name}
              </p>
              {job.highlights.length > 0 && (
                <ul className="mt-2 list-none" style={{ color: style.secondaryColor }}>
                  {job.highlights.filter(Boolean).map((h, i) => (
                    <li key={i} className="text-sm">▸ {h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section className={`${sectionSpace} pl-6`}>
          <h2 
            className="text-lg font-bold"
            style={{ color: style.primaryColor }}
          >
            ✦ Education
          </h2>
          {education.map((edu, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="font-semibold" style={{ color: style.primaryColor }}>
                {edu.institution}
              </h3>
              <p className="text-sm" style={{ color: style.secondaryColor }}>
                {edu.area} {edu.studyType && `in ${edu.studyType}`}
              </p>
              <p className="text-xs" style={{ color: style.accentColor }}>
                {edu.startDate} - {edu.endDate || 'Present'}
              </p>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section className={`${sectionSpace} pl-6`}>
          <h2 
            className="text-lg font-bold"
            style={{ color: style.primaryColor }}
          >
            ✦ Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 rounded text-sm font-medium"
                style={{ 
                  backgroundColor: style.primaryColor,
                  color: 'white'
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {languages.length > 0 && (
        <section className={`${sectionSpace} pl-6`}>
          <h2 
            className="text-lg font-bold"
            style={{ color: style.primaryColor }}
          >
            ✦ Languages
          </h2>
          <div className="flex flex-wrap gap-4" style={{ color: style.secondaryColor }}>
            {languages.map((lang, idx) => (
              <span key={idx}>
                <strong style={{ color: style.primaryColor }}>{lang.language}</strong> — {lang.fluency}
              </span>
            ))}
          </div>
        </section>
      )}

      {interests.length > 0 && (
        <section className={`${sectionSpace} pl-6`}>
          <h2 
            className="text-lg font-bold"
            style={{ color: style.primaryColor }}
          >
            ✦ Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 rounded text-sm"
                style={{ 
                  border: `1px solid ${style.accentColor}`,
                  color: style.accentColor 
                }}
              >
                {interest.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function EnhancvTemplate({ data, style }: TemplateProps) {
  const { basics, work, education, skills, languages } = data;
  const fontFamily = fontFamilies[style.fontFamily] || 'font-sans';
  const fontSize = fontSizes[style.fontSize];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`w-full min-h-full bg-white ${fontFamily} ${fontSize} flex`}
      style={{
        '--primary': style.primaryColor,
        '--secondary': style.secondaryColor,
        '--accent': style.accentColor,
      } as React.CSSProperties}
    >
      {/* Left Sidebar */}
      <div
        className="w-[35%] bg-slate-50 p-6 flex flex-col"
        style={{ borderRight: `1px solid ${style.secondaryColor}20` }}
      >
        {/* Photo/Avatar */}
        <div className="mb-6 flex justify-center">
          {basics.photo ? (
            <img
              src={basics.photo}
              alt={basics.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: style.accentColor, color: 'white' }}
            >
              {getInitials(basics.name)}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="mb-6 space-y-2 text-sm" style={{ color: style.secondaryColor }}>
          {basics.email && (
            <div className="flex items-center gap-2">
              <span>✉</span>
              <span>{basics.email}</span>
            </div>
          )}
          {basics.phone && (
            <div className="flex items-center gap-2">
              <span>☎</span>
              <span>{basics.phone}</span>
            </div>
          )}
          {basics.location?.city && (
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{[basics.location.city, basics.location.region].filter(Boolean).join(', ')}</span>
            </div>
          )}
          {basics.profiles?.map((profile, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span>🔗</span>
              <span>{profile.network}: {profile.username}</span>
            </div>
          ))}
        </div>

        {/* Languages */}
        {languages.length > 0 && (
          <div className="mb-6">
            <h3
              className="text-sm font-bold uppercase tracking-wider mb-3"
              style={{ color: style.primaryColor }}
            >
              Languages
            </h3>
            <div className="space-y-2">
              {languages.map((lang, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: style.primaryColor }}>{lang.language}</span>
                    <span style={{ color: style.secondaryColor }}>{lang.fluency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h3
              className="text-sm font-bold uppercase tracking-wider mb-3"
              style={{ color: style.primaryColor }}
            >
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: `${style.accentColor}20`,
                    color: style.accentColor,
                  }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tools (from skills keywords) */}
        {skills.some((s) => s.keywords.length > 0) && (
          <div>
            <h3
              className="text-sm font-bold uppercase tracking-wider mb-3"
              style={{ color: style.primaryColor }}
            >
              Tools
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills
                .flatMap((s) => s.keywords)
                .filter((k, i, arr) => arr.indexOf(k) === i)
                .map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor: `${style.secondaryColor}15`,
                      color: style.secondaryColor,
                    }}
                  >
                    {tool}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <header className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: style.primaryColor }}
          >
            {basics.name || 'Your Name'}
          </h1>
          {basics.label && (
            <p
              className="text-xl"
              style={{ color: style.accentColor }}
            >
              {basics.label}
            </p>
          )}
        </header>

        {/* Profile/Summary */}
        {basics.summary && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: style.accentColor }}
              />
              <h2
                className="text-lg font-bold uppercase tracking-wider"
                style={{ color: style.primaryColor }}
              >
                Profile
              </h2>
            </div>
            <p style={{ color: style.secondaryColor, lineHeight: '1.6' }}>
              {basics.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {work.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: style.accentColor }}
              />
              <h2
                className="text-lg font-bold uppercase tracking-wider"
                style={{ color: style.primaryColor }}
              >
                Experience
              </h2>
            </div>
            <div className="space-y-5">
              {work.map((job, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className="font-bold"
                      style={{ color: style.primaryColor }}
                    >
                      {job.position}
                    </h3>
                    <span
                      className="text-sm whitespace-nowrap"
                      style={{ color: style.secondaryColor }}
                    >
                      {job.startDate} – {job.endDate || 'Present'}
                    </span>
                  </div>
                  <p
                    className="text-sm mb-1"
                    style={{ color: style.accentColor }}
                  >
                    {job.name}
                  </p>
                  {job.summary && (
                    <p
                      className="text-sm mb-2"
                      style={{ color: style.secondaryColor }}
                    >
                      {job.summary}
                    </p>
                  )}
                  {job.highlights.length > 0 && (
                    <ul className="space-y-1">
                      {job.highlights.filter(Boolean).map((h, i) => (
                        <li
                          key={i}
                          className="text-sm"
                          style={{ color: style.secondaryColor }}
                        >
                          • {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: style.accentColor }}
              />
              <h2
                className="text-lg font-bold uppercase tracking-wider"
                style={{ color: style.primaryColor }}
              >
                Education
              </h2>
            </div>
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start">
                    <h3
                      className="font-bold"
                      style={{ color: style.primaryColor }}
                    >
                      {edu.institution}
                    </h3>
                    <span
                      className="text-sm whitespace-nowrap"
                      style={{ color: style.secondaryColor }}
                    >
                      {edu.startDate} – {edu.endDate || 'Present'}
                    </span>
                  </div>
                  <p style={{ color: style.secondaryColor }}>
                    {edu.area}
                    {edu.studyType && `, ${edu.studyType}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export const templates = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  creative: CreativeTemplate,
  enhancv: EnhancvTemplate,
};