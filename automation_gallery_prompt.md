# Automation Art Gallery — Full Build Prompt
### For: Google Antigravity (or any AI coding assistant)

---

## Project Overview

Build a **personal professional portfolio website** for an Automation Engineer named **Osama K. Ellafi**, framed as an **Art Gallery** of automation projects. This is not a typical developer portfolio — it is a curated, museum-grade digital exhibition of n8n workflow automation projects. Every design and copy decision should commit to the gallery metaphor fully.

The site must be **dynamic**: Osama will continue adding new projects indefinitely through a built-in admin form. All workflow data must be stored and retrieved from **Firebase Firestore** (or equivalent Google-stack database) so the gallery updates in real time without any code changes.

The design language is adapted from **Autonomix** — Osama's automation company brand — applied to a personal context. The aesthetic is: **futuristic, clean, monochrome, intelligent**.

---

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + custom CSS variables
- **Animations**: Framer Motion
- **Database**: Firebase Firestore (for dynamic workflow data)
- **Auth**: Firebase Auth (Google sign-in) — for admin-only access to the submission form
- **Deployment**: Vercel
- **Fonts**: Load via Google Fonts — `Orbitron` (display/headings) and `Inter` (body copy)
- **Icons**: Lucide React or React Icons

---

## Brand Identity & Design System

Apply this design system consistently across every component. Do not deviate from it.

### Color Palette

```css
:root {
  /* Backgrounds */
  --bg-dark: #f5f6f8;           /* Page canvas — soft off-white */
  --bg-card: rgba(255, 255, 255, 0.8); /* Glass cards */

  /* Brand Colors (monochrome only — no color accents ever) */
  --primary: #0f1117;           /* Deep near-black charcoal — headings, CTAs, active elements */
  --secondary: #3b3f51;         /* Dark slate — secondary emphasis */
  --accent: #5a5f73;            /* Mid-tone gray — decorative, tertiary elements */

  /* Text */
  --text-main: #0f1117;         /* Primary copy */
  --text-dim: #6b7085;          /* Descriptions, secondary info, placeholders */

  /* Borders */
  --glass-border: rgba(15, 17, 23, 0.07);

  /* Admin / Status (the ONLY place non-monochrome is allowed) */
  --status-live: #16a34a;
  --status-draft: #d97706;
}
```

### Typography

- **Display / Headers**: `Orbitron`, `sans-serif` — uppercase, `letter-spacing: 0.05em`, used for ALL headings h1–h6, logo, buttons, labels, step numbers, badge text, nav links
- **Body**: `Inter`, `sans-serif` — used for all paragraph text, descriptions, metadata, form fields
- **Never mix** — if it's structural or labeling, it's Orbitron. If it's reading copy, it's Inter.
- Button text: Orbitron, `font-weight: 600`, `text-transform: uppercase`, `font-size: 0.8rem`, `letter-spacing: 0.1em`

### Glassmorphism — The Core Surface Language

Every card and container uses one of two glass variants:

**Standard Glass (`.glass`)**
```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(15, 17, 23, 0.07);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.glass:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border-color: rgba(15, 17, 23, 0.12);
}
```

**Premium Glass (`.glass-premium`)** — for hero-level feature cards
```css
.glass-premium {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid transparent;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.glass-premium:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 24px 52px rgba(0, 0, 0, 0.10);
  border-color: rgba(0, 0, 0, 0.05);
}
```

### Motion Principles

- Use Framer Motion `whileInView` with `viewport: { once: true }` for all scroll-triggered reveals
- Default entrance: `opacity: 0, y: 20` → `opacity: 1, y: 0`, duration `0.5s`
- Stagger siblings: `0.08s` delay per item
- Hover lifts: `translateY(-2px)`, `transition: 0.3s`
- Page-level reveals: slide from `x: -24` or `x: 24`
- Hero elements: sequential stagger — heading → tagline → stats bar → CTA buttons
- **All animations must feel physical, not decorative** — ease with `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- Respect `prefers-reduced-motion`

### Button Styles

```css
/* Primary */
.btn-primary {
  background: var(--primary);
  color: #ffffff;
  border-radius: 50px;
  padding: 12px 28px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  box-shadow: 0 4px 16px rgba(15, 17, 23, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15, 17, 23, 0.25); }

