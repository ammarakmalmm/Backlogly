export type BookSearchResult = {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  image?: string;
  pageCount?: number;
};

export async function searchBooksByTitle(query: string): Promise<BookSearchResult[]> {
  const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8${key ? `&key=${key}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Search request failed.');
  const data = await res.json();
  return (data.items ?? []).map((item: { id: string; volumeInfo?: { title?: string; authors?: string[]; publisher?: string; pageCount?: number; imageLinks?: { large?: string; medium?: string; thumbnail?: string; smallThumbnail?: string } } }) => {
    const info = item.volumeInfo ?? {};
    const thumbnail = info.imageLinks?.large || info.imageLinks?.medium || info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
    return {
      id: item.id,
      title: info.title ?? 'Untitled',
      authors: info.authors ?? [],
      publisher: info.publisher,
      image: thumbnail?.replace(/^http:/, 'https:'),
      pageCount: info.pageCount,
    };
  });
}
