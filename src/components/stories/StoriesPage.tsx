import type { HinduStory } from '../../types';
import { t } from '../../utils/i18n';

interface StoriesPageProps {
  stories: HinduStory[];
  activeDeity?: string | null;
  language: 'ne' | 'en';
}

export default function StoriesPage({ stories, activeDeity, language }: StoriesPageProps) {
  const visibleStories = activeDeity ? stories.filter((story) => story.deity === activeDeity) : stories;
  return (
    <main className="page-container page-shell stories-page">
      <section className="page-hero editorial-card">
        <p className="page-eyebrow">{t('stories', language)}</p>
        <h1 className="page-title">{language === 'ne' ? 'पाठसहित छोटा धर्मकथा संग्रह' : 'Short Hindu stories with a lesson'}</h1>
        <p className="page-subtitle">
          {language === 'ne'
            ? 'श्रद्धायुक्त, परिवारमैत्री कथाहरू जसले भक्तिलाई दैनिकीको समझसँग जोड्छ।'
            : 'Respectful, family-friendly stories that connect devotion with everyday understanding.'}
        </p>
      </section>

      <div className="content-grid story-grid">
        {visibleStories.map((story) => (
          <article key={story.id} className="story-card story-feature-card visual-card">
            <header className="story-header">
              <div>
                <p className="page-eyebrow">{language === 'ne' ? 'कथा' : 'Story'}</p>
                <h2 className="card-title">{story.title}</h2>
                {story.deity && <p className="deity-line">{language === 'ne' ? 'सम्बद्ध देवता' : 'Linked deity'}: {story.deity}</p>}
              </div>
            </header>

            <section className="content-block">
              <p className="page-eyebrow">{t('summary', language)}</p>
              <div className="soft-divider" />
              <p className="card-copy">{story.summary}</p>
            </section>

            <section className="content-block story-excerpt">
              <p className="page-eyebrow">{language === 'ne' ? 'कथा' : 'Story'}</p>
              <div className="soft-divider" />
              <p className="reader-paragraph whitespace-pre-wrap">{story.story}</p>
            </section>

            <section className="lesson-callout">
              <p className="page-eyebrow">{t('lesson', language)}</p>
              <p className="reader-paragraph">{story.lesson}</p>
            </section>

            {story.source && (
              <section className="info-callout">
                <p className="page-eyebrow">{t('sourceLabel', language)}</p>
                <p>{story.source}</p>
              </section>
            )}

            <div className="chip-row">
              {story.tags.map((tag) => (
                <span key={tag} className="tag-chip tag-chip-muted">
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
