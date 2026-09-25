// KOAZY Explanation Engine - Transparent, Non-Black-Box AI Decision Explanations
// Crucial for SIH 26186: Demonstrates exactly why an intervention was chosen over alternatives.

export const ExplanationEngine = {
  /**
   * Generates a clear, human-understandable explanation of the decision
   */
  generateExplanation(norm, signals, trendResult, contextFactors, intervention, sufficiency) {
    const primaryFactor = contextFactors[0] ? contextFactors[0].category : 'Unknown';

    // 1. Conflicting Signals
    if (trendResult.pattern.includes('Conflicting')) {
      return {
        summary: "Self-report shows positive state, but duty and sleep indicators show operational pressure. System avoids guessing or overruling self-report, offering gentle optional support.",
        whyThisResponse: "We prioritize personnel autonomy. Rather than forcing an intervention on someone feeling good, we acknowledge the demanding duty tempo with an unobtrusive optional check-in.",
        signalsUsed: ["Self-reported mood: Good", `Duty Intensity: ${norm.dutyIntensity}`, `Sleep: ${norm.sleepQuality}`]
      };
    }

    // 2. Unknown / Insufficient Data
    if (primaryFactor === 'Unknown / Insufficient Data' || sufficiency.rating === 'Low') {
      return {
        summary: "Available check-in information is limited without distinct contextual signals. The engine refuses to hallucinate or guess a diagnosis.",
        whyThisResponse: "Because there is insufficient evidence to attribute the feeling to duty, family, or sleep, the engine invites the user to elaborate rather than prescribing an arbitrary exercise.",
        signalsUsed: ["Reported Mood: Low/Stressed", "Context Signals: No dominant factor", `Sufficiency: ${sufficiency.rating} (${sufficiency.confidencePct}%)`]
      };
    }

    // 3. Family / Personal
    if (primaryFactor === 'Family / Personal') {
      return {
        summary: "Recent self-reported information indicates personal/family strain. Duty and sleep indicators remain stable and within baseline limits.",
        whyThisResponse: "Since duty demands are normal and rest is intact, fatigue recovery is not the primary need. An empathetic dialogue and family support pathway provide targeted emotional reassurance.",
        signalsUsed: ["Family Signal: High (User-reported)", `Duty Intensity: ${norm.dutyIntensity} (Normal)`, `Sleep Quality: ${norm.sleepQuality} (Adequate)`]
      };
    }

    // 4. Duty / Workload
    if (primaryFactor === 'Duty / Workload') {
      const isDeclining = trendResult.direction.includes('Declining');
      return {
        summary: isDeclining 
          ? "Repeated high duty intensity and increasing workloads have correlated with declining wellbeing over multiple days."
          : "Elevated duty shift strain detected with associated physical tension.",
        whyThisResponse: isDeclining
          ? "Cumulative duty strain requires structural recovery. Standard exercises are supplemented with an optional, authorized unit welfare workload review."
          : "Immediate nervous system down-regulation via tactical box breathing is most effective for post-shift operational fatigue.",
        signalsUsed: [`Duty Intensity: ${norm.dutyIntensity}`, `Workload Trend: ${norm.workloadTrend}`, `Trend: ${trendResult.direction}`]
      };
    }

    // 5. Sleep / Recovery
    if (primaryFactor === 'Sleep / Recovery') {
      return {
        summary: "Poor sleep quality combined with reduced energy levels identified as primary recovery bottleneck.",
        whyThisResponse: "Mental strain here stems from restorative sleep deficits. Prioritizing barrack soundscapes and sleep hygiene over active cognitive exercises directly addresses the physiological need.",
        signalsUsed: [`Sleep Quality: ${norm.sleepQuality}`, `Energy Level: ${norm.energyLevel}%`, `Sleep Signal: ${signals.sleep.level}`]
      };
    }

    // 6. Deployment / Transfer
    if (primaryFactor === 'Deployment' || primaryFactor === 'Transfer / Routine Change') {
      return {
        summary: "Recent station transfer or deployment shift detected alongside adjusting wellbeing baseline.",
        whyThisResponse: "Relocation and operational environment changes disrupt social and daily routines. Connecting with peer listeners fosters rapid social adaptation.",
        signalsUsed: [`Deployment Changed: ${norm.recentDeploymentChange}`, `Transfer Logged: ${norm.recentTransfer}`]
      };
    }

    // 7. Isolated Bad Day
    if (trendResult.pattern.includes('Isolated')) {
      return {
        summary: "Isolated low check-in detected after an established stable baseline.",
        whyThisResponse: "A single stressful day does not warrant alarm or administrative escalation. Gentle self-care preserves personal space without pathologizing normal human fluctuation.",
        signalsUsed: ["Current Mood: Low", "Historical Baseline: Stable (No multi-day decline)", "Escalation: None required"]
      };
    }

    // Default
    return {
      summary: "Balanced indicators with stable baseline.",
      whyThisResponse: "General supportive practice helps maintain resilience and consistent check-in habits.",
      signalsUsed: [`Mood: ${norm.mood}`, `Energy: ${norm.energyLevel}%`]
    };
  }
};
