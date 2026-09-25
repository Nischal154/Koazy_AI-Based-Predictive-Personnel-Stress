// KOAZY Welfare Service - Comprehensive Welfare Analytics, Seasonal Patterns & Cohort Intelligence

const WELFARE_STORE_KEY = 'koazy_welfare_full_data';

// Seasonal & Climatic Operational Stress Patterns (Crucial for CAPFs & Armed Forces)
export const SEASONAL_PATTERNS = {
  WINTER_HIGH_ALTITUDE: {
    id: 'WINTER_HIGH_ALTITUDE',
    name: 'Winter / High Altitude (Siachen & Ladakh)',
    icon: '❄️',
    climateStressTag: 'Sub-Zero & Hypoxia Load',
    primaryHazards: ['Low-oxygen sleep fragmentation', 'Frostbite guard vigilance', 'Isolation due to snowbound passes'],
    affectedOutposts: ['Sector Delta Post 3', 'High Ridge Observation Point', 'Sector Echo Base'],
    averageRestDeficit: '38% increased sleep latency',
    recommendedIntervention: 'Compulsory rotational warming breaks, acclimatization sleep hygiene, peer morale sessions'
  },
  MONSOON_TERRAIN: {
    id: 'MONSOON_TERRAIN',
    name: 'Monsoon & Dense Terrain (North East & CI Ops)',
    icon: '🌧️',
    climateStressTag: 'Terrain & Sepsis Risk',
    primaryHazards: ['Trench foot and dampness fatigue', 'Leaching & flash flood operational hazards', 'Intermittent comms blackout anxiety'],
    affectedOutposts: ['Jungle Patrol Alpha', 'River Crossing Outpost', 'Sector Bravo Post 2'],
    averageRestDeficit: '24% reported emotional weariness',
    recommendedIntervention: 'Dry barrack maintenance, satellite welfare family check-in slots, anti-fungal hygiene kits'
  },
  SUMMER_HEATWAVE: {
    id: 'SUMMER_HEATWAVE',
    name: 'Summer Desert Heatwave (Thar Border)',
    icon: '☀️',
    climateStressTag: 'Extreme Thermal Strain (48°C+)',
    primaryHazards: ['Severe dehydration & heat exhaustion', 'Intense solar glare on perimeter patrol', 'Daytime sleep disruption'],
    affectedOutposts: ['Border Outpost 14', 'Desert Patrol Detachment', 'Sector Gamma Watchtower'],
    averageRestDeficit: '31% daytime sleep disruption',
    recommendedIntervention: 'Shift rescheduling to dawn/dusk hours, electrolyte pacing, cooling hydration stations'
  },
  FESTIVAL_ELECTION_SURGE: {
    id: 'FESTIVAL_ELECTION_SURGE',
    name: 'Festival & Election Deployment Surge',
    icon: '🛡️',
    climateStressTag: 'Continuous Standing Tempo',
    primaryHazards: ['Extended 16-hour standing crowd control', 'Relocation to unfamiliar civil sectors', 'Cancelled leave & festival homesickness'],
    affectedOutposts: ['Civil Assistance Detail 1', 'Transit Camp Metro', 'Quick Reaction Reserve'],
    averageRestDeficit: '42% physical fatigue index',
    recommendedIntervention: 'Micro-decompression breaks, designated welfare hotline access, staggered post-deployment leave recovery'
  }
};

// Batch Cohort Intelligence
export const BATCH_COHORTS = {
  ALL: { id: 'ALL', name: 'All Batches', description: 'Entire Unit Roster (148 Personnel)' },
  BATCH_2024: {
    id: 'BATCH_2024',
    name: 'Batch 2024 (Recruit Cohort)',
    experience: '< 1 Year Service',
    personnelCount: 38,
    primaryVulnerability: 'Initial adaptation, homesickness, military culture shock',
    avgCheckinScore: 68,
    highRiskCases: 2,
    recommendedCare: 'Senior Peer Buddy mentoring, weekly designated family calling slots'
  },
  BATCH_2020: {
    id: 'BATCH_2020',
    name: 'Batch 2020 (Mid-Career)',
    experience: '4–6 Years Service',
    personnelCount: 64,
    primaryVulnerability: 'Deployment fatigue, transfer rotation stress, child education/domestic pressure',
    avgCheckinScore: 74,
    highRiskCases: 1,
    recommendedCare: 'Quarterly leave pacing, confidential unit welfare officer check-in'
  },
  BATCH_2015: {
    id: 'BATCH_2015',
    name: 'Batch 2015 (Senior NCOs & JCOs)',
    experience: '9+ Years Service',
    personnelCount: 46,
    primaryVulnerability: 'Cumulative physical wear, joint/back strain, administrative responsibility load',
    avgCheckinScore: 79,
    highRiskCases: 0,
    recommendedCare: 'Physiotherapy recovery sessions, workload delegation audits'
  }
};

