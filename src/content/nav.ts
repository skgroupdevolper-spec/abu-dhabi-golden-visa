// Header and mega menu from the Developer Specification, section 2, and the Services Menu guide.
import { SERVICE_CATALOG } from './services-catalog';
import { COUNTRIES } from './countries';

// Blog menu: every guide, grouped by topic (titles kept here so the menu stays light).
const BLOG_TITLES: Record<string, [string, number]> = {
  'abu-dhabi-golden-visa-complete-guide': ['Abu Dhabi Golden Visa 2026: Complete Guide', 9],
  'how-to-apply-abu-dhabi-golden-visa': ['How to Apply for Abu Dhabi Golden Visa', 7],
  'abu-dhabi-golden-visa-cost': ['Abu Dhabi Golden Visa Cost and Government Fees', 6],
  'golden-visa-through-property-investment': ['Abu Dhabi Golden Visa Through Property Investment', 7],
  'off-plan-property-golden-visa': ['Can Off-Plan Property Qualify for Abu Dhabi Golden Visa?', 5],
  'mortgaged-property-golden-visa': ['Can You Get a Golden Visa With a Mortgaged Property?', 5],
  'golden-visa-skilled-professionals': ['Abu Dhabi Golden Visa for Skilled Professionals', 6],
  'golden-visa-aed-30000-salary': ['Golden Visa With AED 30,000 Salary: Eligibility Explained', 5],
  'golden-visa-doctors-healthcare': ['Abu Dhabi Golden Visa for Doctors and Healthcare Professionals', 5],
  'golden-visa-teachers-engineers': ['Abu Dhabi Golden Visa for Teachers and Engineers', 5],
  'golden-visa-business-owners-shareholders': ['Golden Visa for Business Owners and Company Shareholders', 6],
  'golden-visa-family-members': ['Abu Dhabi Golden Visa for Family Members', 6],
  'sponsor-parents-golden-visa': ['How to Sponsor Parents Under a Golden Visa', 5],
  'golden-visa-from-outside-uae': ['Golden Visa Application From Outside the UAE', 5],
  'golden-visa-medical-emirates-id': ['Abu Dhabi Golden Visa Medical and Emirates ID Process', 4],
  'golden-visa-renewal-requirements': ['Abu Dhabi Golden Visa Renewal Requirements', 4],
  'selling-golden-visa-property': ['What Happens if You Sell Your Golden Visa Property?', 4],
  'abu-dhabi-vs-dubai-golden-visa': ['Abu Dhabi Golden Visa vs Dubai Golden Visa', 5],
  'golden-visa-vs-retirement-visa': ['UAE Golden Visa vs Retirement Visa', 5],
  'golden-visa-application-mistakes': ['Common Golden Visa Application Mistakes and How to Avoid Them', 5],
};
const BLOG_GROUPS = [
  { title: 'Getting started', slugs: ['abu-dhabi-golden-visa-complete-guide', 'how-to-apply-abu-dhabi-golden-visa', 'abu-dhabi-golden-visa-cost', 'golden-visa-from-outside-uae', 'golden-visa-application-mistakes'] },
  { title: 'Property investors', slugs: ['golden-visa-through-property-investment', 'off-plan-property-golden-visa', 'mortgaged-property-golden-visa', 'selling-golden-visa-property'] },
  { title: 'Professionals & business', slugs: ['golden-visa-skilled-professionals', 'golden-visa-aed-30000-salary', 'golden-visa-doctors-healthcare', 'golden-visa-teachers-engineers', 'golden-visa-business-owners-shareholders'] },
  { title: 'Family & renewal', slugs: ['golden-visa-family-members', 'sponsor-parents-golden-visa', 'golden-visa-medical-emirates-id', 'golden-visa-renewal-requirements'] },
  { title: 'Comparisons', slugs: ['abu-dhabi-vs-dubai-golden-visa', 'golden-visa-vs-retirement-visa'] },
];
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
    groups: BLOG_GROUPS.map((g) => ({
      title: g.title,
      links: g.slugs.filter((slug) => BLOG_TITLES[slug]).map((slug) => ({ label: BLOG_TITLES[slug][0], href: `/blog/${slug}/`, note: `${BLOG_TITLES[slug][1]} min read` })),
    })),
  },
  {
    label: 'Contact',
    href: '/contact/',
    groups: [
      {
        title: 'Resources',
        links: [
          { label: 'Apply Online', href: '/apply/' },
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
];
