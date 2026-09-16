// Tutor Tracker front end — plain JavaScript, no build step.
// Data is stored in Firebase (see store.js); this file is the user interface.

import * as store from "./store.js";

// ============ utilities ============

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const view = $("#view");

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const money = (pence) => gbp.format((pence || 0) / 100);
const toPence = (pounds) => Math.round(parseFloat(String(pounds).replace(/[£,\s]/g, "")) * 100) || 0;
const toPounds = (pence) => ((pence || 0) / 100).toFixed(2);

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localStamp = (d = new Date()) => `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const parseLocal = (s) => {
  const [d, t = "00:00"] = s.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  return new Date(y, m - 1, day, h, mi);
};
const fmtDate = (s, opts = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) =>
  parseLocal(s).toLocaleDateString("en-GB", opts);
const fmtTime = (s) => s.slice(11, 16);
const fmtDur = (min) => {
  const h = Math.floor(min / 60), m = min % 60;
  return h && m ? `${h}h ${m}m` : m ? `${m}m` : `${h}h`;
};
const endTime = (s, dur) => localStamp(new Date(parseLocal(s).getTime() + dur * 60000)).slice(11, 16);
const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// Session length choices: every 30 minutes from 30m up to 8 hours.
const DURATIONS = Array.from({ length: 16 }, (_, i) => (i + 1) * 30);

const STATUS_LABEL = { scheduled: "Scheduled", completed: "Completed", cancelled: "Cancelled", no_show: "No-show" };
const statusPill = (s) => `<span class="pill ${s}">${STATUS_LABEL[s]}</span>`;
const isChargeable = (s) => s.status === "completed" || s.status === "no_show";
const payPill = (s) =>
  !isChargeable(s) || !s.amount_pence ? "" : s.paid ? `<span class="pill paid">Paid</span>` : `<span class="pill unpaid">Unpaid</span>`;

function toast(msg, isError = false) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast" + (isError ? " error" : "");
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (t.hidden = true), isError ? 5000 : 2500);
}

// ============ data access ============

const now = () => localStamp();
const getClients = async () => store.listClients({ now: now() });
const getSettings = async () => store.getSettings();

// ============ router ============

const routes = [
  [/^\/?$/, renderDashboard, "dashboard"],
  [/^\/sessions$/, renderSessions, "sessions"],
  [/^\/calendar$/, renderCalendar, "calendar"],
  [/^\/clients$/, renderClients, "clients"],
  [/^\/clients\/([\w-]+)$/, renderClient, "clients"],
  [/^\/invoice\/([\w-]+)$/, renderInvoice, "clients"],
  [/^\/settings$/, renderSettings, "settings"],
];

async function router({ keepScroll = false } = {}) {
  const hash = location.hash.replace(/^#/, "") || "/";
  const [path, qs] = hash.split("?");
  const params = new URLSearchParams(qs || "");
  for (const [re, fn, nav] of routes) {
    const m = path.match(re);
    if (m) {
      $$("#nav a").forEach((a) => a.classList.toggle("active", a.dataset.nav === nav));
      const y = window.scrollY;
      try {
        await fn(...m.slice(1), params);
      } catch (e) {
        view.innerHTML = `<div class="card empty">${esc(e.message)}</div>`;
      }
      window.scrollTo(0, keepScroll ? y : 0);
      return;
    }
  }
  location.hash = "#/";
}

// Re-render the current page (used after edits and when data changes in another tab/device).
let refreshTimer;
const refresh = () => {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => { if (!$("#topbar").hidden) router({ keepScroll: true }); }, 30);
};

// ============ login ============

function showLogin() {
  $("#topbar").hidden = true;
  view.innerHTML = `
    <div class="login">
      <form class="card" id="login-form">
        <h1>Tutor Tracker</h1>
        <p class="muted" style="margin:0 0 20px">Log in to manage your sessions.</p>
        <label for="em">Email</label>
        <input id="em" type="email" autocomplete="username" required autofocus>
        <label for="pw" style="margin-top:12px">Password</label>
        <input id="pw" type="password" autocomplete="current-password" required>
        <p class="error small" id="login-err" style="color:var(--danger)" hidden></p>
        <button class="btn primary" style="width:100%;justify-content:center;margin-top:16px">Log in</button>
        <button class="btn ghost sm" type="button" id="forgot" style="margin-top:8px">Forgotten password?</button>
      </form>
    </div>`;
  $("#login-form").onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    btn.disabled = true;
    try {
      await store.login($("#em").value, $("#pw").value);
      // watchAuth() takes it from here
    } catch (err) {
      $("#login-err").textContent = err.message;
      $("#login-err").hidden = false;
      btn.disabled = false;
    }
  };
  $("#forgot").onclick = async () => {
    const email = $("#em").value;
    const err = $("#login-err");
    if (!email) { err.textContent = "Enter your email first"; err.hidden = false; return; }
    try {
      await store.resetPassword(email);
      toast("Password reset email sent");
    } catch (e) { err.textContent = e.message; err.hidden = false; }
  };
}

// ============ modal ============

function openModal({ title, body, footer, onMount, wide }) {
  const root = $("#modal-root");
  root.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}" ${wide ? 'style="width:min(760px,100%)"' : ""}>
        <header><h2>${esc(title)}</h2><button class="btn ghost sm" data-close aria-label="Close">✕</button></header>
        <div class="body">${body}</div>
        ${footer ? `<footer>${footer}</footer>` : ""}
      </div>
    </div>`;
  const backdrop = $(".modal-backdrop", root);
  const close = () => { root.innerHTML = ""; document.removeEventListener("keydown", onKey); };
  const onKey = (e) => e.key === "Escape" && close();
  document.addEventListener("keydown", onKey);
  backdrop.addEventListener("mousedown", (e) => e.target === backdrop && close());
  $$("[data-close]", root).forEach((b) => (b.onclick = close));
  onMount?.($(".modal", root), close);
  $("input, select, textarea", root)?.focus();
  return close;
}

function confirmDialog(message, { okLabel = "Delete", danger = true } = {}) {
  return new Promise((resolve) => {
    let answered = false;
    openModal({
      title: "Are you sure?",
      body: `<p style="margin:0">${esc(message)}</p>`,
      footer: `<span></span><div class="btn-row"><button class="btn" data-close>Cancel</button>
        <button class="btn ${danger ? "danger" : "primary"}" id="ok">${esc(okLabel)}</button></div>`,
      onMount: (m, close) => {
        $("#ok", m).onclick = () => { answered = true; close(); resolve(true); };
        const obs = new MutationObserver(() => { if (!m.isConnected) { obs.disconnect(); if (!answered) resolve(false); } });
        obs.observe($("#modal-root"), { childList: true });
      },
    });
  });
}

function formData(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    out[el.name] = el.type === "checkbox" ? el.checked : el.value;
  }
  return out;
}

// ============ session form ============

