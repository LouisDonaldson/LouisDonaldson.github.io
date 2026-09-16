// Data layer: Firebase Authentication + Cloud Firestore.
// All of your data lives under users/{yourUid}/... and the security rules
// (firestore.rules) only let your account read or write it.
//
// The app keeps a live copy of your clients and sessions in memory (Firestore
// listeners + an offline cache), so every page is calculated in the browser.

import { firebaseConfig } from "./firebase-config.js";
import {
  initializeApp,
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail,
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, onSnapshot, setDoc, updateDoc, writeBatch, terminate, clearIndexedDbPersistence,
} from "./vendor/firebase.js";

export const configured = Boolean(firebaseConfig?.apiKey && !String(firebaseConfig.apiKey).startsWith("PASTE"));

const STATUSES = ["scheduled", "completed", "cancelled", "no_show"];
const CHARGEABLE = new Set(["completed", "no_show"]);
const CLIENT_FIELDS = ["name", "contact_name", "email", "phone", "subject", "level", "hourly_rate_pence", "notes", "active"];
const SESSION_FIELDS = ["client_id", "start_at", "duration_min", "subject", "location", "notes", "status", "amount_pence", "paid", "paid_at", "payment_method"];
export const SETTING_KEYS = ["business_name", "your_name", "address", "email", "phone", "payment_details", "invoice_footer"];

let app, auth, db;
if (configured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  try {
    db = initializeFirestore(app, { ignoreUndefinedProperties: true, localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  } catch {
    db = initializeFirestore(app, { ignoreUndefinedProperties: true }); // e.g. private browsing without IndexedDB
  }
}

// ---------- in-memory state ----------

const state = { uid: null, clients: new Map(), sessions: new Map(), settings: {}, ready: null };
const listeners = new Set();
let unsubs = [];

/** Subscribe to data changes (fires after every Firestore update). */
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
const emit = () => listeners.forEach((fn) => fn());

const userCol = (name) => collection(db, "users", state.uid, name);
const userDoc = (name, id) => doc(db, "users", state.uid, name, id);
const settingsDoc = () => doc(db, "users", state.uid, "meta", "settings");

function startListening() {
  stopListening();
  let pending = 3;
  let resolveReady, rejectReady;
  state.ready = new Promise((res, rej) => { resolveReady = res; rejectReady = rej; });
  const first = () => { if (--pending === 0) resolveReady(); };
  const fail = (err) => { console.error(err); rejectReady(friendly(err)); emit(); };

  const watch = (col, map) => {
    let initial = true;
    return onSnapshot(userCol(col), (snap) => {
      for (const ch of snap.docChanges()) {
        if (ch.type === "removed") map.delete(ch.doc.id);
        else map.set(ch.doc.id, { ...ch.doc.data(), id: ch.doc.id });
      }
      if (initial) { initial = false; first(); } else emit();
    }, fail);
  };
  let settingsInitial = true;
  unsubs = [
    watch("clients", state.clients),
    watch("sessions", state.sessions),
    onSnapshot(settingsDoc(), (snap) => {
      state.settings = snap.exists() ? snap.data() : {};
      if (settingsInitial) { settingsInitial = false; first(); } else emit();
    }, fail),
  ];
}

function stopListening() {
  unsubs.forEach((u) => u());
  unsubs = [];
  state.clients.clear();
  state.sessions.clear();
  state.settings = {};
}

// ---------- auth ----------

/** Calls back with true/false whenever the login state changes. */
export function watchAuth(cb) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      state.uid = user.uid;
      startListening();
    } else {
      state.uid = null;
      stopListening();
    }
    cb(user);
  });
}

export const ready = () => state.ready;
export const currentUser = () => auth?.currentUser || null;

export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (e) { throw friendly(e); }
}
/** Logs out and wipes the offline copy of your data from this browser, then reloads. */
export async function logout() {
  stopListening();
  await signOut(auth);
  try {
    await terminate(db);
    await clearIndexedDbPersistence(db);
  } catch (e) { console.warn("Could not clear offline cache", e); }
  location.reload();
}
export async function resetPassword(email) {
  try { await sendPasswordResetEmail(auth, email.trim()); } catch (e) { throw friendly(e); }
}

function friendly(e) {
  const code = e?.code || "";
  const map = {
    "auth/invalid-credential": "Incorrect email or password",
    "auth/invalid-email": "That email address doesn't look right",
    "auth/user-disabled": "This account has been disabled",
    "auth/too-many-requests": "Too many attempts — please wait a few minutes and try again",
    "auth/network-request-failed": "No internet connection",
    "permission-denied": "This account isn't allowed to access the data. Check the UID in your Firestore rules (see README).",
    "unavailable": "Can't reach the database right now — changes will sync when you're back online",
  };
  return new Error(map[code] || e?.message || "Something went wrong");
}

