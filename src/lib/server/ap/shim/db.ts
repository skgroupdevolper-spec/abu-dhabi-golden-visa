import 'server-only';
// Stand-in for the database client the publisher code was written for: the publisher's own tables
// are JSON files (table.ts); posts, services and FAQs are the website's own (site.ts).
import { table } from './table';
import { faq, post, service, translation } from './site';

export const prisma = {
  setting: table('setting', {}, 'key'),
  autoJob: table('job', { missionId: null, kind: 'new', stage: 'research', topic: '', focusKeyword: null, postId: null, data: '{}', error: null, tries: 0, publishAt: null }),
  autoMission: table('mission', { active: true, focus: '', keywords: '', markets: '[]', languages: '[]', nativeLanguages: '[]', postsPerWeek: 21, publishMode: 'publish', category: '', minWords: 1500, maxWords: 2500, tone: '', customTitles: '', stopRule: '{}', lastRunAt: null, total: 0 }),
  autoKeyword: table('keyword', { market: '', source: 'manual', intent: 'info', score: 0, hits: 0, status: 'new', postId: null }),
  autoFingerprint: table('fingerprint', { postId: null, focusKeyword: null, title: null, sig: '{}' }),
  autoLog: table('log', { level: 'info', jobId: null }),
  autoReference: table('reference', { caption: '', tags: '', active: true, uses: 0, lastUsedAt: null }),
  post,
  service,
  faq,
  translation,
  // Pictures the publisher made (their descriptions keep new pictures different from recent ones)
  media: table('media', { alt: '' }),
};