async function openSessionForm(session = null, defaults = {}) {
  const clients = await getClients();
  const active = clients.filter((c) => c.active || c.id === session?.client_id);
  if (!active.length) {
    toast("Add a client first");
    return openClientForm();
  }
  const isNew = !session;
  const s = session || {
    client_id: defaults.client_id || (active.length === 1 ? active[0].id : ""),
    start_at: defaults.start_at || nextHourOn(defaults.date),
    duration_min: 60,
    status: "scheduled",
    paid: 0,
  };
  const [date, time] = s.start_at.split("T");
  const clientOpts = active.map((c) => `<option value="${c.id}" ${c.id == s.client_id ? "selected" : ""}>${esc(c.name)}</option>`).join("");

  openModal({
    title: isNew ? "New session" : "Edit session",
    body: `
      <form id="session-form" class="grid">
        <div>
          <label for="f-client">Client</label>
          <select id="f-client" name="client_id" required>
            <option value="">Choose a client…</option>${clientOpts}
          </select>
        </div>
        <div class="grid three">
          <div><label for="f-date">Date</label><input id="f-date" type="date" name="date" value="${date}" required></div>
          <div><label for="f-time">Start time</label><input id="f-time" type="time" name="time" value="${time}" required step="300"></div>
          <div><label for="f-dur">Duration</label>
            <select id="f-dur" name="duration_min">
              ${DURATIONS.concat(
                DURATIONS.includes(Number(s.duration_min)) ? [] : [Number(s.duration_min)],
              ).sort((a, b) => a - b).map((d) => `<option value="${d}" ${d == s.duration_min ? "selected" : ""}>${fmtDur(d)}</option>`).join("")}
            </select></div>
        </div>
        <div class="grid two">
          <div><label for="f-subject">Subject / topic</label><input id="f-subject" name="subject" value="${esc(s.subject)}" placeholder="e.g. Algebra"></div>
          <div><label for="f-loc">Location</label><input id="f-loc" name="location" value="${esc(s.location)}" placeholder="e.g. Online" list="loc-list">
            <datalist id="loc-list"><option>Online</option><option>Client's home</option><option>My home</option><option>Library</option></datalist></div>
        </div>
        <div class="grid two">
          <div><label for="f-status">Status</label>
            <select id="f-status" name="status">
              ${Object.entries(STATUS_LABEL).map(([k, v]) => `<option value="${k}" ${k === s.status ? "selected" : ""}>${v}</option>`).join("")}
            </select></div>
          <div><label for="f-amount">Charge</label>
            <div class="input-prefix"><span>£</span><input id="f-amount" name="amount" inputmode="decimal" value="${isNew ? "" : toPounds(s.amount_pence)}"></div>
            <div class="field-hint" id="amount-hint"></div></div>
        </div>
        <div class="grid two" id="pay-row">
          <label class="check"><input type="checkbox" name="paid" ${s.paid ? "checked" : ""}> Paid</label>
          <div id="pay-extra" ${s.paid ? "" : "hidden"}>
            <div class="grid two">
              <div><label for="f-method">Method</label><input id="f-method" name="payment_method" value="${esc(s.payment_method)}" list="pm-list" placeholder="Bank transfer">
                <datalist id="pm-list"><option>Bank transfer</option><option>Cash</option><option>Card</option><option>PayPal</option></datalist></div>
              <div><label for="f-paidat">Paid on</label><input id="f-paidat" type="date" name="paid_at" value="${s.paid_at || ymd(new Date())}"></div>
            </div>
          </div>
        </div>
        <div><label for="f-notes">Notes — what was covered, homework set</label>
          <textarea id="f-notes" name="notes" placeholder="Covered quadratic equations. Homework: exercise 4B.">${esc(s.notes)}</textarea></div>
        ${isNew ? `
        <div class="grid two">
          <div><label for="f-repeat">Repeat weekly</label>
            <select id="f-repeat" name="repeat_weeks">
              <option value="1">Don't repeat</option>
              ${[2, 4, 6, 8, 10, 12, 16, 20, 26, 39, 52].map((n) => `<option value="${n}">For ${n} weeks</option>`).join("")}
            </select></div>
        </div>` : s.series_id ? `<p class="small muted" style="margin:0">Part of a weekly series.</p>` : ""}
        <p class="error" id="form-err" hidden></p>
      </form>`,
    footer: `
      <div class="btn-row">${isNew ? "" : `<button class="btn danger" id="del">Delete</button>`}</div>
      <div class="btn-row"><button class="btn" data-close>Cancel</button>
        <button class="btn primary" form="session-form">${isNew ? "Add session" : "Save"}</button></div>`,
    onMount: (m, close) => {
      const form = $("#session-form", m);
      const amount = $("#f-amount", m);
      let amountTouched = !isNew;
      const hint = () => {
        const c = clients.find((x) => x.id == form.client_id.value);
        const dur = Number(form.duration_min.value);
        const calc = c ? Math.round((c.hourly_rate_pence * dur) / 60) : 0;
        $("#amount-hint", m).textContent = c ? `${money(c.hourly_rate_pence)}/hr × ${fmtDur(dur)} = ${money(calc)}` : "";
        if (!amountTouched) amount.value = toPounds(calc);
        if (isNew && c && !form.subject.value && c.subject) form.subject.placeholder = c.subject;
      };
      amount.addEventListener("input", () => (amountTouched = true));
      form.client_id.onchange = () => { amountTouched = false; hint(); };
      form.duration_min.onchange = () => { if (isNew) amountTouched = false; hint(); };
      form.paid.onchange = () => ($("#pay-extra", m).hidden = !form.paid.checked);
      hint();

      form.onsubmit = async (e) => {
        e.preventDefault();
        const d = formData(form);
        const client = clients.find((x) => x.id == d.client_id);
        const payload = {
          client_id: d.client_id,
          start_at: `${d.date}T${d.time}`,
          duration_min: Number(d.duration_min),
          subject: d.subject || (isNew ? client?.subject || "" : ""),
          location: d.location,
          notes: d.notes,
          status: d.status,
          amount_pence: toPence(d.amount),
          paid: d.paid,
          payment_method: d.paid ? d.payment_method : null,
          paid_at: d.paid ? d.paid_at : null,
        };
        if (isNew) payload.repeat_weeks = Number(d.repeat_weeks);
        try {
          if (isNew) {
            const r = await store.createSessions(payload);
            toast(r.created > 1 ? `${r.created} weekly sessions added` : "Session added");
          } else {
            await store.updateSession(s.id, payload);
            toast("Session saved");
          }
          close();
          refresh();
        } catch (err) {
          $("#form-err", m).textContent = err.message;
          $("#form-err", m).hidden = false;
        }
      };

      const del = $("#del", m);
      if (del) del.onclick = async () => {
        close();
        if (s.series_id && s.status === "scheduled") {
          openModal({
            title: "Delete repeating session",
            body: `<p style="margin:0">This session is part of a weekly series.</p>`,
            footer: `<button class="btn" data-close>Cancel</button><div class="btn-row">
              <button class="btn danger" id="d-one">Just this one</button>
              <button class="btn danger" id="d-future">This and all future</button></div>`,
            onMount: (mm, c2) => {
              $("#d-one", mm).onclick = async () => { c2(); await deleteSession(s.id); };
              $("#d-future", mm).onclick = async () => { c2(); await deleteSession(s.id, true); };
            },
          });
        } else if (await confirmDialog(`Delete this session with ${s.client_name} on ${fmtDate(s.start_at)}?`)) {
          await deleteSession(s.id);
        }
      };
    },
  });
}

async function deleteSession(id, future = false) {
  try {
    const r = await store.deleteSession(id, { future });
    toast(r.deleted > 1 ? `${r.deleted} sessions deleted` : "Session deleted");
    refresh();
  } catch (e) { toast(e.message, true); }
}