// ---------- helpers ----------

const isDateTime = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const nowIso = () => new Date().toISOString();

function toInt(v, name) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n)) throw new Error(`${name} must be a whole number`);
  return n;
}
function pick(obj, fields) {
  const out = {};
  for (const f of fields) if (obj[f] !== undefined) out[f] = obj[f] === "" ? null : obj[f];
  return out;
}
function addDaysLocal(dt, days) {
  const [d, t] = dt.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, day + days));
  return `${date.toISOString().slice(0, 10)}T${t}`;
}
function validateClient(c, partial) {
  if (!partial || c.name !== undefined) {
    if (!c.name || !String(c.name).trim()) throw new Error("Client name is required");
    c.name = String(c.name).trim();
  }
  if (c.hourly_rate_pence !== undefined) {
    c.hourly_rate_pence = toInt(c.hourly_rate_pence ?? 0, "Hourly rate");
    if (c.hourly_rate_pence < 0) throw new Error("Hourly rate cannot be negative");
  }
  if (c.active !== undefined) c.active = Boolean(c.active);
  return c;
}
function validateSession(s, partial) {
  if (!partial || s.client_id !== undefined) {
    if (!state.clients.has(s.client_id)) throw new Error("Please choose a client");
  }
  if (!partial || s.start_at !== undefined) {
    if (!isDateTime(s.start_at)) throw new Error("Start must be a date and time");
  }
  if (s.duration_min !== undefined) {
    s.duration_min = toInt(s.duration_min, "Duration");
    if (s.duration_min <= 0 || s.duration_min > 1440) throw new Error("Duration must be between 1 and 1440 minutes");
  }
  if (s.status !== undefined && !STATUSES.includes(s.status)) throw new Error("Invalid status");
  if (s.amount_pence !== undefined) {
    s.amount_pence = toInt(s.amount_pence ?? 0, "Amount");
    if (s.amount_pence < 0) throw new Error("Amount cannot be negative");
  }
  if (s.paid !== undefined) {
    s.paid = Boolean(s.paid);
    if (s.paid && !s.paid_at) s.paid_at = today();
    if (!s.paid) { s.paid_at = null; s.payment_method = null; }
  }
  return s;
}

// Firestore batches are limited to 500 writes.
function commitInChunks(ops) {
  const commits = [];
  for (let i = 0; i < ops.length; i += 450) {
    const batch = writeBatch(db);
    ops.slice(i, i + 450).forEach((op) => op(batch));
    commits.push(batch.commit());
  }
  return Promise.all(commits);
}

// Writes resolve once the server confirms. When offline they're queued, so
// don't block the UI waiting: resolve after a short grace period instead.
function settle(p) {
  const tracked = p.catch((e) => { console.error(e); throw friendly(e); });
  tracked.catch(() => {}); // avoid "unhandled rejection" if the error arrives after the grace period
  return Promise.race([tracked, new Promise((r) => setTimeout(r, 1500))]);
}

const isChargeable = (s) => CHARGEABLE.has(s.status);
const isOwed = (s) => isChargeable(s) && !s.paid && s.amount_pence > 0;
const byStart = (a, b) => (a.start_at < b.start_at ? -1 : a.start_at > b.start_at ? 1 : 0);
const withClientName = (s) => ({ ...s, client_name: state.clients.get(s.client_id)?.name ?? "(deleted client)" });
const sum = (arr, f) => arr.reduce((a, x) => a + (f(x) || 0), 0);

// ---------- clients ----------

export function listClients({ now, includeInactive = true } = {}) {
  const sessions = [...state.sessions.values()];
  return [...state.clients.values()]
    .filter((c) => includeInactive || c.active !== false)
    .map((c) => {
      const mine = sessions.filter((s) => s.client_id === c.id);
      const upcoming = mine.filter((s) => s.status === "scheduled" && s.start_at >= now).sort(byStart);
      return {
        ...c,
        active: c.active !== false,
        completed_count: mine.filter((s) => s.status === "completed").length,
        owed_pence: sum(mine.filter(isOwed), (s) => s.amount_pence),
        next_session: upcoming[0]?.start_at || null,
      };
    })
    .sort((a, b) => (b.active - a.active) || a.name.localeCompare(b.name, "en-GB", { sensitivity: "base" }));
}

