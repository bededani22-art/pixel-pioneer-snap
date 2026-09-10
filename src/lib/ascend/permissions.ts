import type { Role, User } from "./types";

/**
 * Central permission model. Prototype-level, but the only place roles are
 * interpreted — UI never hard-codes role checks. A secure backend can later
 * enforce exactly the same matrix.
 */
export type Capability =
  | "projects.write"
  | "letters.write"
  | "claims.write"
  | "delays.write"
  | "plan.write"
  | "users.manage"
  | "system.manage";

const MATRIX: Record<Role, Capability[]> = {
  Administrator: [
    "projects.write",
    "letters.write",
    "claims.write",
    "delays.write",
    "plan.write",
    "users.manage",
    "system.manage",
  ],
  "Contract Administrator": [
    "projects.write",
    "letters.write",
    "claims.write",
    "delays.write",
    "plan.write",
  ],
  "Claims Engineer": ["letters.write", "claims.write", "delays.write", "plan.write"],
  "Project Manager": ["projects.write", "plan.write", "letters.write"],
  Viewer: [],
};

export function can(user: User | null | undefined, capability: Capability): boolean {
  if (!user || !user.active) return false;
  return (MATRIX[user.role] ?? []).includes(capability);
}

export const ROLES: Role[] = [
  "Administrator",
  "Contract Administrator",
  "Claims Engineer",
  "Project Manager",
  "Viewer",
];
