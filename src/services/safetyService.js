// KOAZY Safety Service - Interactive Emergency Calling, Silent SOS & Audit Logging (Demo Mode)

const SAFETY_EVENTS_KEY = 'koazy_safety_events';

let activeCallState = {
  isActive: false,
  timerInterval: null,
  seconds: 0,
  targetNumber: '1800-555-KOAZY',
  targetName: '24/7 Armed Forces & CAPF Tele-Support Helpline'
};

export const SafetyService = {
  getEvents() {
    const raw = localStorage.getItem(SAFETY_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  logEvent(type, title, detail, isDemo = true) {
    const events = this.getEvents();
    const event = {
      id: 'EVT-' + Date.now(),
      timestamp: Date.now(),
      timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type, // 'CRISIS_DETECTED', 'PROTOCOL_ACTIVATED', 'DEMO_ACTION', 'ALERT_CREATED', 'SOS_TRIGGERED', 'CALL_ACTIVE'
      title,
      detail,
      isDemo
    };
    events.unshift(event);
    localStorage.setItem(SAFETY_EVENTS_KEY, JSON.stringify(events.slice(0, 40)));
    return event;
  },

  clearEvents() {
    localStorage.removeItem(SAFETY_EVENTS_KEY);
  },

  /**
   * Starts a simulated interactive telephone call
   */
  startSimulatedCall(number = '1800-555-KOAZY', name = '24/7 Armed Forces & CAPF Tele-Support') {
    if (activeCallState.timerInterval) clearInterval(activeCallState.timerInterval);

    activeCallState.isActive = true;
    activeCallState.seconds = 0;
    activeCallState.targetNumber = number;
    activeCallState.targetName = name;

    this.logEvent(
      'CALL_ACTIVE',
      `Live Call Connected: ${name}`,
      `Dialed ${number}. Secure military tele-counseling channel established. (Demo Mode: Simulated Call)`
    );

    return activeCallState;
  },

  endSimulatedCall() {
    if (activeCallState.timerInterval) {
      clearInterval(activeCallState.timerInterval);
      activeCallState.timerInterval = null;
    }
    const duration = activeCallState.seconds;
    activeCallState.isActive = false;

    this.logEvent(
      'DEMO_ACTION',
      'Call Terminated',
      `Call with ${activeCallState.targetName} ended. Duration: ${duration}s. Post-call welfare check scheduled.`
    );

    return duration;
  },

  getCallState() {
    return activeCallState;
  },

  /**
   * Dispatches a discrete, high-priority Silent SOS Alert
   */
  triggerSilentSOS(location = 'Sector Delta, Outpost 4 (34°12\'N 77°35\'E)') {
    const event = this.logEvent(
      'SOS_TRIGGERED',
      '🚨 SILENT SOS EMERGENCY TRIGGERED',
      `Discrete panic alert activated from ${location}. Unit QRT, Base Medical Officer, and Welfare Officer alerted instantly.`
    );
    return event;
  },

  /**
   * Dispatches Emergency Medical Assistance request
   */
  triggerMedicalDispatch(unitSector = 'Sector Delta Base Hospital') {
    const event = this.logEvent(
      'DEMO_ACTION',
      '🚑 Emergency Medical / Ambulance Dispatch Initiated',
      `Direct dispatch ticket #MED-${Date.now().toString().slice(-4)} routed to ${unitSector}. Base Medical Officer Dr. Sunita Rao notified.`
    );
    return event;
  },

  /**
   * Dispatches standard demo actions
   */
  triggerDemoAction(actionType, personnelName = 'Sara Sharma') {
    switch (actionType) {
      case 'family':
        return this.logEvent(
          'DEMO_ACTION',
          'DEMO: Family Contact Call Initiated',
          `Simulated outbound call to designated family contact for ${personnelName}. (Demo Mode: No real call placed)`
        );
      case 'medical':
        return this.triggerMedicalDispatch();
      case 'officer':
        return this.logEvent(
          'ALERT_CREATED',
          'DEMO: Priority Welfare Officer Alert Generated',
          `Confidential priority safety notification queued for Unit Welfare Officer Capt. R. Deshmukh.`
        );
      case 'listener':
        return this.logEvent(
          'DEMO_ACTION',
          'DEMO: Peer Listener Direct Connection',
          `Peer listener Manoj K. notified for discreet, supportive check-in.`
        );
      default:
        return this.logEvent('DEMO_ACTION', 'DEMO Action', `Action ${actionType} recorded.`);
    }
  }
};