function nextHourOn(dateStr) {
  const now = new Date();
  if (dateStr) return `${dateStr}T${pad(Math.min(Math.max(now.getHours() + 1, 9), 20))}:00`;
  const d = new Date(now.getTime() + 60 * 60000);
  return `${ymd(d)}T${pad(d.getHours())}:00`;
}

async function editSessionById(id) {
  try { openSessionForm(store.getSession(id)); } catch (e) { toast(e.message, true); }
}

async function quickStatus(id, status) {
  try {
    await store.updateSession(id, { status });
    toast(`Marked ${STATUS_LABEL[status].toLowerCase()}`);
    refresh();
  } catch (e) { toast(e.message, true); }
}

function markPaidDialog(ids, total) {
  openModal({
    title: `Record payment`,
    body: `
      <p style="margin:0">Mark <b>${ids.length}</b> session${ids.length > 1 ? "s" : ""} as paid — <b>${money(total)}</b>.</p>
      <form id="pay-form" class="grid two">
        <div><label for="p-method">Method</label><input id="p-method" name="payment_method" list="pm-list2" value="Bank transfer">
          <datalist id="pm-list2"><option>Bank transfer</option><option>Cash</option><option>Card</option><option>PayPal</option></datalist></div>
        <div><label for="p-date">Paid on</label><input id="p-date" name="paid_at" type="date" value="${ymd(new Date())}"></div>
      </form>`,
    footer: `<span></span><div class="btn-row"><button class="btn" data-close>Cancel</button><button class="btn primary" form="pay-form">Mark as paid</button></div>`,
    onMount: (m, close) => {
      $("#pay-form", m).onsubmit = async (e) => {
        e.preventDefault();
        try {
          await store.markPaid(ids, formData(e.target));
          close();
          toast("Payment recorded");
          refresh();
        } catch (err) { toast(err.message, true); }
      };
    },
  });
}

// ============ client form ============

function openClientForm(client = null) {
  const c = client || { active: 1, hourly_rate_pence: 0 };
  const isNew = !client;
  openModal({
    title: isNew ? "New client" : "Edit client",
    body: `
      <form id="client-form" class="grid">
        <div class="grid two">
          <div><label for="c-name">Student name</label><input id="c-name" name="name" value="${esc(c.name)}" required></div>
          <div><label for="c-contact">Parent / bill payer</label><input id="c-contact" name="contact_name" value="${esc(c.contact_name)}" placeholder="Optional"></div>
        </div>
        <div class="grid two">
          <div><label for="c-email">Email</label><input id="c-email" type="email" name="email" value="${esc(c.email)}"></div>
          <div><label for="c-phone">Phone</label><input id="c-phone" type="tel" name="phone" value="${esc(c.phone)}"></div>
        </div>
        <div class="grid three">
          <div><label for="c-subject">Subject</label><input id="c-subject" name="subject" value="${esc(c.subject)}" placeholder="e.g. Maths"></div>
          <div><label for="c-level">Level</label><input id="c-level" name="level" value="${esc(c.level)}" list="lvl-list" placeholder="e.g. GCSE">
            <datalist id="lvl-list"><option>KS2</option><option>11+</option><option>KS3</option><option>GCSE</option><option>A-Level</option><option>University</option><option>Adult</option></datalist></div>
          <div><label for="c-rate">Hourly rate</label><div class="input-prefix"><span>£</span>
            <input id="c-rate" name="rate" inputmode="decimal" value="${toPounds(c.hourly_rate_pence)}" required></div></div>
        </div>
        <div><label for="c-notes">Notes</label><textarea id="c-notes" name="notes" placeholder="Goals, exam board, exam dates, learning needs…">${esc(c.notes)}</textarea></div>
        ${isNew ? "" : `<label class="check"><input type="checkbox" name="active" ${c.active ? "checked" : ""}> Active client (untick to archive)</label>`}
        <p class="error" id="c-err" hidden></p>
      </form>`,
    footer: `
      <div class="btn-row">${isNew ? "" : `<button class="btn danger" id="c-del">Delete client</button>`}</div>
      <div class="btn-row"><button class="btn" data-close>Cancel</button>
        <button class="btn primary" form="client-form">${isNew ? "Add client" : "Save"}</button></div>`,
    onMount: (m, close) => {
      $("#client-form", m).onsubmit = async (e) => {
        e.preventDefault();
        const d = formData(e.target);
        const payload = { ...d, hourly_rate_pence: toPence(d.rate) };
        delete payload.rate;
        if (isNew) delete payload.active;
        try {
          if (isNew) {
            const r = await store.createClient(payload);
            toast("Client added");
            close();
            location.hash = `#/clients/${r.id}`;
          } else {
            await store.updateClient(c.id, payload);
            toast("Client saved");
            close();
            refresh();
          }
        } catch (err) {
          $("#c-err", m).textContent = err.message;
          $("#c-err", m).hidden = false;
        }
      };
      const del = $("#c-del", m);
      if (del) del.onclick = async () => {
        close();
        if (await confirmDialog(`Delete ${c.name} and ALL of their sessions and payment history? This cannot be undone. (Tip: untick "Active" to archive instead.)`)) {
          try {
            await store.deleteClient(c.id);
            toast("Client deleted");
            location.hash = "#/clients";
          } catch (e) { toast(e.message, true); }
        }
      };
    },
  });
}

// ============ shared renderers ============

function sessionListItem(s, { actions = "" } = {}) {
  const d = parseLocal(s.start_at);
  return `
    <li>
      <div class="date-badge"><span>${d.toLocaleDateString("en-GB", { month: "short" })}</span><b>${d.getDate()}</b></div>
      <div class="grow">
        <div class="title"><a href="#/clients/${s.client_id}">${esc(s.client_name)}</a></div>
        <div class="small muted">${d.toLocaleDateString("en-GB", { weekday: "short" })} ${fmtTime(s.start_at)}–${endTime(s.start_at, s.duration_min)}${s.subject ? ` · ${esc(s.subject)}` : ""}${s.location ? ` · ${esc(s.location)}` : ""}</div>
      </div>
      <div class="btn-row">${actions}<button class="btn sm" data-edit="${s.id}">Edit</button></div>
    </li>`;
}

function bindEditButtons(root = view) {
  $$("[data-edit]", root).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); editSessionById(b.dataset.edit); }));
  $$("[data-status]", root).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); quickStatus(b.dataset.id, b.dataset.status); }));
}

function sessionsTable(rows, { selectable = false, showClient = true } = {}) {
  if (!rows.length) return `<div class="empty">No sessions found.</div>`;
  return `
    <div class="table-wrap"><table>
      <thead><tr>
        ${selectable ? `<th style="width:36px"><input type="checkbox" id="sel-all" aria-label="Select all unpaid"></th>` : ""}
        <th>Date</th>${showClient ? "<th>Client</th>" : ""}<th class="hide-sm">Topic & notes</th>
        <th>Status</th><th class="right">Charge</th><th class="hide-sm">Payment</th>
      </tr></thead>
      <tbody>
        ${rows.map((s) => `
          <tr class="clickable" data-row="${s.id}">
            ${selectable ? `<td>${isChargeable(s) && !s.paid && s.amount_pence ? `<input type="checkbox" class="sel" value="${s.id}" data-amount="${s.amount_pence}" aria-label="Select">` : ""}</td>` : ""}
            <td class="nowrap">${fmtDate(s.start_at, { day: "numeric", month: "short", year: "2-digit" })}<div class="small muted">${fmtTime(s.start_at)} · ${fmtDur(s.duration_min)}</div></td>
            ${showClient ? `<td><a href="#/clients/${s.client_id}">${esc(s.client_name)}</a></td>` : ""}
            <td class="hide-sm">${esc(s.subject || "")}${s.notes ? `<div class="notes">${esc(s.notes)}</div>` : ""}</td>
            <td>${statusPill(s.status)}</td>
            <td class="right num">${s.status === "cancelled" ? `<span class="muted">—</span>` : money(s.amount_pence)}</td>
            <td class="hide-sm">${payPill(s)}${s.paid && s.payment_method ? `<div class="small muted">${esc(s.payment_method)}</div>` : ""}</td>
          </tr>`).join("")}
      </tbody>
    </table></div>`;
}

