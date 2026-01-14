import type { Project, Question, DetailedSummary, PromptBundle } from "@shared/schema";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function createQuestion(text: string, answerText: string): Question {
  return {
    id: generateId(),
    text,
    answerText,
    createdAt: new Date().toISOString(),
  };
}

// ============================================
// DEMO 1: Facilities Management Application
// ============================================
const facilitiesQuestions: Question[] = [
  createQuestion(
    "What is the core purpose of this application?",
    "We need a facilities management application for our corporate office building. The main goal is to help facility managers track and manage work orders, schedule preventive maintenance, and handle space allocation for meeting rooms and workspaces. We have about 500 employees across 5 floors and need to manage everything from HVAC issues to desk booking."
  ),
  createQuestion(
    "Who are the primary users of this application?",
    "There are three main user types. First, facility managers who need a dashboard to see all open work orders, maintenance schedules, and space utilization metrics. Second, building maintenance staff who receive and complete work orders on their mobile devices. Third, regular employees who submit maintenance requests and book meeting rooms or hot desks."
  ),
  createQuestion(
    "What are the must-have features for the MVP?",
    "For the MVP we absolutely need a work order submission system where employees can report issues like broken AC, lighting problems, or plumbing issues. We need a maintenance staff mobile view to accept and complete work orders. A simple meeting room booking system is essential - just show available rooms on a floor plan and let people book for up to 2 hours. Finally, we need basic reporting showing how many work orders are open, average resolution time, and room utilization."
  ),
  createQuestion(
    "What features can be deferred to later versions?",
    "We can defer advanced features like IoT sensor integration for automatic issue detection, predictive maintenance algorithms, complex billing for shared spaces, visitor management, and integration with our existing ERP system. Also, detailed energy monitoring and sustainability tracking can come later."
  ),
  createQuestion(
    "What does the ideal user flow look like for reporting an issue?",
    "An employee opens the app, clicks Report Issue, selects the floor and zone from a dropdown, picks a category like HVAC, Electrical, Plumbing, or Furniture, types a brief description, optionally attaches a photo, and submits. They immediately get a ticket number. The system auto-assigns based on category to the right maintenance person who gets a push notification. The employee can track status and gets notified when resolved."
  ),
  createQuestion(
    "How should meeting room booking work?",
    "Users select a date and time range, see a visual floor plan showing which rooms are available in green and booked in red, tap an available room to see capacity and amenities like projector and whiteboard, then confirm booking. They should be able to see their upcoming bookings and cancel if needed. No complex recurring booking for MVP - just single bookings. Maybe a 15-minute auto-cancel if no one checks in."
  ),
  createQuestion(
    "What data or integrations are needed?",
    "For MVP, we need a basic database of our floors, zones, room inventory with capacity and amenities, and a list of maintenance staff with their specialties. We need email notifications to work. Later we might integrate with Outlook calendar for room bookings and our HR system for employee directory, but for MVP simple email/password login is fine."
  ),
  createQuestion(
    "Are there any compliance or security requirements?",
    "Standard corporate security - all data must be encrypted, proper authentication, role-based access so regular employees cant see all work orders or modify room settings. Maintenance logs should be retained for at least one year for audit purposes. Nothing super specialized for facilities management."
  ),
  createQuestion(
    "What does success look like for this MVP?",
    "Success means facility managers spend less time on phone calls and email about maintenance issues. We want to reduce average work order resolution time from 3 days to under 24 hours for non-critical issues. Room booking conflicts should drop to near zero. If we can show 80% adoption among employees within the first month, that would be great."
  ),
  createQuestion(
    "Any specific design or branding requirements?",
    "Clean and professional look that matches our corporate branding - we use blues and grays. The interface needs to be very simple since not everyone is tech-savvy. Mobile-first for employees submitting issues, but facility managers mostly use desktop. Dashboard should have clear visual indicators - green yellow red for status. No fancy animations, just functional and fast."
  ),
];

const facilitiesDetailedSummary: DetailedSummary = {
  oneSentenceDefinition: "FacilityHub is a facilities management platform that enables employees to submit maintenance requests and book meeting rooms, while providing facility managers with real-time visibility into work orders, space utilization, and team workload across a 5-floor corporate office.",
  mvpScope: {
    includes: [
      "Work order submission system with category selection (HVAC, Electrical, Plumbing, Furniture)",
      "Photo attachment capability for issue documentation",
      "Automatic ticket assignment based on issue category",
      "Email notifications for ticket updates and resolution",
      "Visual floor plan for meeting room booking",
      "Room availability display with capacity and amenities",
      "Single-booking system (no recurring bookings)",
      "15-minute auto-cancel for no-shows",
      "Facility manager dashboard with open work orders and metrics",
      "Maintenance staff mobile view for accepting and completing work orders",
      "Basic reporting: open tickets, resolution time, room utilization",
      "Role-based access control (employees, maintenance staff, facility managers)",
      "Email/password authentication"
    ],
    excludes: [
      "IoT sensor integration for automatic issue detection",
      "Predictive maintenance algorithms",
      "Complex billing for shared spaces",
      "Visitor management system",
      "ERP system integration",
      "Energy monitoring and sustainability tracking",
      "Outlook calendar integration",
      "HR system integration for employee directory",
      "Recurring room bookings",
      "Push notifications (using email for MVP)"
    ]
  },
  screens: [
    {
      name: "Employee Dashboard",
      purpose: "Central hub for employees to submit issues and book rooms",
      uiElements: [
        "Report Issue button (prominent)",
        "Book Room button",
        "My Open Tickets list with status indicators",
        "My Upcoming Bookings list",
        "Quick status overview"
      ],
      whyItWorks: "Provides single entry point for all employee facilities needs with clear calls to action"
    },
    {
      name: "Report Issue Form",
      purpose: "Capture maintenance request details efficiently",
      uiElements: [
        "Floor selector dropdown",
        "Zone selector dropdown",
        "Category selector (HVAC, Electrical, Plumbing, Furniture)",
        "Description text area",
        "Photo upload button",
        "Submit button",
        "Ticket confirmation display"
      ],
      whyItWorks: "Structured form ensures all necessary information is captured for proper routing and resolution"
    },
    {
      name: "Room Booking View",
      purpose: "Visual room selection and booking",
      uiElements: [
        "Date and time range selectors",
        "Interactive floor plan with room status colors (green/red)",
        "Room details panel (capacity, amenities)",
        "Confirm booking button",
        "My bookings list with cancel option"
      ],
      whyItWorks: "Visual floor plan makes room selection intuitive and prevents booking conflicts"
    },
    {
      name: "Maintenance Staff Queue",
      purpose: "Mobile-optimized work order management for maintenance team",
      uiElements: [
        "Assigned tickets list sorted by priority",
        "Accept/Start Work button",
        "Ticket details with location and description",
        "Photo viewer for attached images",
        "Mark Complete button with resolution notes",
        "Status filters"
      ],
      whyItWorks: "Mobile-first design enables maintenance staff to manage work on the go"
    },
    {
      name: "Facility Manager Dashboard",
      purpose: "Overview of all operations and metrics",
      uiElements: [
        "Open work orders count with priority breakdown",
        "Average resolution time metric",
        "Room utilization percentage",
        "Work order list with filters",
        "Maintenance staff workload view",
        "Weekly trends chart"
      ],
      whyItWorks: "Aggregated view enables managers to identify bottlenecks and optimize operations"
    }
  ],
  userFlow: [
    "Employee logs in with email/password",
    "Employee views dashboard with Report Issue and Book Room options",
    "For issues: Employee clicks Report Issue, selects floor/zone/category, describes problem, optionally attaches photo, submits",
    "System generates ticket number and auto-assigns to appropriate maintenance staff based on category",
    "Maintenance staff receives email notification about new assignment",
    "Maintenance staff views ticket in mobile queue, accepts work order",
    "Staff completes work, marks ticket resolved with notes",
    "Employee receives email notification that issue is resolved",
    "For bookings: Employee clicks Book Room, selects date/time",
    "Employee views floor plan with available (green) and booked (red) rooms",
    "Employee taps available room, views capacity and amenities, confirms booking",
    "System sends confirmation email with booking details",
    "If no check-in within 15 minutes, booking auto-cancels",
    "Facility manager views dashboard for operations overview and reporting"
  ],
  dataSources: {
    mvpSources: [
      "PostgreSQL database for all application data",
      "Floors and zones configuration table",
      "Meeting rooms inventory with capacity and amenities",
      "Maintenance staff roster with specialty assignments",
      "Work order tickets with status history",
      "Room bookings with timestamps"
    ],
    futureSources: [
      "Outlook Calendar API for room sync",
      "HR system API for employee directory",
      "IoT sensors for automatic issue detection",
      "Building management system for energy data"
    ]
  },
  legalGuardrails: [
    "All data encrypted at rest and in transit (TLS 1.3)",
    "Role-based access control enforced at API level",
    "Employees can only view their own tickets and bookings",
    "Maintenance logs retained for minimum 1 year for audit",
    "Session timeout after 30 minutes of inactivity",
    "Password requirements: minimum 8 characters with complexity"
  ],
  buildPrompt: `Build FacilityHub, a facilities management web application for a corporate office with 500 employees across 5 floors.

## Core Features

### Work Order System
- Employees submit maintenance requests by selecting floor, zone, and category (HVAC, Electrical, Plumbing, Furniture)
- Include description field and optional photo upload
- Auto-generate ticket numbers and assign to maintenance staff based on category
- Email notifications for ticket updates
- Status tracking: Open, In Progress, Resolved

### Meeting Room Booking
- Visual floor plan showing room availability (green = available, red = booked)
- Date/time selection for bookings up to 2 hours
- Display room capacity and amenities (projector, whiteboard)
- Single bookings only (no recurring)
- Auto-cancel after 15 minutes if no check-in

### User Roles
1. Employees: Submit issues, book rooms, track their tickets/bookings
2. Maintenance Staff: Mobile-optimized queue, accept/complete work orders
3. Facility Managers: Dashboard with all work orders, metrics, utilization reports

## Technical Requirements
- React frontend with TypeScript
- Node.js/Express backend
- PostgreSQL database
- Email notifications via SMTP
- Role-based authentication with email/password
- Mobile-responsive design (mobile-first for maintenance staff)

## Design
- Clean, professional look with blue and gray color scheme
- Simple interface for non-technical users
- Clear status indicators (green/yellow/red)
- No animations, focus on speed and functionality`,
  lastGeneratedAt: new Date().toISOString(),
  agreed: true
};

