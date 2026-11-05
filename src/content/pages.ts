import type { Page } from './types';
import { GOLDEN_VISA_PAGES } from './pages-golden-visa';
import { OTHER_PAGES } from './pages-other';

export const PAGES: Page[] = [...GOLDEN_VISA_PAGES, ...OTHER_PAGES];

const BY_PATH = new Map(PAGES.map((p) => [p.path, p]));

export function getPage(path: string): Page | undefined {
  const p = path.endsWith('/') ? path : path + '/';
  return BY_PATH.get(p);
}

export function pageTitle(path: string): string {
  return getPage(path)?.eyebrow ?? path;
}
