import { useEffect, useMemo, useState } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { Header, type FilterMode } from './components/Header';
import { PortfolioCard } from './components/PortfolioCard';
import { PreviewModal } from './components/PreviewModal';
import {
  loadPortfolios,
  resetLocalOverride,
  savePortfolios,
  type PortfolioItem,
} from './data/portfolios';

export function App() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(
    () => window.location.hash === '#admin',
  );

  useEffect(() => {
    loadPortfolios()
      .then(({ items: loaded }) => {
        setItems(loaded);
        setLoadError(null);
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onHashChange = () => setIsAdmin(window.location.hash === '#admin');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const toggleAdmin = () => {
    const next = !isAdmin;
    setIsAdmin(next);
    window.location.hash = next ? '#admin' : '';
  };

  const periods = useMemo(
    () => Array.from(new Set(items.map((p) => p.periodo).filter(Boolean))),
    [items],
  );

  const liveCount = useMemo(
    () => items.filter((p) => p.embeddable).length,
    [items],
  );

  const repoCount = useMemo(
    () => items.filter((p) => Boolean(p.repoUrl)).length,
    [items],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (filter === 'live' && !item.embeddable) return false;
      if (selectedPeriod !== 'all' && item.periodo !== selectedPeriod) {
        return false;
      }
      if (!query) return true;
      return (
        item.nome.toLowerCase().includes(query) ||
        item.domain.toLowerCase().includes(query) ||
        item.link.toLowerCase().includes(query)
      );
    });
  }, [items, search, filter, selectedPeriod]);

  const handleSaveAll = async (nextItems: PortfolioItem[]) => {
    const target = await savePortfolios(nextItems);
    setItems(nextItems);
    return target;
  };

  const handleResetOverride = async () => {
    const fresh = await resetLocalOverride();
    setItems(fresh);
  };

  return (
    <>
      <Header
        totalCount={items.length}
        liveCount={liveCount}
        repoCount={repoCount}
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        periods={periods}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        isAdmin={isAdmin}
        onToggleAdmin={toggleAdmin}
      />

      <main className="main-content">
        <div className="container">
          {loading ? (
            <div className="empty-state">
              Carregando portfólios de <code>/portfolios.json</code>...
            </div>
          ) : loadError ? (
            <div className="empty-state">{loadError}</div>
          ) : isAdmin ? (
            <AdminPanel
              key={items.map((i) => i.id).join(',')}
              items={items}
              onSaveAll={handleSaveAll}
              onResetOverride={handleResetOverride}
            />
          ) : filtered.length > 0 ? (
            <div className="grid">
              {filtered.map((item) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  onSelect={setSelected}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              Nenhum portfólio encontrado para &ldquo;{search}&rdquo;.
            </div>
          )}
        </div>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <img
            src="/pucminas-logo.svg"
            alt="PUC Minas"
            className="footer-logo"
          />
          <span>
            Oficina de Desenvolvimento de Interfaces Web (DIW) · PUC Minas
          </span>
        </div>
      </footer>

      <PreviewModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default App;
