# Salon Queue Management System

**Deployment:** Vercel-ready (Vite SPA)
**Staff PIN / Access:** No PIN required (Quick Switcher on top navbar allows instant switching between Customer Phone, Receptionist Tablet, Barber Mirror, Waiting Area TV, and Owner Admin).

---

## About the Project
Royal Cuts Salon & Spa is a modern, responsive Salon Queue Management System designed specifically to eliminate chaotic weekend waiting times in busy hair salons and grooming centers.

Built following the **Vibe Coding MSc IT Lab Handout** guidelines, this application provides dedicated real-time interfaces for customers, receptionists, barbers, and a waiting lounge TV display.

### Key Highlights
- **Real-Time Cross-Window Synchronization**: Zero backend latency synchronization using the `BroadcastChannel` API and reactive LocalStorage bus. Opening customer, reception, barber, and TV screens across multiple browser tabs/windows keeps all statuses in sync instantly (< 50ms).
- **Premium Salon Aesthetic**: Custom theme engineered around Charcoal (`#1F2937`) and Regal Gold (`#D4A017`) with smooth transitions and minimum 44px touch targets.
- **Full Bilingual Localization**: Complete toggle between **English** and **Gujarati (ગુજરાતી)** across every label, status, service, and alert.
- **Audio Chime & Phone Vibration**: Native Web Audio API chime sounds when a ticket is called on the TV display, paired with `navigator.vibrate` on customer smartphones.
- **Strict Queue Business Rules**:
  - First-Come, First-Served (FIFO) dispatch.
  - Barber preference respect: Calling next for Barber X never grabs a customer waiting specifically for Barber Y.
  - Duplicate phone check prevents one customer from hoarding multiple active queue spots.
  - Emergency master switch to pause online queue joining while still allowing walk-ins.

---

## The 7 App Screens

| # | Screen | Route | Target Device | Key Capabilities |
|---|--------|-------|---------------|------------------|
| 1 | **Customer Home** | `/` | Smartphone / Desktop | Live waiting count, wait time estimate, barber status chips, Join Queue CTA |
| 2 | **Join Queue** | `/join` | Smartphone | Name, 10-digit phone validation, 3-service max picker, barber choice, live price & wait summary |
| 3 | **My Status** | `/status/:id` | Smartphone | Large token badge, position countdown, "Start coming" alert at 2nd in line, pulsing full-screen gold celebration alert |
| 4 | **Reception Dashboard** | `/reception` | 10" Tablet Landscape | Barber cards with progress bars, arrival-ordered queue list, amber highlight (> 60m), "+ Add walk-in" modal |
| 5 | **Barber View** | `/barber/:name` | Smartphone Mirror | Active client, service timer (`mm:ss`), big Start/Done buttons, "Next for you" preview, Break toggle |
| 6 | **Waiting Area TV** | `/display` | Wall TV (5m view) | Active stations with "Now Serving", Up Next 5 tokens, flashing gold banner + audio chime on call |
| 7 | **Owner Settings** | `/admin` | Laptop / Tablet | Service catalog editor (EN/GU, prices, durations), barber duty toggles, online queue pause switch, business analytics |

---

## Quick Start (Run Locally)

```bash
# 1. Clone or navigate to the directory
cd salon-queue

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in your browser
http://localhost:5173
```

To test cross-device synchronization:
1. Open `http://localhost:5173/#/` in Window 1 (Customer view).
2. Open `http://localhost:5173/#/reception` in Window 2 (Receptionist view).
3. Open `http://localhost:5173/#/display` in Window 3 (TV view).
4. Join the queue in Window 1 and watch it appear in Window 2 and Window 3 simultaneously!

---

## Running Verification Tests

To verify that all dispatch algorithms, barber preference filtering, waiting time formulas, and phone validation rules pass:

```bash
node tests/verifyRules.js
```

---

## Deployment to Vercel

This app is production-ready for deployment on Vercel:

```bash
# Build production bundle
npm run build

# Deploy via Vercel CLI or import repository on https://vercel.com
vercel deploy --prod
```
The output directory is `dist`, pre-configured for Vite.
