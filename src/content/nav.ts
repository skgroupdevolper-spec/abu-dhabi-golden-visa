// Header and mega menu from the Developer Specification, section 2, and the Services Menu guide.
import { SERVICE_CATALOG } from './services-catalog';
import { COUNTRIES } from './countries';
export type NavLink = { label: string; href: string; note?: string };
export type NavGroup = { title: string; links: NavLink[] };
export type NavItem = { label: string; href: string; groups?: NavGroup[] };

export const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Golden Visa',
    href: '/golden-visa/',
    groups: [
      {
        title: 'Golden Visa',
        links: [
          { label: 'Property Investors', href: '/golden-visa/property-investment/', note: 'AED 2M+ in Abu Dhabi' },
          { label: 'Company Owners & Investors', href: '/golden-visa/business-investors/', note: 'Capital, deposits, tax' },
          { label: 'Entrepreneurs', href: '/golden-visa/entrepreneurs/', note: 'Approved or sold ventures' },
          { label: 'Skilled Professionals', href: '/golden-visa/skilled-professionals/', note: 'AED 30,000+ salary' },
          { label: 'Exceptional Talents', href: '/golden-visa/exceptional-talents/', note: 'Arts, sport, innovation' },
          { label: 'Scientists & Researchers', href: '/golden-visa/scientists-researchers/', note: 'Recommended specialists' },
          { label: 'Outstanding Students', href: '/golden-visa/students-graduates/', note: 'Top grades' },
          { label: 'Humanitarian & Other Categories', href: '/golden-visa/humanitarian-other/', note: 'Pioneers, frontline' },
        ],
      },
      {
        title: 'By profession',
        links: [
          { label: 'Doctors', href: '/golden-visa/doctors/' },
          { label: 'Healthcare Professionals', href: '/golden-visa/healthcare-professionals/' },
          { label: 'Engineers', href: '/golden-visa/engineers/' },
          { label: 'Technology Specialists', href: '/golden-visa/technology-specialists/' },
          { label: 'Teachers & Educators', href: '/golden-visa/teachers/' },
          { label: 'Executive Directors', href: '/golden-visa/executives/' },
          { label: 'Artists & Creative Professionals', href: '/golden-visa/artists-creatives/' },
          { label: 'Frontline Heroes', href: '/golden-visa/frontline-heroes/' },
        ],
      },
      {
        title: 'By country',
        links: COUNTRIES.map((c) => ({ label: c.menu, href: c.path })),
      },
    ],
  },
  {
    label: 'Family & Residency',
    href: '/family-golden-visa/',
    groups: [
      {
        title: 'Family & Residency',
        links: [
          { label: 'Spouse Golden Visa', href: '/family-golden-visa/spouse/' },
          { label: 'Children Golden Visa', href: '/family-golden-visa/children/' },
          { label: 'Parents Sponsorship', href: '/family-golden-visa/parents/' },
          { label: 'Newborn Residency', href: '/family-golden-visa/newborn/' },
          { label: 'Family Residency', href: '/family-golden-visa/' },
          { label: 'Retirement Visa', href: '/retirement-visa/' },
          { label: 'Remote Work Visa', href: '/remote-work-visa/' },
        ],
      },
    ],
  },
  {
    label: 'Our Services',
    href: '/services/',
    groups: SERVICE_CATALOG.map((g) => ({ title: g.title, links: g.items.map((i) => ({ label: i.label, href: i.href })) })),
  },
  { label: 'Visa Check', href: '/visa-check/' },
  { label: 'Cost Calculator', href: '/golden-visa-cost/' },
  {
    label: 'Blog',
    href: '/blog/',
    groups: [
      {
        title: 'Resources',
        links: [
          { label: 'Eligibility Checker', href: '/visa-check/' },
          { label: 'Cost Calculator', href: '/golden-visa-cost/' },
          { label: 'Requirements & Documents', href: '/requirements-documents/' },
          { label: 'Application Process', href: '/how-to-apply/' },
          { label: 'Processing Time', href: '/processing-time/' },
          { label: 'Golden Visa Benefits', href: '/golden-visa-benefits/' },
          { label: 'FAQs', href: '/faqs/' },
          { label: 'Blog & Guides', href: '/blog/' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About Us', href: '/about/' },
          { label: 'Why Choose Us', href: '/why-choose-us/' },
          { label: 'Contact Us', href: '/contact/' },
          { label: 'Free Consultation', href: '/free-consultation/' },
        ],
      },
    ],
  },
  { label: 'Contact', href: '/contact/' },
];