// Designated Welfare Officers Directory
export const WELFARE_OFFICERS = [
  {
    id: 'OFF-01',
    name: 'Capt. R. Deshmukh',
    role: 'Unit Welfare Officer',
    specialty: 'Operational Workload Audits & Administrative Leave Assistance',
    status: 'On Duty',
    activeCases: 4,
    avatar: '🛡️'
  },
  {
    id: 'OFF-02',
    name: 'Subedar Manoj Kumar',
    role: 'Senior Peer Counselor',
    specialty: 'Field Experience, Barrack Culture & Homesickness Mentoring',
    status: 'On Duty',
    activeCases: 3,
    avatar: '🤝'
  },
  {
    id: 'OFF-03',
    name: 'Dr. Sunita Rao',
    role: 'Base Medical Officer',
    specialty: 'Sleep Disorders, Physical Exhaustion & Medical Reassignment',
    status: 'Available',
    activeCases: 2,
    avatar: '🩺'
  }
];

// Initial Rich Cases List
const defaultCases = [
  {
    id: 'CASE-402',
    personnelRef: 'Personnel #8921 (Anonymized)',
    batch: 'BATCH_2024',
    company: 'Alpha Coy',
    priority: 'urgent',
    issue: 'High cumulative sleep disruption and low-oxygen headache reported across 4 consecutive border patrol shifts.',
    assignedOfficer: 'Capt. R. Deshmukh',
    assignedRole: 'Unit Welfare Officer',
    actionPlan: 'Light Duty Reassignment (24h) + Base Medical Review',
    status: 'Intervention Active',
    seasonLink: 'WINTER_HIGH_ALTITUDE',
    notes: 'Transferred from High Ridge post to base station for acclimatization and rest.'
  },
  {
    id: 'CASE-409',
    personnelRef: 'Personnel #6140 (Anonymized)',
    batch: 'BATCH_2020',
    company: 'Bravo Coy',
    priority: 'moderate',
    issue: 'Severe family medical emergency in home state reported during state-of-mind check-in.',
    assignedOfficer: 'Subedar Manoj Kumar',
    assignedRole: 'Senior Peer Counselor',
    actionPlan: 'Compassionate Leave Application Fast-Tracked',
    status: 'Pending Leave Approval',
    seasonLink: 'FESTIVAL_ELECTION_SURGE',
    notes: 'Welfare officer in communication with district liaison to assist family.'
  },
  {
    id: 'CASE-415',
    personnelRef: 'Personnel #7329 (Direct Request)',
    batch: 'BATCH_2024',
    company: 'Quick Reaction Team',
    priority: 'moderate',
    issue: 'Requested confidential 1-on-1 peer listener session regarding barrack adjustment and homesickness.',
    assignedOfficer: 'Subedar Manoj Kumar',
    assignedRole: 'Senior Peer Counselor',
    actionPlan: 'Scheduled 1-on-1 Peer Mentoring Session',
    status: 'Scheduled',
    seasonLink: 'MONSOON_TERRAIN',
    notes: 'Session scheduled for Thursday 17:00 in confidential welfare room.'
  },
  {
    id: 'CASE-420',
    personnelRef: 'Personnel #5411 (Anonymized)',
    batch: 'BATCH_2015',
    company: 'Logistics Detail',
    priority: 'routine',
    issue: 'Chronic lower back fatigue following continuous heavy equipment transit.',
    assignedOfficer: 'Dr. Sunita Rao',
    assignedRole: 'Base Medical Officer',
    actionPlan: 'Physiotherapy & Lumbar Support Kit Prescribed',
    status: 'Under Care',
    seasonLink: 'SUMMER_HEATWAVE',
    notes: 'Recommended 3-day ergonomic duty adjustment.'
  }
];

export const WelfareService = {
  getCases() {
    const raw = localStorage.getItem(WELFARE_STORE_KEY);
    return raw ? JSON.parse(raw) : defaultCases;
  },

  saveCases(cases) {
    localStorage.setItem(WELFARE_STORE_KEY, JSON.stringify(cases));
  },

  getCaseById(id) {
    const cases = this.getCases();
    return cases.find(c => c.id === id) || null;
  },

  updateCase(caseId, updates) {
    const cases = this.getCases();
    const target = cases.find(c => c.id === caseId);
    if (target) {
      Object.assign(target, updates);
      this.saveCases(cases);
    }
    return target;
  },

  getOfficers() {
    return WELFARE_OFFICERS;
  },

  getSeasonalPattern(seasonId) {
    return SEASONAL_PATTERNS[seasonId] || SEASONAL_PATTERNS.WINTER_HIGH_ALTITUDE;
  },

  getBatchMetrics(batchId) {
    return BATCH_COHORTS[batchId] || BATCH_COHORTS.ALL;
  }
};
