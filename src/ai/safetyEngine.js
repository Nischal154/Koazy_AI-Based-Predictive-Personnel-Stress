// KOAZY Safety & Crisis Decision Engine
// Critical Rule: Safety protocol overrides standard wellness recommendations when imminent risk appears.
// Demo Mode: Actions are simulated for review; no real phone calls or SMS are dispatched.

export const ESCALATION_LEVELS = {
  LEVEL_0_NORMAL: {
    level: 0,
    tag: 'LEVEL 0 — NORMAL',
    severity: 'normal',
    description: 'Routine wellbeing conversation. Standard supportive flow.'
  },
  LEVEL_1_DISTRESS: {
    level: 1,
    tag: 'LEVEL 1 — DISTRESS',
    severity: 'moderate',
    description: 'Strong emotional strain or fatigue reported, but no immediate danger indicators.'
  },
  LEVEL_2_CONCERN: {
    level: 2,
    tag: 'LEVEL 2 — SAFETY CONCERN',
    severity: 'high',
    description: 'Language suggests hopelessness or potential self-harm. Human support recommended.'
  },
  LEVEL_3_URGENT: {
    level: 3,
    tag: 'LEVEL 3 — URGENT SAFETY CONCERN',
    severity: 'critical',
    description: 'Language indicates possible immediate crisis. Safety protocol activated immediately.'
  }
};

const CRISIS_TRIGGER_PHRASES = [
  'quit life',
  'want to die',
  'don\'t want to live',
  'dont want to live',
  'hurt myself',
  'kill myself',
  'end it all',
  'can\'t keep going',
  'cant keep going',
  'no reason to live'
];

const DISTRESS_TRIGGER_PHRASES = [
  'overwhelmed',
  'breaking down',
  'can\'t take it anymore',
  'cant take it anymore',
  'hopeless',
  'at my limit'
];

export const SafetyEngine = {
  /**
   * Scans text for safety/crisis signals
   */
  evaluateText(text = '') {
    const clean = text.toLowerCase().trim();
    if (!clean) return { level: ESCALATION_LEVELS.LEVEL_0_NORMAL, matchedPhrase: null };

    // Check Level 3 Urgent
    for (const phrase of CRISIS_TRIGGER_PHRASES) {
      if (clean.includes(phrase)) {
        return {
          level: ESCALATION_LEVELS.LEVEL_3_URGENT,
          matchedPhrase: phrase,
          isCrisis: true
        };
      }
    }

    // Check Level 2 Concern
    if (clean.includes('no point') || clean.includes('give up') || clean.includes('lost all hope')) {
      return {
        level: ESCALATION_LEVELS.LEVEL_2_CONCERN,
        matchedPhrase: 'despair/hopelessness pattern',
        isCrisis: true
      };
    }

    // Check Level 1 Distress
    for (const phrase of DISTRESS_TRIGGER_PHRASES) {
      if (clean.includes(phrase)) {
        return {
          level: ESCALATION_LEVELS.LEVEL_1_DISTRESS,
          matchedPhrase: phrase,
          isCrisis: false
        };
      }
    }

    return {
      level: ESCALATION_LEVELS.LEVEL_0_NORMAL,
      matchedPhrase: null,
      isCrisis: false
    };
  },

  /**
   * Generates a compassionate, human-centered safety response
   */
  getSafetyResponse(evaluation) {
    if (evaluation.level.level === 3) {
      return {
        message: "I hear how much pain you're in, and I want you to know that you are not alone right now. Please take a pause with me. Your life matters deeply, and there is confidential, compassionate support ready for you right this second.",
        promptQuestion: "Would you like to connect with someone who can stay with you right now?",
        supportOptions: [
          { id: 'family', label: 'Call Trusted Family Contact', type: 'family', icon: '📞' },
          { id: 'medical', label: 'Emergency Medical Service (Tele-Support)', type: 'emergency', icon: '🚑' },
          { id: 'officer', label: 'Notify Unit Welfare Officer (Priority Alert)', type: 'officer', icon: '🛡️' },
          { id: 'listener', label: 'Connect to Peer Listener (Manoj K.)', type: 'peer', icon: '💬' }
        ]
      };
    }

    if (evaluation.level.level === 2) {
      return {
        message: "It sounds like you are carrying an extraordinarily heavy burden right now. Please know that reaching out for support is a sign of courage. Let's make sure you're safe and supported.",
        promptQuestion: "Can we connect you with someone who can listen and support you?",
        supportOptions: [
          { id: 'listener', label: 'Talk to Unit Peer Listener', type: 'peer', icon: '💬' },
          { id: 'officer', label: 'Request Confidential Welfare Check-in', type: 'officer', icon: '🛡️' },
          { id: 'family', label: 'Call Family Member', type: 'family', icon: '📞' }
        ]
      };
    }

    return null;
  }
};
