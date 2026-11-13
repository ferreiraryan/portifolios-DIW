export interface RawPortfolioItem {
  id: string;
  nome: string;
  link: string;
  periodo: string;
  repoUrl?: string;
  embeddable: boolean;
  embedNote?: string;
}

export interface PortfolioItem extends RawPortfolioItem {
  domain: string;
  previewImage: string;
}

const STORAGE_KEY = 'pucminas-diw-portfolios-v1';

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || url;
  }
}

export function hydratePortfolio(item: RawPortfolioItem): PortfolioItem {
  return {
    ...item,
    repoUrl: item.repoUrl?.trim() ?? '',
    domain: extractDomain(item.link),
    previewImage: `/previews/${item.id}.png`,
  };
}

export function stripDerivedFields(items: PortfolioItem[]): RawPortfolioItem[] {
  return items.map(({ domain: _d, previewImage: _p, ...raw }) => ({
    ...raw,
    repoUrl: raw.repoUrl?.trim() || '',
  }));
}

export async function loadPortfolios(): Promise<{
  items: PortfolioItem[];
  source: 'json' | 'localStorage';
}> {
  const res = await fetch('/portfolios.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Falha ao carregar portfolios.json (HTTP ${res.status})`);
  }
  const jsonItems = (await res.json()) as RawPortfolioItem[];

  const localRaw = localStorage.getItem(STORAGE_KEY);
  if (localRaw) {
    try {
      const parsed = JSON.parse(localRaw) as RawPortfolioItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { items: parsed.map(hydratePortfolio), source: 'localStorage' };
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return { items: jsonItems.map(hydratePortfolio), source: 'json' };
}

export async function savePortfolios(
  items: PortfolioItem[],
): Promise<'file+browser' | 'browser'> {
  const raw = stripDerivedFields(items);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));

  try {
    const res = await fetch('/api/portfolios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(raw),
    });
    if (res.ok) {
      localStorage.removeItem(STORAGE_KEY);
      return 'file+browser';
    }
  } catch {
    // Em build estático (/api/portfolios indisponível), mantém apenas localStorage
  }
  return 'browser';
}

export async function resetLocalOverride(): Promise<PortfolioItem[]> {
  localStorage.removeItem(STORAGE_KEY);
  const res = await fetch('/portfolios.json', { cache: 'no-store' });
  const jsonItems = (await res.json()) as RawPortfolioItem[];
  return jsonItems.map(hydratePortfolio);
}
