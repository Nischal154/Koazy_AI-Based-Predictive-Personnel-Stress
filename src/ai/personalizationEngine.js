// KOAZY Personalization Engine - Core Decision Pipeline
// Coordinates normalization, context, trend, intervention selection, and explanation.

import { ContextEngine } from './contextEngine.js';
import { TrendEngine } from './trendEngine.js';
import { InterventionEngine } from './interventionEngine.js';
import { ExplanationEngine } from './explanationEngine.js';
import { SafetyEngine, ESCALATION_LEVELS } from './safetyEngine.js';

export const PersonalizationEngine = {
  /**
   * Executes the full 11-step predictive & personalization pipeline
   */
  process(personalInput = {}, orgData = {}, history = []) {
    // 1. Data Normalization
    const norm = ContextEngine.normalizeInputs(personalInput, orgData);

    // 2. Safety / Crisis Screening
    const safetyCheck = SafetyEngine.evaluateText(norm.writtenReflection);

    // 3. Feature & Context Signal Extraction
    const signals = ContextEngine.extractContextSignals(norm);

    // 4. Current State Assessment (Non-diagnostic application states)
    let currentState = 'Stable';
    if (safetyCheck.isCrisis) {
      currentState = 'Crisis / Urgent Safety Concern';
    } else if (norm.mood.toLowerCase() === 'good') {
      currentState = 'Positive & Balanced';
    } else if (norm.mood.toLowerCase() === 'okay') {
      currentState = 'Stable Baseline';
    } else if (norm.mood.toLowerCase() === 'stressed') {
      currentState = 'Stressed';
    } else if (norm.mood.toLowerCase() === 'overwhelmed') {
      currentState = 'Overwhelmed';
    } else if (norm.mood.toLowerCase() === 'exhausted' || norm.energyLevel < 40) {
      currentState = 'Exhausted / High Fatigue';
    } else if (norm.mood.toLowerCase() === 'a little low' || norm.mood.toLowerCase() === 'low') {
      currentState = 'Low Wellbeing State';
    }

    // 5. Historical Trend Analysis
    const trendResult = TrendEngine.analyzeTrend(norm, history);

    // 6. Contributing Context Analysis
    const contributingFactors = ContextEngine.analyzeContributingFactors(signals, norm);

    // 7. Data Sufficiency / Confidence
    const sufficiency = ContextEngine.evaluateDataSufficiency(norm, history);

    // 8. Escalation Level
    let escalationLevel = safetyCheck.level || ESCALATION_LEVELS.LEVEL_0_NORMAL;
    if (!safetyCheck.isCrisis) {
      if (trendResult.pattern.includes('Persistent') && norm.energyLevel < 40) {
        escalationLevel = ESCALATION_LEVELS.LEVEL_1_DISTRESS;
      }
    }

    // 9. Intervention Selection
    const intervention = InterventionEngine.selectIntervention(contributingFactors, trendResult, sufficiency, norm);

    // 10. Explanation Formulation
    const explanation = ExplanationEngine.generateExplanation(norm, signals, trendResult, contributingFactors, intervention, sufficiency);

    // 11. Structured Decision Object
    const decisionLog = {
      id: 'DEC-' + Date.now(),
      timestamp: Date.now(),
      timestampDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inputs: {
        personal: personalInput,
        organizational: orgData
      },
      normalizedInputs: norm,
      currentState,
      trend: trendResult.direction,
      trendPattern: trendResult.pattern,
      trendSummary: trendResult.summary,
      contextSignals: {
        family: signals.family.level,
        duty: signals.duty.level,
        sleep: signals.sleep.level,
        deployment: signals.deployment.level,
        transfer: signals.transfer.level
      },
      contextSignalsDetail: signals,
      contributingFactors: contributingFactors.map(f => f.category),
      contributingFactorsDetail: contributingFactors,
      dataSufficiency: sufficiency.rating,
      confidencePct: sufficiency.confidencePct,
      recommendedIntervention: intervention.title,
      interventionDetail: intervention,
      escalationLevel: escalationLevel.tag,
      escalationSeverity: escalationLevel.severity,
      explanation: explanation.whyThisResponse,
      explanationSummary: explanation.summary,
      signalsUsed: explanation.signalsUsed,
      userFeedback: null // 'Helped', 'Did not help', 'Not tried'
    };

    return decisionLog;
  }
};
