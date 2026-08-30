export type GameSummary = {
  id: number;
  name: string;
  released?: string;
  background_image?: string;
  genres: string[];
  platforms: string[];
};

const key = () => {
  const k = import.meta.env.VITE_RAWG_API_KEY;
  if (!k) throw new Error('Game search is not configured yet.');
  return k;
};

export async function searchGames(query: string): Promise<GameSummary[]> {
  const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&page_size=8&key=${key()}`);
  if (!res.ok) throw new Error('Search request failed.');
  const data = await res.json();
  return (data.results ?? []).map((g: { id: number; name: string; released?: string; background_image?: string; genres?: { name: string }[]; platforms?: { platform: { name: string } }[] }) => ({
    id: g.id,
    name: g.name,
    released: g.released,
    background_image: g.background_image,
    genres: (g.genres ?? []).map(x => x.name),
    platforms: (g.platforms ?? []).map(x => x.platform.name),
  }));
}

export async function getGameDeveloper(id: number): Promise<string> {
  const res = await fetch(`https://api.rawg.io/api/games/${id}?key=${key()}`);
  if (!res.ok) throw new Error('Could not load game details.');
  const g = await res.json();
  return (g.developers ?? []).map((d: { name: string }) => d.name).join(', ');
}