const facilitiesPrompts: PromptBundle[] = [
  {
    id: generateId(),
    sequence: 1,
    category: "Foundation",
    title: "Project Setup and Database Schema",
    content: `Set up FacilityHub with the following structure:

## Database Schema (PostgreSQL)

### users table
- id (UUID, primary key)
- email (unique, not null)
- password_hash (not null)
- name (not null)
- role (enum: 'employee', 'maintenance', 'manager')
- specialty (for maintenance: 'hvac', 'electrical', 'plumbing', 'furniture')
- created_at, updated_at

### floors table
- id (serial, primary key)
- name (e.g., "Floor 1")
- floor_number (integer)

### zones table
- id (serial, primary key)
- floor_id (foreign key)
- name (e.g., "North Wing", "South Wing")

### rooms table
- id (serial, primary key)
- floor_id (foreign key)
- name (e.g., "Conference Room A")
- capacity (integer)
- amenities (array: projector, whiteboard, video_conf, phone)
- x_position, y_position (for floor plan display)

### work_orders table
- id (UUID, primary key)
- ticket_number (auto-generated, unique)
- submitted_by (user_id foreign key)
- assigned_to (user_id foreign key, nullable)
- floor_id, zone_id (foreign keys)
- category (enum: 'hvac', 'electrical', 'plumbing', 'furniture')
- description (text)
- photo_url (nullable)
- status (enum: 'open', 'in_progress', 'resolved')
- priority (enum: 'low', 'medium', 'high')
- resolution_notes (text, nullable)
- created_at, updated_at, resolved_at

### bookings table
- id (UUID, primary key)
- room_id (foreign key)
- booked_by (user_id foreign key)
- start_time (timestamp)
- end_time (timestamp)
- checked_in (boolean, default false)
- cancelled (boolean, default false)
- created_at

Set up Drizzle ORM with these schemas and create seed data for 5 floors, 10 zones, and 15 meeting rooms.`,
    deliverable: "Database schema with all tables and seed data for floors, zones, and rooms",
    roles: ["manager"]
  },
  {
    id: generateId(),
    sequence: 2,
    category: "Authentication",
    title: "User Authentication System",
    content: `Implement authentication for FacilityHub:

## Requirements
- Email/password login with session-based auth
- Password hashing with bcrypt (min 8 chars, require complexity)
- Session timeout after 30 minutes of inactivity
- Role-based middleware to protect routes
- Login page with clean, professional design

## API Endpoints
- POST /api/auth/login - Login with email/password
- POST /api/auth/logout - End session
- GET /api/auth/me - Get current user info

## Seed Users
Create test accounts:
- manager@facilityhub.com (Facility Manager)
- maintenance1@facilityhub.com (HVAC specialist)
- maintenance2@facilityhub.com (Electrical specialist)
- employee@facilityhub.com (Regular employee)

All with password: Demo123!`,
    deliverable: "Working login system with role-based access control",
    roles: ["employee", "maintenance", "manager"]
  },
  {
    id: generateId(),
    sequence: 3,
    category: "Core Feature",
    title: "Work Order Submission System",
    content: `Build the work order submission flow:

## Report Issue Form
- Floor dropdown (populated from database)
- Zone dropdown (filtered by selected floor)
- Category radio buttons: HVAC, Electrical, Plumbing, Furniture
- Description textarea (required, min 20 characters)
- Photo upload (optional, max 5MB, jpg/png only)
- Submit button

## Backend Logic
- Generate ticket number: WO-YYYYMMDD-XXXX
- Auto-assign based on category:
  - HVAC issues -> maintenance staff with hvac specialty
  - Electrical -> electrical specialty
  - etc.
- Round-robin assignment if multiple staff have same specialty
- Set initial status to 'open', priority to 'medium'
- Store photo in object storage, save URL

## Confirmation
- Show success message with ticket number
- Email notification to employee confirming submission
- Email notification to assigned maintenance staff

## API Endpoints
- GET /api/floors - List all floors with zones
- POST /api/work-orders - Create new work order
- GET /api/work-orders/mine - Get employee's tickets`,
    deliverable: "Complete work order submission with auto-assignment",
    roles: ["employee"]
  },
  {
    id: generateId(),
    sequence: 4,
    category: "Core Feature",
    title: "Maintenance Staff Mobile Queue",
    content: `Build the maintenance staff work order queue:

## Queue View (Mobile-Optimized)
- List assigned work orders sorted by: priority (high first), then date
- Each card shows:
  - Ticket number
  - Category icon
  - Location (Floor, Zone)
  - Time since submitted
  - Priority indicator (color-coded)
- Tap to expand with full details

## Work Order Detail View
- Full description
- Photo viewer (tap to enlarge)
- Location details
- Status buttons:
  - "Accept" (changes status to in_progress)
  - "Mark Complete" (opens resolution form)

## Resolution Form
- Resolution notes textarea (required)
- Confirm Complete button
- Sets status to 'resolved', records resolved_at

## API Endpoints
- GET /api/work-orders/assigned - Get maintenance staff's queue
- PATCH /api/work-orders/:id/accept - Start working
- PATCH /api/work-orders/:id/resolve - Complete with notes

## Notifications
- Email employee when their ticket is resolved`,
    deliverable: "Mobile-optimized maintenance staff interface",
    roles: ["maintenance"]
  },
  {
    id: generateId(),
    sequence: 5,
    category: "Core Feature",
    title: "Meeting Room Booking System",
    content: `Build the room booking system:

## Room Booking View
- Date picker (today + next 14 days)
- Time slot selector (30-minute increments, 7am-8pm)
- Duration selector (30min, 1hr, 1.5hr, 2hr max)

## Floor Plan Display
- Simple grid/visual representation of rooms per floor
- Floor tabs to switch between floors
- Color coding:
  - Green: Available for selected time
  - Red: Booked
  - Gray: Not available (outside hours)

## Room Selection
- Click room to see details popup:
  - Room name
  - Capacity
  - Amenities list with icons
  - "Book Now" button
- Confirm booking -> success message

## My Bookings
- List of upcoming bookings
- Cancel button (only for future bookings)
- Check-in button (available 5 min before start)

## Auto-Cancel Logic
- Background job checks every 5 minutes
- Cancel bookings not checked in within 15 min of start time
- Email notification to booker about cancellation

## API Endpoints
- GET /api/rooms?floor_id=X - List rooms with availability
- GET /api/rooms/:id/availability?date=YYYY-MM-DD - Time slots
- POST /api/bookings - Create booking
- POST /api/bookings/:id/check-in - Check in
- DELETE /api/bookings/:id - Cancel booking
- GET /api/bookings/mine - My upcoming bookings`,
    deliverable: "Complete room booking with floor plan view",
    roles: ["employee"]
  },
  {
    id: generateId(),
    sequence: 6,
    category: "Dashboard",
    title: "Facility Manager Dashboard",
    content: `Build the facility manager dashboard:

## Metrics Cards (Top Row)
- Open Work Orders (count, with high priority count)
- Average Resolution Time (last 30 days)
- Room Utilization (% of bookings used)
- Pending Issues (> 24 hours old)

## Work Orders Section
- Filterable table:
  - Filters: Status, Category, Priority, Date range
  - Columns: Ticket#, Category, Location, Status, Assigned To, Age
- Click row to view full details
- Can reassign tickets to different staff

## Staff Workload View
- List of maintenance staff
- Open tickets assigned count
- Average resolution time per staff

## Weekly Trends Chart
- Line chart showing:
  - New tickets per day
  - Resolved tickets per day
- Last 7 days

## Room Utilization Report
- Bar chart by room: bookings vs actual usage (checked in)
- Top utilized rooms list
- Low utilization rooms to investigate

## API Endpoints
- GET /api/dashboard/metrics - Aggregate metrics
- GET /api/work-orders?filters - All work orders (manager only)
- GET /api/dashboard/staff-workload - Staff performance
- GET /api/dashboard/trends - Weekly data
- GET /api/dashboard/room-utilization - Room stats`,
    deliverable: "Manager dashboard with all metrics and reports",
    roles: ["manager"]
  },
  {
    id: generateId(),
    sequence: 7,
    category: "Notifications",
    title: "Email Notification System",
    content: `Set up email notifications:

## Email Templates (HTML)
1. Work Order Submitted (to employee)
   - Ticket number
   - Category and location
   - "We'll notify you when resolved"

2. New Assignment (to maintenance staff)
   - Ticket details
   - Priority indicator
   - Link to view in app

3. Work Order Resolved (to employee)
   - Resolution notes
   - "Was this resolved satisfactorily?" link

4. Booking Confirmation (to employee)
   - Room name, date, time
   - Check-in reminder

5. Booking Auto-Cancelled (to employee)
   - Room and time
   - "No check-in detected"

## Implementation
- Use nodemailer with SMTP
- Queue emails for reliability
- Include FacilityHub branding
- Mobile-friendly email templates`,
    deliverable: "All email notifications working with branded templates",
    roles: ["employee", "maintenance"]
  },
  {
    id: generateId(),
    sequence: 8,
    category: "Polish",
    title: "Final UI Polish and Testing",
    content: `Complete the application:

## UI Polish
- Consistent blue/gray color scheme throughout
- Loading states for all async operations
- Error handling with user-friendly messages
- Empty states (no tickets, no bookings)
- Mobile responsiveness verification

## Navigation
- Role-based navigation:
  - Employee: Dashboard, Report Issue, Book Room, My Tickets, My Bookings
  - Maintenance: My Queue, Completed Today
  - Manager: Dashboard, All Work Orders, Staff, Reports

## Testing Checklist
- [ ] Employee can submit work order with photo
- [ ] Work order auto-assigns correctly
- [ ] Maintenance staff can view and complete tickets
- [ ] Employee gets email on resolution
- [ ] Room booking shows correct availability
- [ ] Booking check-in works
- [ ] Auto-cancel triggers after 15 min
- [ ] Manager dashboard shows accurate metrics
- [ ] All filters work on work order list
- [ ] Mobile views are usable`,
    deliverable: "Production-ready application with polished UI",
    roles: ["employee", "maintenance", "manager"]
  }
];

