// Browser test: runs the real app against the in-memory fake Firebase.
// Usage: serve the repo root on :8801 (python3 -m http.server 8801), then `node test/e2e.mjs`
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.OUT || "/tmp/pw";
const B = "http://localhost:8801/docs/";
const fake = fs.readFileSync(path.join(here, "fake-firebase.js"), "utf8");
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const ctx = await b.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
await ctx.route("**/vendor/firebase.js", (r) => r.fulfill({ body: fake, contentType: "text/javascript" }));
await ctx.route("**/firebase-config.js", (r) => r.fulfill({ body: 'export const firebaseConfig={apiKey:"test"}', contentType: "text/javascript" }));
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push("PAGE " + e.message));
p.on("console", (m) => m.type() === "error" && errs.push("CONSOLE " + m.text()));
const modalOk = () => p.click(".modal footer button.primary");
const log = (...a) => console.log(...a);

await p.goto(B);
await p.waitForSelector("#login-form");
await p.fill("#em", "tutor@example.com");
await p.fill("#pw", "wrong");
await p.click("#login-form button.primary");
await p.waitForSelector("#login-err:not([hidden])");
log("bad login:", await p.textContent("#login-err"));
await p.fill("#pw", "secret123");
await p.click("#login-form button.primary");
await p.waitForSelector(".kpis");
log("logged in");

await p.click("#quick-add");
await p.waitForSelector("#client-form");
await p.fill("#c-name", "Amy Patel");
await p.fill("#c-contact", "Mrs Patel");
await p.fill("#c-subject", "Maths");
await p.fill("#c-rate", "35");
await modalOk();
await p.waitForSelector('h1:has-text("Amy Patel")');

await p.click("#add-s");
await p.fill("#f-date", "2026-09-09");
await p.fill("#f-time", "16:00");
await p.selectOption("#f-dur", "90");
await p.selectOption("#f-status", "completed");
log("amount", await p.inputValue("#f-amount"));
await modalOk();
await p.waitForTimeout(300);

await p.click("#add-s");
await p.fill("#f-date", "2026-09-18");
await p.fill("#f-time", "17:00");
await p.selectOption("#f-repeat", "6");
await modalOk();
await p.waitForTimeout(300);
log("history rows", await p.locator("tr[data-row]").count());

await p.goto(B + "#/clients");
await p.click("#add-client");
await p.fill("#c-name", "Ben Hughes");
await p.fill("#c-rate", "40");
await modalOk();
await p.waitForSelector('h1:has-text("Ben Hughes")');
await p.click("#add-s");
await p.fill("#f-date", "2026-09-14");
await p.fill("#f-time", "18:00");
await modalOk();
await p.waitForTimeout(300);

await p.goto(B + "#/");
await p.waitForSelector(".kpis");
log("kpis:", (await p.locator(".kpi .value").allTextContents()).join(" | "));
log("needs update:", await p.locator('[data-status="completed"]').count());
await p.click('[data-status="completed"]');
await p.waitForTimeout(300);
log("kpis after:", (await p.locator(".kpi .value").allTextContents()).join(" | "));
await p.screenshot({ path: `${OUT}/fb-dash.png`, fullPage: true });

await p.goto(B + "#/sessions?unpaid=1");
await p.waitForSelector("table");
log("unpaid rows", await p.locator("tr[data-row]").count());
await p.locator(".sel").first().check();
await p.click("#bulk-pay");
await modalOk();
await p.waitForTimeout(300);
log("unpaid rows after", await p.locator("tr[data-row]").count());

await p.goto(B + "#/calendar?m=2026-10");
await p.waitForSelector(".cal");
log("oct chips", await p.locator(".chip").count());
await p.locator(".chip").first().click();
await p.waitForSelector("#session-form");
await p.click("#del");
await p.click("#d-future");
await p.waitForTimeout(300);
log("oct chips after", await p.locator(".chip").count());

await p.goto(B + "#/settings");
await p.fill("#s-biz", "Louis Tuition");
await p.fill("#s-pay", "Sort code 00-00-00");
await p.click("#settings-form button");
await p.waitForTimeout(300);
log("brand", await p.textContent("#brand-name"));
const [bk] = await Promise.all([p.waitForEvent("download"), p.click("#backup")]);
await bk.saveAs(`${OUT}/backup.json`);

await p.goto(B + "#/clients");
await p.click('.client-card:has-text("Amy")');
await p.waitForSelector('h1:has-text("Amy")');
await p.click('a:has-text("Invoice")');
await p.waitForSelector(".invoice");
const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#pdf")]);
await dl.saveAs(`${OUT}/fb-inv.pdf`);
log("pdf", dl.suggestedFilename());
await p.screenshot({ path: `${OUT}/fb-inv.png`, fullPage: true });

await p.goto(B + "#/clients");
await p.click('.client-card:has-text("Amy")');
await p.waitForSelector("#edit-client");
await p.click("#edit-client");
await p.click("#c-del");
await p.click("#ok");
await p.waitForSelector('h1:has-text("Clients")');
await p.waitForTimeout(200);
log("clients after delete", await p.locator(".client-card").count());
await p.goto(B + "#/settings");
await p.setInputFiles("#restore", `${OUT}/backup.json`);
await p.click("#ok");
await p.waitForTimeout(400);
await p.goto(B + "#/clients");
await p.waitForTimeout(200);
log("clients after restore", await p.locator(".client-card").count());

const m = await ctx.newPage();
await m.setViewportSize({ width: 390, height: 844 });
await m.goto(B + "#/calendar"); // fresh page = logged out in the fake
await m.waitForSelector("#login-form");
log("new tab asks for login");
await m.close();

await p.goto(B + "#/settings");
await p.click("#logout");
await p.waitForSelector("#login-form");
log("logged out");
log("ERRORS", errs);
await b.close();
