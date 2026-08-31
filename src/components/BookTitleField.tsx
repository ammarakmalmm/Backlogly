import { useEffect, useRef, useState } from 'react';
import { searchBooksByTitle, type BookSearchResult } from '../services/bookSearch';

type Picked = { title: string; image?: string; author: string; publisher: string; totalPages: string };

export function BookTitleField({ value, onChange, onSelect }: { value: string; onChange: (v: string) => void; onSelect: (data: Picked) => void }) {
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
      try { const r = await searchBooksByTitle(v); setResults(r); setOpen(true); }
      catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
  };

  const pick = (b: BookSearchResult) => {
    onSelect({ title: b.title, image: b.image, author: b.authors.join(', '), publisher: b.publisher ?? '', totalPages: b.pageCount ? String(b.pageCount) : '' });
    setOpen(false);
  };

  return <div className="title-search-field" ref={boxRef}>
    <input autoFocus value={value} onChange={e => handleChange(e.target.value)} onFocus={() => results.length > 0 && setOpen(true)} placeholder="Search for a book…" />
    {open && (loading || results.length > 0) && <div className="title-dropdown">
      {loading && <p className="hint">Searching…</p>}
      {results.map(b => <button type="button" key={b.id} className="search-result" onClick={() => pick(b)}>
        {b.image ? <img src={b.image} alt="" /> : <span className="thumb-fallback">📚</span>}
        <div><b>{b.title}</b><small>{b.authors.join(', ')}</small></div>
      </button>)}
    </div>}
  </div>;
}