export const facilitiesManagementProject: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
  name: "FacilityHub - Facilities Management",
  scriptSource: "paste",
  currentStep: 5,
  questions: facilitiesQuestions,
  detailedSummary: facilitiesDetailedSummary,
  generatedPrompts: facilitiesPrompts,
};

// ============================================
// DEMO 2: IT Service Management Application
// ============================================
const itsmQuestions: Question[] = [
  createQuestion(
    "What is the core purpose of this application?",
    "We need an IT service management application to replace our current email-based support system. The IT department supports about 2000 employees across multiple offices. We need to track incidents, service requests, and manage our IT asset inventory. The goal is to have a proper ticketing system with SLA tracking and a self-service portal for common issues."
  ),
  createQuestion(
    "Who are the primary users of this application?",
    "We have end users who are all employees needing IT support - they submit tickets and check status. IT support agents work the queue, respond to tickets, and resolve issues. IT managers need visibility into ticket volumes, SLA compliance, and agent performance. We also have IT asset managers who track hardware and software assignments."
  ),
  createQuestion(
    "What are the must-have features for the MVP?",
    "Must have a ticket submission form where users describe their issue, select category and priority, and optionally attach screenshots. Need a knowledge base with searchable articles for common issues like password reset, VPN setup, printer problems. IT agents need a ticket queue with filters by priority, category, and age. Basic SLA timers showing time to first response and resolution. Asset inventory list linked to tickets so we know what hardware the user has."
  ),
  createQuestion(
    "What features can be deferred to later versions?",
    "Can defer change management workflows, problem management for root cause tracking, full CMDB with dependency mapping, automated password reset, chatbot for tier-0 support, integration with monitoring tools for auto-ticket creation, and complex approval workflows for service requests. Also defer mobile app - desktop web is fine for MVP."
  ),
  createQuestion(
    "What does the ideal user flow look like for submitting a ticket?",
    "Employee goes to the portal, sees a search bar suggesting knowledge articles first. If they cant find an answer, they click Create Ticket. They fill out a form with subject, description, category dropdown like Hardware, Software, Network, Access, and urgency level. They can attach files. Upon submission they get a ticket number and email confirmation. They can view their open tickets and add comments or updates."
  ),
  createQuestion(
    "How should the IT agent workflow function?",
    "Agents log in and see their assigned tickets plus an unassigned queue. They can filter and sort by priority, age, or category. Clicking a ticket shows full history, user details, and linked assets. Agents can update status, add internal notes not visible to user, send replies to user, and escalate to tier 2. When resolving, they select a resolution category and write a brief resolution note. Ticket automatically emails the user when updated."
  ),
  createQuestion(
    "What data or integrations are needed?",
    "Need integration with Active Directory or our identity provider for single sign-on - users shouldnt need separate passwords. Need email integration for ticket notifications and replies. For MVP, asset data can be manually entered or imported via CSV - we have spreadsheets. Later we could integrate with endpoint management tools but not for MVP."
  ),
  createQuestion(
    "Are there any compliance or security requirements?",
    "IT tickets can contain sensitive information so role-based access is critical. Agents should only see tickets in their queue or category. All ticket data encrypted at rest and in transit. Audit trail required for ticket changes. Data retention policy is 3 years. We follow SOC 2 type 2 compliance so need proper access controls and logging."
  ),
  createQuestion(
    "What does success look like for this MVP?",
    "Reduce average time to first response from 4 hours to under 1 hour. Decrease ticket volume by 20% through self-service knowledge base. Have 100% of tickets tracked in system instead of scattered emails. SLA compliance above 90%. User satisfaction rating above 4 out of 5 stars on resolved tickets."
  ),
  createQuestion(
    "Any specific design or branding requirements?",
    "Should match our internal tools branding with company colors - navy blue and white. Interface must be clean and efficient - agents process many tickets daily so minimize clicks. User portal should be friendly and approachable, not intimidating. Dashboard for managers should be data-rich with charts. Dark mode would be nice for agents working late but not required for MVP."
  ),
];

