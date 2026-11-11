// Admin menu, shared by the sidebar, the search box and the user permissions editor.
export type Role = 'owner' | 'admin' | 'staff' | 'viewer';
export type Item = { href: string; label: string; ic: string; roles?: Role[]; badge?: 'leads' | 'unread' | 'notes' };
const FULL: Role[] = ['owner', 'admin'];

export const ADMIN_MENU: { title: string; items: Item[] }[] = [
  { title: 'Work', items: [
    { href: '/admin/', label: 'Dashboard', ic: 'chart' },
    { href: '/admin/notifications/', label: 'Notifications', ic: 'bell', badge: 'notes' },
    { href: '/admin/leads/', label: 'Leads & enquiries', ic: 'inbox', badge: 'leads' },
    { href: '/admin/visitors/', label: 'Visitors', ic: 'chart' },
    { href: '/admin/applications/', label: 'Applications', ic: 'folder', badge: 'unread' },
    { href: '/admin/customers/', label: 'Customers', ic: 'users' },
    { href: '/admin/bookings/', label: 'Appointments', ic: 'calendar' },
    { href: '/admin/payments/', label: 'Online payments', ic: 'card' },
    { href: '/admin/whatsapp/', label: 'WhatsApp', ic: 'wa', roles: FULL },
    { href: '/admin/chatbot/', label: 'AI chatbot', ic: 'spark' },
  ] },
  { title: 'Content', items: [
    { href: '/admin/posts/', label: 'Blog posts', ic: 'pen' },
    { href: '/admin/categories/', label: 'Blog categories', ic: 'tag' },
    { href: '/admin/autopublisher/', label: 'Auto Publisher', ic: 'bolt', roles: FULL },
    { href: '/admin/pages/', label: 'Pages & builder', ic: 'layout' },
    { href: '/admin/faqs/', label: 'FAQs', ic: 'question' },
    { href: '/admin/services/', label: 'Services & prices', ic: 'tag' },
    { href: '/admin/fees/', label: 'Cost calculator', ic: 'calc', roles: FULL },
    { href: '/admin/testimonials/', label: 'Testimonials', ic: 'quote' },
    { href: '/admin/partners/', label: 'Partner logos', ic: 'star' },
    { href: '/admin/offer/', label: 'Offer pop-up', ic: 'spark', roles: FULL },
    { href: '/admin/media/', label: 'Media library', ic: 'image' },
    { href: '/admin/subscribers/', label: 'Subscribers', ic: 'mail' },
  ] },
  { title: 'Website', items: [
    { href: '/admin/brand/', label: 'Logo & brand', ic: 'image', roles: FULL },
    { href: '/admin/home/', label: 'Home page text', ic: 'home', roles: FULL },
    { href: '/admin/header/', label: 'Header & menu', ic: 'menu', roles: FULL },
    { href: '/admin/footer/', label: 'Footer', ic: 'layout', roles: FULL },
    { href: '/admin/design/', label: 'Design & typography', ic: 'palette', roles: FULL },
    { href: '/admin/seo/', label: 'SEO & Google', ic: 'seo', roles: FULL },
    { href: '/admin/languages/', label: 'Languages', ic: 'globe', roles: FULL },
    { href: '/admin/settings/', label: 'Site settings', ic: 'settings', roles: FULL },
  ] },
  { title: 'Account', items: [
    { href: '/admin/users/', label: 'Admin users', ic: 'users', roles: FULL },
    { href: '/admin/profile/', label: 'My profile', ic: 'user' },
    { href: '/admin/backup/', label: 'Backup & move', ic: 'download', roles: FULL },
  ] },
];


/** Sections every signed-in user can open. */
export const ALWAYS = ['/admin/', '/admin/profile/', '/admin/notifications/'];
/** With custom permissions only the chosen sections show; otherwise the role decides. */
export const allowed = (i: Item, role: Role, perms?: string[]) => (perms && perms.length ? ALWAYS.includes(i.href) || perms.includes(i.href) : !i.roles || i.roles.includes(role));
