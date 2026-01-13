import type { Project, Question } from "@shared/schema";

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
export const facilitiesManagementProject: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
  name: "FacilityHub - Facilities Management",
  scriptSource: "paste",
  currentStep: 2,
  questions: [
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
  ],
};

// ============================================
// DEMO 2: IT Service Management Application
// ============================================
export const itServiceManagementProject: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
  name: "ServiceDesk Pro - IT Service Management",
  scriptSource: "paste",
  currentStep: 2,
  questions: [
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
  ],
};

// ============================================
// DEMO 3: HR Case Management Application
// ============================================
export const hrCaseManagementProject: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
  name: "PeopleFirst - HR Case Management",
  scriptSource: "paste",
  currentStep: 2,
  questions: [
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
  ],
};

// Helper function to create a full project from demo data
export function createDemoProject(
  demoData: Omit<Project, "id" | "createdAt" | "updatedAt">
): Project {
  const now = new Date().toISOString();
  return {
    ...demoData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
}

// Export all demo projects as array
export const allDemoProjects = [
  { key: "facilities", name: "Facilities Management", data: facilitiesManagementProject },
  { key: "itsm", name: "IT Service Management", data: itServiceManagementProject },
  { key: "hr", name: "HR Case Management", data: hrCaseManagementProject },
];
