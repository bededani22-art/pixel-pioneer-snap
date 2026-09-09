import type { Claim, CurrencyCode, Project } from "./types";

export function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

export function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

export function fmtNum(v: number | null | undefined, digits = 0): string {
  if (v === null || v === undefined || isNaN(v)) return "—";
  return v.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function fmtMoney(code: CurrencyCode, amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "—";
  return `${code} ${Math.round(amount).toLocaleString()}`;
}

export function dayDiff(a?: string | null, b?: string | null): number | null {
  if (!a || !b) return null;
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  if (isNaN(d1) || isNaN(d2)) return null;
  return Math.round((d2 - d1) / 86400000);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Group claim money by currency so different currencies are never summed together. */
export function totalsByCurrency(
  claims: Claim[],
  field: "claimedAmount" | "approvedAmount" | "settledAmount",
): { code: CurrencyCode; total: number }[] {
  const map = new Map<string, number>();
  claims.forEach((c) => {
    const v = c[field];
    if (v === null || v === undefined || isNaN(v)) return;
    map.set(c.currency, (map.get(c.currency) ?? 0) + v);
  });
  return [...map.entries()]
    .map(([code, total]) => ({ code, total }))
    .sort((a, b) => b.total - a.total);
}

export function projectCurrencyLabel(p: Project): string {
  if (!p.currencies.length) return "—";
  return p.currencies.map((c) => `${c.code} ${c.pct}%`).join(" · ");
}

export function primaryCurrency(p?: Project | null): CurrencyCode {
  if (!p || !p.currencies.length) return "USD";
  return [...p.currencies].sort((a, b) => b.pct - a.pct)[0].code;
}

export function contractTypeLabel(p: Project): string {
  return p.contractType === "Other" ? p.contractTypeOther || "Other" : p.contractType;
}
