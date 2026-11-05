import type { Page } from './types';
import { GOLDEN_VISA_PAGES } from './pages-golden-visa';
import { OTHER_PAGES } from './pages-other';
import { SERVICE_PAGES } from './pages-services';
import { COUNTRY_PAGES } from './countries';
import { BLOG } from './blog';
import { enrich } from './enrich';

const APPLY_PAGE: Page = {
  path: '/apply/',
  seoTitle: 'Apply Online | Abu Dhabi Golden Visa and UAE Visa Services',
  meta: 'Start your Abu Dhabi Golden Visa, family visa or UAE visa service online: choose the service, add your family, upload documents and see the government fees.',
  eyebrow: 'Online application',
  h1: 'Apply online in five short steps',
  intro: 'Choose your visa or service, add your family, upload what you have and see the estimated government fees. Your advisor checks everything and confirms the final quote in writing before you pay.',
  sections: [{ type: 'tool', tool: 'apply' }],
};

export const PAGES: Page[] = [...GOLDEN_VISA_PAGES, ...OTHER_PAGES, ...SERVICE_PAGES, ...COUNTRY_PAGES, ...BLOG, APPLY_PAGE].map(enrich);

const BY_PATH = new Map(PAGES.map((p) => [p.path, p]));

export function getPage(path: string): Page | undefined {
  const p = path.endsWith('/') ? path : path + '/';
  return BY_PATH.get(p);
}

export function pageTitle(path: string): string {
  return getPage(path)?.eyebrow ?? path;
}