/* Outline */
.btn-outline {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(15, 17, 23, 0.12);
  border-radius: 50px;
  /* same typography as primary */
}
.btn-outline:hover { background: rgba(255, 255, 255, 0.9); border-color: rgba(15, 17, 23, 0.25); }
```

---

## Navigation — Floating Island Pill

```
Position: fixed, top: 20px, centered horizontally, z-index: 100
Shape: border-radius: 9999px, max-width: 720px
Default state: bg-white/50, backdrop-blur-md, no border
Scrolled state (>50px): bg-white/80, backdrop-blur-xl, subtle shadow, glass-border visible
Logo: "OSAMA" in var(--primary) Orbitron + small subtitle "Automation Engineer" in text-dim Inter 10px
Nav links: Terminal · Gallery · About · Contact (Orbitron, uppercase, text-dim, hover → text-primary)
Active link: text-primary with 3px dot indicator below (background: var(--primary), border-radius: 50%)
Admin link: hidden in nav — accessible only via /admin route when authenticated
```

---

## Page Structure & Sections

### SECTION 1 — The Entrance Hall (Hero)

**Concept:** A grand museum entrance. The visitor arrives to see a full-screen statement about who Osama is, with an animated live stats bar that immediately communicates the scale of the work.

**Layout:**
- Full viewport height (`100vh`)
- Background: `var(--bg-dark)` with a very subtle grid dot pattern overlay (CSS background-image, dots at `rgba(15,17,23,0.04)`, 24px spacing)
- A large decorative faint watermark behind the headline: the word `AUTOMATION` in Orbitron at `font-size: clamp(80px, 15vw, 180px)`, `color: rgba(15,17,23,0.025)`, absolutely positioned, centered

**Content (center-aligned, vertically centered):**

```
[Small label — Orbitron, 10px, letter-spacing: 0.3em, text-dim, uppercase]
OSAMA AUTOMATION ENGINEER · EST. 2020

[Main headline — Orbitron, clamp(2.5rem, 5vw, 4.5rem), font-weight: 800]
THE AUTOMATION
GALLERY

[Divider line — 48px, 3px, var(--primary) at 30% opacity, centered]

[Tagline — Inter, 18px, text-dim, max-width: 500px, centered]
A curated archive of real-world automation systems,
n8n workflows, and intelligent process engineering.

[Live Stats Bar — glass card, inline, centered, Framer Motion count-up on load]
  [ XX Workflows ] · [ XXX Nodes Deployed ] · [ XX Categories ] · [ XX% Avg. Automation ]

[CTA Buttons — staggered entrance]
  [ENTER THE GALLERY] (btn-primary)   [VIEW ABOUT] (btn-outline)
```

**Stats bar implementation:**
- Fetch aggregated stats from Firestore on page load (count of workflows, sum of total_nodes, average automation_percentage)
- Animate numbers counting up from 0 using Framer Motion `useMotionValue` + `animate` on mount
- Display inside a `.glass` pill container

**Scroll indicator:** A subtle animated chevron-down icon at the very bottom center, fading in after 2 seconds.

---

### SECTION 2 — The Gallery Hall (Main Project Grid)

**Concept:** The main exhibition floor. Visitors browse "exhibits" — each workflow is a framed artwork on the gallery wall.

**Header:**
```
[Section label — Orbitron 10px, tracking-widest, text-dim]  THE COLLECTION
[Section title — Orbitron, 2.5rem, font-weight: 700]         ALL EXHIBITS
[Section accent line — 48px, 3px, var(--primary)/30, centered]
```

**Filter & Search Bar:**
Place immediately below the header inside a `.glass` container, pill-shaped, sticky on scroll.
- Search input: `Inter`, placeholder "Search exhibits..." — searches workflow name + description + tags
- Filter chips (Orbitron, 10px, uppercase): ALL · HR AUTOMATION · ONBOARDING · COMPLIANCE · RECRUITMENT · OPERATIONS · INTEGRATIONS — and dynamically generated from tags in Firestore
- Sort dropdown: "Newest First" · "Oldest First" · "Most Complex" · "Highest Automation %" 
- On mobile: filters collapse into a drawer

**Workflow Cards Grid:**
Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, `gap: 28px`

Each **Workflow Card** is a `.glass-premium` panel with:

```
Card structure (border-radius: 24px, padding: 28px):

