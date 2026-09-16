// In-memory stand-in for the Firebase SDK, used only by the automated browser test.
const docs = new Map(); // path -> data
const listeners = new Set();
let user = null; const authCbs = new Set();
const USERS = { "tutor@example.com": { pw: "secret123", uid: "UID1", email: "tutor@example.com" } };
let autoId = 0;
const tick = () => new Promise((r) => setTimeout(r, 5));
const err = (code) => Object.assign(new Error(code), { code });

export const initializeApp = (c) => ({ c });
export const getAuth = () => ({ get currentUser() { return user; } });
export const onAuthStateChanged = (a, cb) => { authCbs.add(cb); setTimeout(() => cb(user), 0); return () => authCbs.delete(cb); };
export async function signInWithEmailAndPassword(a, email, pw) {
  await tick(); const u = USERS[email];
  if (!u || u.pw !== pw) throw err("auth/invalid-credential");
  user = { uid: u.uid, email }; authCbs.forEach((cb) => cb(user));
}
export async function signOut() { user = null; authCbs.forEach((cb) => cb(null)); }
export async function sendPasswordResetEmail() { await tick(); }
export const setPersistence = async () => {}; export const browserLocalPersistence = {};
export const initializeFirestore = () => ({});
export const persistentLocalCache = () => ({}); export const persistentMultipleTabManager = () => ({});
export const serverTimestamp = () => new Date().toISOString();

const allowed = (path) => user && path.startsWith(`users/${user.uid}/`);
export function collection(db, ...segs) { return { type: "col", path: segs.join("/") }; }
export function doc(first, ...segs) {
  if (first.type === "col") return { type: "doc", path: `${first.path}/${segs[0] ?? "id" + (++autoId)}`, get id() { return this.path.split("/").pop(); } };
  const path = segs.join("/"); return { type: "doc", path, id: path.split("/").pop() };
}
const snapDoc = (path) => ({ id: path.split("/").pop(), data: () => structuredClone(docs.get(path)), exists: () => docs.has(path) });
function notify(changed) {
  for (const l of listeners) {
    if (l.ref.type === "doc") { if (changed.has(l.ref.path)) l.cb(snapDoc(l.ref.path)); continue; }
    const mine = [...changed].filter((p) => p.startsWith(l.ref.path + "/") && p.split("/").length === l.ref.path.split("/").length + 1);
    if (mine.length) l.cb({ docChanges: () => mine.map((p) => ({ type: docs.has(p) ? "modified" : "removed", doc: snapDoc(p) })) });
  }
}
export function onSnapshot(ref, cb, onErr) {
  const l = { ref, cb };
  setTimeout(() => {
    if (!allowed(ref.path)) return onErr(err("permission-denied"));
    listeners.add(l);
    if (ref.type === "doc") cb(snapDoc(ref.path));
    else cb({ docChanges: () => [...docs.keys()].filter((p) => p.startsWith(ref.path + "/") && p.split("/").length === ref.path.split("/").length + 1).map((p) => ({ type: "added", doc: snapDoc(p) })) });
  }, 10);
  return () => listeners.delete(l);
}
function apply(ops) {
  for (const [op] of ops) if (!allowed(op.ref.path)) throw err("permission-denied");
  const changed = new Set();
  for (const [op] of ops) {
    const { kind, ref, data, opts } = op;
    if (kind === "set") docs.set(ref.path, opts?.merge ? { ...(docs.get(ref.path) || {}), ...data } : structuredClone(data));
    if (kind === "update") { if (!docs.has(ref.path)) throw err("not-found"); docs.set(ref.path, { ...docs.get(ref.path), ...structuredClone(data) }); }
    if (kind === "delete") docs.delete(ref.path);
    changed.add(ref.path);
  }
  notify(changed);
}
export async function setDoc(ref, data, opts) { apply([[{ kind: "set", ref, data, opts }]]); await tick(); }
export async function updateDoc(ref, data) { apply([[{ kind: "update", ref, data }]]); await tick(); }
export async function deleteDoc(ref) { apply([[{ kind: "delete", ref }]]); await tick(); }
export async function addDoc(col, data) { const r = doc(col); await setDoc(r, data); return r; }
export function writeBatch() {
  const ops = [];
  return {
    set: (ref, data, opts) => ops.push([{ kind: "set", ref, data, opts }]),
    update: (ref, data) => ops.push([{ kind: "update", ref, data }]),
    delete: (ref) => ops.push([{ kind: "delete", ref }]),
    commit: async () => { apply(ops); await tick(); },
  };
}
window.__fakeDocs = docs;
export const terminate = async () => {};
export const clearIndexedDbPersistence = async () => {};
