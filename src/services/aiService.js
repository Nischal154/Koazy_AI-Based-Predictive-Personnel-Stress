// KOAZY AI Service - Facade connecting Application UI & Case Studies to AI Engines

import { PersonalizationEngine } from '../ai/personalizationEngine.js';
import { CASE_STUDIES, TWO_PERSON_COMPARISON } from '../ai/caseStudies.js';
import { StorageService } from './storage.service.js';

export const AIService = {
  /**
   * Evaluates a live check-in using the full personalization pipeline
   */
  analyzeLiveCheckin(personalInput, orgData = {}) {
    const history = StorageService.getCheckins();
    const profile = StorageService.getProfile();

    const mergedOrgData = {
      dutyIntensity: orgData.dutyIntensity || 'Normal',
      workloadTrend: orgData.workloadTrend || 'Stable',
      recentDeploymentChange: orgData.recentDeploymentChange || false,
      recentTransfer: orgData.recentTransfer || false,
      ...orgData
    };

    const decisionLog = PersonalizationEngine.process(personalInput, mergedOrgData, history);
    StorageService.saveAIDecision(decisionLog);
    return decisionLog;
  },

  /**
   * Retrieves all available case studies
   */
  getCaseStudies() {
    return CASE_STUDIES;
  },

  /**
   * Runs the complete pipeline on a specific case study
   */
  runCaseStudy(caseId) {
    const target = CASE_STUDIES.find(c => c.id === caseId) || CASE_STUDIES[0];
    const decisionLog = PersonalizationEngine.process(
      target.personalInput,
      target.orgData,
      target.history
    );
    decisionLog.caseStudyMeta = target;
    return decisionLog;
  },

  /**
   * Runs the Two-Person Comparison Demo
   */
  runComparison() {
    const decisionA = PersonalizationEngine.process(
      TWO_PERSON_COMPARISON.personA.personalInput,
      TWO_PERSON_COMPARISON.personA.orgData,
      []
    );
    const decisionB = PersonalizationEngine.process(
      TWO_PERSON_COMPARISON.personB.personalInput,
      TWO_PERSON_COMPARISON.personB.orgData,
      []
    );

    return {
      personA: {
        meta: TWO_PERSON_COMPARISON.personA,
        decision: decisionA
      },
      personB: {
        meta: TWO_PERSON_COMPARISON.personB,
        decision: decisionB
      }
    };
  },

  /**
   * Records simulated feedback loop outcome and updates user context
   */
  recordFeedback(decisionId, feedback) {
    // feedback: 'Helped' | 'Did not help' | 'Not tried'
    const updated = StorageService.updateAIDecisionFeedback(decisionId, feedback);
    return {
      decision: updated,
      feedback,
      updatedContextMessage: feedback === 'Helped'
        ? 'Feedback Logged: Positive adaptation recorded. System context reinforced for similar restorative practices.'
        : 'Feedback Logged: Alternative recovery options queued for future check-in adjustments.'
    };
  }
};
