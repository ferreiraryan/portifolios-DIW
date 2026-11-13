import { useMemo, useState } from 'react';
import {
  Check,
  Download,
  ExternalLink,
  GitBranch,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import {
  hydratePortfolio,
  stripDerivedFields,
  type PortfolioItem,
} from '../data/portfolios';

interface AdminPanelProps {
  items: PortfolioItem[];
  onSaveAll: (nextItems: PortfolioItem[]) => Promise<'file+browser' | 'browser'>;
  onResetOverride: () => Promise<void>;
}

export function AdminPanel({
  items,
  onSaveAll,
  onResetOverride,
}: AdminPanelProps) {
  const [drafts, setDrafts] = useState<PortfolioItem[]>(items);
  const [search, setSearch] = useState('');
  const [repoFilter, setRepoFilter] = useState<'all' | 'missing' | 'with'>('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newPeriodo, setNewPeriodo] = useState('2026/2');
  const [newRepo, setNewRepo] = useState('');

  const visibleDrafts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drafts.filter((d) => {
      if (repoFilter === 'missing' && d.repoUrl) return false;
      if (repoFilter === 'with' && !d.repoUrl) return false;
      if (!q) return true;
      return (
        d.nome.toLowerCase().includes(q) ||
        d.link.toLowerCase().includes(q) ||
        (d.repoUrl ?? '').toLowerCase().includes(q)
      );
    });
  }, [drafts, search, repoFilter]);

  const updateField = <K extends keyof PortfolioItem>(
    id: string,
    key: K,
    value: PortfolioItem[K],
  ) => {
    setDrafts((prev) =>
      prev.map((item) =>
        item.id === id
          ? hydratePortfolio({
              ...item,
              [key]: value,
            })
          : item,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const target = await onSaveAll(drafts);
      setFeedback(
        target === 'file+browser'
          ? 'Salvo em public/portfolios.json e atualizado na vitrine!'
          : 'Salvo no navegador (localStorage). Use "Exportar JSON" para atualizar public/portfolios.json em produção.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLink.trim()) return;
    const normalizedLink = newLink.startsWith('http')
      ? newLink.trim()
      : `https://${newLink.trim()}`;
    const slug =
      newName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `aluno-${Date.now()}`;

    const created = hydratePortfolio({
      id: `${slug}-${Date.now().toString(36).slice(-4)}`,
      nome: newName.trim(),
      link: normalizedLink,
      periodo: newPeriodo.trim() || '2026/2',
      repoUrl: newRepo.trim(),
      embeddable: true,
    });
    setDrafts((prev) => [created, ...prev]);
    setNewName('');
    setNewLink('');
    setNewRepo('');
    setFeedback('Novo portfólio adicionado ao rascunho. Clique em "Salvar alterações".');
  };

  const handleDelete = (id: string) => {
    setDrafts((prev) => prev.filter((item) => item.id !== id));
    setFeedback('Item removido do rascunho. Clique em "Salvar alterações" para confirmar.');
  };

  const handleExportJson = () => {
    const raw = stripDerivedFields(drafts);
    const blob = new Blob([`${JSON.stringify(raw, null, 2)}\n`], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolios.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    await onResetOverride();
    setFeedback('Dados restaurados a partir de public/portfolios.json.');
  };

  return (
    <section className="admin-section">
      <div className="admin-top-bar">
        <div className="admin-filters">
          <input
            type="search"
            className="search-input admin-search"
            placeholder="Filtrar aluno, site ou repositório..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filter-group">
            <button
              type="button"
              className={`filter-btn ${repoFilter === 'all' ? 'active' : ''}`}
              onClick={() => setRepoFilter('all')}
            >
              Todos ({drafts.length})
            </button>
            <button
              type="button"
              className={`filter-btn ${repoFilter === 'missing' ? 'active' : ''}`}
              onClick={() => setRepoFilter('missing')}
            >
              Sem repo ({drafts.filter((d) => !d.repoUrl).length})
            </button>
            <button
              type="button"
              className={`filter-btn ${repoFilter === 'with' ? 'active' : ''}`}
              onClick={() => setRepoFilter('with')}
            >
              Com repo ({drafts.filter((d) => Boolean(d.repoUrl)).length})
            </button>
          </div>
        </div>

        <div className="admin-actions">
          <button
            type="button"
            className="secondary-link-btn"
            onClick={handleReset}
            title="Descartar rascunho local e recarregar do JSON"
          >
            <RotateCcw size={15} /> Recarregar JSON
          </button>
          <button
            type="button"
            className="secondary-link-btn"
            onClick={handleExportJson}
          >
            <Download size={15} /> Exportar JSON
          </button>
          <button
            type="button"
            className="primary-link-btn"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="admin-toast" role="status">
          <Check size={16} />
          <span>{feedback}</span>
        </div>
      )}

      <form className="admin-add-form" onSubmit={handleAdd}>
        <input
          type="text"
          className="admin-input"
          placeholder="Nome do aluno"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <input
          type="text"
          className="admin-input"
          placeholder="Link do site (ex: https://aluno.dev)"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          required
        />
        <input
          type="text"
          className="admin-input admin-input-sm"
          placeholder="Período (ex: 2026/2)"
          value={newPeriodo}
          onChange={(e) => setNewPeriodo(e.target.value)}
        />
        <input
          type="url"
          className="admin-input"
          placeholder="Link do repositório (opcional)"
          value={newRepo}
          onChange={(e) => setNewRepo(e.target.value)}
        />
        <button type="submit" className="primary-link-btn">
          <Plus size={15} /> Adicionar
        </button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Link do Site</th>
              <th>Período</th>
              <th>Link do Repositório</th>
              <th>Iframe</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {visibleDrafts.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="text"
                    className="admin-cell-input"
                    value={item.nome}
                    onChange={(e) => updateField(item.id, 'nome', e.target.value)}
                    aria-label={`Nome de ${item.nome}`}
                  />
                </td>
                <td>
                  <div className="admin-url-cell">
                    <input
                      type="url"
                      className="admin-cell-input mono"
                      value={item.link}
                      onChange={(e) => updateField(item.id, 'link', e.target.value)}
                      aria-label={`Site de ${item.nome}`}
                    />
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-btn"
                      title="Abrir site"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    className="admin-cell-input period-input"
                    value={item.periodo}
                    onChange={(e) =>
                      updateField(item.id, 'periodo', e.target.value)
                    }
                    aria-label={`Período de ${item.nome}`}
                  />
                </td>
                <td>
                  <div className="admin-url-cell">
                    <GitBranch size={15} className="repo-icon-inline" />
                    <input
                      type="url"
                      className="admin-cell-input mono"
                      placeholder="https://github.com/usuario/repo"
                      value={item.repoUrl ?? ''}
                      onChange={(e) =>
                        updateField(item.id, 'repoUrl', e.target.value)
                      }
                      aria-label={`Repositório de ${item.nome}`}
                    />
                  </div>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={item.embeddable}
                    onChange={(e) =>
                      updateField(item.id, 'embeddable', e.target.checked)
                    }
                    aria-label={`Permitir iframe para ${item.nome}`}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="icon-btn danger-btn"
                    onClick={() => handleDelete(item.id)}
                    title="Remover portfólio"
                    aria-label={`Remover ${item.nome}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
