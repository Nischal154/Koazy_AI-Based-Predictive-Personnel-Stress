# 🐨 KOAZY — AI-Powered Personnel Stress & Welfare Monitoring System
> **Smart India Hackathon (SIH 26186)**  
> *Predictive Behavioral Analytics, Voluntary Wellness Check-ins & Early-Intervention Support System for Armed Forces & CAPF Personnel*

---

## 🌟 Overview
**KOAZY** is a specialized, secure, and privacy-conscious mental wellbeing and stress monitoring platform developed to support personnel under demanding operational conditions (Armed Forces, CAPF, high-vigilance deployments).

It combines:
1. **Voluntary Daily Check-ins**: Personnel report state of mind, sleep duration, meal patterns, family safety, and operational focus.
2. **Predictive Behavioral Analytics Engine**: Multi-signal AI assessing burnout and stress risks proactively while safeguarding personnel anonymity.
3. **Adaptive Early Interventions**: Real-time delivery of stress-free calming exercises (Box Breathing, Sensory Grounding) and confidential CBT coping chat sessions.
4. **Emergency Support & SOS Dispatch**: One-touch 24/7 Helpline, silent panic triggers, and live emergency ambulance response tracking (`Android Large - 18` & `Android Large - 17`).
5. **Personal Wellbeing Analytics ("My Journal")**: Personal habit checklist, trackers, and wave activity charts.
6. **Welfare Officer Oversight Dashboard**: Aggregated unit trends, seasonal operational stress patterns, and cohort analytics.

---

## 📱 Core Features

### 1. Mobile Wellness & Daily Self-Assessment
* **Mood Assessment (`check_1`)**: 6 card-based states (*Great, Good, Okay, Confused, Sad, Stressed*) with friendly mascot guidance.
* **Multi-Signal Context (`check_2`)**: Operational factor categories (*Family, Deployment, Sleep, Workload, Duty*) plus voluntary daily health indicators:
  * 🌙 **Sleep Duration**: `< 5h (Deficit)`, `6-7h`, `8h+ Rested`
  * 🍲 **Food Intake**: `Regular Meals`, `Skipped Meal`, `Poor Appetite`
  * 🏡 **Family Safety / Well-being**: `Safe & Well`, `Family Concern`
* **Private Voice Notes & Reflections (`check_3`)**: Hold-to-record encrypted personal reflections and optional voice memos.

### 2. 🤖 Predictive Behavioral Analytics & Stress Risk Engine
* Identifies cognitive strain and fatigue patterns from combined voluntary indicators and operational factors.
* Real-time trigger: If elevated stress risk is identified, Screen 07 immediately alerts the personnel with a tailored recovery banner and a 1-click **CBT Coping Session** (`Screen 09`).

### 3. 🚨 Emergency Help & Ambulance Dispatch
* **Center Alert Button `(!)`**: Middle button on the floating bottom dock navigates straight to Emergency SOS.
* **Emergency Help Needed (`Android Large - 18`)**:
  * Coral **IMMEDIATE CONTACTS** badge.
  * Large glowing red SOS phone button with orbital animation (holding connects to the 24/7 Helpline `1800-555-KOAZY` with live audio waveform simulation).
  * 3 quick option cards: **Talk Now** (CBT chat), **Self-Help** (Breathing), and **Schedule Therapy**.
* **Ambulance & Quick Response Teams Away (`Android Large - 17`)**:
  * Vector route map with animated ambulance dispatch marker and ETA pill (`🚑 8 min · 2.8 km away`).
  * Floating Central Hospital bottom sheet with direct **Call Now** and encrypted **Message** capabilities.

### 4. 📊 Personal Records & "My Journal" (`Screen 10`)
* Timeframe selector: *Today, 7 Days, 30 Days, 3 Months*.
* 70% Progress Ring with mood log shortcut.
* Daily checklist with interactive counters: **Drink Up!** (water glasses), **Sleep Time**, **Meditation**.
* Visual trackers: **Sleep** and **Goals**.
* **My Activities Coral Wave Card**: Curved spline chart with emotion peak smileys (13:00 Happy, 1:00 Neutral, Tired dip).

### 5. 🛡️ Welfare Officer Dashboard (`Screen 13`)
* High-fatigue alerts and unit check-in compliance rates.
* **Seasonal & Climatic Operational Hazards**: High Altitude Winter (Hypoxia/Isolation), Monsoon Terrain, Desert Heatwave, Election Surge.
* **Cohort & Batch Breakdown**: Recruits (2024), Mid-Career (2020), Senior (2015).
* Confidential case management action plans.

---

## 🎨 UI Architecture & Design System
* **Typography**: Google Sans Flex & Plus Jakarta Sans.
* **Design Philosophy**: Card-based content layouts with pastel mood tones, rounded corners, soft shadows, and clean touch-friendly targets.
* **Device Emulation**: Dual view modes:
  * 📱 **Interactive Android Smartphone**: Real-time Android frame with gesture pill and live status bar.
  * 🗂️ **13-Screen Gallery Matrix**: Side-by-side inspection grid displaying all 13 primary application screens.
  * 🧠 **AI Engine & Judge Demo**: SIH evaluator suite displaying real-time decision logs, confidence scores, and case studies.

---

## 🚀 Running Locally

### Prerequisites
* Python 3.x (or any static HTTP server / Node.js)

### Start Development Server
```bash
# Clone the repository
git clone https://github.com/Nischal154/Koazy_AI-Based-Predictive-Personnel-Stress.git
cd Koazy_AI-Based-Predictive-Personnel-Stress

# Start local server
python -m http.server 5173
```
Then open `http://localhost:5173/` in your browser.

---

## 🔐 Privacy & Security (RBAC)
* Personnel check-ins can operate in anonymous mode to protect sensitive identities.
* Aggregated metrics for commanding/welfare officers never expose private textual notes or voice recordings.
* Compliant with voluntary participation principles and role-based access control.
