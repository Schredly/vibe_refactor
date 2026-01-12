# Vibe Refactor - Design Guidelines

## Design Approach
**System:** Linear + Notion-inspired productivity tool aesthetic
**Rationale:** This wizard-based MVP planning application requires clarity, efficiency, and information hierarchy over visual flair. Users need to focus on capturing requirements, not be distracted by decorative elements.

## Typography System
- **Primary Font:** Inter (via Google Fonts CDN)
- **Display (Steps, Headers):** 28px / font-semibold
- **Section Titles:** 20px / font-semibold
- **Body Text:** 15px / font-normal
- **Small/Meta:** 13px / font-medium
- **Code/Prompts:** JetBrains Mono, 14px

## Layout & Spacing
**Spacing Scale:** Use Tailwind units of 2, 4, 6, 8, 12, 16, and 24 exclusively
- Card padding: p-6 to p-8
- Section gaps: gap-6 to gap-8
- Page margins: px-8 to px-12
- Vertical rhythm: space-y-6 between major sections

**Grid System:**
- Sidebar: Fixed 280px width
- Main content: max-w-4xl centered
- Wizard steps: max-w-3xl for optimal readability
- Question cards: Full width within container

## Component Architecture

### Navigation & Layout
**Left Sidebar:**
- Fixed position, full height
- Logo + app name at top (py-6)
- Project list with hover states
- "New Project" button (prominent)
- Settings at bottom
- Dividers between sections (border-t with subtle treatment)

**Top Progress Bar:**
- Fixed to top of main content area
- 5 steps with connecting lines
- Active step highlighted
- Completed steps with checkmark icons
- Numbered circles for each step

### Wizard Steps

**Step 1: Load Script**
- Three large option cards (Upload / Paste / Google Drive)
- Icon + title + description pattern
- Active state with border treatment
- File drop zone with dashed border
- Question preview list with edit controls
- Reorder handles (drag icon on left)

**Step 2: Capture Answers**
- Question cards in vertical stack (space-y-4)
- Each card contains:
  - Question number badge (top-left)
  - Question text (prominent)
  - Recording controls (icon buttons in row)
  - Collapsible answer area (starts collapsed if answered)
  - Timestamp and status indicator
- Recording state: Pulsing red indicator
- Waveform visualization during recording
- Keyboard shortcut hints (subtle, top-right)

**Step 3: Review & Summarize**
- Large content card with sections
- Section headers with edit icons
- Inline editing mode with textarea
- Action buttons row at top
- Status badge ("Draft" / "Agreed")
- Warning banner if generating prompts without agreement

**Step 4: Generate Build Pack**
- Accordion sections for each category
- Section header with icon + count of prompts
- Each prompt in card with:
  - Title + copy button
  - Markdown content preview
  - Edit and regenerate buttons
- "Copy Master Prompt" floating action (sticky top)

**Step 5: Create App**
- Hero-style card with large icon
- Step-by-step instructions (numbered list)
- Primary action button (prominent)
- Export options below (secondary buttons)
- Quality check warnings if applicable

### UI Components

**Buttons:**
- Primary: Solid with medium height, rounded-lg
- Secondary: Border with transparent background
- Icon-only: Square with hover background
- Record button: Circular, red accent when active
- Sizes: Small (h-8), Medium (h-10), Large (h-12)

**Cards:**
- Base: Rounded-xl, subtle border, shadow-sm on hover
- Padding: p-6 standard, p-8 for emphasis cards
- Nested cards: p-4 with reduced shadow

**Form Inputs:**
- Consistent height (h-10 for text inputs)
- Rounded-lg borders
- Focus states with ring treatment
- Labels above inputs (text-sm, font-medium)

**Badges & Tags:**
- Small rounded pills (px-3, py-1)
- Status colors: Draft, Agreed, Recording, Completed
- Number badges: Circular, small (w-6 h-6)

**Collapsible Sections:**
- Chevron icon rotates on expand
- Smooth height transition
- Subtle border on expanded state
- Content padding: p-4 when expanded

### Recording Interface
- Large circular record button (center of question card)
- Live transcript area below (monospace font, subtle background)
- Waveform visualization (animated bars)
- Timer display (MM:SS format)
- Control buttons: Record, Stop, Re-record, Edit
- Visual feedback: Recording state uses pulsing animation

### Dark Mode Considerations
- Toggle in top-right of app
- Smooth theme transition
- Consistent contrast ratios
- Adjusted shadow depths for dark backgrounds
- Inverted accent colors where needed

## Animations
**Minimal Approach:**
- Smooth page transitions between wizard steps (slide effect)
- Recording pulse animation only
- Accordion expand/collapse (200ms ease)
- Button hover scale (subtle, 1.02x)
- Copy confirmation toast (slide up from bottom)
- NO scroll animations, parallax, or decorative motion

## Images
**No hero images needed.** This is a utility application focused on workflow efficiency. All visual communication happens through:
- Icons from Heroicons CDN (outline style)
- Status indicators
- Recording visualizations
- Clean typography hierarchy

The interface should feel like a professional tool - clean, efficient, and distraction-free.