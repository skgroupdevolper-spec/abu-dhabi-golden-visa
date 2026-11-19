/** The Golden Visa eligibility checker moved from /visa-check/ (now the UAE visa status check) to
 *  /eligibility-check/. Buttons whose label is about eligibility follow it, including saved settings. */
export function eligLink(href: string, label = ''): string {
  return href === '/visa-check/' && /eligib|free check|my check/i.test(label) ? '/eligibility-check/' : href;
}
