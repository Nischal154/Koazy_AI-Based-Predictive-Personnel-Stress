// KOAZY Context Engine - Normalization, Signal Extraction & Context Analysis
// Principle: Signals are contextual associations, NEVER diagnostic labels.

export const CONTEXT_CATEGORIES = {
  FAMILY_PERSONAL: 'Family / Personal',
  DUTY_WORKLOAD: 'Duty / Workload',
  SLEEP_RECOVERY: 'Sleep / Recovery',
  DEPLOYMENT: 'Deployment',
  TRANSFER_CHANGE: 'Transfer / Routine Change',
  PHYSICAL_WELLBEING: 'Physical Wellbeing',
  UNKNOWN_INSUFFICIENT: 'Unknown / Insufficient Data'
};

export const ContextEngine = {
  /**
   * Normalizes raw personal inputs and organizational data
   */
  normalizeInputs(personalInput = {}, orgData = {}) {
    return {
      mood: personalInput.mood || 'Okay',
      energyLevel: Number.isInteger(personalInput.energyLevel) ? personalInput.energyLevel : 70,
      sleepQuality: personalInput.sleepQuality || 'Normal',
      reportedFactors: Array.isArray(personalInput.factors) ? personalInput.factors : [],
      writtenReflection: (personalInput.note || '').trim(),
      // Authorized Organizational Signals
      dutyIntensity: orgData.dutyIntensity || 'Normal', // 'Low', 'Normal', 'High'
      workloadTrend: orgData.workloadTrend || 'Stable', // 'Stable', 'Increasing', 'High'
      recentDeploymentChange: Boolean(orgData.recentDeploymentChange),
      recentTransfer: Boolean(orgData.recentTransfer),
      leavePattern: orgData.leavePattern || 'Regular'
    };
  },

  /**
   * Evaluates signal strengths across context dimensions
   */
  extractContextSignals(norm) {
    const signals = {
      family: { level: 'None', label: 'No reported concern' },
      duty: { level: 'Low', label: 'Routine duties' },
      sleep: { level: 'Normal', label: 'Adequate rest' },
      deployment: { level: 'None', label: 'No routine change' },
      transfer: { level: 'None', label: 'Stable station' }
    };

    // Family / Personal Context
    const hasFamilyConcern = norm.reportedFactors.some(f => 
      f.toLowerCase().includes('family') || f.toLowerCase().includes('relationship')
    ) || norm.writtenReflection.toLowerCase().includes('family') || norm.writtenReflection.toLowerCase().includes('home');
    
    if (hasFamilyConcern) {
      signals.family = { level: 'High', label: 'User-reported personal/family concern' };
    }

    // Duty / Workload Context
    const hasDutyFactor = norm.reportedFactors.some(f => 
      f.toLowerCase().includes('work') || f.toLowerCase().includes('duty') || f.toLowerCase().includes('shift')
    );
    if (norm.dutyIntensity === 'High' || norm.workloadTrend === 'Increasing') {
      signals.duty = { level: 'High', label: 'High duty intensity & increasing workload' };
    } else if (hasDutyFactor) {
      signals.duty = { level: 'Moderate', label: 'Self-reported duty strain' };
    }

    // Sleep / Recovery Context
    const poorSleep = norm.sleepQuality.toLowerCase().includes('poor') || 
                      norm.sleepQuality.toLowerCase().includes('broken') || 
                      norm.sleepQuality.toLowerCase().includes('insufficient') ||
                      norm.sleepQuality.toLowerCase().includes('interrupted');
    if (poorSleep && norm.energyLevel < 50) {
      signals.sleep = { level: 'High', label: 'Sleep disruption + significant fatigue' };
    } else if (poorSleep || norm.energyLevel < 50) {
      signals.sleep = { level: 'Moderate', label: 'Reduced recovery indicators' };
    }

    // Deployment Context
    if (norm.recentDeploymentChange) {
      signals.deployment = { level: 'High', label: 'Recent operational deployment shift' };
    }

    // Transfer Context
    if (norm.recentTransfer) {
      signals.transfer = { level: 'High', label: 'Recent station relocation / transfer' };
    }

    return signals;
  },

  /**
   * Synthesizes primary possible contributing contexts
   */
  analyzeContributingFactors(signals, norm) {
    const contributing = [];

    if (signals.family.level === 'High') {
      contributing.push({
        category: CONTEXT_CATEGORIES.FAMILY_PERSONAL,
        confidence: 'High',
        descriptor: 'Possible personal/family contributor (self-reported)'
      });
    }

    if (signals.duty.level === 'High' || (signals.duty.level === 'Moderate' && signals.sleep.level !== 'None')) {
      contributing.push({
        category: CONTEXT_CATEGORIES.DUTY_WORKLOAD,
        confidence: signals.duty.level === 'High' ? 'High' : 'Moderate',
        descriptor: 'Possible duty/workload strain'
      });
    }

    if (signals.sleep.level === 'High' || signals.sleep.level === 'Moderate') {
      contributing.push({
        category: CONTEXT_CATEGORIES.SLEEP_RECOVERY,
        confidence: signals.sleep.level === 'High' ? 'High' : 'Moderate',
        descriptor: 'Associated sleep disruption / fatigue signal'
      });
    }

    if (signals.deployment.level === 'High') {
      contributing.push({
        category: CONTEXT_CATEGORIES.DEPLOYMENT,
        confidence: 'High',
        descriptor: 'Recent deployment adaptation factor'
      });
    }

    if (signals.transfer.level === 'High') {
      contributing.push({
        category: CONTEXT_CATEGORIES.TRANSFER_CHANGE,
        confidence: 'Moderate',
        descriptor: 'Station transfer adjustment context'
      });
    }

    // Unknown context handling: if mood is low but no specific factor emerged
    const isNegativeMood = ['low', 'stressed', 'overwhelmed', 'exhausted'].includes(norm.mood.toLowerCase());
    if (isNegativeMood && contributing.length === 0) {
      contributing.push({
        category: CONTEXT_CATEGORIES.UNKNOWN_INSUFFICIENT,
        confidence: 'Low',
        descriptor: 'Insufficient contextual data (no single driver identified)'
      });
    }

    return contributing;
  },

  /**
   * Assesses data sufficiency / confidence
   */
  evaluateDataSufficiency(norm, history = []) {
    let score = 0;
    if (norm.reportedFactors.length > 0) score += 2;
    if (norm.writtenReflection.length > 5) score += 2;
    if (history.length >= 3) score += 3;
    if (norm.dutyIntensity !== 'Normal' || norm.recentDeploymentChange || norm.recentTransfer) score += 2;

    if (score >= 6) return { rating: 'High', confidencePct: 88 };
    if (score >= 3) return { rating: 'Moderate', confidencePct: 65 };
    return { rating: 'Low', confidencePct: 42 };
  }
};
