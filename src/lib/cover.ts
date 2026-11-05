/** Link to the automatic cover picture for an article or page (gold style with the title). */
export function coverUrl(title: string, category?: string) {
  return `/api/cover/?t=${encodeURIComponent(title.slice(0, 110))}${category ? `&c=${encodeURIComponent(category.slice(0, 40))}` : ''}`;
}