function bindTable(root, rows) {
  $$("tr[data-row]", root).forEach((tr) => {
    tr.onclick = (e) => {
      if (e.target.closest("a, input")) return;
      const s = rows.find((r) => r.id == tr.dataset.row);
      if (s) openSessionForm(s);
    };
  });
}

// ============ dashboard ============

async function renderDashboard() {
  const d = store.dashboard(localStamp());
  const now = new Date();
  const hours = (d.this_month.minutes / 60).toFixed(1).replace(/\.0$/, "");
  const monthName = now.toLocaleDateString("en-GB", { month: "long" });
  const byMonth = Object.fromEntries(d.monthly.map((r) => [r.month, r]));
  const months = Array.from({ length: 12 }, (_, i) => {
    const key = `${now.getFullYear()}-${pad(i + 1)}`;
    return { key, label: new Date(now.getFullYear(), i, 1).toLocaleDateString("en-GB", { month: "short" }), ...(byMonth[key] || { earned_pence: 0, sessions: 0 }) };
  });
  const maxEarned = Math.max(1, ...months.map((m) => m.earned_pence));
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  view.innerHTML = `
    <div class="page-head">
      <div><h1>${greeting}</h1><p class="muted">${now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div>
    </div>
    <div class="stack">
      <div class="kpis">
        <div class="card kpi"><div class="label">Earned in ${monthName}</div><div class="value">${money(d.this_month.earned_pence)}</div><div class="sub">${d.this_month.sessions} session${d.this_month.sessions === 1 ? "" : "s"}</div></div>
        <div class="card kpi"><div class="label">Hours taught in ${monthName}</div><div class="value">${hours}</div><div class="sub">completed sessions</div></div>
        <div class="card kpi ${d.owed.owed_pence ? "alert" : ""}"><div class="label">Owed to you</div><div class="value">${money(d.owed.owed_pence)}</div><div class="sub">${d.owed.n} unpaid session${d.owed.n === 1 ? "" : "s"}</div></div>
        <div class="card kpi"><div class="label">Tax year so far</div><div class="value">${money(d.tax_year.earned_pence)}</div><div class="sub">since ${fmtDate(d.tax_year.start, { day: "numeric", month: "short", year: "numeric" })}</div></div>
      </div>

      ${d.needs_update.length ? `
      <div class="card">
        <div class="card-head"><h2>Needs updating</h2><span class="small muted">Past sessions still marked as scheduled</span></div>
        <ul class="list">${d.needs_update.map((s) => sessionListItem(s, {
          actions: `<button class="btn sm primary" data-status="completed" data-id="${s.id}">Done</button>
                    <button class="btn sm hide-sm" data-status="no_show" data-id="${s.id}">No-show</button>
                    <button class="btn sm hide-sm" data-status="cancelled" data-id="${s.id}">Cancelled</button>`,
        })).join("")}</ul>
      </div>` : ""}

      <div class="cols">
        <div class="card">
          <div class="card-head"><h2>Coming up</h2><a href="#/calendar" class="small">Calendar →</a></div>
          ${d.upcoming.length ? `<ul class="list">${d.upcoming.map((s) => sessionListItem(s)).join("")}</ul>`
            : `<div class="empty">Nothing scheduled.<br><button class="btn primary" style="margin-top:10px" id="empty-add">Schedule a session</button></div>`}
        </div>
        <div class="card">
          <div class="card-head"><h2>Unpaid by client</h2><a href="#/sessions?unpaid=1" class="small">All unpaid →</a></div>
          ${d.owed_by_client.length ? `<ul class="list">${d.owed_by_client.map((c) => `
            <li><div class="avatar">${esc(initials(c.name))}</div>
              <div class="grow"><div class="title"><a href="#/clients/${c.id}">${esc(c.name)}</a></div>
              <div class="small muted">${c.sessions} session${c.sessions === 1 ? "" : "s"}</div></div>
              <div class="num" style="font-weight:600">${money(c.owed_pence)}</div>
              <a class="btn sm" href="#/invoice/${c.id}">Invoice</a></li>`).join("")}</ul>`
            : `<div class="empty">Everyone's paid up. 🎉</div>`}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>Earnings in ${now.getFullYear()}</h2><span class="small muted">Completed & no-show sessions</span></div>
        <div class="bars" role="img" aria-label="Monthly earnings chart">
          ${months.map((m) => `<div class="bar ${m.earned_pence ? "" : "zero"} ${m.key === now.toISOString().slice(0, 7) ? "current" : ""}"
            style="height:${Math.max(2, (m.earned_pence / maxEarned) * 100)}%" title="${m.label}: ${money(m.earned_pence)} (${m.sessions} sessions)"></div>`).join("")}
        </div>
        <div class="bar-labels">${months.map((m) => `<span>${m.label}</span>`).join("")}</div>
      </div>
    </div>`;
  bindEditButtons();
  $("#empty-add")?.addEventListener("click", () => openSessionForm());
}

// ============ sessions ============

async function renderSessions(params) {
  const clients = await getClients();
  const f = {
    client_id: params.get("client_id") || "",
    status: params.get("status") || "",
    unpaid: params.get("unpaid") || "",
    from: params.get("from") || "",
    to: params.get("to") || "",
    q: params.get("q") || "",
  };
  const rows = store.listSessions({ ...f, from: f.from && `${f.from}T00:00`, to: f.to && `${ymd(addDays(parseLocal(f.to), 1))}T00:00` });
  const total = rows.filter((s) => s.status !== "cancelled").reduce((a, s) => a + s.amount_pence, 0);

  view.innerHTML = `
    <div class="page-head">
      <div><h1>Sessions</h1><p class="muted">${rows.length} session${rows.length === 1 ? "" : "s"} · ${money(total)} total</p></div>
      <div class="btn-row"><button class="btn" id="csv">Export CSV</button><button class="btn primary" id="add">+ Add session</button></div>
    </div>
    <div class="card">
      <form class="filters" id="filters">
        <div class="grow"><label for="q">Search</label><input id="q" name="q" type="search" value="${esc(f.q)}" placeholder="Client, topic or notes"></div>
        <div><label for="fc">Client</label><select id="fc" name="client_id"><option value="">All clients</option>
          ${clients.map((c) => `<option value="${c.id}" ${c.id == f.client_id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div>
        <div><label for="fs">Status</label><select id="fs" name="status"><option value="">Any status</option>
          ${Object.entries(STATUS_LABEL).map(([k, v]) => `<option value="${k}" ${k === f.status ? "selected" : ""}>${v}</option>`).join("")}</select></div>
        <div><label for="ff">From</label><input id="ff" type="date" name="from" value="${f.from}"></div>
        <div><label for="ft">To</label><input id="ft" type="date" name="to" value="${f.to}"></div>
        <div><label class="check" style="height:38px"><input type="checkbox" name="unpaid" ${f.unpaid ? "checked" : ""}> Unpaid only</label></div>
      </form>
      <div class="bulkbar" id="bulk" hidden>
        <b id="bulk-count"></b><span class="grow"></span>
        <button class="btn sm primary" id="bulk-pay">Mark as paid</button>
      </div>
      ${sessionsTable(rows, { selectable: true })}
    </div>`;

  const form = $("#filters");
  const apply = () => {
    const d = formData(form);
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(d)) if (v && v !== false) qs.set(k, v === true ? "1" : v);
    location.hash = `#/sessions${qs.toString() ? "?" + qs : ""}`;
  };
  form.onchange = apply;
  form.onsubmit = (e) => { e.preventDefault(); apply(); };
  let t;
  $("#q").oninput = () => { clearTimeout(t); t = setTimeout(apply, 400); };
  if (f.q) { const q = $("#q"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }

  $("#add").onclick = () => openSessionForm(null, { client_id: f.client_id });
  $("#csv").onclick = () => downloadCsv(rows);
  bindTable(view, rows);

  const updateBulk = () => {
    const sel = $$(".sel:checked");
    $("#bulk").hidden = !sel.length;
    const sum = sel.reduce((a, x) => a + Number(x.dataset.amount), 0);
    $("#bulk-count").textContent = `${sel.length} selected · ${money(sum)}`;
  };
  $$(".sel").forEach((x) => (x.onchange = updateBulk));
  const all = $("#sel-all");
  if (all) all.onchange = () => { $$(".sel").forEach((x) => (x.checked = all.checked)); updateBulk(); };
  $("#bulk-pay").onclick = () => {
    const sel = $$(".sel:checked");
    markPaidDialog(sel.map((x) => x.value), sel.reduce((a, x) => a + Number(x.dataset.amount), 0));
  };
}

function downloadCsv(rows) {
  const cols = ["Date", "Start", "End", "Duration (min)", "Client", "Subject", "Location", "Status", "Charge (£)", "Paid", "Paid on", "Payment method", "Notes"];
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [cols.map(q).join(",")].concat(rows.map((s) => [
    s.start_at.slice(0, 10), fmtTime(s.start_at), endTime(s.start_at, s.duration_min), s.duration_min, s.client_name,
    s.subject, s.location, STATUS_LABEL[s.status], toPounds(s.amount_pence), s.paid ? "Yes" : "No", s.paid_at, s.payment_method, s.notes,
  ].map(q).join(",")));
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `sessions-${ymd(new Date())}.csv` });
  a.click();
  URL.revokeObjectURL(a.href);
}