const itsmDetailedSummary: DetailedSummary = {
  oneSentenceDefinition: "ServiceDesk Pro is an IT service management platform that provides employees with a self-service portal and knowledge base, while enabling IT agents to efficiently track, prioritize, and resolve support tickets with SLA monitoring and asset linking.",
  mvpScope: {
    includes: [
      "Ticket submission form with category, priority, and file attachments",
      "Searchable knowledge base for common IT issues",
      "IT agent ticket queue with filters (priority, category, age, status)",
      "SLA timers for first response and resolution targets",
      "IT asset inventory with CSV import",
      "Asset linking to user profiles and tickets",
      "Internal notes (agent-only) and user-visible replies",
      "Ticket escalation to Tier 2 support",
      "Resolution categories and notes",
      "Email notifications for ticket updates",
      "Manager dashboard with SLA compliance metrics",
      "User satisfaction rating on resolved tickets",
      "Single sign-on via identity provider",
      "Audit trail for all ticket changes"
    ],
    excludes: [
      "Change management workflows",
      "Problem management for root cause tracking",
      "Full CMDB with dependency mapping",
      "Automated password reset",
      "AI chatbot for tier-0 support",
      "Monitoring tool integration for auto-tickets",
      "Complex approval workflows",
      "Mobile application",
      "Endpoint management integration",
      "Dark mode (nice to have for later)"
    ]
  },
  screens: [
    {
      name: "Employee Self-Service Portal",
      purpose: "Entry point for employees to get help or submit tickets",
      uiElements: [
        "Search bar with knowledge base suggestions",
        "Popular articles quick links",
        "Create Ticket button",
        "My Open Tickets list with status",
        "Recently resolved tickets"
      ],
      whyItWorks: "Knowledge base search-first approach reduces ticket volume by helping users find answers"
    },
    {
      name: "Knowledge Base Article View",
      purpose: "Display self-help content to resolve common issues",
      uiElements: [
        "Article title and category breadcrumb",
        "Step-by-step instructions with screenshots",
        "Was this helpful? feedback buttons",
        "Related articles sidebar",
        "Still need help? Create Ticket button"
      ],
      whyItWorks: "Structured articles with feedback enable continuous improvement of self-service"
    },
    {
      name: "Ticket Submission Form",
      purpose: "Capture all information needed to resolve IT issues",
      uiElements: [
        "Subject line input",
        "Category dropdown (Hardware, Software, Network, Access)",
        "Urgency selector (Low, Medium, High, Critical)",
        "Description textarea with formatting",
        "File attachment dropzone",
        "Linked assets display (from user profile)",
        "Submit button"
      ],
      whyItWorks: "Structured form with required fields ensures agents have information needed to help"
    },
    {
      name: "Agent Ticket Queue",
      purpose: "Efficient ticket management for IT support staff",
      uiElements: [
        "Queue tabs: My Tickets, Unassigned, All Open",
        "Filter bar: Priority, Category, Age, SLA Status",
        "Sort options: Oldest first, SLA breach risk, Priority",
        "Ticket rows with SLA countdown indicators",
        "Quick actions: Assign to me, Change priority",
        "Bulk selection for mass updates"
      ],
      whyItWorks: "Powerful filtering and SLA visibility helps agents prioritize effectively"
    },
    {
      name: "Ticket Detail View (Agent)",
      purpose: "Complete ticket context for resolution",
      uiElements: [
        "User info panel with linked assets",
        "Ticket timeline with all updates",
        "Internal notes section (agent-only)",
        "Reply composer with templates",
        "Status dropdown",
        "Escalate to Tier 2 button",
        "Resolution form (category + notes)",
        "SLA timers (response, resolution)"
      ],
      whyItWorks: "All context in one view minimizes context-switching for faster resolution"
    },
    {
      name: "IT Manager Dashboard",
      purpose: "Operational visibility and team management",
      uiElements: [
        "KPI cards: Open tickets, Avg resolution time, SLA compliance %, CSAT score",
        "SLA breach risk list (tickets approaching deadline)",
        "Agent workload distribution chart",
        "Ticket volume trend (daily, weekly)",
        "Category breakdown pie chart",
        "Export reports button"
      ],
      whyItWorks: "Data-rich dashboard enables proactive management and resource planning"
    },
    {
      name: "Asset Inventory",
      purpose: "Track IT hardware and software assignments",
      uiElements: [
        "Asset list with search and filters",
        "Asset type tabs: Hardware, Software",
        "Asset details: Serial, Model, Assigned user, Status",
        "Import CSV button",
        "Link to user button",
        "Ticket history for asset"
      ],
      whyItWorks: "Asset tracking enables agents to understand user's technical environment"
    }
  ],
  userFlow: [
    "Employee accesses self-service portal",
    "Employee searches knowledge base for their issue",
    "If article found: Employee follows instructions to self-resolve",
    "If no answer: Employee clicks Create Ticket",
    "Employee fills form with subject, description, category, priority, attachments",
    "System shows user's assigned assets and includes in ticket",
    "Employee submits ticket, receives ticket number and email confirmation",
    "Ticket appears in unassigned queue or auto-assigns based on category",
    "Agent sees ticket in queue with SLA countdown",
    "Agent opens ticket, reviews user info and assets, adds internal notes",
    "Agent sends reply to user (user gets email notification)",
    "If escalation needed: Agent escalates to Tier 2 with notes",
    "When resolved: Agent selects resolution category, writes notes, marks resolved",
    "Employee receives resolution email with satisfaction survey link",
    "Employee rates experience (1-5 stars)",
    "Manager views dashboard for team performance and SLA compliance"
  ],
  dataSources: {
    mvpSources: [
      "PostgreSQL database for tickets, articles, assets",
      "Identity provider (SSO) for user authentication",
      "CSV import for asset inventory data",
      "Email service for notifications"
    ],
    futureSources: [
      "Active Directory for org chart and manager approvals",
      "Endpoint management tools for real-time asset data",
      "Monitoring systems for auto-ticket creation",
      "LDAP for group-based access control"
    ]
  },
  legalGuardrails: [
    "All data encrypted at rest (AES-256) and in transit (TLS 1.3)",
    "Role-based access: agents see only assigned tickets and their category queue",
    "Complete audit trail for all ticket modifications",
    "3-year data retention per company policy",
    "SOC 2 Type 2 compliant access controls and logging",
    "Personal data handling per privacy policy",
    "Session management with secure, httpOnly cookies"
  ],
  buildPrompt: `Build ServiceDesk Pro, an IT service management application for 2000 employees.

## Core Features

### Self-Service Portal
- Knowledge base with searchable articles
- Ticket submission with category (Hardware, Software, Network, Access)
- Priority levels: Low, Medium, High, Critical
- File attachments (screenshots, logs)
- View my tickets and add comments

### IT Agent Queue
- Ticket queue with filters: priority, category, age, status
- SLA timers visible on each ticket
- Internal notes (not visible to users)
- Reply to users with email notification
- Escalate to Tier 2
- Resolution with category and notes

### Asset Management
- Asset inventory (hardware, software)
- CSV import capability
- Link assets to users
- View asset ticket history

### Manager Dashboard
- KPI metrics: open tickets, resolution time, SLA compliance, CSAT
- Agent workload distribution
- Ticket trends and category breakdown
- Export reports

## Technical Requirements
- React + TypeScript frontend
- Node.js/Express backend
- PostgreSQL database
- SSO integration via identity provider
- Email notifications via SMTP
- SOC 2 compliant audit logging

## Design
- Navy blue and white color scheme
- Clean, efficient interface for agents
- Friendly portal for employees
- Data-rich manager dashboard`,
  lastGeneratedAt: new Date().toISOString(),
  agreed: true
};

