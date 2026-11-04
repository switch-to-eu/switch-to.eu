/** People who write on the site. An author not listed here is an organisation. */
const AUTHORS: Record<string, { photo: string }> = {
  "Simon Peters": { photo: "/images/authors/simon-peters.webp" },
};

export function getAuthor(name: string) {
  return AUTHORS[name] ?? null;
}
