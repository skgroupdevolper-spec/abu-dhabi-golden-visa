// Links into the client dashboard. NEXT_PUBLIC_PORTAL_URL points at its sign-in page
// (https://app.abudhabigoldenvisa.com/login/ in production, /portal/login/ otherwise).
const LOGIN = process.env.NEXT_PUBLIC_PORTAL_URL || '/portal/login/';
export const portalHome = () => LOGIN.replace(/login\/?$/, '');
export const portalApply = (service?: string | null) => `${portalHome()}apply/${service ? `?service=${encodeURIComponent(service)}` : ''}`;
export const portalLogin = () => LOGIN;