const itsmPrompts: PromptBundle[] = [
  {
    id: generateId(),
    sequence: 1,
    category: "Foundation",
    title: "Database Schema and Project Setup",
    content: `Set up ServiceDesk Pro with the following database schema:

## Database Tables (PostgreSQL)

### users
- id (UUID, primary key)
- email (unique, not null)
- name (not null)
- role (enum: 'employee', 'agent', 'manager')
- department (text)
- manager_id (UUID, nullable, self-reference)
- sso_id (for identity provider linking)
- created_at, updated_at

### tickets
- id (UUID, primary key)
- ticket_number (auto-generated: INC-YYYYMMDD-XXXX)
- subject (not null)
- description (text, not null)
- category (enum: 'hardware', 'software', 'network', 'access')
- priority (enum: 'low', 'medium', 'high', 'critical')
- status (enum: 'new', 'open', 'pending', 'resolved', 'closed')
- submitted_by (user_id foreign key)
- assigned_to (user_id foreign key, nullable)
- tier (enum: 'tier1', 'tier2', default 'tier1')
- resolution_category (text, nullable)
- resolution_notes (text, nullable)
- satisfaction_rating (integer 1-5, nullable)
- first_response_at (timestamp, nullable)
- resolved_at (timestamp, nullable)
- created_at, updated_at

### ticket_comments
- id (UUID, primary key)
- ticket_id (foreign key)
- author_id (user_id foreign key)
- content (text)
- is_internal (boolean, default false)
- created_at

### ticket_attachments
- id (UUID, primary key)
- ticket_id (foreign key)
- filename (text)
- file_url (text)
- file_size (integer)
- uploaded_by (user_id foreign key)
- created_at

### knowledge_articles
- id (UUID, primary key)
- title (not null)
- category (text)
- content (text, rich HTML)
- helpful_count, not_helpful_count (integers)
- status (enum: 'draft', 'published')
- author_id (user_id foreign key)
- created_at, updated_at

### assets
- id (UUID, primary key)
- asset_tag (unique)
- type (enum: 'hardware', 'software')
- name (text)
- model, serial_number, manufacturer (text)
- assigned_to (user_id foreign key, nullable)
- status (enum: 'in_use', 'available', 'retired')
- purchase_date, warranty_end (dates)
- created_at, updated_at

### sla_policies
- id (UUID, primary key)
- priority (enum matches tickets.priority)
- first_response_hours (integer)
- resolution_hours (integer)

Create seed data for SLA policies:
- Critical: 1hr response, 4hr resolution
- High: 2hr response, 8hr resolution
- Medium: 4hr response, 24hr resolution
- Low: 8hr response, 72hr resolution`,
    deliverable: "Complete database schema with SLA policies seeded",
    roles: ["manager"]
  },
  {
    id: generateId(),
    sequence: 2,
    category: "Authentication",
    title: "SSO Integration and User Management",
    content: `Implement single sign-on authentication:

## SSO Integration
- Configure OAuth 2.0 / OIDC with identity provider
- Map SSO attributes to user fields (email, name, department)
- Auto-create user on first login
- Session management with secure cookies

## Role Assignment
- Default role: 'employee'
- Roles assigned by admin or mapped from SSO groups
- Role hierarchy: manager > agent > employee

## API Endpoints
- GET /api/auth/sso/login - Redirect to identity provider
- GET /api/auth/sso/callback - Handle SSO response
- POST /api/auth/logout - End session
- GET /api/auth/me - Current user with role

## Middleware
- requireAuth - Check valid session
- requireRole(['agent', 'manager']) - Role-based access

## Development Mode
For local development without SSO:
- Email/password fallback login
- Seed test users for each role`,
    deliverable: "SSO authentication with role-based access control",
    roles: ["employee", "agent", "manager"]
  },
  {
    id: generateId(),
    sequence: 3,
    category: "Core Feature",
    title: "Knowledge Base",
    content: `Build the searchable knowledge base:

## Article Display
- List view with category filters
- Full-text search across titles and content
- Article detail page with formatted content
- "Was this helpful?" Yes/No buttons
- Related articles based on category

## Admin (Agents/Managers)
- Create/edit articles with rich text editor
- Draft/published status
- View article feedback stats

## Search Integration
- Search bar prominently displayed on portal home
- Show article suggestions as user types
- "No results? Create a ticket" prompt

## Seed Articles
Create 10 sample articles:
- Password reset instructions
- VPN setup guide
- Printer troubleshooting
- Software installation request process
- New employee IT checklist
- etc.

## API Endpoints
- GET /api/articles - List/search articles
- GET /api/articles/:id - Article detail
- POST /api/articles - Create (agent/manager)
- PUT /api/articles/:id - Update
- POST /api/articles/:id/feedback - Submit helpful vote`,
    deliverable: "Searchable knowledge base with 10 seed articles",
    roles: ["employee"]
  },
  {
    id: generateId(),
    sequence: 4,
    category: "Core Feature",
    title: "Ticket Submission System",
    content: `Build ticket creation for employees:

## Ticket Form
- Subject (required, max 200 chars)
- Description (required, rich text, max 5000 chars)
- Category dropdown: Hardware, Software, Network, Access
- Priority selector with descriptions:
  - Low: General question, no urgency
  - Medium: Work impacted but has workaround
  - High: Significant work disruption
  - Critical: Complete work stoppage, multiple users
- File attachments (max 5 files, 10MB each)
- Show user's linked assets (pulled from assets table)

## Submission Flow
- Generate ticket number (INC-YYYYMMDD-XXXX)
- Calculate SLA deadlines based on priority
- Auto-assign based on category (if rules defined)
- Send confirmation email to user
- Create audit log entry

## My Tickets View
- List of user's tickets with status badges
- Click to view details and timeline
- Add comment/update form

## API Endpoints
- POST /api/tickets - Create ticket
- GET /api/tickets/mine - User's tickets
- GET /api/tickets/:id - Ticket detail (with auth check)
- POST /api/tickets/:id/comments - Add comment`,
    deliverable: "Complete ticket submission with SLA calculation",
    roles: ["employee"]
  },
  {
    id: generateId(),
    sequence: 5,
    category: "Core Feature",
    title: "Agent Ticket Queue",
    content: `Build the IT agent workspace:

## Queue Views
- Tabs: My Tickets | Unassigned | All Open (manager only)
- Ticket count badges on each tab

## Filters and Sorting
- Filter by: Priority, Category, Status, SLA Status (on-track/at-risk/breached)
- Sort by: Oldest first, Priority, SLA urgency
- Save filter presets

## Queue Table
- Columns: Ticket#, Subject, Category, Priority, Status, SLA Timer, Assigned
- Color-coded SLA indicators:
  - Green: > 50% time remaining
  - Yellow: < 50% time remaining
  - Red: Breached or < 2 hours
- Click row to open ticket

## Quick Actions
- Assign to me (from unassigned)
- Change priority
- Bulk assign/update (checkboxes)

## API Endpoints
- GET /api/tickets - With filters (agent access)
- PATCH /api/tickets/:id/assign - Assign ticket
- PATCH /api/tickets/:id/priority - Change priority`,
    deliverable: "Agent queue with filtering and SLA indicators",
    roles: ["agent"]
  },
  {
    id: generateId(),
    sequence: 6,
    category: "Core Feature",
    title: "Ticket Detail and Resolution",
    content: `Build the agent ticket detail view:

## User Information Panel
- User name, email, department
- Linked assets list
- Previous tickets (last 5)

## Ticket Timeline
- Chronological list of all activities:
  - Status changes
  - Comments (user and agent)
  - Internal notes (agent only, highlighted)
  - Assignments
- Each entry shows author, timestamp, content

## Actions Panel
- Status dropdown: New -> Open -> Pending -> Resolved
- Priority change
- Assign/reassign to agent
- Escalate to Tier 2 button

## Communication
- Reply composer with template suggestions
- Rich text formatting
- "Internal Note" checkbox (not visible to user)
- Add attachment

## Resolution
- Resolution category dropdown (predefined list)
- Resolution notes textarea
- Resolve button -> changes status, records time

## Audit Trail
- Log all changes to ticket_audit table
- Who, what, when for compliance

## API Endpoints
- GET /api/tickets/:id - Full ticket with timeline
- POST /api/tickets/:id/comments - Add reply/note
- PATCH /api/tickets/:id/status - Update status
- PATCH /api/tickets/:id/escalate - Escalate to Tier 2
- POST /api/tickets/:id/resolve - Resolve with notes`,
    deliverable: "Complete ticket management with timeline and resolution",
    roles: ["agent"]
  },
  {
    id: generateId(),
    sequence: 7,
    category: "Core Feature",
    title: "Asset Inventory System",
    content: `Build IT asset management:

## Asset List View
- Tabs: All | Hardware | Software
- Search by asset tag, name, assigned user
- Filters: Status, Type
- Pagination for large inventories

## Asset Detail
- All asset fields displayed
- Assigned user with link to profile
- Ticket history for this asset
- Edit button (agents/managers)

## Asset Assignment
- Assign to user button
- Unassign button
- History of assignments

## CSV Import
- Template download button
- Upload CSV with validation
- Preview before import
- Error report for invalid rows

## User Profile Enhancement
- Show assigned assets on user info panel
- Link from ticket to user's assets

## API Endpoints
- GET /api/assets - List with filters
- GET /api/assets/:id - Asset detail
- POST /api/assets - Create
- PUT /api/assets/:id - Update
- POST /api/assets/:id/assign - Assign to user
- POST /api/assets/import - CSV import`,
    deliverable: "Asset inventory with CSV import and ticket linking",
    roles: ["agent", "manager"]
  },
  {
    id: generateId(),
    sequence: 8,
    category: "Dashboard",
    title: "Manager Dashboard and Reporting",
    content: `Build IT manager dashboard:

## KPI Cards (Top Row)
- Open Tickets (count, trend arrow)
- Avg First Response Time (vs SLA target)
- SLA Compliance % (last 30 days)
- Customer Satisfaction (avg rating)

## SLA Risk Section
- List of tickets approaching SLA breach
- Sort by time remaining
- Quick action to reassign

## Charts
- Ticket Volume: Line chart, daily trend (last 30 days)
- Category Distribution: Pie chart
- Resolution Time: Bar chart by category
- Agent Workload: Stacked bar (open/resolved per agent)

## Agent Performance Table
- Agent name
- Assigned tickets
- Resolved today/this week
- Avg resolution time
- CSAT score

## Reports
- Export buttons for CSV/PDF
- Date range selector
- Filter by category, agent

## Satisfaction Survey
- Email sent after resolution with survey link
- Simple 1-5 star rating + optional comment
- Results feed into dashboard

## API Endpoints
- GET /api/dashboard/kpis - Aggregate metrics
- GET /api/dashboard/sla-risk - At-risk tickets
- GET /api/dashboard/trends - Chart data
- GET /api/dashboard/agent-stats - Agent performance
- POST /api/tickets/:id/rating - Submit satisfaction`,
    deliverable: "Manager dashboard with full metrics and exports",
    roles: ["manager"]
  },
  {
    id: generateId(),
    sequence: 9,
    category: "Notifications",
    title: "Email Notifications and Audit",
    content: `Implement notification system:

## Email Notifications
1. Ticket Created (to submitter)
2. Ticket Assigned (to agent)
3. New Comment (to relevant parties)
4. Ticket Resolved (to submitter with survey link)
5. SLA Warning (to agent, 2 hours before breach)

## Email Templates
- Branded HTML templates
- Include ticket details and link
- Mobile-responsive

## Audit Logging
- Log all ticket changes to audit table:
  - ticket_id, user_id, action, old_value, new_value, timestamp
- Actions: created, status_change, assignment, comment_added, resolved
- Retention: 3 years per policy
- Export capability for compliance

## API Endpoints
- GET /api/audit/:ticketId - Audit trail for ticket
- GET /api/audit/export - Export audit logs (manager only)`,
    deliverable: "Email notifications and SOC 2 compliant audit logging",
    roles: ["employee", "agent", "manager"]
  },
  {
    id: generateId(),
    sequence: 10,
    category: "Polish",
    title: "Final Polish and Testing",
    content: `Complete the application:

## UI Polish
- Navy blue and white color scheme
- Loading states and skeleton screens
- Error handling with clear messages
- Empty states with helpful guidance

## Performance
- Pagination for all list views
- Optimistic updates for status changes
- Efficient queries with indexes

## Testing Checklist
- [ ] Employee can search knowledge base
- [ ] Employee can submit ticket with attachments
- [ ] SLA timers calculate correctly
- [ ] Agent can filter and sort queue
- [ ] Agent can add internal notes (not visible to user)
- [ ] Agent can resolve with category and notes
- [ ] Escalation to Tier 2 works
- [ ] User receives email on resolution
- [ ] Satisfaction rating recorded
- [ ] Manager dashboard shows accurate metrics
- [ ] CSV asset import works
- [ ] Audit trail captures all changes`,
    deliverable: "Production-ready ITSM application",
    roles: ["employee", "agent", "manager"]
  }
];

