// Local Persistence & State Management for KOAZY

const STORAGE_KEYS = {
  USER_PROFILE: 'koazy_user_profile',
  CHECKIN_HISTORY: 'koazy_checkin_history',
  PRIVACY_SETTINGS: 'koazy_privacy_settings',
  WELFARE_CASES: 'koazy_welfare_cases'
};

const defaultProfile = {
  name: 'Sara Sharma',
  email: 'sara.sharma@forces.gov.in',
  role: 'Sub-Inspector',
  unit: 'Battalion 42, Sector Delta',
  streakDays: 4,
  anonymousMode: false,
  shareAggregatedData: true,
  offlineOnly: false
};

const defaultHistory = [
  {
    id: 'chk-1',
    date: 'Today, 08:30 AM',
    mood: 'Good',
    moodEmoji: '😊',
    energyLevel: 82,
    factors: ['Restful Sleep', 'Family Call'],
    note: 'Feeling positive and focused before today’s shift.'
  },
  {
    id: 'chk-2',
    date: 'Yesterday, 07:15 PM',
    mood: 'A little low',
    moodEmoji: '😐',
    energyLevel: 48,
    factors: ['Long Shift / Duty', 'Disrupted Sleep'],
    note: 'Double patrol duty felt tiring. Need to rest tonight.'
  },
  {
    id: 'chk-3',
    date: '2 days ago, 08:00 AM',
    mood: 'Okay',
    moodEmoji: '🙂',
    energyLevel: 65,
    factors: ['Work / Duty'],
    note: 'Routine day at headquarters.'
  }
];

const defaultWelfareCases = [
  {
    id: 'CASE-402',
    personnelRef: 'Personnel #8921 (Anonymized)',
    priority: 'urgent',
    issue: 'High cumulative sleep disruption and exhaustion flagged across 4 consecutive check-ins.',
    assignedTo: 'Capt. R. Deshmukh (Welfare Officer)',
    status: 'Intervention Scheduled'
  },
  {
    id: 'CASE-409',
    personnelRef: 'Personnel #6140 (Anonymized)',
    priority: 'moderate',
    issue: 'Family and transfer pressure reported during routine state-of-mind check-in.',
    assignedTo: 'Unassigned',
    status: 'Pending Review'
  },
  {
    id: 'CASE-415',
    personnelRef: 'Personnel #7329 (Direct Request)',
    priority: 'moderate',
    issue: 'Requested confidential 1-on-1 peer listener session.',
    assignedTo: 'Peer Listener Manoj K.',
    status: 'Active'
  }
];

export const StorageService = {
  getProfile() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : defaultProfile;
  },
  saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },
  getCheckins() {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKIN_HISTORY);
    return raw ? JSON.parse(raw) : defaultHistory;
  },
  addCheckin(entry) {
    const history = this.getCheckins();
    history.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.CHECKIN_HISTORY, JSON.stringify(history));
    return history;
  },
  getWelfareCases() {
    const raw = localStorage.getItem(STORAGE_KEYS.WELFARE_CASES);
    return raw ? JSON.parse(raw) : defaultWelfareCases;
  },
  assignCase(caseId, officerName) {
    const cases = this.getWelfareCases();
    const target = cases.find(c => c.id === caseId);
    if (target) {
      target.assignedTo = officerName;
      target.status = 'Assigned';
      localStorage.setItem(STORAGE_KEYS.WELFARE_CASES, JSON.stringify(cases));
    }
    return cases;
  },
  getAIDecisions() {
    const raw = localStorage.getItem('koazy_ai_decisions');
    return raw ? JSON.parse(raw) : [];
  },
  saveAIDecision(decision) {
    const list = this.getAIDecisions();
    list.unshift(decision);
    localStorage.setItem('koazy_ai_decisions', JSON.stringify(list.slice(0, 20)));
    return decision;
  },
  getLatestAIDecision() {
    const list = this.getAIDecisions();
    return list.length > 0 ? list[0] : null;
  },
  updateAIDecisionFeedback(decisionId, feedback) {
    const list = this.getAIDecisions();
    const target = list.find(d => d.id === decisionId) || (list.length > 0 ? list[0] : null);
    if (target) {
      target.userFeedback = feedback;
      localStorage.setItem('koazy_ai_decisions', JSON.stringify(list));
      return target;
    }
    return null;
  }
};