// ============ calendar ============

async function renderCalendar(params) {
  const today = new Date();
  const month = params.get("m") || `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const gridStart = addDays(first, -((first.getDay() + 6) % 7)); // weeks start Monday
  const weeks = Math.ceil((((first.getDay() + 6) % 7) + new Date(y, m, 0).getDate()) / 7);
  const gridEnd = addDays(gridStart, weeks * 7);
  const rows = store.listSessions({ from: `${ymd(gridStart)}T00:00`, to: `${ymd(gridEnd)}T00:00`, order: "asc" });
  const byDay = {};
  for (const s of rows) (byDay[s.start_at.slice(0, 10)] ||= []).push(s);

  const selected = params.get("d") || (today.getFullYear() === y && today.getMonth() === m - 1 ? ymd(today) : ymd(first));
  const shift = (n) => { const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
  const monthSessions = rows.filter((s) => s.start_at.startsWith(month) && s.status !== "cancelled");

  const days = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(gridStart, i);
    const key = ymd(d);
    const list = byDay[key] || [];
    days.push(`
      <div class="day ${d.getMonth() !== m - 1 ? "other" : ""} ${key === ymd(today) ? "today" : ""} ${key === selected ? "selected" : ""}" data-day="${key}" tabindex="0" aria-label="${d.toDateString()}, ${list.length} sessions">
        <span class="dnum">${d.getDate()}</span>
        ${list.slice(0, 3).map((s) => `<div class="chip ${s.status}" data-sid="${s.id}" title="${esc(s.client_name)} ${fmtTime(s.start_at)}"><span class="t">${fmtTime(s.start_at)}</span>${esc(s.client_name)}</div>`).join("")}
        ${list.length > 3 ? `<div class="more">+${list.length - 3} more</div>` : ""}
        <div class="dots">${list.map((s) => `<span class="dot ${s.status}"></span>`).join("")}</div>
      </div>`);
  }
  const selList = byDay[selected] || [];

  view.innerHTML = `
    <div class="page-head">
      <div><h1>Calendar</h1><p class="muted">${monthSessions.length} session${monthSessions.length === 1 ? "" : "s"} · ${fmtDur(monthSessions.reduce((a, s) => a + s.duration_min, 0) || 0)} this month</p></div>
    </div>
    <div class="stack">
      <div class="card" style="overflow:hidden">
        <div class="cal-head">
          <a class="btn sm" href="#/calendar?m=${shift(-1)}" aria-label="Previous month">‹</a>
          <div class="row"><h2>${first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h2>
            <a class="btn sm ghost" href="#/calendar">Today</a></div>
          <a class="btn sm" href="#/calendar?m=${shift(1)}" aria-label="Next month">›</a>
        </div>
        <div class="cal">
          ${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => `<div class="dow">${d}</div>`).join("")}
          ${days.join("")}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>${fmtDate(selected, { weekday: "long", day: "numeric", month: "long" })}</h2>
          <button class="btn sm primary" id="add-day">+ Add session</button></div>
        ${selList.length ? `<ul class="list">${selList.map((s) => sessionListItem(s, { actions: statusPill(s.status) })).join("")}</ul>`
          : `<div class="empty">No sessions on this day.</div>`}
      </div>
    </div>`;

  $$(".day").forEach((el) => {
    const go = () => { location.hash = `#/calendar?m=${month}&d=${el.dataset.day}`; };
    el.onclick = (e) => {
      const chip = e.target.closest("[data-sid]");
      if (chip) return editSessionById(chip.dataset.sid);
      if (el.dataset.day === selected && window.matchMedia("(min-width: 681px)").matches) return openSessionForm(null, { date: selected });
      go();
    };
    el.onkeydown = (e) => { if (e.key === "Enter") go(); };
  });
  $("#add-day").onclick = () => openSessionForm(null, { date: selected });
  bindEditButtons();
}

// ============ clients ============