[TOP ROW]
  Left: Workflow ID badge  (Orbitron 9px, uppercase, glass pill,  e.g. "WF-001")
  Right: Trigger type badge (Orbitron 9px: "SCHEDULED" / "WEBHOOK" / "MANUAL" / "FORM")

[MINI NODE MAP — 180px tall SVG]
  A schematic SVG visualization of the workflow's node structure.
  Rendered from node_map_data (array of {label, type} objects in Firestore).
  Nodes as small rounded rectangles (8px radius), connected by thin lines.
  Node colors by type:
    - Trigger nodes: var(--primary) filled, white text
    - Action nodes: rgba(15,17,23,0.06) background, var(--primary) border, text-main
    - Integration nodes: rgba(15,17,23,0.03) background, dashed border
  On hover: the SVG subtly animates — nodes pulse with a soft opacity cycle (CSS keyframes)

[WORKFLOW NAME — Orbitron, 1rem, font-weight: 600, text-main, margin-top: 16px]
[DESCRIPTION — Inter, 0.85rem, text-dim, 2-line clamp, margin-top: 4px]

[METRICS ROW — 3 inline stats]
  [ X Nodes ] · [ XX% Automated ] · [ Category ]
  Font: Orbitron 9px, text-dim, tracking-wider

[TAGS — flex-wrap row of pills]
  Each tag: glass pill, Orbitron 9px, uppercase, text-secondary
  Max 3 visible, "+N more" pill if overflow

[CARD FOOTER — border-top: var(--glass-border), padding-top: 12px, margin-top: 16px]
  Left: Integration icons row (small 20px icons for Google Sheets, Gmail, Slack, etc.)
  Right: "VIEW EXHIBIT →" text link (Orbitron 9px, uppercase, text-dim → text-main on hover)
```

**Hover state:** Card lifts `translateY(-4px)`, shadow deepens, background becomes `rgba(255,255,255,0.95)`.

**Empty state:** When filters return no results, show a centered glass card: "No exhibits found. Try adjusting your filters."

**Pagination / Infinite Scroll:** Load 9 cards initially, infinite scroll loads 9 more as user approaches bottom. Show a subtle loading skeleton (animated shimmer) while fetching.

**Featured Exhibits:** Workflows marked `featured: true` in Firestore get a special treatment:
- A thin `2px solid var(--primary)` border on the card
- A small `FEATURED EXHIBIT` badge in Orbitron 9px at top-center
- These always appear first in the grid, regardless of sort order

---

### SECTION 3 — The Exhibit Room (Individual Workflow Detail Page)

**Route:** `/gallery/[workflow-id]`

**Concept:** Walking into a private room in the museum dedicated to a single artwork. Rich, immersive, detailed.

**Layout:** Single column, `max-width: 900px`, centered.

**Header block:**
```
[Breadcrumb — Orbitron 9px, text-dim]   Gallery  →  [Category]  →  [Workflow Name]
[Workflow ID — large watermark behind title, Orbitron, very faint]
[Title — Orbitron, clamp(2rem, 4vw, 3.5rem), font-weight: 800]
[Subtitle/Description — Inter, 1.1rem, text-dim, max-width: 640px]
[Meta row: trigger type · date added · node count · category]
```

**Content blocks (staggered Framer Motion entrances):**

**Block A — The Exhibit (Interactive Node Diagram)**
- A `.glass-premium` panel containing a full-width SVG node diagram
- The SVG is rendered from `node_map_data` stored in Firestore — more detailed than the card thumbnail
- Nodes are labeled with actual node names (e.g., "Google Sheets", "Gmail Send", "IF Condition")
- Arrows show data flow direction
- User can hover a node to see a tooltip with: node type, what it does in this workflow
- If a demo video URL is stored, show a "▶ WATCH DEMO" button overlay in the bottom-right of the diagram block

**Block B — The Story (Problem & Solution)**
Two-column `.glass` layout:
- Left: "THE PROBLEM" — Inter, description of what manual process this replaced
- Right: "THE SOLUTION" — Inter, how the automation solves it
- Both have small Orbitron uppercase section labels

**Block C — Impact Metrics**
4-stat grid of metric cards (`.glass` cards, `border-radius: 16px`):
- Hours Saved / Month
- Steps Automated
- Automation Percentage (circular progress ring — pure CSS SVG)
- Complexity Score (1–5 displayed as filled squares)

Each card: large Orbitron number, small Inter label below

**Block D — Technical Breakdown**
- Node types used: chips/pills with Lucide icons per integration type
- Trigger method: badge
- External services: list of connected apps with their logos
- Workflow complexity classification: BASIC / INTERMEDIATE · ADVANCED · EXPERT (Orbitron badge)

**Block E — Related Exhibits**
3 small cards linking to workflows in the same category. Label: "YOU MAY ALSO LIKE" in Orbitron.

**Navigation footer:** `← PREVIOUS EXHIBIT` and `NEXT EXHIBIT →` links, glass pill style.

---

### SECTION 4 — The Archive Index (Dense Data View)

**Route:** `/archive`

**Concept:** The museum's research library — a complete, searchable table of every workflow ever built.

**Header:** "THE ARCHIVE" · "Complete index of all automation exhibits"

**Table structure** (`.glass` container, full-width):
```
Columns (Orbitron 9px headers, uppercase):
  ID  |  Workflow Name  |  Category  |  Trigger  |  Nodes  |  Automation %  |  Date  |  Status  |  →
