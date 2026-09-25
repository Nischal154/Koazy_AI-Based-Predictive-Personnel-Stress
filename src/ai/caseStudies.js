// KOAZY Case Studies & SIH Demonstration Scenarios
// Configures all 10 required case studies + Two-Person Comparison presets.

export const CASE_STUDIES = [
  {
    id: 'CASE-01',
    number: '01',
    title: 'Family Stress (Remote Deployment)',
    subtitle: 'Personnel stationed away from home facing domestic concerns',
    personnelName: 'Constable Rajesh M.',
    personalInput: {
      mood: 'Stressed',
      moodEmoji: '😟',
      energyLevel: 58,
      sleepQuality: 'Normal',
      factors: ['Family', 'Personal thoughts'],
      note: 'Worried about parents back home in village. Medical situation ongoing.'
    },
    orgData: {
      dutyIntensity: 'Normal',
      workloadTrend: 'Stable',
      recentDeploymentChange: false,
      recentTransfer: false,
      leavePattern: 'Due for leave next month'
    },
    history: [
      { mood: 'Okay', date: '3 days ago' },
      { mood: 'Okay', date: '2 days ago' },
      { mood: 'Good', date: 'Yesterday' }
    ],
    expectedContext: 'Possible family/personal contributor (Self-reported)',
    expectedIntervention: 'Supportive conversation + personal/family support pathway'
  },
  {
    id: 'CASE-02',
    number: '02',
    title: 'Duty / Workload Stress',
    subtitle: 'High-tempo border or security deployment fatigue',
    personnelName: 'Head Constable Vikram S.',
    personalInput: {
      mood: 'Exhausted',
      moodEmoji: '😴',
      energyLevel: 32,
      sleepQuality: 'Broken / Interrupted',
      factors: ['Work / Duty', 'Sleep'],
      note: 'Third night shift in a row. Standing patrol duties extending beyond 12 hours.'
    },
    orgData: {
      dutyIntensity: 'High',
      workloadTrend: 'Increasing',
      recentDeploymentChange: false,
      recentTransfer: false,
      leavePattern: 'Normal'
    },
    history: [
      { mood: 'Okay', date: '4 days ago' },
      { mood: 'Stressed', date: '3 days ago' },
      { mood: 'Exhausted', date: 'Yesterday' }
    ],
    expectedContext: 'Possible duty/workload + recovery contributor',
    expectedIntervention: 'Recovery support + workload/welfare pathway + monitor trend'
  },
  {
    id: 'CASE-03',
    number: '03',
    title: 'Deployment Change',
    subtitle: 'Sudden operational shift to a high-altitude or sensitive sector',
    personnelName: 'Sub-Inspector Ananya P.',
    personalInput: {
      mood: 'A little low',
      moodEmoji: '😐',
      energyLevel: 52,
      sleepQuality: 'Insufficient / Short hours',
      factors: ['Work / Duty'],
      note: 'Still adapting to new sector acclimatization routines and station climate.'
    },
    orgData: {
      dutyIntensity: 'Normal',
      workloadTrend: 'Stable',
      recentDeploymentChange: true,
      recentTransfer: false,
      leavePattern: 'Restricted'
    },
    history: [
      { mood: 'Good', date: '5 days ago' },
      { mood: 'Okay', date: '3 days ago' },
      { mood: 'A little low', date: 'Yesterday' }
    ],
    expectedContext: 'Possible routine/deployment adjustment contributor',
    expectedIntervention: 'Supportive check-in + recovery support + monitoring'
  },
  {
    id: 'CASE-04',
    number: '04',
    title: 'Transfer & Personal Adjustment',
    subtitle: 'Relocation to new battalion combined with family distance',
    personnelName: 'Havildar Gurpreet S.',
    personalInput: {
      mood: 'Low',
      moodEmoji: '😐',
      energyLevel: 45,
      sleepQuality: 'Broken / Interrupted',
      factors: ['Family', 'Personal thoughts'],
      note: 'Adjusting to new unit headquarters. Hard to contact family due to connectivity.'
    },
    orgData: {
      dutyIntensity: 'Normal',
      workloadTrend: 'Stable',
      recentDeploymentChange: false,
      recentTransfer: true,
      leavePattern: 'New posting'
    },
    history: [
      { mood: 'Okay', date: '3 days ago' },
      { mood: 'Low', date: 'Yesterday' }
    ],
    expectedContext: 'Multiple contextual signals (Transfer + Family)',
    expectedIntervention: 'Supportive conversation + peer buddy connection + monitoring'
  },
  {
    id: 'CASE-05',
    number: '05',
    title: 'Unknown Cause (Insufficient Data)',
    subtitle: 'Low mood reported with no specific contextual driver identified',
    personnelName: 'Constable Amit B.',
    personalInput: {
      mood: 'Low',
      moodEmoji: '😐',
      energyLevel: 60,
      sleepQuality: 'Normal',
      factors: [],
      note: ''
    },
    orgData: {
      dutyIntensity: 'Normal',
      workloadTrend: 'Stable',
      recentDeploymentChange: false,
      recentTransfer: false,
      leavePattern: 'Normal'
    },
    history: [],
    expectedContext: 'Insufficient information (AI must not guess or diagnose)',
    expectedIntervention: 'Ask supportive follow-up clarifying question'
  },
  {
    id: 'CASE-06',
    number: '06',
    title: 'Isolated Bad Day',
    subtitle: 'Single low check-in following steady historical baseline',
    personnelName: 'Naik Sandeep R.',
    personalInput: {
      mood: 'Stressed',
      moodEmoji: '😟',
      energyLevel: 55,
      sleepQuality: 'Normal',
      factors: ['Something else'],
      note: 'Minor argument during morning briefing. Just need a moment.'
    },
    orgData: {
      dutyIntensity: 'Normal',
      workloadTrend: 'Stable',
      recentDeploymentChange: false,
      recentTransfer: false,
      leavePattern: 'Normal'
    },
    history: [
      { mood: 'Good', date: '4 days ago' },
      { mood: 'Good', date: '3 days ago' },
      { mood: 'Good', date: '2 days ago' },
      { mood: 'Okay', date: 'Yesterday' }
    ],
    expectedContext: 'Isolated negative signal on steady baseline',
    expectedIntervention: 'Gentle support. No unnecessary escalation.'
  },
  {
    id: 'CASE-07',
    number: '07',
    title: 'Persistent Decline',
    subtitle: 'Cumulative fatigue over 2 weeks of demanding duty shifts',
    personnelName: 'Assistant Sub-Inspector Meena K.',
    personalInput: {
      mood: 'Exhausted',
      moodEmoji: '😴',
      energyLevel: 28,
      sleepQuality: 'Broken / Interrupted',
      factors: ['Work / Duty', 'Sleep'],
      note: 'Exhaustion catching up. Body feels heavy every morning.'
    },
    orgData: {
      dutyIntensity: 'High',
      workloadTrend: 'Increasing',
      recentDeploymentChange: false,
      recentTransfer: false,
      leavePattern: 'Deferred'
    },
    history: [
      { mood: 'Stressed', date: '5 days ago' },
      { mood: 'Stressed', date: '4 days ago' },
      { mood: 'Exhausted', date: '3 days ago' },
      { mood: 'Exhausted', date: 'Yesterday' }
    ],
    expectedContext: 'Persistent negative wellbeing pattern',
    expectedIntervention: 'Structured recovery + authorized unit welfare workload review'
  },
  {
    id: 'CASE-08',
    number: '08',
    title: 'Conflicting Signals',
    subtitle: 'Personnel self-reports "Fine" despite heavy operational duty pressure',
    personnelName: 'Sepoy Dinesh T.',
    personalInput: {
      mood: 'Good',
      moodEmoji: '😊',
      energyLevel: 75,
      sleepQuality: 'Normal',
      factors: [],
      note: 'Everything is fine. Continuing duty.'
    },
    orgData: {
      dutyIntensity: 'High',
      workloadTrend: 'Increasing',
      recentDeploymentChange: true,
      recentTransfer: false,
      leavePattern: 'None'
    },
    history: [
      { mood: 'Okay', date: '2 days ago' },
      { mood: 'Good', date: 'Yesterday' }
    ],
    expectedContext: 'Conflicting signals (Do not override self-report)',
    expectedIntervention: 'Gentle optional check-in without administrative intrusion'
  },
  {
    id: 'CASE-09',
    number: '09',
    title: 'Improving Trend',
    subtitle: 'Personnel recovering positive rhythm after leave or rest',
    personnelName: 'Constable Priya V.',
    personalInput: {
      mood: 'Good',
      moodEmoji: '😊',
      energyLevel: 85,
      sleepQuality: 'Restful & deep',
      factors: ['Sleep', 'Family Call'],
      note: 'Slept 8 hours uninterrupted. Feeling refreshed and sharp today.'
    },
    orgData: {
      dutyIntensity: 'Normal',
      workloadTrend: 'Stable',
      recentDeploymentChange: false,
      recentTransfer: false,
      leavePattern: 'Returned from rest day'
    },
    history: [
      { mood: 'Exhausted', date: '4 days ago' },
      { mood: 'Low', date: '3 days ago' },
      { mood: 'Okay', date: 'Yesterday' }
    ],
    expectedContext: 'Improving trend with positive rest indicators',
    expectedIntervention: 'Positive reinforcement + maintain healthy rhythm'
  },
  {
    id: 'CASE-10',
    number: '10',
    title: 'Multi-Factor Stress',
    subtitle: 'Simultaneous family concern, high workload, and sleep disruption',
    personnelName: 'Sub-Inspector Karan N.',
    personalInput: {
      mood: 'Overwhelmed',
      moodEmoji: '😣',
      energyLevel: 30,
      sleepQuality: 'Broken / Interrupted',
      factors: ['Family', 'Work / Duty', 'Sleep'],
      note: 'Family emergency coincide with high-alert deployment duties.'
    },
    orgData: {
      dutyIntensity: 'High',
      workloadTrend: 'Increasing',
      recentDeploymentChange: true,
      recentTransfer: false,
      leavePattern: 'Emergency leave requested'
    },
    history: [
      { mood: 'Stressed', date: '3 days ago' },
      { mood: 'Overwhelmed', date: 'Yesterday' }
    ],
    expectedContext: 'Multiple contributing contexts (Family + Duty + Sleep)',
    expectedIntervention: 'Supportive AI conversation + recovery support + welfare escalation'
  }
];

export const TWO_PERSON_COMPARISON = {
  personA: {
    name: 'Personnel A (Family Context)',
    personalInput: {
      mood: 'Stressed',
      moodEmoji: '😟',
      energyLevel: 55,
      sleepQuality: 'Normal',
      factors: ['Family'],
      note: 'Domestic family issue ongoing back home.'
    },
    orgData: {
      dutyIntensity: 'Normal',
      workloadTrend: 'Stable',
      recentDeploymentChange: false
    }
  },
  personB: {
    name: 'Personnel B (Duty/Recovery Context)',
    personalInput: {
      mood: 'Stressed',
      moodEmoji: '😟',
      energyLevel: 35,
      sleepQuality: 'Broken / Interrupted',
      factors: ['Work / Duty'],
      note: 'Heavy operational workload and poor sleep.'
    },
    orgData: {
      dutyIntensity: 'High',
      workloadTrend: 'Increasing',
      recentDeploymentChange: false
    }
  }
};