async function renderClients(params) {
  const clients = await getClients();
  const showArchived = params.get("archived") === "1";
  const list = clients.filter((c) => (showArchived ? !c.active : c.active));
  const archivedCount = clients.filter((c) => !c.active).length;

  view.innerHTML = `
    <div class="page-head">
      <div><h1>${showArchived ? "Archived clients" : "Clients"}</h1><p class="muted">${list.length} ${showArchived ? "archived" : "active"}</p></div>
      <div class="btn-row">
        ${archivedCount || showArchived ? `<a class="btn" href="#/clients${showArchived ? "" : "?archived=1"}">${showArchived ? "Show active" : `Archived (${archivedCount})`}</a>` : ""}
        <button class="btn primary" id="add-client">+ Add client</button>
      </div>
    </div>
    ${list.length ? `<div class="client-grid">
      ${list.map((c) => `
        <a class="card client-card" href="#/clients/${c.id}">
          <div class="row"><div class="avatar">${esc(initials(c.name))}</div>
            <div style="min-width:0"><div style="font-weight:650">${esc(c.name)}</div>
            <div class="small muted">${esc([c.subject, c.level].filter(Boolean).join(" · ") || "—")}</div></div></div>
          <div class="meta">
            <span class="muted">${money(c.hourly_rate_pence)}/hr · ${c.completed_count} done</span>
            ${c.owed_pence ? `<span class="pill unpaid">${money(c.owed_pence)} owed</span>` : ""}
          </div>
          <div class="small muted" style="margin-top:6px">${c.next_session ? `Next: ${fmtDate(c.next_session, { weekday: "short", day: "numeric", month: "short" })} ${fmtTime(c.next_session)}` : "No upcoming session"}</div>
        </a>`).join("")}
    </div>` : `<div class="card empty">${showArchived ? "No archived clients." : `No clients yet.<br><button class="btn primary" style="margin-top:10px" id="empty-client">Add your first client</button>`}</div>`}`;
  $("#add-client").onclick = () => openClientForm();
  $("#empty-client")?.addEventListener("click", () => openClientForm());
}

async function renderClient(id) {
  const c = store.getClient(id, now());
  const sessions = store.listSessions({ client_id: id });
  const st = c.stats;
  const unpaid = sessions.filter((s) => isChargeable(s) && !s.paid && s.amount_pence);

  view.innerHTML = `
    <div class="page-head">
      <div class="row">
        <div class="avatar" style="width:52px;height:52px;font-size:1.2rem">${esc(initials(c.name))}</div>
        <div><h1>${esc(c.name)} ${c.active ? "" : `<span class="pill cancelled">Archived</span>`}</h1>
          <p class="muted">${esc([c.subject, c.level].filter(Boolean).join(" · "))}${c.subject || c.level ? " · " : ""}${money(c.hourly_rate_pence)}/hr</p></div>
      </div>
      <div class="btn-row">
        <button class="btn" id="edit-client">Edit</button>
        <a class="btn" href="#/invoice/${c.id}">Invoice</a>
        <button class="btn primary" id="add-s">+ Session</button>
      </div>
    </div>
    <div class="stack">
      <div class="kpis">
        <div class="card kpi"><div class="label">Sessions completed</div><div class="value">${st.completed_count}</div><div class="sub">${fmtDur(st.completed_minutes || 0)} in total</div></div>
        <div class="card kpi"><div class="label">Paid to date</div><div class="value">${money(st.paid_pence)}</div></div>
        <div class="card kpi ${st.owed_pence ? "alert" : ""}"><div class="label">Owed</div><div class="value">${money(st.owed_pence)}</div>
          ${unpaid.length ? `<button class="btn sm" id="pay-all" style="margin-top:6px">Record payment</button>` : `<div class="sub">All paid</div>`}</div>
        <div class="card kpi"><div class="label">Next session</div><div class="value" style="font-size:1.2rem;margin-top:6px">${st.next_session ? fmtDate(st.next_session, { weekday: "short", day: "numeric", month: "short" }) : "—"}</div>
          <div class="sub">${st.next_session ? fmtTime(st.next_session) : "Nothing booked"}</div></div>
      </div>
      <div class="cols" style="grid-template-columns: 1fr 2fr">
        <div class="card card-pad">
          <h2 style="margin-bottom:12px">Details</h2>
          <dl class="dl">
            ${c.contact_name ? `<dt>Contact</dt><dd>${esc(c.contact_name)}</dd>` : ""}
            <dt>Email</dt><dd>${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : "—"}</dd>
            <dt>Phone</dt><dd>${c.phone ? `<a href="tel:${esc(c.phone)}">${esc(c.phone)}</a>` : "—"}</dd>
            <dt>Client since</dt><dd>${fmtDate(c.created_at.replace(" ", "T").slice(0, 16), { month: "short", year: "numeric" })}</dd>
          </dl>
          ${c.notes ? `<h2 style="margin:18px 0 6px">Notes</h2><p style="margin:0;white-space:pre-line">${esc(c.notes)}</p>` : ""}
        </div>
        <div class="card">
          <div class="card-head"><h2>Session history</h2><span class="small muted">${sessions.length} total</span></div>
          ${sessionsTable(sessions, { showClient: false })}
        </div>
      </div>
    </div>`;

  $("#edit-client").onclick = () => openClientForm(c);
  $("#add-s").onclick = () => openSessionForm(null, { client_id: c.id });
  $("#pay-all")?.addEventListener("click", () => markPaidDialog(unpaid.map((s) => s.id), st.owed_pence));
  bindTable(view, sessions.map((s) => ({ ...s, client_name: c.name })));
}

// ============ invoice ============

