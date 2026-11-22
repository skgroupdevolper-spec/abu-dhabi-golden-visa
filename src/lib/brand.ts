// Brand of this install. The same code runs more than one website: each site sets these in its .env
// (left empty: Abu Dhabi Golden Visa). NEXT_PUBLIC_ so the browser code gets the same values.
export const DEFAULT_BRAND = 'Abu Dhabi Golden Visa';
export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || DEFAULT_BRAND;
/** File reference prefix (ADGV-0001) and, in lower case, the WhatsApp template prefix (adgv_…). */
export const BRAND_CODE = (process.env.NEXT_PUBLIC_BRAND_CODE || 'ADGV').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const BRAND_PX = BRAND_CODE.toLowerCase();
/** Puts this site's name in a text written for the default brand. */
export const brandText = (s: string) => (BRAND_NAME === DEFAULT_BRAND ? s : s.split(DEFAULT_BRAND).join(BRAND_NAME));
