// Dynamic document checklists by route (spec section 12) and the usual timeline.
export const CHECKLISTS: Record<string, string[]> = {
  property: ['Passport copy (6+ months valid) and photo', 'Title deed or registered purchase agreement', 'Real Estate Unit Value Certificate if the value is not shown', 'Bank letter for mortgaged property / developer statement for off-plan', 'Emirates ID and current visa, if in the UAE', 'Health insurance'],
  investor: ['Passport copy and photo', 'Bank or fund letter for AED 2M deposit, or company capital documents', 'Trade licence, memorandum and commercial register', 'Tax returns for the tax route', 'Health insurance'],
  entrepreneur: ['Passport copy and photo', 'Approval letter from an incubator or authority, or audited revenue', 'Trade licence and ownership documents', 'Business plan or sale documents', 'Health insurance'],
  professional: ['Passport copy and photo', 'Employment contract and salary certificate (AED 30,000+)', 'Attested degree and equivalency certificate', 'Emirates ID and work permit', 'Health insurance'],
  graduate: ['Passport copy and photo', 'Attested degree and transcript (GPA)', 'University letter or ranking evidence', 'Graduation within the last 2 years', 'Health insurance'],
  family: ['Passport copy and photo for each person', 'Attested marriage certificate', 'Attested birth certificates for children', 'Sponsor’s Golden Visa and Emirates ID', 'Health insurance for each person'],
};
export const TIMELINE = ['Free eligibility check and quote', 'Documents and attestation', 'Nomination with the Abu Dhabi channel', 'Entry permit or change of status', 'Medical, Emirates ID and residence'];
