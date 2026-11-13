import { ArrowLeft, Calendar, Search, Shield } from 'lucide-react';

export type FilterMode = 'all' | 'live';

interface HeaderProps {
  totalCount: number;
  liveCount: number;
  repoCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  filter: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
  periods: string[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export function Header({
  totalCount,
  liveCount,
  repoCount,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  periods,
  selectedPeriod,
  onPeriodChange,
  isAdmin,
  onToggleAdmin,
}: HeaderProps) {
  return (
    <header className="hero">
      <div className="container">
        <div className="hero-top-row">
          <div className="brand-block">
            <img
              src="/pucminas-logo.svg"
              alt="Logo PUC Minas — Oficina de DIW"
              className="puc-logo"
            />
            <div className="hero-badge-row">
              <span className="badge badge-count">{totalCount} portfólios</span>
              <span className="badge badge-count">
                {repoCount} repositórios
              </span>
            </div>
          </div>

          {(import.meta.env.DEV || isAdmin) && (
            <button
              type="button"
              className={`admin-toggle-btn ${isAdmin ? 'active' : ''}`}
              onClick={onToggleAdmin}
            >
              {isAdmin ? (
                <>
                  <ArrowLeft size={16} /> Voltar para Vitrine
                </>
              ) : (
                <>
                  <Shield size={16} /> Painel Admin
                </>
              )}
            </button>
          )}
        </div>

        <h1 className="hero-title">
          <span>
            {isAdmin ? 'Painel Admin · Repositórios' : 'Vitrine de Portfólios'}
          </span>
        </h1>
        <p className="hero-subtitle">
          {isAdmin
            ? 'Gerencie os links dos repositórios, adicione novos portfólios ou atualize os dados carregados do JSON.'
            : 'Projetos pessoais desenvolvidos pelos alunos na Oficina de Desenvolvimento de Interfaces Web (DIW) da PUC Minas.'}
        </p>

        {!isAdmin && (
          <div className="toolbar">
            <div className="search-box">
              <Search size={17} className="search-icon" />
              <input
                type="search"
                className="search-input"
                placeholder="Buscar por nome do aluno ou link..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Buscar portfólio por aluno ou link"
              />
            </div>

            <div className="toolbar-right">
              {periods.length > 0 && (
                <label className="period-select-wrap">
                  <Calendar size={15} className="period-icon" />
                  <select
                    className="period-select"
                    value={selectedPeriod}
                    onChange={(e) => onPeriodChange(e.target.value)}
                    aria-label="Filtrar por período"
                  >
                    <option value="all">Todos os períodos</option>
                    {periods.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div
                className="filter-group"
                role="tablist"
                aria-label="Filtrar portfólios"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === 'all'}
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => onFilterChange('all')}
                >
                  Todos ({totalCount})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === 'live'}
                  className={`filter-btn ${filter === 'live' ? 'active' : ''}`}
                  onClick={() => onFilterChange('live')}
                >
                  Preview ao vivo ({liveCount})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