export const itServiceManagementProject: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
  name: "ServiceDesk Pro - IT Service Management",
  scriptSource: "paste",
  currentStep: 5,
  questions: itsmQuestions,
  detailedSummary: itsmDetailedSummary,
  generatedPrompts: itsmPrompts,
};

// ============================================
// DEMO 3: HR Case Management Application
// ============================================
const hrQuestions: Question[] = [
  createQuestion(
    "What is the core purpose of this application?",
    "We need an HR case management system to handle employee inquiries, complaints, and HR service requests in a structured way. Currently our HR team of 15 people handles everything through email and its impossible to track SLAs, ensure consistency, or report on trends. We support 3000 employees and need confidential case tracking for sensitive matters."
  ),
  createQuestion(
    "Who are the primary users of this application?",
    "Three user groups. Employees who submit HR requests and check status of their cases. HR generalists who work cases, respond to employees, and escalate when needed. HR managers and leadership who need analytics on case volumes, types, resolution times, and to ensure compliance with policies and SLAs."
  ),
  createQuestion(
    "What are the must-have features for the MVP?",
    "Case submission portal for employees with categories like benefits questions, payroll issues, leave requests, policy questions, and general inquiries. Separate confidential submission for sensitive matters like harassment or discrimination that routes only to specific HR staff. Case queue for HR with assignment, status tracking, and internal notes. SLA timers based on case type. Basic reporting on case volumes and resolution times."
  ),
  createQuestion(
    "What features can be deferred to later versions?",
    "Defer advanced workflow automation, integration with HRIS for employee data, document management for HR files, onboarding case workflows, offboarding checklists, employee relations investigation tracking with detailed documentation, and compliance training tracking. Also defer mobile app and manager self-service portal."
  ),
  createQuestion(
    "What does the ideal user flow look like for an employee submitting a case?",
    "Employee accesses the portal and sees a friendly interface with common categories. They select a category, fill out a form with their question or issue, and can optionally attach documents. For sensitive matters theres a clearly marked confidential option that limits visibility. They submit and receive a case number. They can view their case status and add comments. They get email updates when HR responds."
  ),
  createQuestion(
    "How should confidential cases be handled differently?",
    "Confidential cases like harassment complaints or workplace investigations should only be visible to designated HR staff - not all HR generalists. When submitting, the employee checks a confidential box and these route to a specific queue visible only to HR managers and employee relations specialists. All activity is logged for audit. These cases have stricter SLAs and higher priority."
  ),
  createQuestion(
    "What data or integrations are needed?",
    "For MVP we need basic employee directory info - name, department, manager, hire date - which can be imported via CSV. Email integration for notifications. Integration with SSO so employees use existing corporate login. Later phases could integrate with our HRIS Workday and our learning management system but not needed for MVP."
  ),
  createQuestion(
    "Are there any compliance or security requirements?",
    "Very important given the sensitive nature of HR data. Role-based access strictly enforced. Confidential cases encrypted with additional access controls. Full audit trail on all case access and modifications. Data retention follows employment law requirements - typically 7 years. System must support GDPR data subject access requests. Need to be able to produce case history for legal matters if needed."
  ),
  createQuestion(
    "What does success look like for this MVP?",
    "All employee HR inquiries tracked in one system instead of scattered emails. Response time targets met - acknowledgment within 4 hours, resolution within 5 business days for standard cases. Reduction in duplicate inquiries through case status visibility. HR managers have real-time visibility into team workload. Monthly reports generated automatically instead of manually."
  ),
  createQuestion(
    "Any specific design or branding requirements?",
    "Warm and approachable design since HR deals with people matters. Use our company colors but softer tones. Clear and simple language - avoid HR jargon in the employee portal. The interface should feel supportive not bureaucratic. For HR staff, efficient and organized layout. Accessibility is important - need to meet WCAG 2.1 AA standards. Light theme preferred."
  ),
];

const hrDetailedSummary: DetailedSummary = {
  oneSentenceDefinition: "PeopleFirst is an HR case management system that enables employees to submit and track HR inquiries through a confidential, accessible portal while providing HR staff with SLA-tracked case queues, compliance-ready audit trails, and leadership reporting.",
  mvpScope: {
    includes: [
      "Employee case submission portal with category selection",
      "Categories: Benefits, Payroll, Leave, Policy, General Inquiry",
      "Confidential case option with restricted visibility",
      "Document attachment capability",
      "Case number generation and email confirmation",
      "HR case queue with assignment and status tracking",
      "Internal notes (HR-only visibility)",
      "SLA timers based on case type and priority",
      "Confidential cases routed to designated HR staff only",
      "Employee case status tracking with updates",
      "Email notifications for case updates",
      "HR manager dashboard with metrics",
      "Basic reporting: volume, resolution times, category breakdown",
      "SSO integration for employee authentication",
      "Full audit trail for all case activities",
      "7-year data retention capability",
      "WCAG 2.1 AA accessibility compliance"
    ],
    excludes: [
      "Advanced workflow automation",
      "HRIS integration (Workday)",
      "Document management system",
      "Onboarding case workflows",
      "Offboarding checklists",
      "Detailed investigation tracking",
      "Compliance training tracking",
      "Mobile application",
      "Manager self-service portal",
      "Learning management system integration"
    ]
  },
  screens: [
    {
      name: "Employee Portal Home",
      purpose: "Welcoming entry point for employees seeking HR help",
      uiElements: [
        "Friendly welcome message",
        "Category cards with icons (Benefits, Payroll, Leave, Policy, Help)",
        "Confidential submission option (clearly marked)",
        "My Cases button with count badge",
        "FAQ quick links"
      ],
      whyItWorks: "Approachable design reduces anxiety about contacting HR; clear categories guide employees"
    },
    {
      name: "Case Submission Form",
      purpose: "Capture case details with appropriate routing",
      uiElements: [
        "Selected category display",
        "Subject line input",
        "Description textarea with helpful prompts",
        "Confidential checkbox with explanation tooltip",
        "Document upload (optional)",
        "Submit button with confirmation"
      ],
      whyItWorks: "Simple form with guidance ensures HR receives needed information"
    },
    {
      name: "My Cases List",
      purpose: "Employee view of their submitted cases",
      uiElements: [
        "Case cards with number, subject, status, last update",
        "Status indicators (Open, In Progress, Awaiting Info, Resolved)",
        "Click to view details",
        "Confidential cases marked with lock icon"
      ],
      whyItWorks: "Visibility into case status reduces duplicate submissions and anxiety"
    },
    {
      name: "Case Detail (Employee View)",
      purpose: "Full case information and communication",
      uiElements: [
        "Case number and subject",
        "Status with timeline visualization",
        "Message thread with HR responses",
        "Add comment/question field",
        "Attached documents list",
        "Close case option (if resolved)"
      ],
      whyItWorks: "Clear communication thread maintains context and supports resolution"
    },
    {
      name: "HR Case Queue",
      purpose: "Efficient case management for HR generalists",
      uiElements: [
        "Queue tabs: My Cases, Unassigned, All (with role-based visibility)",
        "Filters: Category, Status, SLA Status, Priority",
        "Sort by: Date, Priority, SLA urgency",
        "Case rows with SLA countdown",
        "Quick assign and status update",
        "Confidential queue (separate, restricted access)"
      ],
      whyItWorks: "SLA visibility and filtering enable prioritization; confidential separation ensures security"
    },
    {
      name: "Case Detail (HR View)",
      purpose: "Complete case context for resolution",
      uiElements: [
        "Employee info panel (name, dept, manager, tenure)",
        "Case timeline with all activities",
        "Internal notes section (HR-only)",
        "Reply to employee composer",
        "Status and assignment controls",
        "Resolution form with category and notes",
        "Audit history expandable section"
      ],
      whyItWorks: "All context in one view with clear separation of internal vs external communication"
    },
    {
      name: "HR Manager Dashboard",
      purpose: "Operational oversight and compliance monitoring",
      uiElements: [
        "KPI cards: Open cases, SLA compliance %, Avg resolution time",
        "Cases at risk of SLA breach",
        "Team workload distribution",
        "Case volume by category (chart)",
        "Resolution time trends (chart)",
        "Export reports button"
      ],
      whyItWorks: "Real-time metrics enable proactive management and resource allocation"
    }
  ],
  userFlow: [
    "Employee logs in via SSO",
    "Employee sees welcoming portal with category options",
    "Employee selects category (e.g., Benefits Question)",
    "Employee fills form with subject, description, optional documents",
    "For sensitive matters: Employee checks 'Confidential' option",
    "Employee submits and receives case number",
    "Standard cases appear in HR generalist queue",
    "Confidential cases appear only in restricted ER queue",
    "HR generalist claims or is assigned case",
    "HR reviews employee info, adds internal notes",
    "HR sends response to employee (triggers email notification)",
    "Employee views update in My Cases, can add comments",
    "HR resolves case with resolution category and notes",
    "Employee receives resolution notification",
    "HR manager views dashboard for team performance",
    "Monthly reports generated for leadership"
  ],
  dataSources: {
    mvpSources: [
      "PostgreSQL database for all case data",
      "Employee directory via CSV import (name, dept, manager, hire date)",
      "SSO integration for authentication",
      "Email service for notifications",
      "File storage for case attachments"
    ],
    futureSources: [
      "Workday HRIS for real-time employee data",
      "Learning management system for training records",
      "Digital signature service for documents",
      "Analytics platform for advanced reporting"
    ]
  },
  legalGuardrails: [
    "All case data encrypted at rest (AES-256) and in transit (TLS 1.3)",
    "Confidential cases have additional encryption and access controls",
    "Complete audit trail for all case access and modifications",
    "Role-based access strictly enforced (generalist vs manager vs ER)",
    "7-year data retention per employment law requirements",
    "GDPR-ready: support for data subject access requests and right to erasure",
    "Case history exportable for legal discovery",
    "Access logs retained for compliance audits",
    "WCAG 2.1 AA accessibility compliance required"
  ],
  buildPrompt: `Build PeopleFirst, an HR case management system for 3000 employees.

## Core Features

### Employee Portal
- Category-based case submission: Benefits, Payroll, Leave, Policy, General
- Confidential option for sensitive cases (harassment, discrimination)
- Document attachments
- My Cases view with status tracking
- Add comments to existing cases
- Email notifications for updates

### HR Case Queue
- Case assignment and status management
- Filters: category, status, SLA status, priority
- Internal notes (not visible to employees)
- Confidential cases in separate restricted queue
- SLA timers by case type

### Confidential Case Handling
- Visible only to HR managers and ER specialists
- Enhanced audit logging
- Higher priority with stricter SLAs

### HR Manager Dashboard
- KPI metrics: open cases, SLA compliance, resolution times
- Team workload distribution
- Case trends and category breakdown
- Export reports (CSV, PDF)

## Technical Requirements
- React + TypeScript frontend
- Node.js/Express backend
- PostgreSQL database
- SSO integration
- Email notifications
- WCAG 2.1 AA accessibility
- 7-year audit trail retention

## Design
- Warm, approachable colors (soft company tones)
- Simple, supportive language
- Accessible interface
- Light theme`,
  lastGeneratedAt: new Date().toISOString(),
  agreed: true
};