```
- Rows are Inter 13px
- Alternating row backgrounds: white / rgba(15,17,23,0.015)
- Clicking any row navigates to `/gallery/[id]`
- Sortable columns (click header to toggle asc/desc)
- Search filters the table in real time
- Status column: green dot "LIVE" or amber dot "DRAFT"
- Pagination: 20 rows per page, glass pill page controls

**Stats summary bar above table:**
Total exhibits · Total nodes · Categories · Date range covered — all from live Firestore aggregation

---

### SECTION 5 — The Curator (About)

**Route:** `/about` OR a section on the homepage (implement both — the section on the homepage is a teaser, full page at `/about`)

**Concept:** The museum director's note — authoritative, personal, forward-looking.

**Layout:** Two-column on desktop (text left, visual right)

**Left column content:**
```
[Section label — Orbitron 10px]   THE CURATOR
[Name — Orbitron 2rem, font-weight: 800]   OSAMA
[Title — Orbitron 1rem, text-dim]   AUTOMATION ENGINEER
[Divider line]
[Bio — Inter, paragraph text]
  [Placeholder — Osama to fill in: background, experience, philosophy about automation]

[Skills section — Orbitron 9px labels, grid of glass pills]
  n8n · Google Sheets · Make.com · Zapier · Firebase · REST APIs
  HR Systems · Process Mapping · Workflow Architecture

[Vision callout — .glass-premium card, border-left: 3px solid var(--primary)]
  "Building toward:"
  AUTONOMIX — Osama's upcoming automation company
  [Small link to company website]
```

**Right column:**
- A large `.glass-premium` card with a subtle animated background
- Key career stats presented as editorial data blocks
- OR: a timeline of major automation milestones (CSS-only vertical timeline)

---

### SECTION 6 — Contact

**Route:** Bottom of homepage + `/contact`

**Layout:** Centered, max-width 600px

**Content:**
```
[Section label]   GET IN TOUCH
[Heading]         START A CONVERSATION
[Subtext — Inter]  For collaboration, consulting, or just to talk automation.

[Social links row — glass pills]
  GitHub  ·  LinkedIn  ·  Email

[Contact form — .glass-premium container]
  Fields: Name · Email · Subject (dropdown: Collaboration / Consulting / Other) · Message
  Submit button: btn-primary "SEND MESSAGE"
  Form submits to a Firebase Firestore "messages" collection or EmailJS
```

---

### SECTION 7 — Footer

Identical to Autonomix brand footer, adapted for personal use:

```
Layout: CSS Grid, 3-column, single horizontal row on desktop

Left:   "OSAMA" in Orbitron text-3xl + "© 2025 Osama. All rights reserved." in Inter text-xs text-dim
Center: Navigation links in Orbitron tracking-[0.2em] uppercase text-dim:
        Gallery  ·  Archive  ·  About  ·  Contact
