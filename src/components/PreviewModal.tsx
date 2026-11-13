import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Camera,
  ExternalLink,
  GitBranch,
  Monitor,
  Smartphone,
  X,
} from 'lucide-react';
import type { PortfolioItem } from '../data/portfolios';

interface PreviewModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export function PreviewModal({ item, onClose }: PreviewModalProps) {
  const [viewMode, setViewMode] = useState<'iframe' | 'screenshot'>('iframe');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!item) return;
    setViewMode(item.embeddable ? 'iframe' : 'screenshot');
    setViewport('desktop');
    setImgError(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview do portfólio de ${item.nome}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-title-row">
              <h2>{item.nome}</h2>
              <span className="period-chip">
                <Calendar size={11} />
                {item.periodo}
              </span>
            </div>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              {item.link}
            </a>
          </div>

          <div className="modal-controls">
            {item.embeddable && (
              <>
                <div className="segmented" aria-label="Modo de visualização">
                  <button
                    type="button"
                    className={`seg-btn ${viewMode === 'iframe' ? 'active' : ''}`}
                    onClick={() => setViewMode('iframe')}
                  >
                    <Monitor size={14} /> Ao vivo
                  </button>
                  <button
                    type="button"
                    className={`seg-btn ${viewMode === 'screenshot' ? 'active' : ''}`}
                    onClick={() => setViewMode('screenshot')}
                  >
                    <Camera size={14} /> Captura
                  </button>
                </div>

                {viewMode === 'iframe' && (
                  <div className="segmented" aria-label="Tamanho da tela">
                    <button
                      type="button"
                      className={`seg-btn ${viewport === 'desktop' ? 'active' : ''}`}
                      onClick={() => setViewport('desktop')}
                      title="Desktop"
                    >
                      <Monitor size={14} />
                    </button>
                    <button
                      type="button"
                      className={`seg-btn ${viewport === 'mobile' ? 'active' : ''}`}
                      onClick={() => setViewport('mobile')}
                      title="Mobile (390px)"
                    >
                      <Smartphone size={14} />
                    </button>
                  </div>
                )}
              </>
            )}

            {item.repoUrl && (
              <a
                href={item.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-link-btn"
              >
                <GitBranch size={15} /> Repositório
              </a>
            )}

            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-link-btn"
            >
              Abrir site <ExternalLink size={15} />
            </a>

            <button
              type="button"
              className="icon-btn"
              onClick={onClose}
              aria-label="Fechar preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {!item.embeddable && (
            <div className="modal-notice">
              <AlertTriangle size={18} />
              <span>
                {item.embedNote ??
                  'Este site restringe incorporação via iframe.'}{' '}
                Exibindo captura local — use &ldquo;Abrir site&rdquo; para
                navegar diretamente.
              </span>
            </div>
          )}

          {item.embeddable && viewMode === 'iframe' ? (
            <iframe
              key={`${item.id}-${viewport}`}
              src={item.link}
              title={`Preview ao vivo de ${item.nome}`}
              className={`iframe-frame ${viewport === 'mobile' ? 'mobile' : ''}`}
              loading="lazy"
            />
          ) : !imgError ? (
            <img
              src={item.previewImage}
              alt={`Captura do portfólio de ${item.nome}`}
              className="modal-screenshot"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="card-fallback">
              <strong>{item.domain}</strong>
              <span>
                Não foi possível carregar a captura local deste domínio.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
