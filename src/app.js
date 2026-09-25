import { StorageService } from './services/storage.service.js';
import { CheckinService } from './services/checkin.service.js';
import { ChatService } from './services/chat.service.js';
import { AIService } from './services/aiService.js';
import { SafetyService } from './services/safetyService.js';
import { WelfareService, SEASONAL_PATTERNS, BATCH_COHORTS, WELFARE_OFFICERS } from './services/welfare.service.js';

// App State
let currentScreenId = '04';
let currentAITab = 'caseStudies';
let activeCaseStudyId = 'CASE-01';
let lastExecutedDecision = null;
let checkinStep = 1;

// Welfare Dashboard Filter States
let activeSeasonId = 'WINTER_HIGH_ALTITUDE';
let activeBatchFilter = 'ALL';
let selectedManageCaseId = null;

// Call Timer State
let liveCallInterval = null;
let liveCallDurationSeconds = 0;

const checkinAnswers = {
  mood: 'Good',
  moodEmoji: '😊',
  factors: ['Work / Duty'],
  energyLevel: 72,
  tensionArea: 'Neck & Shoulders',
  stressDriver: 'High-tempo shifts',
  sleepQuality: 'Restful',
  note: '',
  helpfulAction: 'Relax / breathe'
};

// Check-in Questions Definition (Per project specification)
const CHECKIN_STEPS = [
  {
    step: 1,
    title: "How are you feeling right now?",
    hint: "Choose whatever feels most true to this moment.",
    type: "single_emoji",
    options: [
      { emoji: "😊", label: "Good" },
      { emoji: "🙂", label: "Okay" },
      { emoji: "😐", label: "A little low" },
      { emoji: "😟", label: "Stressed" },
      { emoji: "😣", label: "Overwhelmed" },
      { emoji: "😴", label: "Exhausted" }
    ]
  },
  {
    step: 2,
    title: "What's been taking up most of your energy today?",
    hint: "Select one or more areas that have been on your mind.",
    type: "multi_tag",
    options: [
      "Work / Duty", "Sleep", "Family", "Relationships",
      "Physical wellbeing", "Personal thoughts", "Something else"
    ]
  },
  {
    step: 3,
    title: "How has your energy been today?",
    hint: "Drag the slider to reflect your vitality level.",
    type: "slider",
    min: 0,
    max: 100,
    default: 65
  },
  {
    step: 4,
    title: "How well did you sleep recently?",
    hint: "Rest rhythms play a big part in service wellbeing.",
    type: "single_choice",
    options: [
      { label: "Restful & deep", icon: "✨" },
      { label: "Okay, but woke up tired", icon: "🥱" },
      { label: "Broken / Interrupted", icon: "⚡" },
      { label: "Insufficient / Short hours", icon: "⏰" }
    ]
  },
  {
    step: 5,
    title: "Is there anything on your mind you'd like to share?",
    hint: "This remains strictly in your private personal log.",
    type: "text",
    placeholder: "Write whatever feels comfortable (optional)..."
  },
  {
    step: 6,
    title: "What would feel helpful right now?",
    hint: "A gentle step to support how you are feeling.",
    type: "single_choice",
    options: [
      { label: "Take a short break", icon: "☕" },
      { label: "Relax / breathe", icon: "🌿" },
      { label: "Talk to someone", icon: "💬" },
      { label: "Do an activity", icon: "🧘" },
      { label: "Get some sleep", icon: "🌙" },
      { label: "I'm not sure", icon: "🤍" }
    ]
  }
];

// Navigation Manager
export function navigateToScreen(screenNumber) {
  const targetId = `screen-${screenNumber}`;
  const screens = document.querySelectorAll('#singlePhoneStage .screen');
  screens.forEach(s => s.classList.remove('active'));

  const targetScreen = document.getElementById(targetId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    currentScreenId = screenNumber;
  }

  // Update screen dropdown
  const dropdown = document.getElementById('screenJumpSelect');
  if (dropdown && dropdown.value !== screenNumber) {
    dropdown.value = screenNumber;
  }

  // Handle bottom navigation visibility
  const bottomNav = document.getElementById('mainBottomNav');
  const showNavScreens = ['04', '08', '09', '10', '11', '12'];
  if (bottomNav) {
    bottomNav.style.display = showNavScreens.includes(screenNumber) ? 'flex' : 'none';
  }

  // Update active bottom nav icon
  updateBottomNavHighlight(screenNumber);

  // Scroll to top of phone content
  const content = document.getElementById('activeScreenContainer');
  if (content) content.scrollTop = 0;

  // Refresh dynamic screen content if needed
  if (screenNumber === '04') updateHomeDashboardStats();
  if (screenNumber === '08') refreshSelfCareActivities();
  if (screenNumber === '10') {
    renderRecordsTimeline();
    renderDynamicWaveGraph('today');
  }
  if (screenNumber === '11') showAmbulanceMap(false);
  if (screenNumber === '13') {
    renderWelfareOfficersDirectory();
    selectSeasonalPattern(activeSeasonId);
    renderWelfareCases();
  }
}
window.navigateToScreen = navigateToScreen;

function updateBottomNavHighlight(screenNumber) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(n => {
    n.classList.remove('active');
    const dot = n.querySelector('.nav-dot');
    if (dot) dot.remove();
  });

  const mapping = {
    '04': 'navItemHome',
    '10': 'navItemRecords',
    '11': 'navItemAlert',
    '09': 'navItemChat',
    '12': 'navItemProfile'
  };

  const activeId = mapping[screenNumber];
  if (activeId) {
    const activeBtn = document.getElementById(activeId);
    if (activeBtn) {
      activeBtn.classList.add('active');
      const dot = document.createElement('span');
      dot.className = 'nav-dot';
      activeBtn.appendChild(dot);
    }
  }
}

// Check-in Flow Handlers
export function startCheckinFlow() {
  navigateToScreen('05');
}
window.startCheckinFlow = startCheckinFlow;

// Home Screen Interactions
export function selectDateChip(el) {
  document.querySelectorAll('.date-day-chip').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
}
window.selectDateChip = selectDateChip;

let isEveningMode = false;
export function toggleDayEveningMode() {
  isEveningMode = !isEveningMode;
  const txt = document.getElementById('homeEveningText');
  const heroTitle = document.getElementById('homeHeroHeadline');
  const card = document.querySelector('.wellbeing-main-card');
  if (isEveningMode) {
    if (txt) txt.textContent = 'MORNING';
    if (heroTitle) heroTitle.innerHTML = 'Good evening!<br>Time to unwind & reflect.';
    if (card) card.style.background = '#4A4E9E';
  } else {
    if (txt) txt.textContent = 'EVENING';
    if (heroTitle) heroTitle.innerHTML = 'Good morning!<br>How are you feeling today?';
    if (card) card.style.background = '#FF6E6A';
  }
}
window.toggleDayEveningMode = toggleDayEveningMode;

// Check_1 Mood Selection
export function selectMoodCard(mood, emoji, el) {
  checkinAnswers.mood = mood;
  checkinAnswers.moodEmoji = emoji;
  document.querySelectorAll('.mood-card-item').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');

  // Dynamically map mood to vitality percentage and sync Step 2 slider
  let energyVal = 70;
  if (mood === 'Great') energyVal = 92;
  else if (mood === 'Good') energyVal = 80;
  else if (mood === 'Okay') energyVal = 65;
  else if (mood === 'Confused') energyVal = 50;
  else if (mood === 'Sad') energyVal = 35;
  else if (mood === 'Stress' || mood === 'Stressed') energyVal = 25;

  checkinAnswers.energyLevel = energyVal;

  const slider = document.getElementById('interactiveEnergySlider');
  if (slider) slider.value = energyVal;
  updateInteractiveEnergy(energyVal);
}
window.selectMoodCard = selectMoodCard;

export function goToStep2() {
  navigateToScreen('06');
  const step2 = document.getElementById('checkinSubStep2');
  const step3 = document.getElementById('checkinSubStep3');
  const fill = document.getElementById('checkinStepProgressFill');
  const num = document.getElementById('checkinStepNumText');
  if (step2) step2.style.display = 'flex';
  if (step3) step3.style.display = 'none';
  if (fill) fill.style.width = '66%';
  if (num) num.textContent = '2/3';
}
window.goToStep2 = goToStep2;

export function goToStep1() {
  const step3 = document.getElementById('checkinSubStep3');
  if (step3 && step3.style.display === 'flex') {
    goToStep2();
  } else {
    navigateToScreen('05');
  }
}
window.goToStep1 = goToStep1;

// Check_2 Category Selection
export function toggleCategoryChip(cat, el) {
  if (checkinAnswers.factors.includes(cat)) {
    checkinAnswers.factors = checkinAnswers.factors.filter(f => f !== cat);
    if (el) el.classList.remove('active');
  } else {
    checkinAnswers.factors.push(cat);
    if (el) el.classList.add('active');
  }
}
window.toggleCategoryChip = toggleCategoryChip;

// Voluntary Health & Daily Indicators (Sleep, Food Intake, Family Safety)
export function setHealthIndicator(type, value, el) {
  if (!checkinAnswers.healthIndicators) {
    checkinAnswers.healthIndicators = { sleep: '8h+', food: 'regular', family: 'safe' };
  }
  checkinAnswers.healthIndicators[type] = value;
  
  if (el) {
    const parent = el.closest('.indicator-chips-row');
    if (parent) {
      parent.querySelectorAll('.indicator-chip').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
    }
  }
}
window.setHealthIndicator = setHealthIndicator;

// Interactive Adaptive Q&A Handlers
export function selectAdaptiveChoice(type, val, el) {
  if (type === 'tension') {
    checkinAnswers.tensionArea = val;
    const parent = document.getElementById('somaticTensionChips');
    if (parent) {
      parent.querySelectorAll('.qa-choice-chip').forEach(c => c.classList.remove('active'));
    }
  } else if (type === 'driver') {
    checkinAnswers.stressDriver = val;
    const parent = document.getElementById('stressDriverChips');
    if (parent) {
      parent.querySelectorAll('.qa-choice-chip').forEach(c => c.classList.remove('active'));
    }
  }
  if (el) el.classList.add('active');
}
window.selectAdaptiveChoice = selectAdaptiveChoice;

