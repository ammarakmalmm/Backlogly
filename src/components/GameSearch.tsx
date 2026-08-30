import { useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { searchGames, getGameDeveloper, type GameSummary } from '../services/gameLookup';

type Picked = { title: string; image?: string; platform: string; genre: string; developer: string; releaseYear: string };

export function GameSearch({ onSelect, onClose }: { onSelect: (data: Picked) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [picking, setPicking] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const search = (q: string) => {
    setQuery(q);
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true); setError('');
      try { setResults(await searchGames(q)); }
      catch (err) { setError(err instanceof Error ? err.message : 'Search failed.'); }
      finally { setLoading(false); }
    }, 400);
  };

  const pick = async (g: GameSummary) => {
    setPicking(g.id); setError('');
    try {
      const developer = await getGameDeveloper(g.id);
      onSelect({
        title: g.name,
        image: g.background_image,
        platform: g.platforms.join(', '),
        genre: g.genres.join(', '),
        developer,
        releaseYear: g.released ? g.released.slice(0, 4) : '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load game details.');
    } finally {
      setPicking(null);
    }
  };

  return <div className="overlay">
    <div className="camera-modal search-modal">
      <button className="icon close" onClick={onClose} aria-label="Close search"><X /></button>
      <h2>Search Games</h2>
      <div className="search"><Search size={18} /><input autoFocus value={query} onChange={e => search(e.target.value)} placeholder="Search for a game…" /></div>
      {error && <p className="error">{error}</p>}
      {loading && <p className="hint">Searching…</p>}
      <div className="search-results">
        {results.map(g => <button key={g.id} className="search-result" disabled={picking === g.id} onClick={() => pick(g)}>
          {g.background_image ? <img src={g.background_image} alt="" /> : <span className="thumb-fallback">🎮</span>}
          <div><b>{g.name}</b><small>{g.released?.slice(0, 4)}{g.platforms.length ? ` · ${g.platforms.slice(0, 2).join(', ')}` : ''}</small></div>
        </button>)}
      </div>
    </div>
  </div>;
}
