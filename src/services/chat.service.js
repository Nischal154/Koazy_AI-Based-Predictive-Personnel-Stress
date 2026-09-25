// Talk to Koazy - Empathetic AI Companion Service with Crisis Safety Screening

import { SafetyEngine } from '../ai/safetyEngine.js';
import { SafetyService } from './safetyService.js';

const SUPPORTIVE_RESPONSES = [
  {
    keywords: ['tired', 'exhausted', 'sleep', 'fatigue', 'shift', 'duty'],
    reply: "Demanding duty shifts take a real physical and mental toll. Can you sit back for a moment and take three slow, deep breaths with me?"
  },
  {
    keywords: ['stress', 'overwhelm', 'pressure', 'workload', 'transfer'],
    reply: "Carrying high expectations and sudden changes can feel heavy. Remember that acknowledging how you feel right now is strength, not weakness."
  },
  {
    keywords: ['family', 'home', 'miss', 'away'],
    reply: "Being away from family during service is one of the hardest sacrifices. Sending you warmth. Would hearing a calming soundscape or journaling a small note help right now?"
  },
  {
    keywords: ['hello', 'hi', 'hey', 'koazy'],
    reply: "Hello! I'm Koazy, your private wellbeing companion. I'm right here with you. How is your day feeling so far?"
  }
];

export const ChatService = {
  /**
   * Processes a user message through Safety screening first, then supportive dialogue
   */
  processMessage(userMessage) {
    // 1. Safety & Crisis Screening
    const safety = SafetyEngine.evaluateText(userMessage);

    if (safety.isCrisis) {
      // Log safety detection event
      SafetyService.logEvent(
        'CRISIS_DETECTED',
        `Crisis Signal Detected (${safety.level.tag})`,
        `Language pattern matched: "${safety.matchedPhrase}". Safety protocol activated immediately.`
      );
      SafetyService.logEvent(
        'PROTOCOL_ACTIVATED',
        'Supportive Safety Workflow Engaged',
        'System shifted from routine wellness recommendations to compassionate human safety response.'
      );

      const safetyResponse = SafetyEngine.getSafetyResponse(safety);
      return {
        isCrisis: true,
        level: safety.level,
        reply: safetyResponse.message,
        promptQuestion: safetyResponse.promptQuestion,
        supportOptions: safetyResponse.supportOptions
      };
    }

    // 2. Normal Empathetic Conversation
    const lower = userMessage.toLowerCase();
    for (const item of SUPPORTIVE_RESPONSES) {
      if (item.keywords.some(k => lower.includes(k))) {
        return {
          isCrisis: false,
          reply: item.reply
        };
      }
    }

    return {
      isCrisis: false,
      reply: "I hear you. Thank you for sharing that with me. Take all the time you need—I'm here whenever you want to unpack your thoughts."
    };
  },

  // Backward compatibility helper
  generateReply(userMessage) {
    const res = this.processMessage(userMessage);
    return res.reply;
  }
};
