import type { PoojaBidhi } from '../../types';

interface PoojaPageProps {
  poojaBidhi: PoojaBidhi[];
}

export default function PoojaPage({ poojaBidhi }: PoojaPageProps) {
  return (
    <main className="page-container page-shell pooja-page">
      <section className="page-hero editorial-card">
        <p className="page-eyebrow">Pooja Bidhi</p>
        <h1 className="page-title">Simple guidance for special poojas</h1>
        <p className="page-subtitle">
          Practical outlines for common family rituals. Follow your family tradition and consult a priest for major ceremonies.
        </p>
      </section>

      <div className="content-grid pooja-grid">
        {poojaBidhi.map((item) => (
          <article key={item.id} className="pooja-card pooja-guide-card visual-card">
            <header className="pooja-card-header">
              <div>
                <p className="page-eyebrow">{item.occasion}</p>
                <h2 className="card-title">{item.title}</h2>
                <p className="deity-line">Deity: {item.deity}</p>
              </div>
            </header>

            <p className="card-copy">{item.overview}</p>

            <section className="content-block">
              <p className="page-eyebrow">Samagri</p>
              <div className="soft-divider" />
              <div className="compact-checklist">
                {item.materials.map((material) => (
                  <div key={material} className="check-item">
                    <span className="check-dot" />
                    <span>{material}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="content-block">
              <p className="page-eyebrow">Steps</p>
              <div className="soft-divider" />
              <ol className="step-list">
                {item.steps.map((step, index) => (
                  <li key={step} className="step-item">
                    <span className="step-number">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="content-block info-block">
              <p className="page-eyebrow">Benefits</p>
              <div className="soft-divider" />
              <ul className="bullet-list">
                {item.benefits.map((benefit) => (
                  <li key={benefit}>• {benefit}</li>
                ))}
              </ul>
            </section>

            <section className="info-callout">
              <p className="page-eyebrow">Caution</p>
              <p>{item.cautions || 'Traditions vary by family, region, and sampradaya. For major rituals, consult a priest or family elder.'}</p>
            </section>

            {item.source && (
              <section className="info-callout">
                <p className="page-eyebrow">Source</p>
                <p>{item.source}</p>
              </section>
            )}

            <div className="chip-row">
              {item.tags.map((tag) => (
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
