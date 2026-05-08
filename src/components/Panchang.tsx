import { CalendarClock, MapPin, MoonStar, SunMedium } from 'lucide-react';
import type { ReactNode } from 'react';
import { format } from 'date-fns';
import type { PanchangContent } from '../types';

const today = new Date();
const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(today);
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time zone';
const termName = (item: { name?: string; title?: string }) => item.name || item.title || '';
const termDescription = (item: { description?: string; text?: string }) => item.description || item.text || '';

export default function Panchang({ content }: { content: PanchangContent }) {
  return (
    <main className="page-container page-shell panchang-page">
      <section className="page-hero editorial-card">
        <p className="page-eyebrow">Panchang</p>
        <h1 className="page-title">{content.introTitle}</h1>
        <p className="page-subtitle">{content.intro}</p>
      </section>

      <section className="content-grid panchang-grid">
        <div className="panchang-card panchang-dashboard visual-card">
          <div className="today-summary">
            <div className="today-summary-main">
              <div className="today-badge">
                <CalendarClock size={18} />
                <span>Today</span>
              </div>
              <h2 className="today-date">{format(today, 'PPP')}</h2>
              <p className="today-weekday">{weekday}</p>
            </div>

            <div className="today-summary-side">
              <div className="today-summary-pill">
                <MapPin size={16} />
                <span>{timezone}</span>
              </div>
              <div className="today-summary-pill today-summary-pill-soft">
                <SunMedium size={16} />
                <span>Morning reflection and evening prayer are common devotional anchors.</span>
              </div>
            </div>
          </div>

          <div className="content-grid panchang-info-grid">
            {content.dailyNotes.map((note, index) => (
              <InfoCard
                key={`${termName(note)}-${index}`}
                icon={index % 2 === 0 ? <SunMedium /> : <MoonStar />}
                title={termName(note)}
                text={termDescription(note)}
                practicalMeaning={note.practicalMeaning}
              />
            ))}
          </div>
        </div>

        <div className="panchang-card panchang-dashboard visual-card">
          <div>
            <p className="page-eyebrow">Understand Panchang terms</p>
            <h2 className="card-title">Daily timing concepts</h2>
          </div>
          <div className="soft-divider" />
          <div className="content-grid term-grid">
            {content.terms.map((item, index) => (
              <div key={`${termName(item)}-${index}`} className="term-card">
                <p className="term-title">{termName(item)}</p>
                <p className="term-copy">{termDescription(item)}</p>
                {item.practicalMeaning && <p className="term-copy">Practical use: {item.practicalMeaning}</p>}
              </div>
            ))}
          </div>

          <div className="info-callout">
            <p className="page-eyebrow">Disclaimer</p>
            <p>{content.disclaimer}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, text, practicalMeaning }: { key?: string; icon: ReactNode; title: string; text: string; practicalMeaning?: string }) {
  return (
    <div className="term-card term-card-with-icon">
      <div className="term-icon">{icon}</div>
      <p className="term-title">{title}</p>
      <p className="term-copy">{text}</p>
      {practicalMeaning && <p className="term-copy">Practical use: {practicalMeaning}</p>}
    </div>
  );
}