export function updateInteractiveEnergy(val) {
  const num = parseInt(val, 10);
  checkinAnswers.energyLevel = num;
  const badge = document.getElementById('vitalityLevelBadge');
  if (badge) {
    let label = 'Recharged';
    let color = '#2B6CB0';
    let bg = '#EBF8FF';
    if (num < 35) {
      label = 'Exhausted';
      color = '#C53030';
      bg = '#FFF5F5';
    } else if (num < 60) {
      label = 'Moderate Drain';
      color = '#DD6B20';
      bg = '#FFFAF0';
    } else if (num < 85) {
      label = 'Recharged';
      color = '#2B6CB0';
      bg = '#EBF8FF';
    } else {
      label = 'Peak Vitality';
      color = '#22543D';
      bg = '#F0FFF4';
    }
    badge.textContent = `${num}% — ${label}`;
    badge.style.color = color;
    badge.style.background = bg;
  }
}
window.updateInteractiveEnergy = updateInteractiveEnergy;

export function goToStep3() {
  const step2 = document.getElementById('checkinSubStep2');
  const step3 = document.getElementById('checkinSubStep3');
  const fill = document.getElementById('checkinStepProgressFill');
  const num = document.getElementById('checkinStepNumText');
  if (step2) step2.style.display = 'none';
  if (step3) step3.style.display = 'flex';
  if (fill) fill.style.width = '100%';
  if (num) num.textContent = '3/3';
}
window.goToStep3 = goToStep3;

// Check_3 Input & Voice Note
export function handleCheckinNoteInput(val) {
  checkinAnswers.note = val;
}
window.handleCheckinNoteInput = handleCheckinNoteInput;

let voiceTimer = null;
let voiceSeconds = 0;
export function startVoiceRecording() {
  const status = document.getElementById('voiceRecordingStatus');
  const card = document.getElementById('voiceNoteCard');
  if (card) card.style.borderColor = '#FF6E6A';
  voiceSeconds = 0;
  if (status) status.innerHTML = '🔴 Recording... 0:00';
  voiceTimer = setInterval(() => {
    voiceSeconds++;
    if (status) status.innerHTML = `🔴 Recording... 0:0${voiceSeconds}`;
  }, 1000);
}
export function stopVoiceRecording() {
  if (voiceTimer) clearInterval(voiceTimer);
  const status = document.getElementById('voiceRecordingStatus');
  const card = document.getElementById('voiceNoteCard');
  if (card) card.style.borderColor = '#2E9B4F';
  if (status) status.innerHTML = '✅ Voice note saved privately';
  checkinAnswers.note = (checkinAnswers.note ? checkinAnswers.note + ' ' : '') + '[Voice note attached]';
}
window.startVoiceRecording = startVoiceRecording;
window.stopVoiceRecording = stopVoiceRecording;

export function submitCheckinForm() {
  finishCheckin();
}
window.submitCheckinForm = submitCheckinForm;

// Emergency SOS & Ambulance Handlers (Android Large - 18 & 17)
export function showAmbulanceMap(show) {
  const mainView = document.getElementById('emergencyHelpMainView');
  const mapView = document.getElementById('emergencyAmbulanceMapView');
  if (mainView && mapView) {
    if (show) {
      mainView.style.display = 'none';
      mapView.style.display = 'flex';
    } else {
      mainView.style.display = 'flex';
      mapView.style.display = 'none';
    }
  }
}
window.showAmbulanceMap = showAmbulanceMap;

let sosHoldTimer = null;
export function startSOSCallHold() {
  const btn = document.getElementById('sosBigCallButton');
  if (btn) btn.style.transform = 'scale(0.92)';
  sosHoldTimer = setTimeout(() => {
    triggerImmediateSOS();
  }, 1200);
}
export function endSOSCallHold() {
  if (sosHoldTimer) clearTimeout(sosHoldTimer);
  const btn = document.getElementById('sosBigCallButton');
  if (btn) btn.style.transform = '';
}
export function triggerImmediateSOS() {
  if (sosHoldTimer) clearTimeout(sosHoldTimer);
  startHelplineCall('1800-555-KOAZY', '24/7 Armed Forces & CAPF Helpline');
}
window.startSOSCallHold = startSOSCallHold;
window.endSOSCallHold = endSOSCallHold;
window.triggerImmediateSOS = triggerImmediateSOS;

export function openScheduleTherapyModal() {
  alert('Confidential Therapy Booking:\nAppointment request dispatched to Unit Welfare Officer & Sector Clinical Psychologist.\nA discreet confirmation will arrive in your encrypted inbox.');
}
window.openScheduleTherapyModal = openScheduleTherapyModal;

// =========================================================
// HOME DASHBOARD LIVE METRICS & READINESS SYNC (SCREEN 04)
// =========================================================
export function updateHomeDashboardStats() {
  const checkins = StorageService.getCheckins();
  const profile = StorageService.getProfile();
  const latest = checkins.length > 0 ? checkins[0] : null;

  const statePill = document.getElementById('homeFunctionalStatePill');
  const stateText = document.getElementById('homeFunctionalStateText');
  const updateTime = document.getElementById('homeFunctionalUpdateTime');
  const emotionalScore = document.getElementById('homeEmotionalScoreText');
  const emotionalBar = document.getElementById('homeEmotionalBarFill');
  const vitalityScore = document.getElementById('homeVitalityScoreText');
  const vitalityBar = document.getElementById('homeVitalityBarFill');

  const readinessEl = document.getElementById('homeReadinessScore');
  const restEl = document.getElementById('homeRestScore');
  const streakEl = document.getElementById('homeStreakScore');
  const hydrationEl = document.getElementById('homeHydrationScore');

  // Hydration sync
  if (hydrationEl) hydrationEl.textContent = `${waterCount}/6`;

  // Default values
  let energy = latest ? (latest.energyLevel || 75) : 78;
  let emotional = 82;
  let isRisk = latest ? !!latest.isStressRisk : false;
  let sleepHours = '8.0h';

  if (latest) {
    if (latest.mood === 'Great') emotional = 94;
    else if (latest.mood === 'Good') emotional = 82;
    else if (latest.mood === 'Okay') emotional = 66;
    else if (latest.mood === 'Confused') emotional = 52;
    else if (latest.mood === 'Stressed' || latest.mood === 'Stress') emotional = 30;
    else if (latest.mood === 'Sad') emotional = 32;

    if (latest.healthIndicators) {
      if (latest.healthIndicators.sleep === '<5h') sleepHours = '4.5h Deficit';
      else if (latest.healthIndicators.sleep === '6-7h') sleepHours = '6.5h Steady';
      else if (latest.healthIndicators.sleep === '8h+') sleepHours = '8.0h Rested';
    }

    if (updateTime) {
      updateTime.textContent = latest.date === 'Just now' ? 'Synced just now' : `Synced (${latest.date.split(',')[0]})`;
    }
  }

  // Calculate composite readiness score (weighted vitality, emotional balance, hydration)
  const hydrationPct = (waterCount / 6) * 100;
  const readiness = Math.round((energy * 0.45) + (emotional * 0.4) + (hydrationPct * 0.15));

  if (readinessEl) readinessEl.textContent = `${readiness}%`;
  if (restEl) restEl.textContent = sleepHours;
  if (streakEl) streakEl.textContent = `${profile.streakDays || 5} Days`;

  if (emotionalScore) emotionalScore.textContent = `${emotional}%`;
  if (emotionalBar) {
    emotionalBar.style.width = `${emotional}%`;
    emotionalBar.className = `f-metric-bar-fill ${emotional < 45 ? 'coral' : emotional < 70 ? 'blue' : 'green'}`;
  }

  if (vitalityScore) vitalityScore.textContent = `${energy}%`;
  if (vitalityBar) {
    vitalityBar.style.width = `${energy}%`;
    vitalityBar.className = `f-metric-bar-fill ${energy < 45 ? 'coral' : energy < 70 ? 'blue' : 'green'}`;
  }

  if (stateText && statePill) {
    const dot = statePill.querySelector('.state-dot');
    if (isRisk || readiness < 50) {
      stateText.textContent = 'Elevated Strain • Rest Protocol Recommended';
      if (dot) dot.className = 'state-dot coral';
    } else if (readiness < 75) {
      stateText.textContent = 'Vigilant • Stable Duty Readiness';
      if (dot) dot.className = 'state-dot blue';
    } else {
      stateText.textContent = 'Fit for Duty • High Resilience';
      if (dot) dot.className = 'state-dot green';
    }
  }

  // Sync Desktop Companion Rail if present
  const railResilience = document.getElementById('railResilienceScore');
  const railRisk = document.getElementById('railStressRisk');
  const railRest = document.getElementById('railRestRhythm');
  const railStreak = document.getElementById('railStreak');

  if (railResilience) railResilience.textContent = `${readiness}%`;
  if (railRisk) {
    railRisk.textContent = isRisk ? 'Elevated (0.65)' : 'Low (0.18)';
    railRisk.style.color = isRisk ? '#F87171' : '#60A5FA';
  }
  if (railRest) railRest.textContent = sleepHours;
  if (railStreak) railStreak.textContent = `${profile.streakDays || 5} Days`;
}
window.updateHomeDashboardStats = updateHomeDashboardStats;

