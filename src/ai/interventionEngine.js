// KOAZY Intervention Engine - Context-Aware Intervention Library
// Core rule: Choose from a diverse library based on context, not the same exercise for everyone.

import { CONTEXT_CATEGORIES } from './contextEngine.js';

export const InterventionEngine = {
  /**
   * Maps contributing contexts, trend, and sufficiency to personalized interventions
   */
  selectIntervention(contextFactors, trendResult, sufficiency, norm) {
    const primaryFactor = contextFactors[0] ? contextFactors[0].category : CONTEXT_CATEGORIES.UNKNOWN_INSUFFICIENT;

    // 1. Conflicting Signals Handling
    if (trendResult.direction === 'Vigilant / Guarded') {
      return {
        id: 'int-conflict',
        title: 'Gentle Optional Check-in',
        category: 'Proactive Inquiry',
        description: 'Notice of demanding operational tempo without invalidating positive self-report.',
        actionLabel: 'Explore Optional Check-in',
        actionType: 'checkin_optional',
        followUpPrompt: "Your recent duty routine looks demanding. Whenever you feel like taking 2 minutes for yourself, Koazy is right here."
      };
    }

    // 2. Unknown / Insufficient Data Context
    if (primaryFactor === CONTEXT_CATEGORIES.UNKNOWN_INSUFFICIENT || sufficiency.rating === 'Low') {
      return {
        id: 'int-unknown',
        title: 'Supportive Clarifying Dialogue',
        category: 'Exploratory Care',
        description: 'Context is unclear. The system intentionally avoids guessing and invites gentle reflection.',
        actionLabel: 'Share What’s on Your Mind',
        actionType: 'chat_prompt',
        followUpPrompt: "Is there something specific that’s been weighing on your mind today, or would you simply prefer a quiet breathing pause?"
      };
    }

    // 3. Family / Personal Context
    if (primaryFactor === CONTEXT_CATEGORIES.FAMILY_PERSONAL) {
      return {
        id: 'int-family',
        title: 'Supportive Reflection & Family Support Pathway',
        category: 'Personal / Emotional Support',
        description: 'Holds space for family/personal strain during remote service posting.',
        actionLabel: 'Unpack Thoughts with Koazy',
        actionType: 'chat_support',
        followUpPrompt: 'Being away from family while on duty is a profound sacrifice. Let’s take a quiet moment to process what’s on your heart.'
      };
    }

    // 4. Duty / Workload Context
    if (primaryFactor === CONTEXT_CATEGORIES.DUTY_WORKLOAD) {
      const isPersistent = trendResult.direction.includes('Declining');
      return {
        id: 'int-duty',
        title: isPersistent ? 'Workload Review & Tactical Recovery' : 'Post-Duty Decompression & Breathing Pacer',
        category: 'Operational Recovery',
        description: isPersistent ? 'Persistent duty overload detected; suggests workload dialogue and guided physical rest.' : 'Short 3-minute tactical breathing reset after intensive duty.',
        actionLabel: isPersistent ? 'Request Welfare Workload Review' : 'Start 60s Tactical Reset',
        actionType: isPersistent ? 'welfare_review' : 'breathe',
        followUpPrompt: 'High operational vigilance takes a physical toll. Let’s reset your nervous system before your next shift.'
      };
    }

    // 5. Sleep / Recovery Context
    if (primaryFactor === CONTEXT_CATEGORIES.SLEEP_RECOVERY) {
      return {
        id: 'int-sleep',
        title: 'Barrack Sleep Pacer & Progressive Relaxation',
        category: 'Rest & Recovery',
        description: 'Tailored for disrupted or broken sleep cycles common in barracks and deployment stations.',
        actionLabel: 'Play Restful Soundscape',
        actionType: 'sleep_care',
        followUpPrompt: 'Your body is asking for deep rest tonight. Let’s wind down with ambient rainfall or a gentle body scan.'
      };
    }

    // 6. Deployment / Routine Change
    if (primaryFactor === CONTEXT_CATEGORIES.DEPLOYMENT || primaryFactor === CONTEXT_CATEGORIES.TRANSFER_CHANGE) {
      return {
        id: 'int-deployment',
        title: 'Deployment Transition Pacing & Peer Check-in',
        category: 'Adaptation Support',
        description: 'Supports adjustment to new operational environment, new unit rhythms, and relocation.',
        actionLabel: 'Connect with Peer Buddy',
        actionType: 'peer_connect',
        followUpPrompt: 'Adjusting to a new station or deployment takes time. Reaching out to a peer listener can make the transition smoother.'
      };
    }

    // 7. Improving Trend
    if (trendResult.direction === 'Improving') {
      return {
        id: 'int-improving',
        title: 'Positive Reinforcement & Rhythm Maintenance',
        category: 'Wellbeing Maintenance',
        description: 'Reinforces positive rebound from earlier fatigue.',
        actionLabel: 'Continue Steady Routine',
        actionType: 'positive_reinforce',
        followUpPrompt: 'Great to see your energy returning. Acknowledge yourself for taking care of your rest.'
      };
    }

    // Default gentle wellness
    return {
      id: 'int-default',
      title: 'Mindful Breathing & Self Care',
      category: 'General Wellbeing',
      description: 'Gentle foundational practice for steady balance.',
      actionLabel: 'Try a 60-Second Breathing Exercise',
      actionType: 'breathe',
      followUpPrompt: 'Taking even 60 seconds to breathe deeply supports your resilience.'
    };
  }
};
