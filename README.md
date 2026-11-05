# Abu Dhabi Golden Visa

Website and customer dashboard for **www.abudhabigoldenvisa.com**, operated by Brightlink Management Consultancy LLC (Trade Licence 1053387).

- Next.js 15 (App Router), TypeScript, no CSS framework
- 20 languages: English at `/`, others at `/ar/`, `/ru/`, `/tr/` … (`/en/…` redirects to `/`)
- Customer dashboard on a subdomain (default `app.abudhabigoldenvisa.com`), served from the same app
- Cost calculator (also as a pop-up on every page), eligibility checker and enquiry forms
- **Team dashboard** at `/admin/`: enquiries, client applications (status, quote, payments and receipts, documents, messages, secure portal link) and editable government fees
- **Client dashboard** on the portal subdomain: progress, quote acceptance, payments and receipts, document upload and download, messages
- Data (enquiries, applications, fees, uploads) is saved in `DATA_DIR`

## Live preview with GitHub Codespaces

1. On GitHub, open the repository, click **Code → Codespaces → Create codespace on main**.
2. Wait for the setup (about 3 minutes: it installs, adds one sample client and builds).
3. The preview opens on port 3000. Open the **Ports** tab to copy the public link.
   - Website: the link itself
   - Team dashboard: link + `/admin/` (sign in with `admin@preview.local` / `preview-admin-2026`)
   - Client dashboard (sample): link + `/portal/t/a1b2c3d4e5f60718293a4b5c6d7e8f90/`
4. After changing code: stop the server (Ctrl+C in the terminal), run `npm run build && npm start`.

## Run locally

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:3000
```

## Deploy on xCloud

1. **Create the site.** In xCloud, add a Node.js site for `abudhabigoldenvisa.com` (with `www`). Point the domain's DNS A record to the server.
2. **Connect GitHub.** Use repository `skgroupdevolper-spec/abu-dhabi-golden-visa`, branch `main`.
3. **Environment.** Add the values from `.env.example` (`NEXT_PUBLIC_SITE_URL`, `PORTAL_HOST`, `DATA_DIR`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `PORT`). Put `DATA_DIR` outside the release folder, for example `/home/<user>/adgv-data`, so enquiries, client files and uploads survive each deploy, and include it in your server backups.
4. **Build and start commands.**
   ```bash
   npm ci || npm install
   npm run build
   pm2 startOrReload ecosystem.config.js
   ```
   Then point xCloud's reverse proxy to the app port (default `3000`).
5. **Customer dashboard subdomain.** Add `app.abudhabigoldenvisa.com` as an alias (or a second site) proxying to the **same** port. The app detects the host and serves the client portal. If you choose another subdomain, change `PORTAL_HOST`.
6. **SSL.** Enable Let's Encrypt for `abudhabigoldenvisa.com`, `www` and `app`.
7. **Redirect.** Redirect `abudhabigoldenvisa.com` to `www.abudhabigoldenvisa.com` in xCloud.

Each push to `main` runs the GitHub Actions build (type check, production build, smoke test of pages, languages, portal host and the enquiry API).

## Project layout

```
src/app/[locale]/page.tsx          homepage
src/app/[locale]/[...slug]/        all content pages (from src/content)
src/app/admin/                     team dashboard (/admin/)
src/app/portal/                    client dashboard (portal subdomain, or /portal/ on the main site)
src/app/api/leads/                 enquiry API
src/app/api/fees/                  live government fees for the calculator
src/content/                       page text, navigation, FAQs
src/lib/fees.ts                    government fee schedule used by the calculator
src/components/                    header, footer, water background, calculator, forms
```

Government fees are edited in the team dashboard under **Government fees**; the calculator and new quotes use them straight away. `src/lib/fees.ts` holds the starting values.

## Content rules

- Never promise approval or a fixed processing time.
- Every page shows: “Not an official UAE government website. Visa issuance and eligibility are subject to the competent authorities.”
- Use only images supplied by the owner (`public/brand`, `public/images`).
