// Check-in Service - Connected to the KOAZY AI / Analytics Engine

import { AIService } from './aiService.js';

export const CheckinService = {
  generateSupportiveReflection(checkinData, orgData = {}) {
    // Run live check-in through the full AI Personalization & Context Pipeline
    const decision = AIService.analyzeLiveCheckin(checkinData, orgData);

    const mood = (checkinData.mood || '').toLowerCase();
    const primaryFactor = decision.contributingFactors[0] || 'your day';

    let message = "Thank you for checking in with yourself today.";
    let subtext = "Noticing how you feel is the first step toward caring for yourself.";

    if (mood === 'good' || mood === 'okay' || mood === 'great') {
      message = "Glad to hear that. Take a little time for yourself today.";
      subtext = decision.explanationSummary || "Holding space for calm moments helps keep your energy steady.";
    } else if (mood === 'stress' || mood === 'stressed' || mood === 'overwhelmed' || mood === 'sad') {
      message = `You've been carrying a lot regarding ${primaryFactor}. A little rest might help.`;
      subtext = decision.explanationSummary || "Remember you don't have to tackle everything at once right now.";
    } else if (mood === 'exhausted' || checkinData.energyLevel < 40) {
      message = "Sounds like today has been a little heavy.";
      subtext = decision.explanationSummary || "Your body and mind are asking for gentle recovery. Give yourself permission to pause.";
    }

    return {
      message,
      subtext,
      suggestedAction: decision.recommendedIntervention,
      suggestedActionType: decision.interventionDetail ? decision.interventionDetail.actionType : 'care',
      decisionLog: decision,
      whyThisResponse: decision.explanation,
      signalsUsed: decision.signalsUsed
    };
  }
};