const hrPrompts: PromptBundle[] = [
  {
    id: generateId(),
    sequence: 1,
    category: "Foundation",
    title: "Database Schema and Project Setup",
    content: `Set up PeopleFirst with the following database schema:

## Database Tables (PostgreSQL)

### employees (synced from CSV/HRIS)
- id (UUID, primary key)
- employee_id (company ID, unique)
- email (unique, not null)
- name (not null)
- department (text)
- manager_id (UUID, nullable)
- hire_date (date)
- sso_id (for SSO linking)
- created_at, updated_at

### hr_users
- id (UUID, primary key)
- employee_id (foreign key to employees)
- role (enum: 'generalist', 'specialist', 'manager', 'er_specialist')
- can_view_confidential (boolean, default false)
- created_at

### cases
- id (UUID, primary key)
- case_number (auto-generated: HR-YYYYMMDD-XXXX)
- submitted_by (employee_id foreign key)
- category (enum: 'benefits', 'payroll', 'leave', 'policy', 'general')
- subject (text, not null)
- description (text, not null)
- is_confidential (boolean, default false)
- priority (enum: 'low', 'medium', 'high', 'urgent')
- status (enum: 'new', 'open', 'pending_info', 'resolved', 'closed')
- assigned_to (hr_users.id, nullable)
- resolution_category (text, nullable)
- resolution_notes (text, nullable)
- acknowledged_at (timestamp)
- resolved_at (timestamp)
- created_at, updated_at

### case_comments
- id (UUID, primary key)
- case_id (foreign key)
- author_id (employee_id or hr_user_id)
- author_type (enum: 'employee', 'hr')
- content (text)
- is_internal (boolean, default false)
- created_at

### case_attachments
- id (UUID, primary key)
- case_id (foreign key)
- filename (text)
- file_url (text)
- file_size (integer)
- uploaded_by (employee_id or hr_user_id)
- created_at

### case_audit_log
- id (serial, primary key)
- case_id (foreign key)
- user_id (UUID)
- user_type (enum: 'employee', 'hr')
- action (text: 'viewed', 'created', 'updated', 'commented', 'assigned', 'resolved')
- field_changed (text, nullable)
- old_value, new_value (text, nullable)
- ip_address (text)
- created_at

### sla_policies
- id (serial, primary key)
- category (matches case category)
- is_confidential (boolean)
- acknowledgment_hours (integer)
- resolution_hours (integer)

Create SLA seed data:
- Standard cases: 4hr acknowledgment, 40hr (5 days) resolution
- Confidential cases: 2hr acknowledgment, 24hr resolution`,
    deliverable: "Complete database schema with SLA policies and audit logging",
    roles: ["manager"]
  },
  {
    id: generateId(),
    sequence: 2,
    category: "Authentication",
    title: "SSO Integration and Access Control",
    content: `Implement authentication with confidentiality controls:

## SSO Integration
- Configure OAuth 2.0 / OIDC with identity provider
- Map SSO attributes to employee record
- Auto-create employee on first login
- Link existing employees by email

## Role-Based Access Control
- Employee: Can only view/manage their own cases
- HR Generalist: Can view non-confidential cases
- HR Manager: Full access to all cases
- ER Specialist: Access to confidential cases

## Access Middleware
- requireAuth - Valid session required
- requireHR - HR user required
- requireConfidentialAccess - ER or Manager only

## Audit Logging
- Log all case access (view events)
- Capture IP address and timestamp
- Special logging for confidential case access

## API Endpoints
- GET /api/auth/sso/login
- GET /api/auth/sso/callback
- POST /api/auth/logout
- GET /api/auth/me (includes role and permissions)

## Development Mode
- Fallback to email/password
- Seed test accounts for each role`,
    deliverable: "SSO authentication with role-based confidential access",
    roles: ["employee", "generalist", "manager"]
  },
  {
    id: generateId(),
    sequence: 3,
    category: "Core Feature",
    title: "Employee Case Submission Portal",
    content: `Build the employee-facing submission portal:

## Portal Home
- Welcoming header: "How can we help you today?"
- Category cards with icons:
  - Benefits (heart icon)
  - Payroll (dollar icon)
  - Leave (calendar icon)
  - Policy Questions (book icon)
  - General Inquiry (message icon)
- "My Cases" button with unresolved count
- Confidential submission link (subtle but clear)

## Case Submission Form
- Category shown at top
- Subject input (required)
- Description textarea with placeholder guidance
- Confidential checkbox with tooltip:
  "Check this for sensitive matters like harassment, discrimination, or personal issues. These cases are only visible to designated HR staff."
- Document upload (optional, multiple files, max 10MB each)
- Submit button

## Confirmation
- Case number displayed prominently
- Acknowledgment: "We'll respond within [X] hours"
- Link to view case status

## Accessibility (WCAG 2.1 AA)
- Proper form labels and ARIA attributes
- Keyboard navigation
- Color contrast ratios
- Focus indicators
- Screen reader compatible

## API Endpoints
- POST /api/cases - Create case
- GET /api/cases/mine - Employee's cases
- POST /api/cases/:id/attachments - Upload files`,
    deliverable: "Accessible employee portal with confidential submission option",
    roles: ["employee"]
  },
  {
    id: generateId(),
    sequence: 4,
    category: "Core Feature",
    title: "My Cases - Employee View",
    content: `Build the employee case tracking view:

## My Cases List
- Case cards showing:
  - Case number
  - Subject (truncated if long)
  - Status badge (color-coded)
  - Last update timestamp
  - Confidential indicator (lock icon)
- Sort by: Date (newest first), Status
- Status filters

## Case Detail View
- Case header: Number, Subject, Status
- Status timeline visualization
- Message thread:
  - Employee's original submission
  - HR responses
  - Employee replies
- Add Comment form (rich text)
- Attached documents list with download
- Close case option (if resolved)

## Notifications
- Email when HR responds
- In-app notification badge

## API Endpoints
- GET /api/cases/mine - List employee's cases
- GET /api/cases/:id - Case detail (with access check)
- POST /api/cases/:id/comments - Add comment
- PATCH /api/cases/:id/close - Employee closes case`,
    deliverable: "Complete employee case tracking and communication",
    roles: ["employee"]
  },
  {
    id: generateId(),
    sequence: 5,
    category: "Core Feature",
    title: "HR Case Queue",
    content: `Build the HR generalist case queue:

## Queue Tabs
- My Cases (assigned to me)
- Unassigned (not yet claimed)
- All Open (managers see all, generalists see non-confidential)
- Resolved (recent, last 30 days)

## Confidential Queue (Restricted)
- Separate tab visible only to managers/ER specialists
- Cases with is_confidential = true
- Enhanced visual distinction (different color)

## Filters
- Category dropdown
- Status dropdown
- SLA Status: On Track, At Risk, Breached
- Date range
- Assigned to (manager only)

## Queue Table
- Columns: Case#, Employee, Category, Subject, Status, SLA Timer, Assigned
- SLA indicators:
  - Green: Plenty of time
  - Yellow: < 50% remaining
  - Red: Breached
- Row click opens detail

## Quick Actions
- Assign to me
- Change priority
- Reassign (managers)

## API Endpoints
- GET /api/hr/cases - With filters (respects access level)
- PATCH /api/hr/cases/:id/assign - Assign case
- GET /api/hr/cases/confidential - Confidential queue (restricted)`,
    deliverable: "HR queue with confidential case separation",
    roles: ["generalist", "manager"]
  },
  {
    id: generateId(),
    sequence: 6,
    category: "Core Feature",
    title: "HR Case Detail and Resolution",
    content: `Build the HR case management view:

## Employee Info Panel
- Name, department, manager
- Hire date and tenure
- Previous cases (count and link)
- Contact info

## Case Timeline
- All activities chronologically:
  - Creation
  - Status changes
  - Comments (internal flagged differently)
  - Assignments
- Each entry: Author, timestamp, content

## Internal Notes
- Separate section, clearly marked "Internal - Not visible to employee"
- Add internal note form
- Visible only to HR users

## Communication
- Reply to employee form
- Templates dropdown for common responses
- Automatic email notification

## Actions
- Status dropdown
- Priority change
- Assign/reassign
- For confidential: Transfer to ER specialist

## Resolution
- Resolution category dropdown:
  - Answered question
  - Issue resolved
  - Policy clarified
  - Referred to specialist
  - No action needed
- Resolution notes
- Resolve button

## Audit Section (Expandable)
- Complete access and change history
- Who viewed, when
- All modifications

## API Endpoints
- GET /api/hr/cases/:id - Full case with timeline
- POST /api/hr/cases/:id/comments - Add comment/note
- PATCH /api/hr/cases/:id - Update status, priority, assignment
- POST /api/hr/cases/:id/resolve - Resolve with category/notes`,
    deliverable: "Complete HR case management with internal notes and audit",
    roles: ["generalist", "manager"]
  },
  {
    id: generateId(),
    sequence: 7,
    category: "Dashboard",
    title: "HR Manager Dashboard",
    content: `Build the HR leadership dashboard:

## KPI Cards
- Open Cases (with trend vs last month)
- SLA Compliance % (acknowledgment and resolution)
- Avg Resolution Time (business hours)
- Cases This Month (volume)

## At Risk Cases
- List of cases approaching SLA breach
- Sorted by urgency
- Quick reassign capability

## Team Workload
- HR staff table:
  - Name, role
  - Open cases count
  - Avg resolution time
  - Cases resolved this week
- Balanced workload indicators

## Charts
- Case Volume Trend (line chart, last 90 days)
- Category Distribution (pie chart)
- Resolution Time by Category (bar chart)
- Confidential vs Standard ratio

## Reports
- Date range selector
- Filter by category, HR staff
- Export to CSV, PDF
- Scheduled monthly report option

## API Endpoints
- GET /api/hr/dashboard/kpis - Aggregate metrics
- GET /api/hr/dashboard/at-risk - SLA risk cases
- GET /api/hr/dashboard/workload - Team stats
- GET /api/hr/dashboard/charts - Chart data
- GET /api/hr/reports/export - Generate report`,
    deliverable: "Manager dashboard with full metrics and exports",
    roles: ["manager"]
  },
  {
    id: generateId(),
    sequence: 8,
    category: "Notifications",
    title: "Email Notifications and Audit",
    content: `Implement notification and compliance systems:

## Email Notifications
1. Case Submitted (to employee)
   - Case number
   - Expected response time
   - Link to view status

2. Case Assigned (to HR)
   - Case summary
   - Employee info
   - Link to case

3. HR Response (to employee)
   - Message content
   - Link to respond

4. Case Resolved (to employee)
   - Resolution summary
   - Feedback option

5. SLA Warning (to HR)
   - 4 hours before breach
   - Escalate if not acknowledged

## Email Templates
- Warm, supportive tone
- Company branding
- Mobile responsive
- Accessibility compliant

## Comprehensive Audit
- All case access logged
- All changes with old/new values
- IP address and timestamp
- User identity
- 7-year retention

## GDPR Support
- Data export for employee (their cases)
- Right to erasure workflow (with legal hold exception)

## API Endpoints
- GET /api/employees/:id/data-export - GDPR export
- POST /api/admin/retention/apply - Apply retention policy`,
    deliverable: "Notification system and 7-year audit trail",
    roles: ["employee", "generalist", "manager"]
  },
  {
    id: generateId(),
    sequence: 9,
    category: "Admin",
    title: "Employee Directory and CSV Import",
    content: `Build employee data management:

## CSV Import
- Template download with columns:
  - employee_id
  - email
  - name
  - department
  - manager_email (to link)
  - hire_date
- Upload with validation
- Preview before import
- Error report for issues
- Update existing or create new

## Employee Directory (HR View)
- Search by name, email, department
- View employee profile:
  - Basic info
  - Manager chain
  - Tenure
  - Case history summary
- Link to related cases

## HR User Management (Admin)
- List HR users
- Assign roles
- Toggle confidential access
- Deactivate HR accounts

## API Endpoints
- POST /api/admin/employees/import - CSV import
- GET /api/admin/employees - List with search
- GET /api/employees/:id - Employee profile
- POST /api/admin/hr-users - Create HR user
- PATCH /api/admin/hr-users/:id - Update role/access`,
    deliverable: "Employee directory with CSV import and HR user management",
    roles: ["manager"]
  },
  {
    id: generateId(),
    sequence: 10,
    category: "Polish",
    title: "Accessibility and Final Testing",
    content: `Complete the application with accessibility focus:

## WCAG 2.1 AA Compliance
- Semantic HTML structure
- All form fields with labels
- Focus indicators visible
- Color contrast ratios (4.5:1 for text)
- Skip navigation links
- Keyboard-accessible modals
- Screen reader testing
- Error messages linked to fields

## UI Polish
- Warm, supportive color palette
- Consistent spacing and typography
- Loading states
- Empty states with guidance
- Error handling with clear messages
- Light theme implementation

## Performance
- Pagination for all lists
- Optimistic UI updates
- Efficient queries with indexes

## Testing Checklist
- [ ] Employee can submit standard case
- [ ] Employee can submit confidential case
- [ ] Confidential cases only visible to ER/managers
- [ ] HR can add internal notes (not visible to employee)
- [ ] SLA timers calculate correctly
- [ ] Email notifications send on status changes
- [ ] Manager dashboard shows accurate metrics
- [ ] Audit trail captures all access and changes
- [ ] CSV import works correctly
- [ ] All screens keyboard navigable
- [ ] Screen reader compatible`,
    deliverable: "Accessible, WCAG-compliant HR case management system",
    roles: ["employee", "generalist", "manager"]
  }
];

export const hrCaseManagementProject: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
  name: "PeopleFirst - HR Case Management",
  scriptSource: "paste",
  currentStep: 5,
  questions: hrQuestions,
  detailedSummary: hrDetailedSummary,
  generatedPrompts: hrPrompts,
};

// Helper function to create a full project from demo data
export function createDemoProject(
  demoData: Omit<Project, "id" | "createdAt" | "updatedAt">
): Omit<Project, "id" | "createdAt" | "updatedAt"> {
  return {
    ...demoData,
  };
}

// Export all demo projects as array
export const allDemoProjects = [
  { key: "facilities", name: "Facilities Management", data: facilitiesManagementProject },
  { key: "itsm", name: "IT Service Management", data: itServiceManagementProject },
  { key: "hr", name: "HR Case Management", data: hrCaseManagementProject },
];
