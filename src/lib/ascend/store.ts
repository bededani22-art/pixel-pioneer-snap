import { useSyncExternalStore } from "react";
import type { Database, User } from "./types";
import { seedDatabase } from "./seed";

const DB_KEY = "ascend.db.v1";
const SESSION_KEY = "ascend.session.v1";

let db: Database = seedDatabase();
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function ls(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function loadDatabase() {
  if (loaded) return;
  loaded = true;
  const store = ls();
  const raw = store?.getItem(DB_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<Database>;
      db = { ...seedDatabase(), ...parsed } as Database;
    } catch {
      /* keep seed */
    }
  } else {
    persist();
  }
  emit();
}

function persist() {
  ls()?.setItem(DB_KEY, JSON.stringify(db));
}

export function getDatabase(): Database {
  return db;
}

const serverSnapshot = seedDatabase();
function getServerSnapshot(): Database {
  return serverSnapshot;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDatabase(): Database {
  return useSyncExternalStore(subscribe, getDatabase, getServerSnapshot);
}

export function update(mutator: (draft: Database) => void) {
  const next: Database = JSON.parse(JSON.stringify(db));
  mutator(next);
  db = next;
  persist();
  emit();
}

export function resetDatabase() {
  db = seedDatabase();
  persist();
  emit();
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

/* ---------------- session / authentication ----------------
 * Prototype only: credentials live in the local data store, in the browser.
 * This is NOT secure production authentication — it exists so the UI and the
 * permission model can be built now and moved to a secure backend later.
 */

export interface Session {
  userId: string;
  at: string;
}

let session: Session | null = null;
let sessionLoaded = false;
const sessionListeners = new Set<() => void>();

function emitSession() {
  
  sessionListeners.forEach((l) => l());
}

export function loadSession() {
  if (sessionLoaded) return;
  sessionLoaded = true;
  const raw = ls()?.getItem(SESSION_KEY);
  if (raw) {
    try {
      session = JSON.parse(raw) as Session;
    } catch {
      session = null;
    }
  }
  emitSession();
}

export function getSession(): Session | null {
  return session;
}

function getServerSession(): Session | null {
  return null;
}

export function useSession(): Session | null {
  return useSyncExternalStore(
    (l) => {
      sessionListeners.add(l);
      return () => sessionListeners.delete(l);
    },
    getSession,
    getServerSession,
  );
}

export function useCurrentUser(): User | null {
  const s = useSession();
  const data = useDatabase();
  if (!s) return null;
  return data.users.find((u) => u.id === s.userId) ?? null;
}

export function signIn(username: string, password: string): { ok: boolean; error?: string } {
  const user = db.users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
  );
  if (!user || user.password !== password) {
    return { ok: false, error: "Incorrect username or password." };
  }
  if (!user.active) return { ok: false, error: "This account is inactive. Contact an administrator." };
  session = { userId: user.id, at: new Date().toISOString() };
  ls()?.setItem(SESSION_KEY, JSON.stringify(session));
  emitSession();
  return { ok: true };
}

export function signOut() {
  session = null;
  ls()?.removeItem(SESSION_KEY);
  emitSession();
}

/* ---------------- theme ---------------- */

const THEME_KEY = "ascend.theme";

export function readTheme(): "light" | "dark" {
  const t = ls()?.getItem(THEME_KEY);
  return t === "dark" ? "dark" : "light";
}

export function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  ls()?.setItem(THEME_KEY, theme);
}