export function getClient(id, now) {
  const c = state.clients.get(id);
  if (!c) throw new Error("Client not found");
  const mine = [...state.sessions.values()].filter((s) => s.client_id === id);
  const completed = mine.filter((s) => s.status === "completed");
  const next = mine.filter((s) => s.status === "scheduled" && s.start_at >= now).sort(byStart)[0];
  return {
    ...c,
    active: c.active !== false,
    stats: {
      completed_count: completed.length,
      completed_minutes: sum(completed, (s) => s.duration_min),
      paid_pence: sum(mine.filter((s) => isChargeable(s) && s.paid), (s) => s.amount_pence),
      owed_pence: sum(mine.filter(isOwed), (s) => s.amount_pence),
      next_session: next?.start_at || null,
    },
  };
}

export async function createClient(data) {
  const c = validateClient(pick(data, CLIENT_FIELDS), false);
  const ref = doc(userCol("clients"));
  await settle(setDoc(ref, { active: true, hourly_rate_pence: 0, contact_name: null, email: null, phone: null,
    subject: null, level: null, notes: null, ...c, created_at: nowIso() }));
  return { id: ref.id };
}

export async function updateClient(id, data) {
  if (!state.clients.has(id)) throw new Error("Client not found");
  await settle(updateDoc(userDoc("clients", id), validateClient(pick(data, CLIENT_FIELDS), true)));
}

export async function deleteClient(id) {
  const sessionIds = [...state.sessions.values()].filter((s) => s.client_id === id).map((s) => s.id);
  await settle(commitInChunks([
    ...sessionIds.map((sid) => (b) => b.delete(userDoc("sessions", sid))),
    (b) => b.delete(userDoc("clients", id)),
  ]));
}

// ---------- sessions ----------

export function getSession(id) {
  const s = state.sessions.get(id);
  if (!s) throw new Error("Session not found");
  return withClientName(s);
}

/** filters: from, to (exclusive), client_id, status (comma list), unpaid, q, order ('asc'|'desc') */
export function listSessions(f = {}) {
  const statuses = f.status ? f.status.split(",").filter((x) => STATUSES.includes(x)) : null;
  const q = f.q ? f.q.toLowerCase() : "";
  let rows = [...state.sessions.values()].map(withClientName).filter((s) =>
    (!f.from || s.start_at >= f.from) &&
    (!f.to || s.start_at < f.to) &&
    (!f.client_id || s.client_id === f.client_id) &&
    (!statuses?.length || statuses.includes(s.status)) &&
    (!f.unpaid || isOwed(s)) &&
    (!q || [s.client_name, s.subject, s.notes].some((v) => v && v.toLowerCase().includes(q))));
  rows.sort(byStart);
  if (f.order !== "asc") rows.reverse();
  return rows;
}

export async function createSessions(data) {
  const repeat = Math.max(1, Math.min(52, Number(data.repeat_weeks) || 1));
  const s = validateSession(pick(data, SESSION_FIELDS), false);
  const client = state.clients.get(s.client_id);
  s.duration_min ??= 60;
  s.status ??= "scheduled";
  s.paid ??= false;
  if (s.amount_pence === undefined || s.amount_pence === null) {
    s.amount_pence = Math.round(((client.hourly_rate_pence || 0) * s.duration_min) / 60);
  }
  const seriesId = repeat > 1 ? crypto.randomUUID() : null;
  const ops = [];
  for (let i = 0; i < repeat; i++) {
    const row = { subject: null, location: null, notes: null, paid_at: null, payment_method: null, ...s,
      start_at: addDaysLocal(s.start_at, 7 * i), series_id: seriesId, created_at: nowIso() };
    if (i > 0) Object.assign(row, { status: "scheduled", paid: false, paid_at: null, payment_method: null });
    const ref = doc(userCol("sessions"));
    ops.push((b) => b.set(ref, row));
  }
  await settle(commitInChunks(ops));
  return { created: repeat, series_id: seriesId };
}

export async function updateSession(id, data) {
  if (!state.sessions.has(id)) throw new Error("Session not found");
  await settle(updateDoc(userDoc("sessions", id), validateSession(pick(data, SESSION_FIELDS), true)));
}

export async function deleteSession(id, { future = false } = {}) {
  const s = state.sessions.get(id);
  if (!s) throw new Error("Session not found");
  let ids = [id];
  if (future && s.series_id) {
    ids = [...state.sessions.values()]
      .filter((x) => x.series_id === s.series_id && x.start_at >= s.start_at && x.status === "scheduled")
      .map((x) => x.id);
  }
  await settle(commitInChunks(ids.map((sid) => (b) => b.delete(userDoc("sessions", sid)))));
  return { deleted: ids.length };
}

