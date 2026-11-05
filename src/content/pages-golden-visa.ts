import type { Page } from './types';

// Golden Visa category pages (spec sections 3 and 4). Facts from ADDED, ICP, Invest Abu Dhabi and
// the Ministry of Culture, checked 5 November 2026, written in our own words.
const ELIGIBILITY_CTA = { label: 'Check My Eligibility', href: '/visa-check/' };

export const GOLDEN_VISA_PAGES: Page[] = [
  {
    path: '/golden-visa/',
    seoTitle: 'Abu Dhabi Golden Visa | 10-Year UAE Residency Categories',
    meta: 'Compare every Abu Dhabi Golden Visa route: property, investors, entrepreneurs, professionals, talents, students and family. Free eligibility check.',
    eyebrow: 'Abu Dhabi Golden Visa',
    h1: 'Choose your route to a 10-year UAE residency',
    intro:
      'The Golden Visa gives long-term UAE residency without a local sponsor, renewable while you still qualify. Pick the route that fits you and we check the rest.',
    cta: ELIGIBILITY_CTA,
    sections: [
      {
        type: 'cards',
        title: 'Golden Visa categories',
        items: [
          { title: 'Property investors', text: 'Abu Dhabi property worth AED 2 million or more, including off-plan and mortgaged homes.', href: '/golden-visa/property-investment/' },
          { title: 'Company owners & investors', text: 'An AED 2 million deposit or company investment, or AED 250,000 tax paid a year.', href: '/golden-visa/business-investors/' },
          { title: 'Entrepreneurs', text: 'An approved idea, AED 1 million yearly revenue, or a business sold for AED 7 million.', href: '/golden-visa/entrepreneurs/' },
          { title: 'Skilled professionals', text: 'A degree, a UAE work permit and a monthly salary of AED 30,000 or more.', href: '/golden-visa/skilled-professionals/' },
          { title: 'Exceptional talents', text: 'Artists, writers, musicians, athletes and inventors with recognised work.', href: '/golden-visa/exceptional-talents/' },
          { title: 'Scientists & researchers', text: 'Recommended scientists, researchers and specialists.', href: '/golden-visa/scientists-researchers/' },
          { title: 'Outstanding students', text: 'Top school leavers and university graduates with high grades.', href: '/golden-visa/students-graduates/' },
          { title: 'Humanitarian & other', text: 'Humanitarian pioneers, frontline workers and other recognised groups.', href: '/golden-visa/humanitarian-other/' },
        ],
      },
      {
        type: 'list',
        title: 'What every Golden Visa gives you',
        items: [
          'Residency of up to 10 years, renewable while you meet the conditions',
          'No local sponsor or employer needed',
          'Sponsor your spouse, children of any age and parents',
          'Stay outside the UAE for more than six months without losing residency',
          'Sponsor domestic workers, subject to UAE rules',
          'Family residency stays valid for its term if the main holder passes away',
        ],
      },
      { type: 'tool', tool: 'eligibility', title: 'Check your eligibility in a minute' },
    ],
    related: ['/golden-visa-cost/', '/how-to-apply/', '/family-golden-visa/'],
  },
  {
    path: '/golden-visa/property-investment/',
    seoTitle: 'Abu Dhabi Golden Visa Through Property Investment | Requirements & Cost',
    meta: 'Explore the Abu Dhabi Golden Visa for property investors. Learn about AED 2 million investment eligibility, documents, fees, family sponsorship and application support.',
    eyebrow: 'Property investor Golden Visa',
    h1: 'Get Your 10-Year Abu Dhabi Golden Visa Through Property Investment',
    intro:
      'Invest in qualifying Abu Dhabi real estate and explore your eligibility for long-term UAE residency. Our consultants handle property documents, eligibility checks, entry permits, medical fitness, Emirates ID and residence issuance.',
    cta: { label: 'Check My Property Eligibility', href: '/visa-check/' },
    sections: [
      {
        type: 'text',
        title: 'What is the Abu Dhabi property investor Golden Visa?',
        body: [
          'It is a 10-year residence visa for people who own qualifying property in Abu Dhabi worth AED 2 million or more. You do not need a sponsor, and you can bring your family on the same long-term terms.',
          'Approval is decided by the Abu Dhabi nomination framework and the federal immigration authority. We prepare a complete, checked file so it goes in right the first time.',
        ],
      },
      {
        type: 'table',
        title: 'Minimum property investment requirements',
        head: ['Requirement', 'What it means'],
        rows: [
          ['Investment benchmark', 'Property worth AED 2 million or more in total'],
          ['Location', 'Abu Dhabi, under the local nomination framework'],
          ['Completed or off-plan', 'Both can qualify. Off-plan needs a purchase agreement with an approved developer and at least AED 2 million already paid'],
          ['Mortgaged property', 'Allowed with a UAE national bank, but your own equity must be at least AED 2 million. Example: on an AED 5 million home, the outstanding loan can be up to AED 3 million'],
          ['Multiple properties', 'Several properties in your name can be combined to reach AED 2 million'],
          ['Duration', 'Up to 10 years, renewable while you still qualify'],
        ],
      },
      {
        type: 'text',
        title: 'Joint ownership and spouses',
        body: [
          'Jointly owned property, including property shared with a spouse, is assessed case by case and often does not qualify on its own. Send us the title deed and ownership split before you apply so we can advise on the best route.',
        ],
      },
      {
        type: 'list',
        title: 'Documents and ownership verification',
        intro: 'You will need one of these sets, depending on how you own the property:',
        items: [
          'Fully owned: a purchase agreement registered with the Department of Municipalities and Transport showing AED 2 million or more, or a Real Estate Unit Value Certificate',
          'Mortgaged: a Real Estate Unit Value Certificate, a search certificate showing the property is not under seizure and worth AED 2 million or more, and the bank documents for the loan',
          'Off-plan: the purchase agreement with an approved developer and proof of at least AED 2 million paid to the developer',
          'Passport copy, photo and, if you have one, Emirates ID',
          'Valid health insurance for you and your family',
        ],
      },
      {
        type: 'steps',
        title: 'Application and nomination process',
        items: [
          { title: 'Free eligibility check', text: 'We review your title deed, value and ownership.' },
          { title: 'Valuation and documents', text: 'We arrange the value certificate and any developer or bank letters.' },
          { title: 'Nomination', text: 'Your Golden Visa nomination is submitted through the Abu Dhabi Residents Office channel.' },
          { title: 'Entry permit or status change', text: 'From abroad you receive an entry permit; inside the UAE we change your status.' },
          { title: 'Medical, Emirates ID and residence', text: 'We book the medical and biometrics and follow the file until your residency is issued.' },
        ],
      },
      { type: 'tool', tool: 'calculator', title: 'Government fees and service packages', intro: 'See the government fees for you and your family, person by person.' },
      {
        type: 'table',
        title: 'Processing timelines and travel requirements',
        head: ['Stage', 'What to expect'],
        rows: [
          ['Valuation certificate', 'About 3 working days after the request, if needed'],
          ['Nomination and approval', 'Depends on the authority and how complete your file is; we give you a realistic estimate after checking it'],
          ['From abroad', 'You receive an entry permit, travel to the UAE and complete the steps here'],
          ['Inside the UAE', 'We change your status, so you do not need to leave the country'],
          ['Medical and Emirates ID', 'Booked once the entry permit or status change is done; you attend in person'],
        ],
        note: 'Nobody can promise a fixed approval time. We update you at every step.',
      },
      {
        type: 'list',
        title: 'Spouse, children and parent sponsorship',
        items: [
          'Spouse and children of any age can join on the same terms',
          'Parents can be sponsored with health insurance',
          'Children under 18 do not need a medical test',
          'A sponsor file is opened once for the whole family',
        ],
      },
      {
        type: 'text',
        title: 'Renewal, property sale and keeping your eligibility',
        body: [
          'Your Golden Visa renews as long as you still meet the conditions. If you plan to sell, refinance or transfer the property, speak to us first so your residency is not affected.',
        ],
      },
      {
        type: 'faq',
        title: 'Property investor FAQs',
        items: [
          { q: 'Does off-plan property qualify?', a: 'Yes, when bought from an approved developer and at least AED 2 million has been paid.' },
          { q: 'Can I use a mortgaged property?', a: 'Yes, through a UAE national bank, as long as your own equity is AED 2 million or more.' },
          { q: 'Do I need a valuation certificate?', a: 'If your registered purchase agreement does not already show AED 2 million, a Real Estate Unit Value Certificate proves the value. We request it for you.' },
          { q: 'Can my parents join me?', a: 'Yes, with health insurance and proof of the relationship.' },
        ],
      },
    ],
    related: ['/document-services/valuation-certificate/', '/family-golden-visa/', '/golden-visa-cost/'],
  },
  {
    path: '/golden-visa/business-investors/',
    seoTitle: 'Abu Dhabi Golden Visa for Business Owners, Shareholders & Investors',
    meta: 'Golden Visa routes for company owners, shareholders and public investors in Abu Dhabi: AED 2 million capital or deposit, or AED 250,000 tax a year. Documents and steps.',
    eyebrow: 'Company owners & investors',
    h1: 'Abu Dhabi Golden Visa for Business Owners, Company Shareholders & Investors',
    intro:
      'Business owners and investors may qualify through capital, deposits or the tax their company pays. We help with ownership structures, documents and the right pathway.',
    cta: ELIGIBILITY_CTA,
    sections: [
      {
        type: 'table',
        title: 'Eligibility for business owners and investors',
        intro: 'You need one of these, at AED 2 million or more:',
        head: ['Route', 'Requirement'],
        rows: [
          ['Deposit', 'A deposit of at least AED 2,000,000 with an investment fund or UAE bank'],
          ['Company capital or share', 'A company investment, or your share in one, of at least AED 2,000,000'],
          ['Tax paid', 'At least AED 250,000 in taxes settled each year for the two years before you apply'],
        ],
        note: 'The capital must be your own and not borrowed. Health insurance is needed for you and your family.',
      },
      {
        type: 'list',
        title: 'Trade licence, memorandum and financial documents',
        items: [
          'Valid trade licence showing the company and your ownership',
          'Updated commercial registration certificate showing paid-in capital and each partner’s share',
          'Bank or fund letter confirming AED 2 million or more',
          'Commercial register copy showing no attachments against the company or your shares',
          'For the tax route: tax return forms and receipts for both years',
        ],
      },
      {
        type: 'text',
        title: 'Business ownership versus property investment',
        body: [
          'If you own both a company and property, we compare the two routes and pick the one with the clearest evidence. Mainland and free-zone companies need different documents, so tell us where your company is licensed.',
          'This route can also cover your spouse, children, one advisor and one executive director.',
        ],
      },
      {
        type: 'text',
        title: 'Public investment routes',
        body: ['Investors in UAE investment funds or listed companies may qualify where the investment is at least AED 2 million and held in their own name. We check fund letters and share statements against the current rules before filing.'],
      },
      {
        type: 'table',
        title: 'Mainland and free-zone documents',
        head: ['Company type', 'What we usually need'],
        rows: [
          ['Mainland', 'Trade licence from the economic department, memorandum of association, commercial register extract'],
          ['Free zone', 'Free-zone licence, share certificate and register of shareholders, authority letter'],
          ['Both', 'Audited financial statements, bank letter for capital or deposits, establishment card'],
        ],
      },
      {
        type: 'steps',
        title: 'Nomination procedure',
        items: [
          { title: 'Route check', text: 'Deposit, capital, fund or tax route, whichever is strongest.' },
          { title: 'Evidence pack', text: 'Licences, ownership, capital and financial documents.' },
          { title: 'Nomination', text: 'Submitted through the Abu Dhabi channel for investors.' },
          { title: 'Entry permit or status change', text: 'Then medical, Emirates ID and residence.' },
        ],
      },
      {
        type: 'list',
        title: 'Family sponsorship',
        items: ['Spouse and children of any age', 'Parents with health insurance', 'One advisor and one executive director under the investor route, where allowed', 'One sponsor file for the whole family'],
      },
      { type: 'tool', tool: 'calculator', title: 'Fees and timelines' },
    ],
    related: ['/golden-visa/entrepreneurs/', '/golden-visa/property-investment/', '/how-to-apply/'],
  },
  {
    path: '/golden-visa/entrepreneurs/',
    seoTitle: 'Abu Dhabi Golden Visa for Entrepreneurs & Startup Founders',
    meta: 'Golden Visa for entrepreneurs in Abu Dhabi: approved business ideas, SMEs with AED 1 million revenue, or founders who sold a business for AED 7 million.',
    eyebrow: 'Entrepreneurs & founders',
    h1: 'Golden Visa for Entrepreneurs and Startup Founders',
    intro:
      'Founders can qualify through an approved idea, a growing company or a successful exit. Business incubators nominate eligible founders, and we prepare the evidence.',
    cta: ELIGIBILITY_CTA,
    sections: [
      {
        type: 'table',
        title: 'Entrepreneur routes',
        head: ['Route', 'Requirement'],
        rows: [
          ['Approved concept', 'Your pioneering idea is approved by an accredited UAE business incubator, the Ministry of Economy or another competent authority'],
          ['Pioneering SME', 'You own or are a partner in an SME in an approved sector with annual revenue of at least AED 1,000,000'],
          ['Previous founder', 'You founded a project that sold for a total of at least AED 7,000,000, subject to approval'],
        ],
      },
      {
        type: 'list',
        title: 'Documents',
        items: [
          'Nomination from a UAE business incubator',
          'Trade licence and audited financial statements for two years (SME route)',
          'Company profile or pitch deck and founders’ LinkedIn profiles',
          'Acceptance letter from an incubator, venture studio or accelerator (concept route)',
          'Proof of the sale value of your previous company (founder route)',
        ],
      },
      { type: 'tool', tool: 'lead', title: 'Tell us about your business' },
    ],
    related: ['/golden-visa/business-investors/', '/how-to-apply/'],
  },
  {
    path: '/golden-visa/skilled-professionals/',
    seoTitle: 'Abu Dhabi Golden Visa for Skilled Professionals and Executives',
    meta: 'Golden Visa for skilled professionals in Abu Dhabi: degree, valid UAE work permit and AED 30,000 monthly salary. Employment, salary and document review.',
    eyebrow: 'Skilled professionals',
    h1: 'Abu Dhabi Golden Visa for Skilled Professionals and Executives',
    intro:
      'Are you an experienced professional working in the UAE? You may qualify for long-term residency through an eligible professional category, without buying property or starting a business. We review your employment, salary, classification and qualifications.',
    cta: ELIGIBILITY_CTA,
    sections: [
      {
        type: 'table',
        title: 'What we check',
        head: ['Topic', 'Requirement'],
        rows: [
          ['Salary', 'A monthly salary of at least AED 30,000 under your current contract'],
          ['Employment', 'A valid UAE work permit in an eligible professional classification (levels one and two)'],
          ['Education', 'At least a bachelor’s degree or equivalent, attested or with equivalency where required'],
          ['Documents', 'Passport, Emirates ID, employment contract, salary certificate, degree and employer documents'],
          ['Approval', 'The relevant Abu Dhabi nomination body and the federal immigration authority'],
        ],
      },
      {
        type: 'cards',
        title: 'Profession guides',
        items: [
          { title: 'Doctors', text: 'Licensed physicians and specialists.', href: '/golden-visa/doctors/' },
          { title: 'Engineers', text: 'Engineering professionals in eligible roles.', href: '/golden-visa/engineers/' },
          { title: 'Teachers & educators', text: 'Education professionals and school leaders.', href: '/golden-visa/teachers/' },
          { title: 'Executives', text: 'Senior managers and directors.', href: '/golden-visa/executives/' },
          { title: 'Healthcare professionals', text: 'Nurses, pharmacists and allied health.', href: '/golden-visa/healthcare-professionals/' },
          { title: 'Technology specialists', text: 'Software, data and digital specialists.', href: '/golden-visa/technology-specialists/' },
        ],
      },
      { type: 'tool', tool: 'eligibility' },
    ],
    related: ['/requirements-documents/', '/document-services/degree-attestation/'],
  },
  {
    path: '/golden-visa/exceptional-talents/',
    seoTitle: 'Golden Visa for Exceptional Talents, Creatives & Athletes | Abu Dhabi',
    meta: 'Golden Visa for artists, writers, musicians, athletes, inventors and digital talents. Ministry of Culture recommendation criteria, documents and support.',
    eyebrow: 'Exceptional talents',
    h1: 'Golden Visa for Creatives, Athletes and Innovators',
    intro:
      'People with recognised achievements in culture, the arts, sport, digital technology and invention can qualify with an endorsement from the relevant federal authority.',
    cta: ELIGIBILITY_CTA,
    sections: [
      {
        type: 'list',
        title: 'Creatives in culture and the arts',
        intro: 'The Ministry of Culture recommends creatives who meet at least one of these, with evidence:',
        items: [
          'Nominated for or won a respected global or regional creative award',
          'Hold an honorary position in a respected international organisation',
          'Active member of a respected international arts organisation',
          'Creative work with wide public and media recognition',
          'Work shown at internationally recognised exhibitions, festivals or events',
        ],
      },
      {
        type: 'list',
        title: 'Documents for the recommendation',
        items: ['Colour personal photo', 'Passport copy', 'Emirates ID and residence visa copies, if you have them', 'CV with biography, key works and achievements'],
      },
      {
        type: 'text',
        title: 'Good to know',
        body: [
          'The Ministry of Culture recommendation itself is free. If a request is declined, you must wait at least six months before applying again. Athletes, digital talents and inventors are endorsed by their own authorities.',
        ],
      },
    ],
    related: ['/golden-visa/scientists-researchers/', '/how-to-apply/'],
  },
  {
    path: '/golden-visa/scientists-researchers/',
    seoTitle: 'Golden Visa for Scientists & Researchers | Abu Dhabi',
    meta: 'Golden Visa for scientists, researchers and specialists with a recommendation from the relevant UAE body. What it covers and how we help.',
    eyebrow: 'Scientists & researchers',
    h1: 'Golden Visa for Scientists and Researchers',
    intro:
      'Scientists, researchers and specialists in priority fields can qualify, usually with a recommendation from the UAE scientists council or the relevant ministry.',
    cta: ELIGIBILITY_CTA,
    sections: [
      {
        type: 'list',
        title: 'Who this route covers',
        items: [
          'Scientists and researchers recommended by the UAE scientists council',
          'Specialists in health, education, industry and priority technology fields',
          'Senior scholars recommended by the relevant authority',
        ],
      },
      { type: 'tool', tool: 'lead', title: 'Ask about your case' },
    ],
  },
  {
    path: '/golden-visa/students-graduates/',
    seoTitle: 'Golden Visa for Outstanding Students & Graduates | Abu Dhabi',
    meta: 'Golden Visa for top school students and university graduates: GPA rules, top-100 universities, two-year window and documents.',
    eyebrow: 'Outstanding students',
    h1: 'Golden Visa for Outstanding Students and Graduates',
    intro: 'High-achieving school leavers and recent graduates can qualify for long-term residency with strong grades and attested certificates.',
    cta: ELIGIBILITY_CTA,
    sections: [
      {
        type: 'table',
        title: 'Academic requirements',
        head: ['Applicant', 'Requirement'],
        rows: [
          ['UAE school leavers', 'Grade 12 certificate from a licensed UAE school with at least 95%, attested by the Ministry of Education'],
          ['UAE university graduates', 'Bachelor’s, master’s or PhD from an accredited university: GPA 3.5+ for A-class universities, 3.8+ for B-class'],
          ['Graduates from abroad', 'Bachelor’s from one of the world’s top 100 universities with GPA 3.5+ and a Ministry of Education equivalency'],
          ['Timing', 'Graduated within the last two years'],
        ],
      },
      {
        type: 'list',
        title: 'Documents',
        items: ['Official transcript showing the final GPA', 'Degree certificate attested by the Ministry of Education', 'Equivalency certificate for degrees from abroad', 'Proof that the university is in the top 100 (if from abroad)'],
      },
    ],
    related: ['/document-services/degree-attestation/'],
  },
  {
    path: '/golden-visa/humanitarian-other/',
    seoTitle: 'Golden Visa for Humanitarian Pioneers & Other Categories',
    meta: 'Golden Visa for humanitarian pioneers, frontline workers and other recognised groups. Requirements and how we help.',
    eyebrow: 'Humanitarian & other categories',
    h1: 'Golden Visa for Humanitarian Pioneers and Frontline Heroes',
    intro: 'People who have made a lasting contribution to humanitarian work, and frontline workers recognised by the authorities, have their own Golden Visa routes.',
    cta: ELIGIBILITY_CTA,
    sections: [
      {
        type: 'list',
        title: 'Humanitarian pioneers',
        intro: 'One of these, plus a university degree:',
        items: [
          'At least five years as a member or outstanding employee of an international, regional or non-profit organisation',
          'Financial contributions of at least AED 2,000,000 to humanitarian work',
        ],
      },
      { type: 'text', title: 'Frontline heroes', body: ['Frontline workers are nominated by the relevant authorities. Contact us and we will tell you whether a nomination route is open for your role.'] },
    ],
  },
  ...['doctors', 'engineers', 'teachers', 'executives', 'healthcare-professionals', 'technology-specialists', 'artists-creatives', 'frontline-heroes'].map((slug): Page => {
    const name: Record<string, string> = {
      doctors: 'Doctors',
      engineers: 'Engineers',
      teachers: 'Teachers & Educators',
      executives: 'Executive Directors',
      'healthcare-professionals': 'Healthcare Professionals',
      'technology-specialists': 'Technology Specialists',
      'artists-creatives': 'Artists & Creative Professionals',
      'frontline-heroes': 'Frontline Heroes',
    };
    const special = slug === 'artists-creatives' || slug === 'frontline-heroes';
    return {
      path: `/golden-visa/${slug}/`,
      seoTitle: `Abu Dhabi Golden Visa for ${name[slug]}`,
      meta: `How ${name[slug].toLowerCase()} can qualify for a 10-year Abu Dhabi Golden Visa: salary, degree, work permit and documents.`,
      eyebrow: `Golden Visa for ${name[slug]}`,
      h1: `Abu Dhabi Golden Visa for ${name[slug]}`,
      intro: slug === 'artists-creatives'
        ? 'Artists, writers, musicians, designers, film makers and other creatives can qualify with a recommendation from the Ministry of Culture or the relevant Abu Dhabi cultural authority. The recommendation for creatives is free; we help you build a strong portfolio file.'
        : slug === 'frontline-heroes'
          ? 'Frontline workers who made exceptional contributions, for example during health emergencies, can be nominated for the Golden Visa by the relevant authority. We check whether a nomination route is open for your role and prepare your documents.'
          : `${name[slug]} working in the UAE may qualify through the skilled professional route or a specialist recommendation. We check your contract, salary, classification and degree.`,
      cta: ELIGIBILITY_CTA,
      sections: [
        {
          type: 'list',
          title: 'Typical requirements',
          items: special ? (slug === 'artists-creatives'
            ? ['A recommendation from the Ministry of Culture or the relevant Abu Dhabi cultural authority', 'A portfolio showing recognised work, awards or a significant audience', 'Passport copy, photo and CV', 'Health insurance for you and your family']
            : ['A nomination from the relevant federal or local authority', 'Evidence of your role and contribution', 'Passport, Emirates ID and employer letter', 'Health insurance for you and your family']) : [
            'At least a bachelor’s degree, attested or with equivalency',
            'A valid UAE work permit in an eligible classification',
            'A monthly salary of AED 30,000 or more, or a recommendation from the relevant authority',
            slug === 'doctors' || slug === 'healthcare-professionals' ? 'A valid UAE health licence for your profession' : 'Employer documents confirming your role',
          ],
        },
        { type: 'tool', tool: 'eligibility' },
      ],
      related: [special ? (slug === 'artists-creatives' ? '/golden-visa/exceptional-talents/' : '/golden-visa/humanitarian-other/') : '/golden-visa/skilled-professionals/', '/how-to-apply/'],
    };
  }),
];
