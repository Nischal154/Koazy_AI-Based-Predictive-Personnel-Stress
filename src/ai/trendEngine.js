// KOAZY Trend Engine - Historical Trend Analysis
// Core rule: ONE BAD DAY != TWO WEEKS OF DECLINING CHECK-INS

export const TREND_PATTERNS = {
  ISOLATED_NEGATIVE: 'Isolated Negative Signal',
  PERSISTENT_DECLINE: 'Persistent Wellbeing Decline',
  IMPROVING: 'Improving Wellbeing Rhythm',
  STABLE: 'Stable Baseline',
  CONFLICTING_SIGNALS: 'Conflicting Signals (Self-Report vs Context)'
};

export const TrendEngine = {
  /**
   * Evaluates historical trend patterns by comparing current state with previous check-ins
   */
  analyzeTrend(currentNorm, history = []) {
    const isCurrentLow = ['low', 'stressed', 'overwhelmed', 'exhausted'].includes(currentNorm.mood.toLowerCase());

    // 1. Conflicting Signals: User says "I'm fine" / "Good", but high duty & poor sleep are active
    const isCurrentPositive = ['good', 'okay'].includes(currentNorm.mood.toLowerCase());
    const hasOrgStrain = (currentNorm.dutyIntensity === 'High' || currentNorm.workloadTrend === 'Increasing') &&
                         (currentNorm.sleepQuality.toLowerCase().includes('poor') || currentNorm.energyLevel < 50);
    
    if (isCurrentPositive && hasOrgStrain) {
      return {
        pattern: TREND_PATTERNS.CONFLICTING_SIGNALS,
        direction: 'Vigilant / Guarded',
        summary: 'Self-reported state is positive, but duty intensity and sleep metrics show high operational strain.',
        recommendationFocus: 'Gentle, optional check-in without overriding self-report.'
      };
    }

    // If no prior history, treat as initial baseline
    if (!history || history.length === 0) {
      return {
        pattern: isCurrentLow ? TREND_PATTERNS.ISOLATED_NEGATIVE : TREND_PATTERNS.STABLE,
        direction: isCurrentLow ? 'Initial Low Signal' : 'Stable',
        summary: 'Initial check-in on record. Establishing individual baseline.',
        recommendationFocus: 'Standard supportive response.'
      };
    }

    // 2. Check for Improving Trend
    const recentPrev = history.slice(0, 3);
    const prevWereLow = recentPrev.some(h => ['low', 'stressed', 'overwhelmed', 'exhausted'].includes((h.mood || '').toLowerCase()));
    if (isCurrentPositive && prevWereLow) {
      return {
        pattern: TREND_PATTERNS.IMPROVING,
        direction: 'Improving',
        summary: 'Recovery detected compared to previous low/stressed check-ins.',
        recommendationFocus: 'Positive reinforcement and sustainable pacing.'
      };
    }

    // 3. Isolated Bad Day vs. Persistent Decline
    if (isCurrentLow) {
      const consecutiveLowCount = recentPrev.filter(h => 
        ['low', 'stressed', 'overwhelmed', 'exhausted'].includes((h.mood || '').toLowerCase())
      ).length;

      if (consecutiveLowCount >= 2) {
        return {
          pattern: TREND_PATTERNS.PERSISTENT_DECLINE,
          direction: 'Declining Over Time',
          summary: 'Multiple consecutive check-ins reflect persistent fatigue or emotional wear.',
          recommendationFocus: 'Structured supportive care and potential authorized welfare check.'
        };
      } else {
        return {
          pattern: TREND_PATTERNS.ISOLATED_NEGATIVE,
          direction: 'Isolated Low Signal',
          summary: 'Isolated low check-in following a steady baseline. No cumulative decline observed.',
          recommendationFocus: 'Gentle decompression. Avoid unnecessary escalation.'
        };
      }
    }

    // Default stable baseline
    return {
      pattern: TREND_PATTERNS.STABLE,
      direction: 'Stable',
      summary: 'Wellbeing and rest indicators are consistent with routine baseline.',
      recommendationFocus: 'Maintenance of healthy habits.'
    };
  }
};
