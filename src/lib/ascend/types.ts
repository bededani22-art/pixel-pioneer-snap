export type ID = string;

export type Role =
  | "Administrator"
  | "Contract Administrator"
  | "Claims Engineer"
  | "Project Manager"
  | "Viewer";

export interface User {
  id: ID;
  username: string;
  password: string;
  name: string;
  role: Role;
  active: boolean;
}

export type CurrencyCode = "USD" | "ETB" | "EUR" | "GBP" | string;

export interface CurrencyAllocation {
  code: CurrencyCode;
  pct: number;
}

export type ProjectStatus = "in_progress" | "completed";

export interface Project {
  id: ID;
  name: string;
  contractRef: string;
  employer: string;
  consultant: string;
  contractor: string;
  contractType: string;
  contractTypeOther?: string;
  currencies: CurrencyAllocation[];
  status: ProjectStatus;
  standing: string;
  standingNote?: string;
  noticePeriodDays: number;
  prelimRatePerDay: number;
  criticalFloatThreshold: number;
  dates: {
    commencement?: string;
    originalCompletion?: string;
    revisedCompletion?: string;
    eotGranted?: string;
    takingOver?: string;
    defectsNotificationEnd?: string;
    contractExpiry?: string;
  };
  createdAt: string;
}

export type LetterType =
  | "Notice"
  | "EOT"
  | "Claim"
  | "Response"
  | "Instruction"
  | "Variation"
  | "Delay"
  | "Payment"
  | "Contractual"
  | "Warning"
  | "Dispute"
  | "Arbitration"
  | "Other";

export interface Letter {
  id: ID;
  projectId: ID;
  ref: string;
  date: string;
  subject: string;
  sender: string;
  recipient: string;
  type: LetterType;
  description: string;
  claimId?: ID;
  eventId?: ID;
  actionId?: ID;
  attachments: DocumentRecord[];
}

export type ClaimType =
  | "Extension of Time"
  | "Prolongation Cost"
  | "Variation"
  | "Additional Cost"
  | "Delay"
  | "Disruption"
  | "Price Escalation"
  | "Force Majeure"
  | "Employer Risk"
  | "Contractor Claim"
  | "Other";

export type ClaimStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Pending Decision"
  | "Approved"
  | "Partially Approved"
  | "Rejected"
  | "Settled"
  | "Dispute"
  | "Arbitration";

export interface Claim {
  id: ID;
  projectId: ID;
  ref: string;
  title: string;
  type: ClaimType;
  status: ClaimStatus;
  submittedDate?: string;
  claimedDays: number | null;
  approvedDays: number | null;
  currency: CurrencyCode;
  claimedAmount: number | null;
  approvedAmount: number | null;
  settledAmount: number | null;
  notes?: string;
}

export type RiskParty = "employer" | "contractor" | "neutral";
export type EventStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "partial"
  | "rejected";

export interface DelayEvent {
  id: ID;
  projectId: ID;
  ref: string;
  title: string;
  category: string;
  activityCode?: string;
  activityName?: string;
  startDate: string;
  endDate: string;
  risk: RiskParty;
  excusable: boolean;
  compensable: "yes" | "no" | "partial";
  floatBeforeDays: number | null;
  criticalAtEvent: boolean;
  completionImpactDays: number | null;
  claimedDays: number | null;
  grantedDays: number | null;
  status: EventStatus;
  noticeGivenDate?: string;
  noticePeriodDays?: number | null;
  ratePerDay?: number | null;
  claimId?: ID;
}

export type ActionPriority = "must" | "attention" | "normal";
export type ActionStatus = "planned" | "done" | "not_completed";

export interface PlanAction {
  id: ID;
  projectId: ID;
  actionType: string;
  weekStarting: string;
  dueDate: string;
  description: string;
  linkedRef?: string;
  status: ActionStatus;
  priority: ActionPriority;
  notes?: string;
}

export interface DocumentRecord {
  id: ID;
  projectId: ID;
  contract?: string;
  name: string;
  docType: string;
  ref?: string;
  date?: string;
  size?: number;
}

export interface Database {
  users: User[];
  projects: Project[];
  letters: Letter[];
  claims: Claim[];
  events: DelayEvent[];
  actions: PlanAction[];
  documents: DocumentRecord[];
  settings: { theme: "light" | "dark" };
}