export async function markPaid(ids, { payment_method, paid_at } = {}) {
  if (!ids?.length) throw new Error("No sessions selected");
  const date = /^\d{4}-\d{2}-\d{2}$/.test(paid_at || "") ? paid_at : today();
  await settle(commitInChunks(ids.map((id) => (b) =>
    b.update(userDoc("sessions", id), { paid: true, paid_at: date, payment_method: payment_method || null }))));
}

// ---------- dashboard ----------

export function dashboard(now) {
  const all = [...state.sessions.values()].map(withClientName);
  const chargeable = all.filter(isChargeable);
  const monthStart = `${now.slice(0, 7)}-01T00:00`;
  const [y, m] = now.slice(0, 7).split("-").map(Number);
  const nextMonth = `${new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7)}-01T00:00`;
  const taxYear = now.slice(5, 10) >= "04-06" ? y : y - 1; // UK tax year starts 6 April
  const taxStart = `${taxYear}-04-06T00:00`;

  const summarise = (rows) => ({
    sessions: rows.length,
    minutes: sum(rows, (s) => s.duration_min),
    earned_pence: sum(rows, (s) => s.amount_pence),
  });
  const owed = all.filter(isOwed);
  const owedMap = new Map();
  for (const s of owed) {
    const e = owedMap.get(s.client_id) || { id: s.client_id, name: s.client_name, owed_pence: 0, sessions: 0 };
    e.owed_pence += s.amount_pence;
    e.sessions += 1;
    owedMap.set(s.client_id, e);
  }
  const monthly = new Map();
  for (const s of chargeable.filter((s) => s.start_at.startsWith(String(y)))) {
    const k = s.start_at.slice(0, 7);
    const e = monthly.get(k) || { month: k, earned_pence: 0, sessions: 0 };
    e.earned_pence += s.amount_pence;
    e.sessions += 1;
    monthly.set(k, e);
  }
  const scheduled = all.filter((s) => s.status === "scheduled").sort(byStart);

  return {
    this_month: summarise(chargeable.filter((s) => s.start_at >= monthStart && s.start_at < nextMonth)),
    tax_year: { ...summarise(chargeable.filter((s) => s.start_at >= taxStart)), start: taxStart.slice(0, 10) },
    owed: { owed_pence: sum(owed, (s) => s.amount_pence), n: owed.length, clients: owedMap.size },
    owed_by_client: [...owedMap.values()].sort((a, b) => b.owed_pence - a.owed_pence),
    upcoming: scheduled.filter((s) => s.start_at >= now).slice(0, 8),
    needs_update: scheduled.filter((s) => s.start_at < now).reverse().slice(0, 20),
    monthly: [...monthly.values()],
  };
}

// ---------- settings & backup ----------

export function getSettings() {
  return Object.fromEntries(SETTING_KEYS.map((k) => [k, state.settings[k] ?? ""]));
}

export async function saveSettings(data) {
  const clean = Object.fromEntries(SETTING_KEYS.filter((k) => data[k] !== undefined).map((k) => [k, String(data[k] ?? "")]));
  await settle(setDoc(settingsDoc(), clean, { merge: true }));
}

export function exportAll() {
  return {
    app: "tutor-tracker",
    version: 2,
    exported_at: nowIso(),
    clients: [...state.clients.values()],
    sessions: [...state.sessions.values()],
    settings: getSettings(),
  };
}

/** Restores a backup made by exportAll(). Existing records with the same id are overwritten; nothing is deleted. */
export async function importBackup(data) {
  if (!data || data.app !== "tutor-tracker" || !Array.isArray(data.clients) || !Array.isArray(data.sessions)) {
    throw new Error("That file isn't a Tutor Tracker backup");
  }
  const strip = ({ id, client_name, ...rest }) => rest;
  const ops = [
    ...data.clients.map((c) => (b) => b.set(userDoc("clients", String(c.id)), strip(c))),
    ...data.sessions.map((s) => (b) => b.set(userDoc("sessions", String(s.id)), { ...strip(s), client_id: String(s.client_id) })),
  ];
  if (data.settings) ops.push((b) => b.set(settingsDoc(), data.settings, { merge: true }));
  await settle(commitInChunks(ops));
  return { clients: data.clients.length, sessions: data.sessions.length };
}
