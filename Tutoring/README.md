# Tutor Tracker

A private web app for a self-employed tutor to track clients, sessions and money owed, and to create invoice PDFs.

- **Hosting:** the pages are hosted free on **GitHub Pages**.
- **Data:** stored in **Firebase** (Google): Authentication handles the login, and Cloud Firestore is the database.
- **Code:** plain HTML, CSS and JavaScript, with no build step and no server to run.

## Features

- **Dashboard:** earnings this month and this UK tax year (from 6 April), hours taught, money owed, upcoming sessions, and past sessions that still need marking as done.
- **Sessions:** search and filter, export to CSV, and tick several unpaid sessions to mark them paid at once.
- **Calendar:** month view (weeks start on Monday) that works on a phone.
- **Clients:** contact details, hourly rate, notes, session history, and totals paid and owed. You can archive old clients.
- **Weekly repeats:** book a slot for up to 52 weeks in one go, and later delete "this and all future" sessions.
- **Invoices:** download a PDF of a client's unpaid sessions (or a date range) to email yourself.
- **Backups:** download a JSON backup, restore from one, and export everything to CSV.
- **Live sync:** changes appear on your phone and laptop straight away, and the app keeps working briefly offline.

> **No payments go through the site.** Invoice PDFs are made in your browser. "Mark as paid" is just your own record.

---

## One-time setup (about 15 minutes)

### 1. Create the Firebase project
1. Go to <https://console.firebase.google.com> and click **Create a project**. Google Analytics isn't needed.
   Stay on the free **Spark** plan and don't add a billing account.
2. **Build → Authentication → Get started.** Under **Sign-in method**, enable **Email/Password**.
3. Still in Authentication, open the **Users** tab and click **Add user**. Enter your email and a strong password.
   Copy the **User UID** it shows, because you'll need it in step 4.
4. **Build → Firestore Database → Create database.**
   - Choose a location. `europe-west2` (London) suits a UK business, and it can't be changed later.
   - Choose **production mode**.
   - Open the **Rules** tab and replace everything with the contents of [`firestore.rules`](firestore.rules).
   - Change `YOUR_UID` to your User UID from step 3, then click **Publish**.
5. Go to **Project settings** (the cog icon) → **General** → **Your apps**, click the **`</>`** (Web) icon, and register an app. Firebase Hosting isn't needed.
   Copy the `firebaseConfig` values into [`docs/firebase-config.js`](docs/firebase-config.js).

> The values in `firebase-config.js` aren't secret: they only say *which* project to talk to. Your data is protected by the login plus the rules. The rules only let **your** UID read or write anything, so even if a stranger created an account, they'd see nothing.

### 2. Publish on GitHub Pages
1. Commit and push this repository to GitHub.
2. On GitHub, go to **Settings → Pages**. Set **Source** to **Deploy from a branch**, **Branch** to `main`, and the folder to **`/docs`**, then click Save.
3. After a minute or so the site is live at `https://<your-username>.github.io/Tutoring-Web-App/`.
4. Back in Firebase, go to **Authentication → Settings → Authorized domains** and add `<your-username>.github.io`.

On your phone, open the site and choose **Add to Home Screen** so it works like an app.

### Optional hardening
- **Block new sign-ups:** in Firebase → Authentication → Settings → **User actions**, if the option is there, untick "Enable create (sign-up)". The rules already block other accounts, so this is extra.
- **Restrict the API key:** in Google Cloud console → APIs & Services → Credentials, open the "Browser key" and restrict it to the `https://<your-username>.github.io/*` website.

---

## Running it on your computer

**Don't double-click `docs/index.html`.** Browsers block JavaScript modules on pages opened from disk (`file://`), and you'll see a **CORS error**. Serve the folder over `http://localhost` instead. Any one of these works:

- **Windows:** double-click **`start-local.bat`**. It uses Node.js or Python, whichever you have, and opens <http://localhost:8801/docs/>.
- **VS Code:** install the **Live Server** extension, then right-click `docs/index.html` and choose **Open with Live Server**.
- **Terminal:** run `npx http-server . -p 8801 -c-1` (or `python -m http.server 8801`) in the project folder, then open <http://localhost:8801/docs/>.

Always use `localhost` rather than `127.0.0.1`, because Firebase only allows `localhost` by default.

It connects to your real Firebase project, so what you see is your live data. `localhost` is allowed by Firebase by default.

## Free-tier limits

Firebase's no-cost Spark plan includes a daily allowance of Firestore reads, writes and deletes, plus 1 GiB of storage. See the current figures at <https://firebase.google.com/pricing>.

The app loads your clients and sessions once when it opens, and then only receives changes. Its offline cache also avoids re-downloading everything on each visit. A tutor with a few hundred sessions a year will use a very small part of the allowance. If you ever go over, requests are refused until the daily allowance resets. You are never charged on Spark.

## Backups

Go to **Settings → Download backup** every month or so. **Restore from backup…** puts records back without deleting anything.

## Security and privacy notes

- Client names and contact details are personal data under UK GDPR. Use a strong password, and only store what you need.
- Logging out (Settings → Log out) also deletes the offline copy of your data from that browser. On a shared computer, use a private window anyway.
- To change your password, use **Forgotten password?** on the login screen. Firebase emails you a reset link.

## Project layout

```
docs/                     ← the website GitHub Pages serves
  index.html              app shell
  app.js                  user interface (pages, forms, calendar, PDF invoices)
  store.js                data layer: Firebase login + Firestore reads/writes + totals
  firebase-config.js      your Firebase project settings (edit this)
  styles.css              styles (light/dark mode, phone friendly)
  vendor/                 Firebase SDK, jsPDF (bundled, see vendor/README.md)
firestore.rules           database security rules (paste into Firebase console)
test/                     automated browser test using a fake in-memory Firebase
```

### Data model (Firestore)

```
users/{uid}/clients/{id}     name, contact_name, email, phone, subject, level,
                             hourly_rate_pence, notes, active, created_at
users/{uid}/sessions/{id}    client_id, start_at ("YYYY-MM-DDTHH:MM", local time),
                             duration_min, subject, location, notes,
                             status (scheduled|completed|cancelled|no_show),
                             amount_pence, paid, paid_at, payment_method, series_id
users/{uid}/meta/settings    business_name, your_name, address, email, phone,
                             payment_details, invoice_footer
```

Money is stored in pence (whole numbers) to avoid rounding errors.

### Running the test

```bash
npm install
npx playwright install chromium
npx http-server -p 8801 -c-1 . &
npm test
```
