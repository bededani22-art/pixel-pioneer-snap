import { addDays, dayDiff, todayISO } from "./format";
import type { DelayEvent, Project } from "./types";

export const CONTRACT_TYPES = [
  "FIDIC Red Book",
  "FIDIC Yellow Book",
  "FIDIC Silver Book",
  "FIDIC Green Book",
  "PPA",
  "NEC",
  "JCT",
  "Other",
];

export const CURRENCIES = ["USD", "ETB", "EUR", "GBP", "Other"];

export const STANDINGS = [
  "Contract Administration",
  "Construction Ongoing",
  "EOT Under Review",
  "Claim Preparation",
  "Claim Submitted",
  "Claim Under Evaluation",
  "Dispute",
  "Arbitration",
  "Completed",
  "Final Account",
  "Closeout",
  "Other",
];

export const NOTICE_PERIODS = [7, 14, 21, 28, 42];

export const LETTER_TYPES = [
  "Notice",
  "EOT",
  "Claim",
  "Response",
  "Instruction",
  "Variation",
  "Delay",
  "Payment",
  "Contractual",
  "Warning",
  "Dispute",
  "Arbitration",
  "Other",
] as const;

export const CLAIM_TYPES = [
  "Extension of Time",
  "Prolongation Cost",
  "Variation",
  "Additional Cost",
  "Delay",
  "Disruption",
  "Price Escalation",
  "Force Majeure",
  "Employer Risk",
  "Contractor Claim",
  "Other",
] as const;

export const CLAIM_STATUSES = [
  "Draft",
  "Submitted",
  "Under Review",
  "Pending Decision",
  "Approved",
  "Partially Approved",
  "Rejected",
  "Settled",
  "Dispute",
  "Arbitration",
] as const;

export const EVENT_STATUSES: { v: DelayEvent["status"]; label: string; tone: Tone }[] = [
  { v: "draft", label: "Draft", tone: "neutral" },
  { v: "submitted", label: "Submitted", tone: "accent" },
  { v: "under_review", label: "Under review", tone: "warning" },
  { v: "approved", label: "Approved", tone: "success" },
  { v: "partial", label: "Partially approved", tone: "warning" },
  { v: "rejected", label: "Rejected", tone: "danger" },
];

export const ACTION_TYPES = [
  "Submit EOT",
  "Send Letter",
  "Attend Meeting",
  "Prepare Claim",
  "Review Determination",
  "Update Registry",
  "Other Action",
];

export const DOC_TYPES = [
  "Contract",
  "Letter",
  "Completion Letter",
  "Taking-Over Certificate",
  "Performance Certificate",
  "Final Account",
  "Final Claim",
  "Settlement Agreement",
  "Certificate",
  "Claim",
  "Delay Analysis",
  "Meeting Minutes",
  "Drawing",
  "Other",
];

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

export function claimStatusTone(status: string): Tone {
  switch (status) {
    case "Settled":
    case "Approved":
      return "success";
    case "Under Review":
    case "Pending Decision":
    case "Partially Approved":
      return "warning";
    case "Rejected":
    case "Dispute":
    case "Arbitration":
      return "danger";
    case "Submitted":
      return "accent";
    default:
      return "neutral";
  }
}

export function eventStatusMeta(status: DelayEvent["status"]) {
  return EVENT_STATUSES.find((s) => s.v === status) ?? EVENT_STATUSES[0];
}

export interface NoticeInfo {
  period: number;
  due: string | null;
  given?: string;
  status: "on_time" | "late" | "overdue" | "pending" | "unknown";
  label: string;
}

export function noticeInfo(e: DelayEvent, project?: Project | null): NoticeInfo {
  const period = e.noticePeriodDays ?? project?.noticePeriodDays ?? 28;
  const due = e.startDate ? addDays(e.startDate, period) : null;
  if (!due) return { period, due: null, status: "unknown", label: "—" };
  if (e.noticeGivenDate) {
    const late = (dayDiff(due, e.noticeGivenDate) ?? 0) > 0;
    return {
      period,
      due,
      given: e.noticeGivenDate,
      status: late ? "late" : "on_time",
      label: late ? "Notice late" : "Notice on time",
    };
  }
  const overdue = (dayDiff(due, todayISO()) ?? 0) > 0;
  return {
    period,
    due,
    status: overdue ? "overdue" : "pending",
    label: overdue ? "Notice overdue" : "Notice pending",
  };
}

/** Overlapping Employer-risk vs Contractor-risk windows where one was critical. */
export function concurrency(events: DelayEvent[]) {
  const pairs: { a: DelayEvent; b: DelayEvent; start: string; end: string; days: number }[] = [];
  const flags: Record<string, boolean> = {};
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];
      const opposed =
        (a.risk === "employer" && b.risk === "contractor") ||
        (a.risk === "contractor" && b.risk === "employer");
      if (!opposed) continue;
      if (!a.criticalAtEvent && !b.criticalAtEvent) continue;
      const start = a.startDate > b.startDate ? a.startDate : b.startDate;
      const end = a.endDate < b.endDate ? a.endDate : b.endDate;
      if (!start || !end || start > end) continue;
      flags[a.id] = true;
      flags[b.id] = true;
      pairs.push({ a, b, start, end, days: (dayDiff(start, end) ?? 0) + 1 });
    }
  }
  return { pairs, flags };
}

export function eventRate(e: DelayEvent, project?: Project | null): number {
  return e.ratePerDay ?? project?.prelimRatePerDay ?? 0;
}