async function renderInvoice(id, params) {
  const c = store.getClient(id, now());
  const settings = await getSettings();
  const onlyUnpaid = params.get("all") !== "1";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const all = store.listSessions({
    client_id: id, order: "asc", status: "completed,no_show",
    unpaid: onlyUnpaid,
    from: from && `${from}T00:00`, to: to && `${ymd(addDays(parseLocal(to), 1))}T00:00`,
  });
  const rows = all.filter((s) => s.amount_pence > 0);
  const today = new Date();
  const invNo = params.get("no") || `INV-${ymd(today).replace(/-/g, "")}-${invCode(c)}`;
  const due = ymd(addDays(today, 14));
  const biz = settings.business_name || settings.your_name || "Your tutoring business";

  view.innerHTML = `
    <div class="inv-controls card card-pad">
      <div class="page-head" style="margin-bottom:12px">
        <div><a href="#/clients/${c.id}" class="small">← ${esc(c.name)}</a><h1>Invoice</h1></div>
        <div class="btn-row">
          ${rows.some((s) => !s.paid) ? `<button class="btn" id="inv-paid">Mark these as paid</button>` : ""}
          <button class="btn" id="print" ${rows.length ? "" : "disabled"}>Print</button>
          <button class="btn primary" id="pdf" ${rows.length ? "" : "disabled"}>Download PDF</button>
        </div>
      </div>
      <form class="grid three" id="inv-form">
        <div><label for="i-no">Invoice number</label><input id="i-no" name="no" value="${esc(invNo)}"></div>
        <div><label for="i-from">Sessions from</label><input id="i-from" type="date" name="from" value="${from}"></div>
        <div><label for="i-to">Sessions to</label><input id="i-to" type="date" name="to" value="${to}"></div>
        <label class="check"><input type="checkbox" name="all" ${onlyUnpaid ? "" : "checked"}> Include already-paid sessions</label>
      </form>
      ${!settings.business_name && !settings.payment_details ? `<p class="small muted" style="margin:12px 0 0">Tip: add your business name and bank details in <a href="#/settings">Settings</a> so they appear on invoices.</p>` : ""}
    </div>

    <article class="invoice card">
      <div class="inv-top">
        <div>
          <h1>INVOICE</h1>
          <div style="margin-top:12px;font-weight:650">${esc(biz)}</div>
          ${settings.business_name && settings.your_name ? `<div>${esc(settings.your_name)}</div>` : ""}
          <div class="pre">${esc(settings.address)}</div>
          <div>${esc([settings.email, settings.phone].filter(Boolean).join(" · "))}</div>
        </div>
        <div class="inv-meta">
          <div><span class="muted">Invoice no.</span> <b>${esc(invNo)}</b></div>
          <div><span class="muted">Date</span> ${fmtDate(ymd(today), { day: "numeric", month: "long", year: "numeric" })}</div>
          <div><span class="muted">Due</span> ${fmtDate(due, { day: "numeric", month: "long", year: "numeric" })}</div>
          <div style="margin-top:16px" class="muted">Bill to</div>
          <div style="font-weight:650">${esc(c.contact_name || c.name)}</div>
          ${c.contact_name ? `<div>Re: ${esc(c.name)}</div>` : ""}
          ${c.email ? `<div>${esc(c.email)}</div>` : ""}
        </div>
      </div>
      ${rows.length ? `
      <table>
        <thead><tr><th>Date</th><th>Description</th><th class="right">Duration</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead>
        <tbody>
          ${rows.map((s) => `<tr>
            <td class="nowrap">${fmtDate(s.start_at, { day: "numeric", month: "short", year: "numeric" })}</td>
            <td>${esc(s.subject || c.subject || "Tutoring session")}${s.status === "no_show" ? " (missed session)" : ""}${s.paid ? ` <span class="muted small">— paid</span>` : ""}</td>
            <td class="right nowrap">${fmtDur(s.duration_min)}</td>
            <td class="right num">${money(Math.round((s.amount_pence * 60) / s.duration_min))}/hr</td>
            <td class="right num">${money(s.amount_pence)}</td></tr>`).join("")}
          ${rows.some((s) => s.paid) ? `<tr><td colspan="4" class="right">Already paid</td><td class="right num">−${money(rows.filter((s) => s.paid).reduce((a, s) => a + s.amount_pence, 0))}</td></tr>` : ""}
          <tr class="total"><td colspan="4" class="right">Total due</td><td class="right num">${money(rows.filter((s) => !s.paid).reduce((a, s) => a + s.amount_pence, 0))}</td></tr>
        </tbody>
      </table>` : `<div class="empty">No ${onlyUnpaid ? "unpaid " : ""}sessions to invoice${from || to ? " in this date range" : ""}.</div>`}
      <div class="inv-foot">
        ${settings.payment_details ? `<div style="font-weight:650">Payment details</div><div class="pre">${esc(settings.payment_details)}</div>` : ""}
        <p class="pre muted" style="margin-bottom:0">${esc(settings.invoice_footer || "Thank you!")}</p>
      </div>
    </article>`;

  const form = $("#inv-form");
  form.onchange = () => {
    const d = formData(form);
    const qs = new URLSearchParams();
    if (d.no && d.no !== `INV-${ymd(today).replace(/-/g, "")}-${invCode(c)}`) qs.set("no", d.no);
    if (d.from) qs.set("from", d.from);
    if (d.to) qs.set("to", d.to);
    if (d.all) qs.set("all", "1");
    location.hash = `#/invoice/${c.id}${qs.toString() ? "?" + qs : ""}`;
  };
  form.onsubmit = (e) => e.preventDefault();
  $("#print").onclick = () => {
    const old = document.title;
    document.title = `${invNo} ${c.name}`;
    window.print();
    document.title = old;
  };
  $("#pdf").onclick = async (e) => {
    e.target.disabled = true;
    try {
      await buildInvoicePdf({ c, settings, rows, invNo, today, due, biz });
    } catch (err) {
      toast("Couldn't create the PDF: " + err.message, true);
    } finally {
      e.target.disabled = false;
    }
  };
  $("#inv-paid")?.addEventListener("click", () => {
    const unpaid = rows.filter((s) => !s.paid);
    markPaidDialog(unpaid.map((s) => s.id), unpaid.reduce((a, s) => a + s.amount_pence, 0));
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = Object.assign(document.createElement("script"), { src, onload: resolve, onerror: () => reject(new Error("failed to load " + src)) });
    document.head.appendChild(s);
  });
}

// Builds a real PDF file in the browser (no server, nothing sent anywhere) and downloads it.
async function buildInvoicePdf({ c, settings, rows, invNo, today, due, biz }) {
  await loadScript("./vendor/jspdf.umd.min.js");
  await loadScript("./vendor/jspdf.plugin.autotable.min.js");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 18;
  const long = (d) => fmtDate(d, { day: "numeric", month: "long", year: "numeric" });
  const ink = [31, 37, 34], grey = [102, 112, 107], accent = [47, 93, 80];

  doc.setFont("helvetica", "bold").setFontSize(24).setTextColor(...accent).text("INVOICE", M, 26);

  // From (left)
  let y = 36;
  doc.setFontSize(11).setTextColor(...ink).text(biz, M, y);
  doc.setFont("helvetica", "normal").setFontSize(9.5).setTextColor(...grey);
  const fromLines = [
    settings.business_name && settings.your_name ? settings.your_name : "",
    ...(settings.address || "").split("\n"),
    settings.email, settings.phone,
  ].filter((l) => l && l.trim());
  for (const l of fromLines) { y += 4.8; doc.text(l.trim(), M, y); }
  const leftEnd = y;

  // Invoice meta + bill to (right)
  y = 36;
  const R = W - M;
  const meta = [["Invoice no.", invNo], ["Date", long(ymd(today))], ["Due", long(due)]];
  for (const [k, v] of meta) {
    doc.setFont("helvetica", "normal").setTextColor(...grey).text(k, R - 50, y);
    doc.setFont("helvetica", "bold").setTextColor(...ink).text(v, R, y, { align: "right" });
    y += 5.2;
  }
  y += 4;
  doc.setFont("helvetica", "normal").setTextColor(...grey).text("Bill to", R, y, { align: "right" });
  y += 5.2;
  doc.setFont("helvetica", "bold").setTextColor(...ink).text(c.contact_name || c.name, R, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  if (c.contact_name) { y += 4.8; doc.text(`Re: ${c.name}`, R, y, { align: "right" }); }
  if (c.email) { y += 4.8; doc.setTextColor(...grey).text(c.email, R, y, { align: "right" }); }

  const unpaidTotal = rows.filter((s) => !s.paid).reduce((a, s) => a + s.amount_pence, 0);
  const paidTotal = rows.filter((s) => s.paid).reduce((a, s) => a + s.amount_pence, 0);
  const body = rows.map((s) => [
    fmtDate(s.start_at, { day: "numeric", month: "short", year: "numeric" }),
    `${s.subject || c.subject || "Tutoring session"}${s.status === "no_show" ? " (missed session)" : ""}${s.paid ? " - paid" : ""}`,
    fmtDur(s.duration_min),
    `${money(Math.round((s.amount_pence * 60) / s.duration_min))}/hr`,
    money(s.amount_pence),
  ]);
  const foot = [];
  if (paidTotal) foot.push(["", "", "", "Already paid", `-${money(paidTotal)}`]);
  foot.push(["", "", "", "Total due", money(unpaidTotal)]);

  doc.autoTable({
    startY: Math.max(leftEnd, y) + 12,
    margin: { left: M, right: M },
    head: [["Date", "Description", "Duration", "Rate", "Amount"]],
    body,
    foot,
    theme: "plain",
    styles: { font: "helvetica", fontSize: 9.5, textColor: ink, cellPadding: { top: 3, bottom: 3, left: 2.5, right: 2.5 } },
    headStyles: { fillColor: [244, 244, 241], textColor: grey, fontStyle: "bold", fontSize: 8.5 },
    footStyles: { fontStyle: "bold", textColor: ink, fontSize: 11 },
    columnStyles: { 0: { cellWidth: 30 }, 2: { halign: "right", cellWidth: 22 }, 3: { halign: "right", cellWidth: 28 }, 4: { halign: "right", cellWidth: 26 } },
    didParseCell: (d) => {
      if (d.section === "head" && d.column.index >= 2) d.cell.styles.halign = "right";
      if (d.section === "foot" && d.column.index >= 3) d.cell.styles.halign = "right";
    },
    didDrawCell: (d) => {
      if (d.section === "body") {
        doc.setDrawColor(229, 229, 224).setLineWidth(0.2);
        doc.line(d.cell.x, d.cell.y + d.cell.height, d.cell.x + d.cell.width, d.cell.y + d.cell.height);
      }
    },
  });

  y = doc.lastAutoTable.finalY + 12;
  const pageH = doc.internal.pageSize.getHeight();
  const footLines = [];
  if (settings.payment_details) footLines.push(...settings.payment_details.split("\n"));
  const footer = (settings.invoice_footer || "Thank you!").split("\n");
  if (y + 12 + (footLines.length + footer.length) * 5 > pageH - M) { doc.addPage(); y = M + 6; }
  doc.setDrawColor(229, 229, 224).line(M, y - 5, W - M, y - 5);
  if (footLines.length) {
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...ink).text("Payment details", M, y);
    doc.setFont("helvetica", "normal").setFontSize(9.5);
    for (const l of footLines) { y += 5; doc.text(l, M, y); }
    y += 8;
  }
  doc.setTextColor(...grey);
  for (const l of footer) { doc.text(l, M, y); y += 5; }

  const safe = (s) => s.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-");
  doc.save(`${safe(invNo)}_${safe(c.name)}.pdf`);
  toast("Invoice PDF downloaded");
}