// =========================================================
// DYNAMIC USER ANALYTICS WAVE GRAPH (SCREEN 10)
// =========================================================
export function selectTimeframeTab(el, timeframe) {
  document.querySelectorAll('.timeframe-tab-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderDynamicWaveGraph(timeframe);
}
window.selectTimeframeTab = selectTimeframeTab;

export function renderDynamicWaveGraph(timeframe = 'today') {
  const svg = document.getElementById('dynamicWaveSvg');
  const xAxis = document.getElementById('waveXAxis');
  const summaryAvg = document.getElementById('waveSummaryAvgText');
  if (!svg) return;

  const checkins = StorageService.getCheckins();
  const latest = checkins.length > 0 ? checkins[0] : null;
  const latestEnergy = latest ? (latest.energyLevel !== undefined ? latest.energyLevel : 75) : 75;
  const latestMood = latest ? (latest.mood || 'Good') : 'Good';
  const latestEmoji = latest ? (latest.moodEmoji || '😊') : '😊';

  let dataPoints = [];
  let xLabels = [];

  if (timeframe === 'today') {
    xLabels = ['08:00', '11:30', 'Now', '17:00', '20:00'];
    const afternoonEnergy = latestEnergy < 50 ? 40 : Math.min(92, Math.round(latestEnergy * 0.94));
    const eveningEnergy = latestEnergy < 50 ? 48 : Math.max(45, Math.round(latestEnergy * 0.88));

    dataPoints = [
      { time: '08:00', energy: 82, mood: 'Good', emoji: '😊', isCurrent: false },
      { time: '11:30', energy: 68, mood: 'Okay', emoji: '🙂', isCurrent: false },
      { time: 'Now', energy: latestEnergy, mood: latestMood, emoji: latestEmoji, isCurrent: true },
      { time: '17:00', energy: afternoonEnergy, mood: latestEnergy < 50 ? 'Low' : 'Good', emoji: latestEnergy < 50 ? '😐' : '😊', isCurrent: false },
      { time: '20:00', energy: eveningEnergy, mood: 'Wind-Down', emoji: '😴', isCurrent: false }
    ];
  } else if (timeframe === '7days') {
    xLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    dataPoints = [
      { time: 'Mon', energy: 78, mood: 'Good', emoji: '😊', isCurrent: false },
      { time: 'Tue', energy: 84, mood: 'Great', emoji: '😊', isCurrent: false },
      { time: 'Wed', energy: 62, mood: 'Okay', emoji: '🙂', isCurrent: false },
      { time: 'Thu', energy: 50, mood: 'Low', emoji: '😐', isCurrent: false },
      { time: 'Fri', energy: 72, mood: 'Good', emoji: '😊', isCurrent: false },
      { time: 'Sat', energy: 88, mood: 'Great', emoji: '😊', isCurrent: false },
      { time: 'Sun', energy: latestEnergy, mood: latestMood, emoji: latestEmoji, isCurrent: true }
    ];
  } else if (timeframe === '30days') {
    xLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    dataPoints = [
      { time: 'Week 1', energy: 74, mood: 'Good', emoji: '😊', isCurrent: false },
      { time: 'Week 2', energy: 68, mood: 'Okay', emoji: '🙂', isCurrent: false },
      { time: 'Week 3', energy: 82, mood: 'Great', emoji: '😊', isCurrent: false },
      { time: 'Week 4', energy: Math.round((latestEnergy + 76) / 2), mood: latestMood, emoji: latestEmoji, isCurrent: true }
    ];
  } else { // 3months
    xLabels = ['Month 1', 'Month 2', 'Month 3'];
    dataPoints = [
      { time: 'July', energy: 70, mood: 'Good', emoji: '😊', isCurrent: false },
      { time: 'August', energy: 76, mood: 'Good', emoji: '😊', isCurrent: false },
      { time: 'September', energy: Math.round((latestEnergy + 78) / 2), mood: latestMood, emoji: latestEmoji, isCurrent: true }
    ];
  }

  // Update Summary Average
  const avgEnergy = Math.round(dataPoints.reduce((acc, p) => acc + p.energy, 0) / dataPoints.length);
  if (summaryAvg) summaryAvg.textContent = `Avg Vitality: ${avgEnergy}% • Latest: ${latestMood} (${latestEnergy}%)`;

  // Update X-Axis
  if (xAxis) {
    xAxis.innerHTML = xLabels.map(l => `<span>${l}</span>`).join('');
  }

  // Calculate coordinates in SVG (viewBox 0 0 240 100)
  const width = 240;
  const paddingX = 20;
  const usableWidth = width - (paddingX * 2);
  const stepX = dataPoints.length > 1 ? usableWidth / (dataPoints.length - 1) : 0;

  const points = dataPoints.map((pt, i) => {
    const x = paddingX + (i * stepX);
    // Map energy 0-100% to Y 85 (low) down to 20 (high)
    const y = 85 - ((pt.energy / 100) * 65);
    return { ...pt, x, y };
  });

  // Build smooth cubic bezier curve
  let dCurve = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX1 = curr.x + (next.x - curr.x) / 2;
    const cpY1 = curr.y;
    const cpX2 = curr.x + (next.x - curr.x) / 2;
    const cpY2 = next.y;
    dCurve += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
  }

  const dArea = `${dCurve} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

  // Generate interactive smileys / markers
  const markersHtml = points.map((pt) => {
    const isStress = pt.energy < 50 || pt.mood === 'Stress' || pt.mood === 'Stressed' || pt.mood === 'Sad' || pt.mood === 'Low' || pt.mood === 'Overwhelmed' || pt.mood === 'Exhausted';
    const isNeutral = !isStress && (pt.energy < 75 || pt.mood === 'Okay' || pt.mood === 'Confused');
    const isCurrent = pt.isCurrent;

    const faceColor = isStress ? '#FF6E6A' : isNeutral ? '#FFDA63' : '#10B981';
    const eyeColor = isNeutral ? '#242B33' : '#FFFFFF';
    const mouth = isStress 
      ? `<path d="M ${pt.x - 3} ${pt.y + 4} Q ${pt.x} ${pt.y + 1} ${pt.x + 3} ${pt.y + 4}" stroke="${eyeColor}" stroke-width="1.3" stroke-linecap="round" fill="none"/>`
      : isNeutral
      ? `<line x1="${pt.x - 3}" y1="${pt.y + 3}" x2="${pt.x + 3}" y2="${pt.y + 3}" stroke="${eyeColor}" stroke-width="1.3" stroke-linecap="round"/>`
      : `<path d="M ${pt.x - 3} ${pt.y + 2} Q ${pt.x} ${pt.y + 5.5} ${pt.x + 3} ${pt.y + 2}" stroke="${eyeColor}" stroke-width="1.3" stroke-linecap="round" fill="none"/>`;

    const pulseRing = isCurrent ? `
      <circle cx="${pt.x}" cy="${pt.y}" r="15" fill="none" stroke="${isStress ? '#FF6E6A' : '#10B981'}" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.9">
        <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite"/>
      </circle>
    ` : '';

    return `
      <g class="wave-point-interactive" 
         onclick="showWavePointTooltip('${pt.time}', '${pt.mood}', ${pt.energy})"
         onmouseenter="showWavePointTooltip('${pt.time}', '${pt.mood}', ${pt.energy})"
         style="cursor:pointer;">
        ${pulseRing}
        <!-- Outer Glow -->
        <circle cx="${pt.x}" cy="${pt.y}" r="10" fill="rgba(255,255,255,0.3)"/>
        <!-- Colored Face Circle -->
        <circle cx="${pt.x}" cy="${pt.y}" r="8" fill="${faceColor}" stroke="#FFFFFF" stroke-width="1.3"/>
        <!-- Eyes -->
        <circle cx="${pt.x - 2.8}" cy="${pt.y - 1.5}" r="1.1" fill="${eyeColor}"/>
        <circle cx="${pt.x + 2.8}" cy="${pt.y - 1.5}" r="1.1" fill="${eyeColor}"/>
        <!-- Mouth -->
        ${mouth}
      </g>
    `;
  }).join('');

  svg.innerHTML = `
    <!-- Shaded Area Under Wave -->
    <path d="${dArea}" fill="rgba(255,255,255,0.18)"/>
    <!-- Crisp White Wave Curve -->
    <path d="${dCurve}" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Interactive Markers -->
    ${markersHtml}
  `;
}
window.renderDynamicWaveGraph = renderDynamicWaveGraph;

export function showWavePointTooltip(time, mood, energy) {
  const tooltip = document.getElementById('waveTooltipBox');
  if (!tooltip) return;
  tooltip.innerHTML = `<strong>${time}</strong>: ${mood} • Vitality ${energy}%`;
  tooltip.style.opacity = '1';
  clearTimeout(tooltip._timer);
  tooltip._timer = setTimeout(() => {
    tooltip.style.opacity = '0';
  }, 3200);
}
window.showWavePointTooltip = showWavePointTooltip;

// =========================================================
// DYNAMIC SELF CARE & CALM REFRESH ENGINE (SCREEN 08)
// =========================================================
export function refreshSelfCareActivities(checkin = null) {
  const list = document.getElementById('selfCareActivitiesList');
  const badgeTitle = document.getElementById('selfCareBadgeTitle');
  const badgeSub = document.getElementById('selfCareBadgeSubtitle');
  const badgeCount = document.getElementById('selfCareSessionCount');
  if (!list) return;

  const checkins = StorageService.getCheckins();
  const target = checkin || (checkins.length > 0 ? checkins[0] : null);

  const tension = (target && target.tensionArea) ? target.tensionArea : (checkinAnswers.tensionArea || 'Neck & Shoulders');
  const driver = (target && target.stressDriver) ? target.stressDriver : (checkinAnswers.stressDriver || 'High-tempo shifts');
  const sleepRest = target && target.healthIndicators ? target.healthIndicators.sleep : '8h+';
  const isStress = target ? !!target.isStressRisk : false;

  if (badgeTitle && badgeSub) {
    if (isStress || sleepRest === '<5h') {
      badgeTitle.textContent = `Priority Recovery: ${tension}`;
      badgeSub.textContent = `Tailored somatic down-regulation to relieve ${driver.toLowerCase()} and sleep deficit.`;
    } else {
      badgeTitle.textContent = `Tailored to Your Check-In: ${tension}`;
      badgeSub.textContent = `Optimal maintenance routines targeted for ${tension.toLowerCase()} & sustained clarity.`;
    }
  }

  // Build 4 adaptive activity items
  const activities = [];

  // 1. Somatic physical release
  if (tension === 'Neck & Shoulders') {
    activities.push({
      title: 'Tactical Neck & Trapezoid Release',
      desc: 'Gentle isometric stretches to release trapezius stiffness and body armor burden',
      duration: '4 min',
      icon: 'assets/icons/heart.svg',
      bg: '#FDECE9',
      tag: 'Tension Relief',
      tagColor: '#C53030',
      tagBg: '#FFF5F5',
      highlighted: true
    });
  } else if (tension === 'Jaw & Temples') {
    activities.push({
      title: 'Cranial & Jaw Tension Release',
      desc: 'Temporomandibular decompression to relieve stress clenching and headaches',
      duration: '3 min',
      icon: 'assets/icons/heart.svg',
      bg: '#FDECE9',
      tag: 'Tension Relief',
      tagColor: '#C53030',
      tagBg: '#FFF5F5',
      highlighted: true
    });
  } else if (tension === 'Lower Back') {
    activities.push({
      title: 'Lumbar & Pelvic Decompression',
      desc: 'Decompress spine after standing patrols and heavy field equipment load',
      duration: '5 min',
      icon: 'assets/icons/heart.svg',
      bg: '#FDECE9',
      tag: 'Somatic Posture',
      tagColor: '#DD6B20',
      tagBg: '#FFFAF0',
      highlighted: true
    });
  } else if (tension === 'Chest Tightness') {
    activities.push({
      title: 'Vagus Nerve Chest Expansion',
      desc: 'Diaphragmatic expansion to release autonomic tightness in the ribcage',
      duration: '4 min',
      icon: 'assets/icons/breath.svg',
      bg: '#EAF2ED',
      tag: 'Breath Reset',
      tagColor: '#2F855A',
      tagBg: '#F0FFF4',
      highlighted: true
    });
  } else {
    activities.push({
      title: 'Full-Body Progressive Relaxation',
      desc: 'Gentle systematic muscle release to maintain peak operational flexibility',
      duration: '5 min',
      icon: 'assets/icons/heart.svg',
      bg: '#FDECE9',
      tag: 'Maintenance',
      tagColor: '#2B6CB0',
      tagBg: '#EBF8FF',
      highlighted: false
    });
  }

  // 2. Cognitive / Demand specific
  if (driver === 'Sleep fragmentation' || sleepRest === '<5h') {
    activities.push({
      title: 'NSDR (Non-Sleep Deep Rest)',
      desc: 'Scientifically calibrated guided pause to restore mental clarity in 12 minutes',
      duration: '12 min',
      icon: 'assets/icons/moon.svg',
      bg: '#E7F1F6',
      tag: 'Rest Recovery',
      tagColor: '#3182CE',
      tagBg: '#EBF8FF',
      highlighted: true
    });
  } else if (driver === 'High-tempo shifts') {
    activities.push({
      title: 'Post-Duty Cognitive Decompression',
      desc: 'Mental gear-shift to step down hypervigilance after intense operational tempo',
      duration: '5 min',
      icon: 'assets/icons/breath.svg',
      bg: '#EAF2ED',
      tag: 'Decompression',
      tagColor: '#2F855A',
      tagBg: '#F0FFF4',
      highlighted: true
    });
  } else if (driver === 'Family separation') {
    activities.push({
      title: 'Anchor Grounding & Gratitude',
      desc: 'Affirming emotional connection with distant family & loved ones',
      duration: '6 min',
      icon: 'assets/icons/heart.svg',
      bg: '#FDECE9',
      tag: 'Emotional Anchor',
      tagColor: '#805AD5',
      tagBg: '#FAF5FF',
      highlighted: true
    });
  } else {
    activities.push({
      title: 'Sensory 5-4-3-2-1 Orientation Reset',
      desc: 'Rapid sensory reconnection to stay calm and rooted in the present environment',
      duration: '4 min',
      icon: 'assets/icons/breath.svg',
      bg: '#EAF2ED',
      tag: 'Sensory Grounding',
      tagColor: '#2F855A',
      tagBg: '#F0FFF4',
      highlighted: false
    });
  }

  // 3. Autonomic Breath Pacer Session
  activities.push({
    title: 'Box Breathing (4-4-4-4 Regulation)',
    desc: 'Equal-ratio tactical breathing to balance sympathetic & parasympathetic tone',
    duration: '3 min',
    icon: 'assets/icons/breath.svg',
    bg: '#EAF2ED',
    tag: 'Autonomic Pacer',
    tagColor: '#2F855A',
    tagBg: '#F0FFF4',
    highlighted: false
  });

  // 4. Barrack Sleep Soundscape
  activities.push({
    title: 'Barrack Sleep Soundscape',
    desc: 'Soft Himalayan rainfall and white noise tailored for military barracks',
    duration: '15 min',
    icon: 'assets/icons/moon.svg',
    bg: '#E7F1F6',
    tag: 'Soundscape',
    tagColor: '#6B46C1',
    tagBg: '#FAF5FF',
    highlighted: false
  });

  if (badgeCount) badgeCount.textContent = `${activities.length} tailored`;

  list.innerHTML = activities.map(act => `
    <div class="activity-item ${act.highlighted ? 'highlighted' : ''}" onclick="openActivitySession('${escapeHtml(act.title)}', '${act.duration}', '${escapeHtml(act.desc)}')">
      <div class="activity-icon-sq" style="background:${act.bg};">
        <img src="${act.icon}" width="20" height="20" alt="activity">
      </div>
      <div class="activity-info" style="flex:1;">
        <span class="activity-tag-pill" style="color:${act.tagColor}; background:${act.tagBg};">${act.tag}</span>
        <h4>${act.title}</h4>
        <p>${act.desc}</p>
      </div>
      <span class="activity-duration">${act.duration}</span>
    </div>
  `).join('');
}
window.refreshSelfCareActivities = refreshSelfCareActivities;

// =========================================================
// SCREEN 07 DYNAMIC RECOMMENDED ACTIVITIES GENERATOR
// =========================================================
export function renderCheckinEndActivities(entry = null) {
  const container = document.getElementById('checkinEndSuggestedActivities');
  const subTitle = document.getElementById('endSuggestedSubTitle');
  if (!container) return;

  const target = entry || (StorageService.getCheckins()[0] || {});
  const tension = target.tensionArea || checkinAnswers.tensionArea || 'Neck & Shoulders';
  const driver = target.stressDriver || checkinAnswers.stressDriver || 'High-tempo shifts';
  const mood = target.mood || checkinAnswers.mood || 'Good';
  const energy = target.energyLevel !== undefined ? target.energyLevel : 75;
  const isStress = mood === 'Stress' || mood === 'Stressed' || mood === 'Sad' || mood === 'Overwhelmed' || mood === 'Exhausted' || energy < 50;

  if (subTitle) {
    subTitle.textContent = isStress 
      ? `Priority relief targeted for ${tension} & ${driver}`
      : `Matched to your check-in: ${tension}`;
  }

  // Tailored activities to do first
  const suggestions = [];

  // Item 1: Direct Physical / Somatic match for tension area
  if (tension === 'Neck & Shoulders') {
    suggestions.push({
      title: 'Tactical Neck & Trapezoid Release',
      desc: 'Immediate isometric stretch to release trapezius stiffness & armor burden',
      duration: '4 min',
      tag: 'Tension Relief',
      icon: 'assets/icons/heart.svg',
      bg: '#E8F5E9',
      borderColor: '#A5D6A7',
      tagColor: '#2E7D32',
      tagBg: '#C8E6C9'
    });
  } else if (tension === 'Jaw & Temples') {
    suggestions.push({
      title: 'Cranial & Jaw Tension Release',
      desc: 'Temporomandibular decompression to relieve stress clenching and headaches',
      duration: '3 min',
      tag: 'Tension Relief',
      icon: 'assets/icons/heart.svg',
      bg: '#FFF3E0',
      borderColor: '#FFCC80',
      tagColor: '#E65100',
      tagBg: '#FFE0B2'
    });
  } else if (tension === 'Lower Back') {
    suggestions.push({
      title: 'Lumbar & Pelvic Decompression',
      desc: 'Spine decompression after standing patrols & tactical equipment load',
      duration: '5 min',
      tag: 'Posture Reset',
      icon: 'assets/icons/heart.svg',
      bg: '#EDE7F6',
      borderColor: '#D1C4E9',
      tagColor: '#512DA8',
      tagBg: '#D1C4E9'
    });
  } else if (tension === 'Chest Tightness') {
    suggestions.push({
      title: 'Vagus Nerve Chest Expansion',
      desc: 'Diaphragmatic expansion to release autonomic tightness in the ribcage',
      duration: '4 min',
      tag: 'Vagus Reset',
      icon: 'assets/icons/breath.svg',
      bg: '#E0F2F1',
      borderColor: '#80CBC4',
      tagColor: '#00695C',
      tagBg: '#B2DFDB'
    });
  } else {
    suggestions.push({
      title: 'Full-Body Progressive Relaxation',
      desc: 'Gentle systematic muscle release to maintain peak operational flexibility',
      duration: '5 min',
      tag: 'Maintenance',
      icon: 'assets/icons/heart.svg',
      bg: '#E3F2FD',
      borderColor: '#90CAF9',
      tagColor: '#1565C0',
      tagBg: '#BBDEFB'
    });
  }

  // Item 2: Cognitive / Autonomic calming match
  if (isStress || driver === 'Sleep fragmentation') {
    suggestions.push({
      title: 'NSDR (Non-Sleep Deep Rest)',
      desc: 'Calibrated guided pause to restore cognitive stamina & down-regulate stress',
      duration: '12 min',
      tag: 'Deep Reset',
      icon: 'assets/icons/moon.svg',
      bg: '#EDE7F6',
      borderColor: '#CE93D8',
      tagColor: '#6A1B9A',
      tagBg: '#E1BEE7'
    });
  } else if (driver === 'High-tempo shifts' || driver === 'Terrain / Weather') {
    suggestions.push({
      title: 'Box Breathing (4-4-4-4 Regulation)',
      desc: 'Tactical autonomic breathing to steady heart rate & operational focus',
      duration: '3 min',
      tag: 'Tactical Pacer',
      icon: 'assets/icons/breath.svg',
      bg: '#E8F5E9',
      borderColor: '#A5D6A7',
      tagColor: '#1B5E20',
      tagBg: '#C8E6C9'
    });
  } else if (driver === 'Family separation') {
    suggestions.push({
      title: 'Anchor Grounding & Gratitude',
      desc: 'Affirming emotional connection with distant family & loved ones',
      duration: '5 min',
      tag: 'Emotional Anchor',
      icon: 'assets/icons/heart.svg',
      bg: '#FCE4EC',
      borderColor: '#F48FB1',
      tagColor: '#880E4F',
      tagBg: '#F8BBD0'
    });
  } else {
    suggestions.push({
      title: 'Sensory 5-4-3-2-1 Orientation Reset',
      desc: 'Rapid sensory reconnection to stay calm and rooted in the present',
      duration: '4 min',
      tag: 'Grounding',
      icon: 'assets/icons/breath.svg',
      bg: '#E0F7FA',
      borderColor: '#80DEEA',
      tagColor: '#006064',
      tagBg: '#B2EBF2'
    });
  }

  container.innerHTML = suggestions.map(item => `
    <div class="end-suggested-card" style="background:${item.bg}; border-color:${item.borderColor};">
      <div class="end-suggested-card-top">
        <span class="end-card-tag" style="color:${item.tagColor}; background:${item.tagBg};">${item.tag}</span>
        <span class="end-card-duration">⏱ ${item.duration}</span>
      </div>
      <div class="end-card-main">
        <h4 class="end-card-title">${item.title}</h4>
        <p class="end-card-desc">${item.desc}</p>
      </div>
      <button class="end-card-start-btn" onclick="openActivitySession('${escapeHtml(item.title)}', '${item.duration}', '${escapeHtml(item.desc)}')">
        <span>Start Session</span>
        <span>▶</span>
      </button>
    </div>
  `).join('');
}
window.renderCheckinEndActivities = renderCheckinEndActivities;

// =========================================================
// INTERACTIVE GUIDED ACTIVITY SESSION MODAL CONTROLLER
// =========================================================
let activityPacerInterval = null;
let activityCountdownInterval = null;
let activitySecondsRemaining = 180;
let isActivityPaused = false;

export function openActivitySession(title, durationStr, desc) {
  const modal = document.getElementById('activitySessionModal');
  const modalTitle = document.getElementById('activityModalTitle');
  const modalDesc = document.getElementById('activityModalDesc');
  const modalTimer = document.getElementById('activityModalTimer');
  const pacerText = document.getElementById('activityModalPacerText');
  const toggleBtn = document.getElementById('activityModalToggleBtn');

  if (modalTitle) modalTitle.textContent = title;
  if (modalDesc) modalDesc.textContent = desc;

  // Parse minutes from duration string e.g. "4 min"
  const mins = parseInt(durationStr, 10) || 3;
  activitySecondsRemaining = mins * 60;
  isActivityPaused = false;

  if (modalTimer) {
    const m = String(Math.floor(activitySecondsRemaining / 60)).padStart(2, '0');
    const s = String(activitySecondsRemaining % 60).padStart(2, '0');
    modalTimer.textContent = `${m}:${s}`;
  }

  if (toggleBtn) toggleBtn.textContent = 'Pause';
  if (modal) modal.classList.add('active');

  // Start Pacer Rhythm (Inhale 4s -> Hold 4s -> Exhale 4s)
  const phases = ['Inhale gently (4s)', 'Hold steady (4s)', 'Exhale slowly (4s)', 'Rest & clear (4s)'];
  let phaseIdx = 0;
  if (pacerText) pacerText.textContent = phases[phaseIdx];

  clearInterval(activityPacerInterval);
  activityPacerInterval = setInterval(() => {
    if (!isActivityPaused) {
      phaseIdx = (phaseIdx + 1) % phases.length;
      if (pacerText) pacerText.textContent = phases[phaseIdx];
    }
  }, 4000);

  // Start Countdown Timer
  clearInterval(activityCountdownInterval);
  activityCountdownInterval = setInterval(() => {
    if (!isActivityPaused) {
      if (activitySecondsRemaining > 0) {
        activitySecondsRemaining--;
        const m = String(Math.floor(activitySecondsRemaining / 60)).padStart(2, '0');
        const s = String(activitySecondsRemaining % 60).padStart(2, '0');
        if (modalTimer) modalTimer.textContent = `${m}:${s}`;
      } else {
        closeActivitySession();
        alert(`Session Completed!\nGreat work taking time for your wellbeing.`);
      }
    }
  }, 1000);
}
window.openActivitySession = openActivitySession;

export function closeActivitySession() {
  clearInterval(activityPacerInterval);
  clearInterval(activityCountdownInterval);
  const modal = document.getElementById('activitySessionModal');
  if (modal) modal.classList.remove('active');
}
window.closeActivitySession = closeActivitySession;

export function toggleActivitySessionPlay() {
  isActivityPaused = !isActivityPaused;
  const toggleBtn = document.getElementById('activityModalToggleBtn');
  if (toggleBtn) toggleBtn.textContent = isActivityPaused ? 'Resume' : 'Pause';
}
window.toggleActivitySessionPlay = toggleActivitySessionPlay;

// Daily Habit Counters
let waterCount = 4;
export function incrementWaterHabit() {
  waterCount = Math.min(6, waterCount + 1);
  const display = document.getElementById('waterCounterDisplay');
  const btn = document.getElementById('waterIncrementBtn');
  if (display) display.textContent = `${waterCount}/6 glasses of water`;
  if (waterCount >= 6 && btn) {
    btn.textContent = '✓';
    btn.classList.add('checked');
  }
  updateHomeDashboardStats();
}
window.incrementWaterHabit = incrementWaterHabit;

let meditationMins = 10;
export function incrementMeditationHabit() {
  meditationMins = Math.min(30, meditationMins + 10);
  const display = document.getElementById('meditationCounterDisplay');
  const btn = document.getElementById('meditationIncrementBtn');
  if (display) display.textContent = `${meditationMins}/30 minutes`;
  if (meditationMins >= 30 && btn) {
    btn.textContent = '✓';
    btn.classList.add('checked');
  }
}
window.incrementMeditationHabit = incrementMeditationHabit;

function renderCheckinStep() {
  const current = CHECKIN_STEPS[checkinStep - 1];
  const stepCounter = document.getElementById('checkinStepCounter');
  const progressFill = document.getElementById('checkinProgressFill');
  const stepBody = document.getElementById('checkinStepBody');

  if (!stepBody) return;

  let interactiveHtml = '';

  if (current.type === 'single_emoji') {
    interactiveHtml = `
      <div class="options-vertical-list">
        ${current.options.map(opt => `
          <button class="option-chip-btn ${checkinAnswers.mood === opt.label ? 'selected' : ''}" onclick="selectMood('${opt.label}', '${opt.emoji}')">
            <div style="display:flex; align-items:center;">
              <span class="chip-emoji">${opt.emoji}</span>
              <span>${opt.label}</span>
            </div>
            ${checkinAnswers.mood === opt.label ? '<span class="chip-check">✓</span>' : ''}
          </button>
        `).join('')}
      </div>
    `;
  } else if (current.type === 'multi_tag') {
    interactiveHtml = `
      <div class="tags-cloud-grid">
        ${current.options.map(tag => {
          const isSelected = checkinAnswers.factors.includes(tag);
          return `
            <div class="tag-select-chip ${isSelected ? 'selected' : ''}" onclick="toggleFactorTag('${tag}')">
              ${isSelected ? '✓ ' : ''}${tag}
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else if (current.type === 'slider') {
    interactiveHtml = `
      <div class="energy-slider-box">
        <div class="slider-value-display" id="sliderValDisplay">${checkinAnswers.energyLevel}%</div>
        <div class="slider-sub-label">Steady & balanced energy</div>
        <input type="range" class="custom-range-slider" min="0" max="100" value="${checkinAnswers.energyLevel}" oninput="updateEnergySlider(this.value)">
        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-top:8px;">
          <span>Depleted</span>
          <span>Moderate</span>
          <span>Energized</span>
        </div>
      </div>
    `;
  } else if (current.type === 'single_choice' && current.step === 4) {
    interactiveHtml = `
      <div class="options-vertical-list">
        ${current.options.map(opt => `
          <button class="option-chip-btn ${checkinAnswers.sleepQuality === opt.label ? 'selected' : ''}" onclick="selectSleep('${opt.label}')">
            <div style="display:flex; align-items:center;">
              <span style="font-size:18px; margin-right:12px;">${opt.icon}</span>
              <span>${opt.label}</span>
            </div>
            ${checkinAnswers.sleepQuality === opt.label ? '<span class="chip-check">✓</span>' : ''}
          </button>
        `).join('')}
      </div>
    `;
  } else if (current.type === 'text') {
    interactiveHtml = `
      <textarea id="reflectionTextarea" class="reflection-textarea" placeholder="${current.placeholder}" oninput="checkinAnswers.note = this.value">${checkinAnswers.note || ''}</textarea>
    `;
  } else if (current.type === 'single_choice' && current.step === 6) {
    interactiveHtml = `
      <div class="options-vertical-list">
        ${current.options.map(opt => `
          <button class="option-chip-btn ${checkinAnswers.helpfulAction === opt.label ? 'selected' : ''}" onclick="selectAction('${opt.label}')">
            <div style="display:flex; align-items:center;">
              <span style="font-size:18px; margin-right:12px;">${opt.icon}</span>
              <span>${opt.label}</span>
            </div>
            ${checkinAnswers.helpfulAction === opt.label ? '<span class="chip-check">✓</span>' : ''}
          </button>
        `).join('')}
      </div>
    `;
  }

  stepBody.innerHTML = `
    <div>
      <h3 class="checkin-question-title">${current.title}</h3>
      <p class="checkin-question-hint">${current.hint}</p>
      ${interactiveHtml}
    </div>
    <div style="padding-top:16px;">
      <button class="btn-primary" onclick="nextCheckinStep()">
        <span>${checkinStep === 6 ? 'Finish & Reflect' : 'Continue'}</span>
        <span>→</span>
      </button>
    </div>
  `;
}

window.selectMood = (label, emoji) => {
  checkinAnswers.mood = label;
  checkinAnswers.moodEmoji = emoji;
  renderCheckinStep();
};

window.toggleFactorTag = (tag) => {
  if (checkinAnswers.factors.includes(tag)) {
    checkinAnswers.factors = checkinAnswers.factors.filter(f => f !== tag);
  } else {
    checkinAnswers.factors.push(tag);
  }
  renderCheckinStep();
};

window.updateEnergySlider = (val) => {
  checkinAnswers.energyLevel = parseInt(val, 10);
  const display = document.getElementById('sliderValDisplay');
  if (display) display.textContent = `${val}%`;
};

window.selectSleep = (label) => {
  checkinAnswers.sleepQuality = label;
  renderCheckinStep();
};

window.selectAction = (label) => {
  checkinAnswers.helpfulAction = label;
  renderCheckinStep();
};

function finishCheckin() {
  // Execute via AI Engine connected CheckinService
  const result = CheckinService.generateSupportiveReflection(checkinAnswers);

  const indicators = checkinAnswers.healthIndicators || { sleep: '8h+', food: 'regular', family: 'safe' };
  const isStressRisk = (
    checkinAnswers.mood === 'Stressed' || 
    checkinAnswers.mood === 'Stress' || 
    checkinAnswers.mood === 'Sad' || 
    checkinAnswers.mood === 'Overwhelmed' || 
    checkinAnswers.mood === 'Exhausted' ||
    checkinAnswers.energyLevel < 40 ||
    indicators.sleep === '<5h' || 
    indicators.food === 'skipped' || 
    indicators.food === 'low' || 
    indicators.family === 'concern'
  );

  // Save to persistent storage
  const newEntry = {
    id: 'chk-' + Date.now(),
    date: 'Just now',
    mood: checkinAnswers.mood,
    moodEmoji: checkinAnswers.moodEmoji,
    energyLevel: checkinAnswers.energyLevel,
    tensionArea: checkinAnswers.tensionArea || 'Neck & Shoulders',
    stressDriver: checkinAnswers.stressDriver || 'High-tempo shifts',
    factors: [...checkinAnswers.factors],
    healthIndicators: { ...indicators },
    isStressRisk,
    note: checkinAnswers.note || 'Private personal reflection completed.'
  };
  StorageService.addCheckin(newEntry);

  // Live Refresh Dashboard Stats, Dynamic Wave Graph, Self Care & Screen 07 Activities
  updateHomeDashboardStats();
  renderDynamicWaveGraph('today');
  refreshSelfCareActivities(newEntry);
  renderCheckinEndActivities(newEntry);
  renderRecordsTimeline();

  // Update Result Screen (Screen 07)
  const banner = document.getElementById('checkinStressRiskBanner');
  const bannerMsg = document.getElementById('stressAlertDynamicMsg');
  const endTitle = document.getElementById('checkinEndTitle');
  const endSub = document.getElementById('checkinEndSubtitle');

  if (isStressRisk) {
    if (banner) banner.style.display = 'block';
    let riskFactors = [];
    if (indicators.sleep === '<5h') riskFactors.push('sleep deprivation (<5h)');
    if (indicators.food === 'skipped') riskFactors.push('skipped nutrition');
    if (indicators.food === 'low') riskFactors.push('poor appetite');
    if (indicators.family === 'concern') riskFactors.push('family distress');
    if (checkinAnswers.mood === 'Stressed' || checkinAnswers.mood === 'Sad') riskFactors.push('elevated emotional strain');
    if (riskFactors.length === 0) riskFactors.push('high duty fatigue');

    if (bannerMsg) {
      bannerMsg.textContent = `Koazy Behavioral Analytics Engine flagged elevated stress & burnout risk due to ${riskFactors.join(', ')}. We recommend grounding exercises and a private CBT chat session right now.`;
    }
    if (endTitle) endTitle.innerHTML = "We're here with you,<br>Sara";
    if (endSub) endSub.textContent = "Your indicators show elevated stress. Take a quiet moment to decompress before resuming duties.";
  } else {
    if (banner) banner.style.display = 'none';
    if (endTitle) endTitle.innerHTML = "Thanks for Checking in,<br>Sara";
    if (endSub) endSub.textContent = "Your wellbeing matters. Here are some things that might help you right now.";
  }

  const resultMsg = document.getElementById('resultEmpatheticMsg');
  const resultSub = document.getElementById('resultSubNote');
  const actionTitle = document.getElementById('resultActionTitle');
  const aiWhyText = document.getElementById('aiWhyText');
  const aiSignalsList = document.getElementById('aiSignalsList');
  const aiSufficiencyBadge = document.getElementById('aiSufficiencyBadge');

  if (resultMsg) resultMsg.textContent = result.message;
  if (resultSub) resultSub.textContent = result.subtext;
  if (actionTitle) actionTitle.textContent = result.suggestedAction;

  if (aiWhyText) {
    aiWhyText.textContent = isStressRisk
      ? `Stress Alert: High cognitive & physical strain indicators detected (${indicators.sleep} rest, ${indicators.food} intake, ${indicators.family} status). Proactive welfare intervention recommended.`
      : (result.whyThisResponse || 'Balanced recovery state verified.');
  }
  if (aiSignalsList) {
    const signals = [
      `Mood: ${checkinAnswers.mood}`,
      `Sleep: ${indicators.sleep}`,
      `Meals: ${indicators.food}`,
      `Family: ${indicators.family}`
    ];
    aiSignalsList.innerHTML = signals.map(s => `<span class="signal-tag">${s}</span>`).join('');
  }
  if (aiSufficiencyBadge) {
    aiSufficiencyBadge.textContent = isStressRisk ? 'High Risk Verified' : 'AI Verified';
    aiSufficiencyBadge.style.background = isStressRisk ? '#FFD8D6' : '#C9EBD2';
    aiSufficiencyBadge.style.color = isStressRisk ? '#9B1C1C' : '#23392E';
  }

  navigateToScreen('07');
}

// Toggle AI Explanation Accordion in Screen 07
export function toggleAIExplanation() {
  const body = document.getElementById('aiAccordionBody');
  const chevron = document.getElementById('aiAccordionChevron');
  if (!body) return;

  const isOpen = body.classList.contains('open');
  if (isOpen) {
    body.classList.remove('open');
    if (chevron) chevron.textContent = '▼';
  } else {
    body.classList.add('open');
    if (chevron) chevron.textContent = '▲';
  }
}
window.toggleAIExplanation = toggleAIExplanation;

// Talk to Koazy Chat Flow with Real-Time Safety Screening
export function sendChatMessage() {
  const input = document.getElementById('chatInputField');
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  input.value = '';

  const chatArea = document.getElementById('chatMessagesArea');
  if (!chatArea) return;

  // Append user bubble
  const userRow = document.createElement('div');
  userRow.className = 'chat-bubble-row user';
  userRow.innerHTML = `<div class="chat-bubble user">${escapeHtml(text)}</div>`;
  chatArea.appendChild(userRow);
  chatArea.scrollTop = chatArea.scrollHeight;

  // Process message through Safety Screening + Dialogue
  setTimeout(() => {
    const outcome = ChatService.processMessage(text);
    const koazyRow = document.createElement('div');
    koazyRow.className = 'chat-bubble-row';
    koazyRow.innerHTML = `
      <img src="assets/mascot/koala_happy.svg" class="chat-koala-avatar" alt="Koazy">
      <div class="chat-bubble koazy">${outcome.reply}</div>
    `;
    chatArea.appendChild(koazyRow);
    chatArea.scrollTop = chatArea.scrollHeight;

    // If crisis detected, immediately engage supportive crisis overlay
    if (outcome.isCrisis) {
      openCrisisModal(outcome);
    }
  }, 180);
}
window.sendChatMessage = sendChatMessage;

export function sendQuickPrompt(promptText) {
  const input = document.getElementById('chatInputField');
  if (input) {
    input.value = promptText;
    sendChatMessage();
  }
}
window.sendQuickPrompt = sendQuickPrompt;

// Crisis Safety Modal Handlers
export function openCrisisModal(crisisOutcome) {
  const modal = document.getElementById('mobileCrisisModal');
  const desc = document.getElementById('mobileCrisisDesc');
  if (modal) modal.classList.add('active');
  if (desc && crisisOutcome && crisisOutcome.reply) {
    desc.textContent = crisisOutcome.reply;
  }
}
window.openCrisisModal = openCrisisModal;

export function closeCrisisModal() {
  const modal = document.getElementById('mobileCrisisModal');
  if (modal) modal.classList.remove('active');
}
window.closeCrisisModal = closeCrisisModal;

// =========================================================
// INTERACTIVE EMERGENCY SERVICES & PHONE CALL CONTROLLER
// =========================================================

export function startHelplineCall(number = '1800-555-KOAZY', name = '24/7 Armed Forces & CAPF Helpline') {
  const overlay = document.getElementById('phoneCallOverlay');
  const partyName = document.getElementById('callPartyName');
  const targetNum = document.getElementById('callTargetNumber');
  const timerDisplay = document.getElementById('callTimerDisplay');

  if (partyName) partyName.textContent = name;
  if (targetNum) targetNum.textContent = `Connected (${number})`;
  if (timerDisplay) timerDisplay.textContent = '00:00';

  if (overlay) overlay.classList.add('active');

  SafetyService.startSimulatedCall(number, name);
  liveCallDurationSeconds = 0;

  if (liveCallInterval) clearInterval(liveCallInterval);
  liveCallInterval = setInterval(() => {
    liveCallDurationSeconds++;
    const mins = String(Math.floor(liveCallDurationSeconds / 60)).padStart(2, '0');
    const secs = String(liveCallDurationSeconds % 60).padStart(2, '0');
    if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
  }, 1000);
}
window.startHelplineCall = startHelplineCall;

export function endHelplineCall() {
  if (liveCallInterval) {
    clearInterval(liveCallInterval);
    liveCallInterval = null;
  }
  const overlay = document.getElementById('phoneCallOverlay');
  if (overlay) overlay.classList.remove('active');

  const duration = SafetyService.endSimulatedCall();
  renderSafetyTimeline();
  alert(`Call ended. Duration: ${duration}s. Post-call welfare record saved.`);
}
window.endHelplineCall = endHelplineCall;

export function toggleCallMute(btn) {
  if (!btn) return;
  btn.classList.toggle('active');
  const label = btn.querySelector('span:last-child');
  if (label) {
    label.textContent = btn.classList.contains('active') ? 'Muted' : 'Mute';
  }
}
window.toggleCallMute = toggleCallMute;

export function toggleCallSpeaker(btn) {
  if (!btn) return;
  btn.classList.toggle('active');
}
window.toggleCallSpeaker = toggleCallSpeaker;

// Silent SOS Panic Button
export function triggerSilentSOSAlert() {
  const location = 'Sector Delta (Outpost 4, 34°12\'N 77°35\'E)';
  SafetyService.triggerSilentSOS(location);
  renderSafetyTimeline();
  alert(`🚨 SILENT SOS SENT!\n\nGPS: ${location}\nUnit Quick Reaction Team (QRT) & Base Medical Officer notified immediately. Help is routed.`);
}
window.triggerSilentSOSAlert = triggerSilentSOSAlert;

// Emergency Medical / Ambulance Dispatch
export function triggerMedicalAmbulanceDispatch() {
  SafetyService.triggerMedicalDispatch();
  renderSafetyTimeline();
  alert(`🚑 MEDICAL ASSISTANCE DISPATCHED!\n\nBase Medical Officer Dr. Sunita Rao notified. Emergency transit ambulance dispatched to Sector Delta.`);
}
window.triggerMedicalAmbulanceDispatch = triggerMedicalAmbulanceDispatch;

export function triggerCrisisAction(actionType) {
  SafetyService.triggerDemoAction(actionType);
  renderSafetyTimeline();

  const labels = {
    family: "DEMO: Outbound call initiated to Trusted Family Contact. (Simulated)",
    medical: "DEMO: 24/7 Armed Forces & CAPF Tele-Support request dispatched. (Simulated)",
    officer: "DEMO: Priority safety alert sent to Unit Welfare Officer Capt. R. Deshmukh. (Simulated)",
    listener: "DEMO: Peer Listener Manoj K. discretely notified for check-in. (Simulated)"
  };
  alert(labels[actionType] || "Action logged in Demo Audit Timeline.");
}
window.triggerCrisisAction = triggerCrisisAction;

// Personal Records Timeline Renderer
function renderRecordsTimeline() {
  const container = document.getElementById('recordsTimelineFeed');
  if (!container) return;

  const history = StorageService.getCheckins();
  container.innerHTML = history.map(item => `
    <div class="timeline-entry-card">
      <div class="timeline-emoji-badge">${item.moodEmoji || '🌿'}</div>
      <div class="timeline-entry-body">
        <h4>${item.date} • ${item.mood}</h4>
        <p>${item.note}</p>
        <div class="timeline-tag-list">
          <span class="micro-tag">Energy: ${item.energyLevel}%</span>
          ${item.factors ? item.factors.map(f => `<span class="micro-tag">${f}</span>`).join('') : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// =========================================================
// ADVANCED WELFARE OFFICER DASHBOARD CONTROLLERS
// =========================================================

export function selectSeasonalPattern(seasonId, btn = null) {
  activeSeasonId = seasonId;
  const pattern = WelfareService.getSeasonalPattern(seasonId);

  // Update pills styling
  if (btn) {
    const pills = document.querySelectorAll('.season-pill-btn');
    pills.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
  }

  // Update hazard badge
  const badge = document.getElementById('seasonHazardBadge');
  if (badge) badge.textContent = pattern.climateStressTag;

  // Update hazard box content
  const box = document.getElementById('seasonHazardBox');
  if (box) {
    box.innerHTML = `
      <div class="climate-hazard-title">
        <span>${pattern.icon}</span>
        <span>${pattern.name}</span>
      </div>
      <ul class="hazard-bullet-list">
        ${pattern.primaryHazards.map(h => `<li>${h}</li>`).join('')}
      </ul>
      <div style="font-size:11px; color:var(--comfort-rose-dark); font-weight:700; margin-top:2px;">
        Rest Deficit Signal: ${pattern.averageRestDeficit}
      </div>
      <div style="font-size:10.5px; color:var(--text-muted); margin-top:2px; font-style:italic;">
        Protocol: ${pattern.recommendedIntervention}
      </div>
    `;
  }
}
window.selectSeasonalPattern = selectSeasonalPattern;

export function filterByBatch(batchId, btn = null) {
  activeBatchFilter = batchId;

  if (btn) {
    const chips = document.querySelectorAll('.batch-chip-btn');
    chips.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
  }

  const metrics = WelfareService.getBatchMetrics(batchId);
  const label = document.getElementById('batchSummaryLabel');
  if (label) {
    label.textContent = `${metrics.name} (${metrics.experience || metrics.description})`;
  }

  renderWelfareCases();
}
window.filterByBatch = filterByBatch;

export function renderWelfareOfficersDirectory() {
  const container = document.getElementById('officersDirectoryGrid');
  if (!container) return;

  const officers = WelfareService.getOfficers();
  container.innerHTML = officers.map(off => `
    <div class="officer-profile-card">
      <div class="officer-card-header">
        <div class="officer-avatar-sq">${off.avatar}</div>
        <div>
          <div class="officer-name-title">${off.name}</div>
          <div class="officer-role-sub">${off.role}</div>
        </div>
      </div>
      <div style="font-size:10px; color:var(--text-secondary); line-height:1.35; margin-top:4px;">
        ${off.specialty}
      </div>
      <div class="officer-caseload-tag">
        ● ${off.status} • ${off.activeCases} Active Cases
      </div>
    </div>
  `).join('');
}

export function renderWelfareCases() {
  const container = document.getElementById('welfareCasesListContainer');
  if (!container) return;

  const cases = WelfareService.getCases();
  const filtered = activeBatchFilter === 'ALL'
    ? cases
    : cases.filter(c => c.batch === activeBatchFilter);

  // Update fatigue count
  const fatigueDisplay = document.getElementById('highFatigueCountDisplay');
  if (fatigueDisplay) {
    const urgentCount = filtered.filter(c => c.priority === 'urgent').length;
    fatigueDisplay.textContent = `${urgentCount} High Fatigue Flag${urgentCount === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div style="font-size:12px; color:var(--text-muted); padding:12px; text-align:center;">No active welfare cases in selected cohort filter.</div>`;
    return;
  }

  container.innerHTML = filtered.map(c => `
    <div class="case-card">
      <div class="case-card-top">
        <span class="case-id-badge">${c.id} • ${c.personnelRef}</span>
        <span class="case-priority-pill ${c.priority}">${c.priority}</span>
      </div>
      <div style="display:flex; gap:6px; margin:2px 0;">
        <span class="micro-tag">${c.company}</span>
        <span class="micro-tag" style="background:var(--sand-100); color:#7D4E24;">${c.batch.replace('_', ' ')}</span>
        <span class="micro-tag" style="background:#EAF2ED; color:var(--sage-700);">${c.status}</span>
      </div>
      <div class="case-summary-text">${c.issue}</div>
      <div style="background:var(--sage-50); border-radius:10px; padding:8px 10px; font-size:11.5px; color:var(--sage-800); border-left:3px solid var(--sage-600); margin-top:2px;">
        <strong>Action Plan:</strong> ${c.actionPlan}
      </div>
      <div class="case-action-row">
        <span class="assignee-text">Officer: <strong>${c.assignedOfficer}</strong></span>
        <button class="assign-btn" onclick="openCaseModal('${c.id}')">
          Manage Action
        </button>
      </div>
    </div>
  `).join('');
}

// Case Management Modal Handlers
export function openCaseModal(caseId) {
  selectedManageCaseId = caseId;
  const target = WelfareService.getCaseById(caseId);
  if (!target) return;

  const modal = document.getElementById('caseManagementModal');
  const title = document.getElementById('modalCaseIdTitle');
  const summary = document.getElementById('modalCaseSummary');
  const officerSelect = document.getElementById('modalAssignOfficer');
  const actionSelect = document.getElementById('modalActionPlan');
  const prioritySelect = document.getElementById('modalCasePriority');
  const notesInput = document.getElementById('modalCaseNotes');

  if (title) title.textContent = `Manage Case ${target.id} (${target.personnelRef})`;
  if (summary) summary.textContent = target.issue;
  if (officerSelect) officerSelect.value = target.assignedOfficer;
  if (actionSelect) actionSelect.value = target.actionPlan;
  if (prioritySelect) prioritySelect.value = target.priority;
  if (notesInput) notesInput.value = target.notes || '';

  if (modal) modal.classList.add('active');
}
window.openCaseModal = openCaseModal;

export function closeCaseModal() {
  const modal = document.getElementById('caseManagementModal');
  if (modal) modal.classList.remove('active');
}
window.closeCaseModal = closeCaseModal;

export function saveCaseManagementChanges() {
  if (!selectedManageCaseId) return;

  const officerSelect = document.getElementById('modalAssignOfficer');
  const actionSelect = document.getElementById('modalActionPlan');
  const prioritySelect = document.getElementById('modalCasePriority');
  const notesInput = document.getElementById('modalCaseNotes');

  const updates = {
    assignedOfficer: officerSelect ? officerSelect.value : 'Capt. R. Deshmukh',
    actionPlan: actionSelect ? actionSelect.value : 'Light Duty Reassignment',
    priority: prioritySelect ? prioritySelect.value : 'moderate',
    notes: notesInput ? notesInput.value : '',
    status: 'Action Updated'
  };

  WelfareService.updateCase(selectedManageCaseId, updates);
  closeCaseModal();
  renderWelfareCases();
  renderWelfareOfficersDirectory();
  alert(`Case ${selectedManageCaseId} updated successfully.\nAction Plan: ${updates.actionPlan}\nAssigned Officer: ${updates.assignedOfficer}`);
}
window.saveCaseManagementChanges = saveCaseManagementChanges;

// Breathing Animation Controller
function setupBreathingPacer() {
  const pacerText = document.getElementById('breathingText');
  if (!pacerText) return;

  let state = 0; // 0: inhale, 1: hold, 2: exhale
  setInterval(() => {
    state = (state + 1) % 3;
    if (state === 0) pacerText.textContent = "Breathe In";
    else if (state === 1) pacerText.textContent = "Hold";
    else pacerText.textContent = "Breathe Out";
  }, 2000);
}

// Live Status Bar Clock
function setupClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hrs}:${mins}`;
  }
  update();
  setInterval(update, 30000);
}

// =========================================================
// AI ENGINE & SIH JUDGE DEMONSTRATION CONTROLLERS
// =========================================================

export function switchAITab(tabId) {
  currentAITab = tabId;
  const tabBtns = document.querySelectorAll('.ai-tab-btn');
  tabBtns.forEach(btn => btn.classList.remove('active'));

  const panels = document.querySelectorAll('.ai-tab-panel');
  panels.forEach(p => p.classList.remove('active'));

  const activeBtn = document.getElementById(`tabBtn${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');

  const activePanel = document.getElementById(`aiPanel${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
  if (activePanel) activePanel.classList.add('active');

  if (tabId === 'crisis') renderSafetyTimeline();
  if (tabId === 'auditLogs') renderAuditDecisionLogs();
}
window.switchAITab = switchAITab;

function initCaseStudiesDropdown() {
  const dropdown = document.getElementById('caseStudyDropdown');
  if (!dropdown) return;

  const cases = AIService.getCaseStudies();
  dropdown.innerHTML = cases.map(c => `
    <option value="${c.id}" ${c.id === activeCaseStudyId ? 'selected' : ''}>
      Case ${c.number}: ${c.title}
    </option>
  `).join('');

  onCaseStudySelect(activeCaseStudyId);
}

export function onCaseStudySelect(caseId) {
  activeCaseStudyId = caseId;
  const cases = AIService.getCaseStudies();
  const target = cases.find(c => c.id === caseId) || cases[0];

  const numBadge = document.getElementById('caseNumberBadge');
  const titleDisplay = document.getElementById('caseTitleDisplay');
  const subDisplay = document.getElementById('caseSubtitleDisplay');
  const personDisplay = document.getElementById('casePersonnelName');

  if (numBadge) numBadge.textContent = `CASE ${target.number}`;
  if (titleDisplay) titleDisplay.textContent = target.title;
  if (subDisplay) subDisplay.textContent = target.subtitle;
  if (personDisplay) personDisplay.textContent = target.personnelName;

  executeCurrentCaseStudy();
}
window.onCaseStudySelect = onCaseStudySelect;

export function executeCurrentCaseStudy() {
  const decisionLog = AIService.runCaseStudy(activeCaseStudyId);
  lastExecutedDecision = decisionLog;
  renderDecisionPipeline(decisionLog);
}
window.executeCurrentCaseStudy = executeCurrentCaseStudy;

function renderDecisionPipeline(decision) {
  const meta = decision.caseStudyMeta || {};
  const norm = decision.normalizedInputs;

  // 1. Stage 01: Inputs & Normalization
  const inputsContent = document.getElementById('pipeInputsContent');
  if (inputsContent) {
    inputsContent.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:4px;">
        <div><strong>Mood:</strong> ${norm.mood}</div>
        <div><strong>Energy:</strong> ${norm.energyLevel}% • <strong>Sleep:</strong> ${norm.sleepQuality}</div>
        <div><strong>Duty Tempo:</strong> ${norm.dutyIntensity} (Workload: ${norm.workloadTrend})</div>
        <div><strong>Deployment/Transfer:</strong> ${norm.recentDeploymentChange ? 'Changed' : norm.recentTransfer ? 'Transferred' : 'Stable'}</div>
      </div>
    `;
  }

  // 2. Stage 02: Current State
  const currentStateEl = document.getElementById('pipeCurrentState');
  if (currentStateEl) {
    currentStateEl.textContent = decision.currentState;
  }

  // 3. Stage 03: Trend
  const trendDirEl = document.getElementById('pipeTrendDirection');
  const trendSumEl = document.getElementById('pipeTrendSummary');
  if (trendDirEl) trendDirEl.textContent = decision.trend;
  if (trendSumEl) trendSumEl.textContent = decision.trendSummary;

  // 4. Stage 04: Sufficiency
  const sufficiencyEl = document.getElementById('pipeSufficiency');
  if (sufficiencyEl) {
    sufficiencyEl.textContent = `${decision.dataSufficiency} Confidence (${decision.confidencePct}%)`;
  }

  // 5. Context Matrix
  const matrixContainer = document.getElementById('pipeContextMatrix');
  if (matrixContainer) {
    const signals = decision.contextSignalsDetail || {};
    matrixContainer.innerHTML = Object.keys(signals).map(key => {
      const sig = signals[key];
      const cssClass = sig.level.toLowerCase();
      const capKey = key.charAt(0).toUpperCase() + key.slice(1);
      return `
        <div class="signal-pill-card">
          <div>
            <div class="signal-name">${capKey} Context</div>
            <div style="font-size:10.5px; color:var(--text-muted); margin-top:2px;">${sig.label}</div>
          </div>
          <span class="signal-strength-badge ${cssClass}">${sig.level}</span>
        </div>
      `;
    }).join('');
  }

  // 6. Escalation Badge
  const escBadge = document.getElementById('pipeEscalationBadge');
  if (escBadge) {
    escBadge.textContent = decision.escalationLevel;
    escBadge.className = `signal-strength-badge ${decision.escalationSeverity || 'low'}`;
  }

  // 7. Recommended Intervention Title
  const intTitleEl = document.getElementById('pipeInterventionTitle');
  if (intTitleEl) intTitleEl.textContent = decision.recommendedIntervention;

  // 8. Explanation
  const expTextEl = document.getElementById('pipeExplanationText');
  if (expTextEl) expTextEl.textContent = decision.explanation;

  // 9. Signals Used Tags
  const signalsListEl = document.getElementById('pipeSignalsUsedList');
  if (signalsListEl) {
    signalsListEl.innerHTML = (decision.signalsUsed || []).map(s => `
      <span class="signal-tag">${s}</span>
    `).join('');
  }

  // 10. Feedback reset
  const fbMsg = document.getElementById('feedbackStatusMsg');
  if (fbMsg) {
    fbMsg.textContent = decision.userFeedback 
      ? `Recorded Feedback: ${decision.userFeedback}` 
      : 'Test how personnel response updates subsequent context and model weights.';
  }
}

export function simulateFeedback(feedbackType) {
  if (!lastExecutedDecision) return;
  const result = AIService.recordFeedback(lastExecutedDecision.id, feedbackType);
  const fbMsg = document.getElementById('feedbackStatusMsg');
  if (fbMsg) fbMsg.textContent = result.updatedContextMessage;
  renderAuditDecisionLogs();
}
window.simulateFeedback = simulateFeedback;

// Crisis Protocol Testing
export function testCrisisPhrase(phrase) {
  const outcome = ChatService.processMessage(phrase);
  const levelDisplay = document.getElementById('crisisLevelDisplay');

  if (levelDisplay) {
    if (outcome.isCrisis) {
      levelDisplay.textContent = `🚨 ${outcome.level.tag}: Immediate Safety Concern Detected`;
      levelDisplay.style.background = '#FDECE9';
      levelDisplay.style.color = 'var(--comfort-rose-dark)';
    } else {
      levelDisplay.textContent = `✅ Level 0 — Normal (No immediate risk detected)`;
      levelDisplay.style.background = '#EAF2ED';
      levelDisplay.style.color = 'var(--sage-800)';
    }
  }

  renderSafetyTimeline();
}
window.testCrisisPhrase = testCrisisPhrase;

export function clearSafetyTimeline() {
  SafetyService.clearEvents();
  renderSafetyTimeline();
}
window.clearSafetyTimeline = clearSafetyTimeline;

function renderSafetyTimeline() {
  const container = document.getElementById('safetyTimelineList');
  if (!container) return;

  const events = SafetyService.getEvents();
  if (events.length === 0) {
    container.innerHTML = `
      <div style="font-size:12px; color:var(--text-muted); padding:10px 0; text-align:center;">
        No safety events logged yet. Tap a trigger button or emergency action above to simulate.
      </div>
    `;
    return;
  }

  container.innerHTML = events.map(e => `
    <div class="timeline-event-card ${e.type === 'ALERT_CREATED' || e.type === 'CRISIS_DETECTED' ? 'alert' : ''}">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="color:var(--text-primary); font-size:12px;">${e.title}</strong>
        <span class="timeline-event-time">${e.timeDisplay}</span>
      </div>
      <div style="font-size:11.5px; color:var(--text-secondary);">${e.detail}</div>
    </div>
  `).join('');
}

function renderAuditDecisionLogs() {
  const container = document.getElementById('auditDecisionListContainer');
  if (!container) return;

  const decisions = StorageService.getAIDecisions();
  if (decisions.length === 0) {
    container.innerHTML = `<div style="font-size:12px; color:var(--text-muted);">No decision logs recorded yet. Run a case study or complete a check-in.</div>`;
    return;
  }

  container.innerHTML = decisions.map(d => `
    <div class="case-card">
      <div class="case-card-top">
        <span class="case-id-badge">${d.id} • ${d.timestampDisplay}</span>
        <span class="signal-strength-badge ${d.escalationSeverity || 'low'}">${d.escalationLevel}</span>
      </div>
      <div style="font-size:13px; font-weight:800; color:var(--text-primary); margin-top:2px;">
        State: ${d.currentState} • Intervention: ${d.recommendedIntervention}
      </div>
      <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
        <strong>Rationale:</strong> ${d.explanation}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; font-size:11px; color:var(--text-muted);">
        <span>Confidence: ${d.dataSufficiency} (${d.confidencePct}%)</span>
        <span>Feedback: <strong>${d.userFeedback || 'Pending'}</strong></span>
      </div>
    </div>
  `).join('');
}

// View Mode Toggle (Interactive Phone vs 13-Screen Gallery Matrix vs AI Engine & Judge Demo)
function setupViewModeSwitcher() {
  const singleBtn = document.getElementById('singlePhoneModeBtn');
  const galleryBtn = document.getElementById('galleryModeBtn');
  const aiEngineBtn = document.getElementById('aiEngineModeBtn');

  const singleStage = document.getElementById('singlePhoneStage');
  const galleryStage = document.getElementById('galleryStage');
  const aiDemoStage = document.getElementById('aiDemoStage');
  const jumpDropdown = document.getElementById('screenJumpSelect');

  function deactivateAll() {
    singleBtn.classList.remove('active');
    galleryBtn.classList.remove('active');
    if (aiEngineBtn) aiEngineBtn.classList.remove('active');

    singleStage.classList.add('hidden');
    galleryStage.classList.remove('active');
    if (aiDemoStage) aiDemoStage.classList.remove('active');
  }

  singleBtn.addEventListener('click', () => {
    deactivateAll();
    singleBtn.classList.add('active');
    singleStage.classList.remove('hidden');
  });

  galleryBtn.addEventListener('click', () => {
    deactivateAll();
    galleryBtn.classList.add('active');
    galleryStage.classList.add('active');
    populateGalleryMatrix();
  });

  if (aiEngineBtn) {
    aiEngineBtn.addEventListener('click', () => {
      deactivateAll();
      aiEngineBtn.classList.add('active');
      if (aiDemoStage) aiDemoStage.classList.add('active');
      initCaseStudiesDropdown();
    });
  }

  jumpDropdown.addEventListener('change', (e) => {
    singleBtn.click(); // Switch to phone mode
    navigateToScreen(e.target.value);
  });
}

// Populate the 13-Screen Gallery Matrix with rendered phone viewports
function populateGalleryMatrix() {
  const screens = ['01','02','03','04','05','06','07','08','09','10','11','12','13'];
  screens.forEach(num => {
    const container = document.getElementById(`gallery-s${num}`);
    const sourceScreen = document.getElementById(`screen-${num}`);
    if (container && sourceScreen) {
      const cloned = sourceScreen.cloneNode(true);
      cloned.classList.add('active');
      cloned.style.display = 'flex';
      container.innerHTML = `
        <div class="android-status-bar">
          <div class="status-time">09:41</div>
          <div class="status-bar-camera-notch"><div class="status-bar-camera-lens"></div></div>
          <div class="status-icons">
            <span style="font-size:10px; font-weight:800;">5G</span>
            <div class="status-battery-pill"><div class="status-battery-level"></div></div>
          </div>
        </div>
        <div class="phone-content" style="display:flex; flex-direction:column; padding-bottom:30px;">
          ${cloned.outerHTML}
        </div>
        <div class="android-gesture-pill-area">
          <div class="android-gesture-pill"></div>
        </div>
      `;
    }
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setupClock();
  setupBreathingPacer();
  setupViewModeSwitcher();
  initCaseStudiesDropdown();
  updateHomeDashboardStats();
  renderDynamicWaveGraph('today');
  refreshSelfCareActivities();
  renderCheckinEndActivities();
  renderRecordsTimeline();
  navigateToScreen('04'); // Launch directly on Home Dashboard per requirements
});
