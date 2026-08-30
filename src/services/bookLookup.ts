export async function lookupByISBN(isbn: string) {
  const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`, {
    headers: { 'User-Agent': 'Backlogly (personal backlog tracker)' },
  });
  if (!res.ok) throw new Error('Lookup request failed.');
  const data = await res.json();
  const book = data[`ISBN:${isbn}`];
  if (!book) throw new Error('No book found for that ISBN.');
  return {
    title: book.title as string | undefined,
    author: (book.authors ?? []).map((a: { name: string }) => a.name).join(', '),
    publisher: (book.publishers ?? []).map((p: { name: string }) => p.name).join(', '),
  };
}
