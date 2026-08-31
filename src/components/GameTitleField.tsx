import { useEffect, useRef, useState } from 'react';
import { searchGames, getGameDeveloper, type GameSummary } from '../services/gameLookup';

type Picked = { title: string; image?: string; platform: string; genre: string; developer: string; releaseYear: string };

export function GameTitleField({ value, onChange, onSelect }: { value: string; onChange: (v: string) => void; onSelect: (data: Picked) => void }) {
  const [results, setResults] = useState<GameSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleChange = (v: string) => {
    onChange(v);
    clearTimeout(debounceRef.current);
    if (!v.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try { const r = await searchGames(v); setResults(r); setOpen(true); }
      catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
  };

  const pick = async (g: GameSummary) => {
    setPicking(g.id);
    try {
      const developer = await getGameDeveloper(g.id);
      onSelect({ title: g.name, image: g.background_image, platform: g.platforms.join(', '), genre: g.genres.join(', '), developer, releaseYear: g.released ? g.released.slice(0, 4) : '' });
      setOpen(false);
    } finally {
      setPicking(null);
    }
  };

  return <div className="title-search-field" ref={boxRef}>
    <input autoFocus value={value} onChange={e => handleChange(e.target.value)} onFocus={() => results.length > 0 && setOpen(true)} placeholder="Search for a game…" />
    {open && (loading || results.length > 0) && <div className="title-dropdown">
      {loading && <p className="hint">Searching…</p>}
      {results.map(g => <button type="button" key={g.id} className="search-result" disabled={picking === g.id} onClick={() => pick(g)}>
        {g.background_image ? <img src={g.background_image} alt="" /> : <span className="thumb-fallback">🎮</span>}
        <div><b>{g.name}</b><small>{g.released?.slice(0, 4)}{g.platforms.length ? ` · ${g.platforms.slice(0, 2).join(', ')}` : ''}</small></div>
      </button>)}
    </div>}
  </div>;
}