// ============ settings ============

async function renderSettings() {
  const s = await getSettings(true);
  view.innerHTML = `
    <div class="page-head"><div><h1>Settings</h1><p class="muted">These details appear on your invoices.</p></div></div>
    <div class="stack">
      <form class="card card-pad grid" id="settings-form">
        <div class="grid two">
          <div><label for="s-biz">Business name</label><input id="s-biz" name="business_name" value="${esc(s.business_name)}" placeholder="e.g. Smith Maths Tuition"></div>
          <div><label for="s-name">Your name</label><input id="s-name" name="your_name" value="${esc(s.your_name)}"></div>
        </div>
        <div class="grid two">
          <div><label for="s-email">Email</label><input id="s-email" type="email" name="email" value="${esc(s.email)}"></div>
          <div><label for="s-phone">Phone</label><input id="s-phone" name="phone" value="${esc(s.phone)}"></div>
        </div>
        <div><label for="s-addr">Address</label><textarea id="s-addr" name="address" rows="3">${esc(s.address)}</textarea></div>
        <div><label for="s-pay">Payment details</label><textarea id="s-pay" name="payment_details" rows="3" placeholder="Account name, sort code, account number, payment reference">${esc(s.payment_details)}</textarea></div>
        <div><label for="s-foot">Invoice footer</label><textarea id="s-foot" name="invoice_footer" rows="2" placeholder="e.g. Payment due within 14 days. Thank you!">${esc(s.invoice_footer)}</textarea></div>
        <div><button class="btn primary">Save settings</button></div>
      </form>

      <div class="card card-pad">
        <h2>Your data</h2>
        <p class="muted">Download a full backup of your clients, sessions and settings. It's a good idea to do this now and then.</p>
        <div class="btn-row">
          <button class="btn" id="backup">Download backup (JSON)</button>
          <button class="btn" id="csv-all">Export all sessions (CSV)</button>
          <label class="btn" style="margin:0">Restore from backup…<input type="file" id="restore" accept="application/json,.json" hidden></label>
        </div>
      </div>

      <div class="card card-pad">
        <h2>Account</h2>
        <p class="muted">Logged in as <b>${esc(store.currentUser()?.email || "")}</b>. To change your password, log out and use “Forgotten password?”.</p>
        <button class="btn danger" id="logout">Log out</button>
      </div>
    </div>`;

  $("#settings-form").onsubmit = async (e) => {
    e.preventDefault();
    try {
      await store.saveSettings(formData(e.target));
      applyBrand();
      toast("Settings saved");
    } catch (err) { toast(err.message, true); }
  };
  $("#csv-all").onclick = () => downloadCsv(store.listSessions({ order: "asc" }));
  $("#backup").onclick = () => {
    const blob = new Blob([JSON.stringify(store.exportAll(), null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `tutor-backup-${ymd(new Date())}.json` });
    a.click();
    URL.revokeObjectURL(a.href);
  };
  $("#restore").onchange = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!(await confirmDialog(`Restore ${data.clients?.length ?? 0} clients and ${data.sessions?.length ?? 0} sessions from this backup? Records with the same ID will be overwritten.`, { okLabel: "Restore", danger: false }))) return;
      const r = await store.importBackup(data);
      toast(`Restored ${r.clients} clients and ${r.sessions} sessions`);
    } catch (err) { toast(err.message.startsWith("Unexpected") ? "That file isn't valid JSON" : err.message, true); }
  };
  $("#logout").onclick = () => store.logout();
}

async function applyBrand() {
  const s = await getSettings();
  $("#brand-name").textContent = s.business_name || "Tutor Tracker";
}

// Short, readable client code for invoice numbers, e.g. "AP" + 3 chars of the id.
function invCode(c) {
  return (initials(c.name) + c.id.slice(0, 3)).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function showSetupNeeded() {
  $("#topbar").hidden = true;
  view.innerHTML = `
    <div class="login"><div class="card">
      <h1>Almost there</h1>
      <p>Firebase isn't connected yet. Paste your project's config into <code>docs/firebase-config.js</code>,
      then reload this page. The README walks you through it.</p>
    </div></div>`;
}

// ============ boot ============

$("#quick-add").onclick = () => openSessionForm();
window.addEventListener("hashchange", () => { if (!$("#topbar").hidden) router(); });

if (!store.configured) {
  showSetupNeeded();
} else {
  view.innerHTML = `<div class="empty">Loading…</div>`;
  let unsubscribeData = null;
  store.watchAuth(async (user) => {
    unsubscribeData?.();
    $("#modal-root").innerHTML = "";
    if (!user) return showLogin();
    $("#topbar").hidden = true;
    view.innerHTML = `<div class="empty">Loading your data…</div>`;
    try {
      await store.ready();
    } catch (e) {
      view.innerHTML = `<div class="login"><div class="card"><h1>Can't load your data</h1><p>${esc(e.message)}</p>
        <button class="btn" id="lo">Log out</button></div></div>`;
      $("#lo").onclick = () => store.logout();
      return;
    }
    $("#topbar").hidden = false;
    applyBrand();
    router();
    unsubscribeData = store.onChange(() => { applyBrand(); refresh(); });
  });
}
