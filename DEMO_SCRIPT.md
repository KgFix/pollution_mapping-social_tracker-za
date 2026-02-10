# VukaMap Demo Video Script
**Intwana Yase Kasi – Innovation Challenge 2026**

**Duration:** ~4-5 minutes  
**Style:** Professional, human, impact-focused with technical depth  
**Flow:** Problem → Solution → Demo → Impact

---

## Opening (0:00 - 0:30)

**[VISUAL: Pan across a township with visible litter hotspots, transition to opening screen]**

**SPEAKER:**

"Every day in our townships, we walk past the same illegal dumpsites. The same overflowing corners. The same broken systems. We see it. We talk about it. But nothing changes.

What if we could turn that frustration into action? What if cleaning up the Kasi became a competitive sport?

I'm [Your Name], and this is **VukaMap** — where we wake up the map, and clean up the Kasi."

---

## The Problem (0:30 - 1:10)

**[VISUAL: Show split screen - dirty locations vs. VukaMap heatmap prototype]**

**SPEAKER:**

"Traditional waste reporting systems are broken. They're slow, bureaucratic, and disconnected from the people who live with the problem every day.

Meanwhile, our youth have smartphones in their pockets, and a drive to connect with others. We are social creatures by nature, and, if given the right tools, can make caring for our earth a community driven collaboration

VukaMap transforms environmental cleanup from a civic duty into a high-stakes game. We're not just tracking waste. We're building a movement where every cleaned corner is a conquered zone, every piece of litter removed is a point scored, and every community member becomes a Kasi Hero."

---

## The Solution - Core Concept (1:10 - 2:00)

**[VISUAL: Animated diagram showing the 3-step loop]**

**SPEAKER:**

"VukaMap works on a simple three-step loop that anyone can jump into:

**Step 1: SPOT.** You see a polluted area in your neighborhood. You open VukaMap, snap a photo, and submit. Our system analyzes the image for severity, tags it with GPS coordinates, and drops a red hotspot on the map. That location is now live — visible to everyone in the community.

**Step 2: RESOLVE.** The user, a different user, or a cleanup squad accepts the mission. They clean the site, take an 'after' photo, and submit it. Here's where the tech gets interesting: we use GPS proximity verification. The system checks if you're within 50 meters of the original hotspot using Haversine distance calculations. No fake submissions. No cheesing the system.

**Step 3: RANK.** Once verified, the hotspot turns green. Eco-credits are awarded based on the severity of the cleanup. These credits fuel a competitive leaderboard — individual users, neighborhoods, even entire cities competing to be the greenest."

---

## Live Demo (2:00 - 3:30)

**[VISUAL: Screen recording of the actual application]**

**SPEAKER:**

"Let me show you how it works in action.

**[Navigate to Map View]**

This is the heart of VukaMap — an interactive heatmap of South Africa built with Leaflet.js. Each red marker is an active pollution hotspot reported by someone in that community. The green ones? Those are victories. Resolved sites where someone took action.

**[Click on a red hotspot]**

When you click a hotspot, you see the before photo, the severity score, the eco-credits waiting to be claimed, and how long it's been there. This is transparency. This is urgency.

**[Navigate to Report View]**

Reporting is dead simple. Tap 'Report Problem,' enable location access, and either capture a photo or upload one. Behind the scenes, we're storing metadata — GPS coordinates, timestamps, the user's city — all in a relational database managed with Entity Framework Core.

**[Show the AI scanning animation]**

This animation simulates our vision for AI-powered severity scoring. In production, this would analyze waste type, volume, and environmental risk.

**[Navigate to Leaderboard View]**

Now here's where gamification kicks in. The leaderboard has three tabs: Top Users, Top Cities, and Nearby Heroes. This isn't just about individual glory — it's about provincial pride. Cape Town vs. Gauteng. Durban vs. Soweto. Healthy competition that drives real-world results.

**[Navigate to Events View]**

VukaMap also supports organized cleanup events. Community groups can schedule squads, set attendee limits, and track participation. When you join an event, your profile reflects it, building your reputation as a Kasi Hero.

**[Navigate to Profile View]**

Finally, your profile. This is your impact dashboard — total eco-credits earned, kilograms of waste removed, national ranking, and a timeline of every action you've taken. It's your portfolio of environmental citizenship."

---

## Technical Implementation (3:30 - 4:10)

**[VISUAL: Split screen showing code/architecture diagram]**

**SPEAKER:**

"Under the hood, VukaMap is a full-stack web application built for scale and mobile-first design.

The frontend is Next.js 15 with React 19 and TypeScript — server-side rendering for performance, modern component architecture for maintainability, and Tailwind CSS for a responsive design that works flawlessly on the devices our users actually have.

The backend is ASP.NET Core Web API running on .NET 9. We're using Entity Framework Core for code-first database management with SQLite for development — though we're ready to migrate to PostgreSQL or Azure SQL for production.

The data model is relational: Users, Hotspots, Cleanup Events, Timeline Entries, and Event Registrations — all tied together with foreign keys and composite indexes for query performance.

GPS verification uses the Haversine formula to calculate real-world distance between coordinates. Image uploads are stored in a static file system for the MVP, with cloud storage integration planned.

And critically — everything is mobile-first. We're designing for 100-viewport-height layouts, touch interactions, and low-data environments because that's the reality of township connectivity."

---

## Impact & Vision (4:10 - 4:50)

**[VISUAL: Montage of clean neighborhoods, youth engaged, community celebrations]**

**SPEAKER:**

"VukaMap isn't just an app. It's a movement.

For **residents**, it restores pride. You're not waiting for someone else to fix your neighborhood — you're the one making it happen, and the entire community sees your name on that leaderboard.

For **local government**, it's a data goldmine. Municipalities get high-granularity maps showing exactly where waste collection is failing, where resources need to go, and which communities are leading the charge.

And for **the youth**, it's proof that their voices matter. That they can use the technology in their hands to create measurable change. That being from the Kasi doesn't mean you're powerless — it means you're the solution.

Our vision? To expand beyond waste. Water quality monitoring. Pothole reporting. Spaza shop supply chain optimization. VukaMap is a platform for civic engagement. This is just the beginning."

---

## Closing (4:50 - 5:00)

**[VISUAL: VukaMap logo with tagline]**

**SPEAKER:**

"VukaMap. Wake up the map. Clean up the Kasi.

Let's turn every township into a leaderboard. Let's make our communities the competition.

Thank you."

**[VISUAL: Fade to project links, GitHub repo, team credits]**

---

## Technical Notes for Recording

- **B-Roll Suggestions:**
  - Screen recordings of all 5 views in sequence
  - Close-ups of hotspot interactions, submissions, leaderboard transitions
  - Code snippets (zoomed in): Haversine calculation, API endpoints, component structure
  - Architecture diagrams (hand-drawn or digital)
  
- **Music:** Upbeat but not distracting. South African Amapiano or Afrobeat at low volume.

- **Pacing:** 
  - Problem/Solution sections: conversational, slightly slower
  - Demo section: energetic, show multiple features quickly
  - Technical section: confident but not rushed — you're showing expertise
  - Impact section: inspirational, build to the vision

- **Authenticity Tips:**
  - Use "Kasi" naturally (don't over-explain it)
  - Mention specific township names if relevant to your testing
  - Show genuine passion for the community impact, not just the tech