Right:  GitHub + LinkedIn icons (size 18px, text-dim, hover → text-main)
        + back-to-top ArrowUp button

Background: dark base (#0f1117), border-top: 1px solid rgba(255,255,255,0.04)
All footer text adapts: white/30 on dark background
Vertical padding: py-10 lg:py-12
RULE: The footer is ALWAYS a single horizontal row on desktop. Never multi-row. Never decorative.
```

---

## Admin Section — The Curator's Studio

**Route:** `/admin` (protected by Firebase Auth — Google sign-in only)

**Concept:** A private back-of-house studio where Osama adds new exhibits to the gallery. Clean, functional, no decorative excess — this is a working tool.

### Authentication
- Only Osama's Google account email can access `/admin`
- All other users are redirected to `/` with a toast: "Access restricted."
- Middleware-protected route in Next.js

### Admin Dashboard (`/admin`)

At a glance:
- Total workflow count
- Last workflow added (name + date)
- Drafts vs published count
- Quick action buttons: "ADD NEW EXHIBIT" · "VIEW GALLERY" · "MANAGE ALL"

Table of all existing workflows with Edit / Delete / Toggle Status actions.

### Add / Edit Workflow Form (`/admin/new` and `/admin/edit/[id]`)

This is the critical feature. The form must be comprehensive, well-labeled, and save directly to Firestore.

**Form Fields:**

```
━━━━ IDENTIFICATION ━━━━
  Workflow ID*            [text input — auto-suggested as "WF-XXX" based on count, editable]
  Workflow Name*          [text input]
  Short Description*      [textarea, max 160 chars, character counter]
  Long Description        [rich textarea or markdown editor for detail page]
  Status*                 [toggle: DRAFT / LIVE]
  Featured?               [checkbox: mark as featured exhibit]

━━━━ CLASSIFICATION ━━━━
  Category*               [select: HR Automation / Onboarding / Compliance / Recruitment /
                            Operations / Integrations / Finance / Other]
  Custom Category Tag     [text input — if "Other" selected above]
  Trigger Type*           [select: Scheduled / Webhook / Manual / Form / Email / API]
  Complexity Score*       [1–5 slider with labels: Basic / Intermediate / Advanced / Expert / Master]
  Tags                    [multi-tag input — comma-separated, displayed as pills]

━━━━ METRICS ━━━━
  Total Nodes*            [number input]
  Automation Percentage*  [number input 0–100, with % suffix]
  Steps Automated         [number input]
  Hours Saved Per Month   [number input, optional]
  Date Built / Deployed*  [date picker]

━━━━ NODE MAP DATA ━━━━
  Node Map Builder        [dynamic form — add/remove rows]
    Each row: [ Node Label (text) ] [ Node Type (select: trigger/action/integration/condition/output) ] [ Order (number) ]
  Node map generates the visual SVG diagram automatically from this data.
  Preview button: shows a live SVG preview of the node map as you build it.

━━━━ TECH STACK ━━━━
  Connected Services      [multi-select checkboxes: Google Sheets, Gmail, Slack, HTTP Request,
                            Notion, Airtable, Trello, WhatsApp, Discord, PostgreSQL,
                            MySQL, OpenAI, Twilio, GitHub, Make, Zapier, Other...]
  Primary Integration     [text input — the main external service]

━━━━ MEDIA ━━━━
  Demo Video URL          [URL input — YouTube or Loom link]
  Screenshot / Thumbnail  [file upload → Firebase Storage, or URL input]
  n8n JSON Export         [file upload → Firebase Storage, displayed as downloadable on exhibit page]

━━━━ STORY ━━━━
  The Problem             [textarea — what manual process did this replace?]
  The Solution            [textarea — how does the automation solve it?]
  Notes / Context         [textarea — optional curator's note]

━━━━ RELATED ━━━━
  Related Workflow IDs    [multi-tag input of WF-XXX IDs]
```

**Form UX requirements:**
- Save as Draft button (saves without validation, status = draft)
- Publish button (validates required fields, sets status = live)
- Auto-save every 30 seconds to a local localStorage draft
- Success toast: "Exhibit [Name] has been added to the gallery."
- Form validation: inline errors in Inter 12px red text below each field
- On edit: form pre-populates from Firestore document

---

## Firestore Data Schema

```javascript
// Collection: "workflows"
// Document ID: workflow_id (e.g., "WF-001")

{
  // Identification
  workflow_id: "WF-001",               // string
  name: "Employee Onboarding Flow",    // string
  short_description: "...",            // string, max 160 chars
  long_description: "...",             // string (markdown)
  status: "live",                      // "live" | "draft"
  featured: false,                     // boolean

  // Classification
  category: "Onboarding",             // string
  trigger_type: "Webhook",            // string
  complexity_score: 4,                // number 1–5
  tags: ["hr", "onboarding", "docs"], // string[]

  // Metrics
  total_nodes: 18,                    // number
  automation_percentage: 87,          // number 0–100
  steps_automated: 12,                // number
  hours_saved_per_month: 6,           // number | null
  date_built: "2024-03-15",          // ISO date string

  // Node Map (drives SVG rendering)
  node_map_data: [
    { label: "Webhook Trigger", type: "trigger",     order: 1 },
    { label: "Get Employee Data", type: "action",    order: 2 },
    { label: "IF: Has NDA?",      type: "condition", order: 3 },
    { label: "Send NDA Email",    type: "integration", order: 4 },
    { label: "Update Sheet",      type: "output",    order: 5 }
  ],

  // Tech Stack
  connected_services: ["Gmail", "Google Sheets", "HTTP Request"], // string[]
  primary_integration: "Google Sheets",  // string

  // Media
  demo_video_url: "https://...",      // string | null
  thumbnail_url: "https://...",       // string | null
  json_export_url: "https://...",     // string | null (Firebase Storage URL)

  // Story
  problem: "HR team manually sent...", // string
  solution: "The workflow automatically...", // string
  notes: "...",                        // string | null

  // Relations
  related_workflow_ids: ["WF-003", "WF-007"], // string[]

  // Timestamps
  created_at: Timestamp,
  updated_at: Timestamp
}

// Collection: "site_stats" (single document "global")
{
  total_workflows: 31,
  total_nodes: 412,
  categories: ["HR Automation", "Onboarding", ...],
  last_updated: Timestamp
}

// Collection: "contact_messages"
{
  name: string,
  email: string,
  subject: string,
  message: string,
  submitted_at: Timestamp,
  read: false
}
```

---

## SVG Node Map Rendering Logic

This is a core visual feature. Implement a `NodeMapSVG` React component that:

1. Accepts `node_map_data: NodeMapItem[]` as a prop
2. Sorts by `order` field
3. Renders nodes as a horizontal or vertical flow depending on count:
   - 1–4 nodes: horizontal left-to-right
   - 5–8 nodes: horizontal with line wrap (2 rows)
   - 9+ nodes: vertical top-to-bottom
4. Node visual styles by type:
   - `trigger`: filled `var(--primary)` rectangle, white Orbitron text
   - `action`: white fill, `var(--primary)` border, Inter text
   - `integration`: dashed border, `rgba(15,17,23,0.03)` fill
   - `condition`: diamond shape (rotated square), amber-ish border
   - `output`: double border (inner + outer), slightly rounded
5. Connecting arrows: thin lines with arrowhead markers, `var(--text-dim)` color
6. The card thumbnail version: simplified, no text labels, just node shapes + connections
7. The detail page version: full labels, tooltips on hover, larger sizing

---

## Additional Requirements & Rules

### Content Rules
- All section labels: `Orbitron`, `font-size: 10px`, `letter-spacing: 0.3em`, `text-transform: uppercase`, `color: var(--text-dim)` — these are the "museum placard" labels
- All headings: `Orbitron`, bold, `text-main`
- All body paragraphs: `Inter`, `color: var(--text-dim)` or `text-main`
- Gallery vocabulary throughout: "exhibits" not "projects", "collection" not "portfolio", "curator" not "author", "enter the gallery" not "view work"

### Performance
- Use Next.js Image component for all images
- Firestore queries must use pagination (limit + startAfter) — never fetch all documents at once
- Lazy load the detail page node diagram SVG
- Implement React.Suspense for all data-dependent sections
- ISR (Incremental Static Regeneration) for the gallery grid — revalidate every 60 seconds

### Responsiveness
- Desktop-first design (optimized for 1280px+) but fully responsive down to 375px
- Mobile: single column grid, filters in a bottom drawer, floating nav collapses to hamburger icon
- The floating island nav on mobile becomes a full-width pill at `calc(100% - 32px)`

### SEO
- Each workflow detail page must have:
  - `<title>`: `[Workflow Name] — Osama's Automation Gallery`
  - `<meta description>`: the `short_description` field
  - Open Graph image: auto-generated from workflow thumbnail or a default branded OG image
- Implement `sitemap.xml` that dynamically includes all live workflow pages

### Accessibility
- All interactive elements must have `aria-label`
- Focus states: `outline: 2px solid var(--primary)`, `outline-offset: 2px`
- Color contrast: all text must meet WCAG AA against its background
- SVG diagrams: include `role="img"` with `aria-label` describing the workflow

---

## File Structure

```
/
├── app/
│   ├── page.tsx                    ← Homepage (Hero + Gallery + About teaser + Contact)
│   ├── gallery/
│   │   └── [id]/
│   │       └── page.tsx            ← Exhibit Room detail page
│   ├── archive/
│   │   └── page.tsx                ← Archive Index table
│   ├── about/
│   │   └── page.tsx                ← Full About / Curator page
│   ├── admin/
│   │   ├── page.tsx                ← Admin dashboard
│   │   ├── new/
│   │   │   └── page.tsx            ← Add workflow form
│   │   └── edit/
│   │       └── [id]/
│   │           └── page.tsx        ← Edit workflow form
│   └── layout.tsx                  ← Root layout with Nav + Footer
│
├── components/
│   ├── ui/
│   │   ├── GlassCard.tsx
│   │   ├── NodeMapSVG.tsx          ← The SVG node map renderer
│   │   ├── WorkflowCard.tsx
│   │   ├── FilterBar.tsx
│   │   ├── MetricCard.tsx
│   │   ├── AutomationRing.tsx      ← Circular progress SVG
│   │   ├── StatsBanner.tsx         ← Animated live stats bar
│   │   └── TagPill.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── admin/
│   │   ├── WorkflowForm.tsx        ← The full add/edit form
│   │   ├── NodeMapBuilder.tsx      ← Dynamic row builder for node_map_data
│   │   └── FormField.tsx
│   └── sections/
│       ├── HeroSection.tsx
│       ├── GallerySection.tsx
│       ├── AboutSection.tsx
│       └── ContactSection.tsx
│
├── lib/
│   ├── firebase.ts                 ← Firebase initialization
│   ├── firestore.ts                ← All Firestore query functions
│   └── auth.ts                     ← Firebase Auth helpers
│
├── hooks/
│   ├── useWorkflows.ts             ← Firestore real-time hooks
│   └── useStats.ts                 ← Aggregated stats hook
│
└── types/
    └── workflow.ts                 ← TypeScript interfaces for all data models
```

---

## Starter Data

Pre-seed Firestore with at minimum 3 sample workflow documents to demonstrate the gallery is populated and functional from first run. Use plausible n8n automation examples (e.g., Employee Onboarding Flow, Incident Report Processor, Contract Generation Pipeline) with realistic metrics and at least 5 nodes each in the node_map_data.

---

## What NOT to Do

- ❌ Do NOT use any color accents (no blue, green, red, purple) anywhere except status indicators in the admin panel
- ❌ Do NOT use stock photography or illustration placeholders — SVG node maps are the visual content
- ❌ Do NOT use `box-shadow` with colored glows — shadows are always `rgba(0,0,0,X)` only
- ❌ Do NOT hardcode workflow data — everything must come from Firestore
- ❌ Do NOT skip the admin form — it is a core requirement, not optional
- ❌ Do NOT use more than 2 font families (Orbitron + Inter only)
- ❌ Do NOT make the footer multi-row on desktop
- ❌ Do NOT use decorative circles, rings, or blobs as background elements
- ❌ Do NOT make the floating navbar full-width on desktop

---

*End of prompt. Build this as a production-ready Next.js application.*
