import type { HinduStory } from '../../types';

interface StoriesPageProps {
  stories: HinduStory[];
}

export default function StoriesPage({ stories }: StoriesPageProps) {
  return (
    <main className="page-container page-shell stories-page">
      <section className="page-hero editorial-card">
        <p className="page-eyebrow">Stories</p>
        <h1 className="page-title">Short Hindu stories with a lesson</h1>
        <p className="page-subtitle">
          Respectful, family-friendly stories that connect devotion with everyday understanding.
        </p>
      </section>

      <div className="content-grid story-grid">
        {stories.map((story) => (
          <article key={story.id} className="story-card story-feature-card visual-card">
            <header className="story-header">
              <div>
                <p className="page-eyebrow">Story</p>
                <h2 className="card-title">{story.title}</h2>
                {story.deity && <p className="deity-line">Linked deity: {story.deity}</p>}
              </div>
            </header>

            <section className="content-block">
              <p className="page-eyebrow">Summary</p>
              <div className="soft-divider" />
              <p className="card-copy">{story.summary}</p>
            </section>

            <section className="content-block story-excerpt">
              <p className="page-eyebrow">Story</p>
              <div className="soft-divider" />
              <p className="reader-paragraph whitespace-pre-wrap">{story.story}</p>
            </section>

            <section className="lesson-callout">
              <p className="page-eyebrow">Lesson</p>
              <p className="reader-paragraph">{story.lesson}</p>
            </section>

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
