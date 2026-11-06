// Collects every u('English text') used in the website code into src/lib/ui-strings.json
// (the list the AI translates in Admin > Languages). Runs before each build.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const found = new Set();
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { if (!['admin', 'dash', 'node_modules'].includes(f)) walk(p); continue; }
    if (!/\.(tsx?|mjs)$/.test(f)) continue;
    const src = readFileSync(p, 'utf8');
    for (const m of src.matchAll(/\bu\(\s*(['"`])((?:\\.|(?!\1).)+)\1/g)) if (!m[2].includes('${')) found.add(m[2].replace(/\\(['"`])/g, '$1'));
  }
};
walk('src');
// Menu and service names are data: collect their label, title and note texts too.
for (const f of ['src/content/nav.ts', 'src/content/services-catalog.ts']) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\b(?:label|title|note):\s*'((?:\\'|[^'])+)'/g)) found.add(m[1].replace(/\\'/g, "'"));
}
const list = [...found].sort();
writeFileSync('src/lib/ui-strings.json', JSON.stringify(list, null, 1) + '\n');
console.log(`ui-strings: ${list.length} texts`);
