type BookInfo = { title?: string; author?: string; publisher?: string; image?: string };

async function fromOpenLibrary(isbn: string): Promise<BookInfo | null> {
  const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`, {
    headers: { 'User-Agent': 'Backlogly (personal backlog tracker)' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const book = data[`ISBN:${isbn}`];
  if (!book) return null;
  return {
    title: book.title,
    author: (book.authors ?? []).map((a: { name: string }) => a.name).join(', '),
    publisher: (book.publishers ?? []).map((p: { name: string }) => p.name).join(', '),
    image: book.cover?.large || book.cover?.medium || book.cover?.small,
  };
}

async function fromGoogleBooks(isbn: string): Promise<BookInfo | null> {
  const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${key ? `&key=${key}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const info = data.items?.[0]?.volumeInfo;
  if (!info) return null;
  const thumbnail = info.imageLinks?.large || info.imageLinks?.medium || info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
  return {
    title: info.title,
    author: (info.authors ?? []).join(', '),
    publisher: info.publisher ?? '',
    image: thumbnail?.replace(/^http:/, 'https:'),
  };
}

export async function lookupByISBN(isbn: string): Promise<BookInfo> {
  const [openLibrary, googleBooks] = await Promise.all([
    fromOpenLibrary(isbn).catch(() => null),
    fromGoogleBooks(isbn).catch(() => null),
  ]);
  if (!openLibrary && !googleBooks) throw new Error('No book found for that ISBN.');
  return {
    title: openLibrary?.title || googleBooks?.title,
    author: openLibrary?.author || googleBooks?.author,
    publisher: openLibrary?.publisher || googleBooks?.publisher,
    image: openLibrary?.image || googleBooks?.image,
  };
}
