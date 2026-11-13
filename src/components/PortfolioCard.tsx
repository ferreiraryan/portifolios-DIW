import { useState } from 'react';
import {
  Calendar,
  Camera,
  ExternalLink,
  Eye,
  GitBranch,
  Globe,
  Monitor,
} from 'lucide-react';
import type { PortfolioItem } from '../data/portfolios';

interface PortfolioCardProps {
  item: PortfolioItem;
  onSelect: (item: PortfolioItem) => void;
}

export function PortfolioCard({ item, onSelect }: PortfolioCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="card">
      <div className="card-chrome">
        <div className="traffic-lights" aria-hidden="true">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <div className="url-pill" title={item.link}>
          {item.domain}
        </div>
        <span className="period-chip" title={`Período: ${item.periodo}`}>
          <Calendar size={11} />
          {item.periodo}
        </span>
      </div>

      <button
        type="button"
        className="card-preview-btn"
        onClick={() => onSelect(item)}
        aria-label={`Abrir preview do portfólio de ${item.nome}`}
      >
        {!imgError ? (
          <img
            src={item.previewImage}
            alt={`Preview do portfólio de ${item.nome}`}
            className="card-preview-img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-fallback">
            <Globe size={28} />
            <strong>{item.domain}</strong>
            <span>Captura indisponível — clique para detalhes</span>
          </div>
        )}

        <div className="card-preview-overlay">
          <span className="preview-cta">
            <Eye size={16} />
            {item.embeddable ? 'Abrir preview ao vivo' : 'Ampliar captura'}
          </span>
        </div>
      </button>

      <div className="card-footer">
        <div className="student-info">
          <h2 className="student-name" title={item.nome}>
            {item.nome}
          </h2>
          <div className="meta-row">
            <span
              className={`status-pill ${item.embeddable ? 'status-live' : 'status-static'}`}
              title={item.embedNote ?? 'Permite incorporação via iframe'}
            >
              {item.embeddable ? (
                <>
                  <Monitor size={11} /> Ao vivo
                </>
              ) : (
                <>
                  <Camera size={11} /> Captura local
                </>
              )}
            </span>
          </div>
        </div>

        <div className="card-actions">
          {item.repoUrl && (
            <a
              href={item.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn repo-btn"
              title="Abrir repositório"
              aria-label={`Abrir repositório de ${item.nome}`}
            >
              <GitBranch size={16} />
            </a>
          )}
          <button
            type="button"
            className="icon-btn"
            onClick={() => onSelect(item)}
            title="Visualizar preview"
            aria-label={`Visualizar preview de ${item.nome}`}
          >
            <Eye size={17} />
          </button>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn"
            title={`Abrir ${item.domain} em nova aba`}
            aria-label={`Abrir ${item.domain} em nova aba`}
          >
            <ExternalLink size={17} />
          </a>
        </div>
      </div>
    </article>
  );
}
