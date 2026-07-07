# Trackr — Install on your phone

This folder turns Trackr into a real app icon on your phone. Pick ONE of the two options below.

---

## Option A — 2 minutes, no account needed (best experience)

This gives you a real install: full screen, no browser bar, an offline-friendly app icon, your Trackr logo.

1. Go to **https://app.netlify.com/drop** on your computer.
2. Drag this whole folder (`moneyledgerpremium`) onto the page.
3. It gives you a live link like `https://random-name-123.netlify.app`.
4. Open that link on your phone (Chrome on Android, or Safari on iPhone).
5. Tap the browser menu → **"Add to Home Screen"** (Android may show an automatic "Install app" prompt instead).
6. Done — open it from your home screen like any other app, Trackr logo and all.

Your data is stored only on your phone (in the browser), so it stays private to you. This costs nothing, needs no sign-up, and you can re-drop the folder any time you update it.

## Option B — Right now, zero setup (simpler, still works fine)

1. Unzip this folder onto your phone (or unzip on your computer and transfer the `moneyledgerpremium` folder to your phone via cable, Google Drive, etc.)
2. Open `index.html` from your phone's file manager — it opens in your browser.
3. Tap the browser menu → **"Add to Home Screen"**.
4. You'll get an icon on your home screen that opens Trackr. It may show the browser's address bar at the top — that's the only difference from Option A.

Either way: everything you enter is saved right there in your phone's browser storage — it'll be there every time you open the app.

## What's new in this update

- Removed the default mobile browser tap-highlight flash. That solid colored box you would briefly see on tap before anything happened was the phone's own default highlight, not part of the app design, now disabled everywhere.
- Added a smooth fade and scale-up animation to every overlay (Search, Category Detail, Transaction Detail, EMI Schedule), and a matching fade-in to switching between More menu pages. Everything now opens with a quick, deliberate motion instead of snapping instantly.

## Older updates

- Fixed a scroll glitch on the EMI payment schedule, where earlier rows could visibly peek out from behind the header while scrolling. Replaced the sticky-header technique (which misbehaves on Android when combined with a blur backdrop) with a more robust fixed-header plus scrolling-body layout, applied to every overlay: Search, Category Detail, Transaction Detail, and the EMI Schedule.
- Transaction Details now shows the time an entry was logged, not just the date. Older entries from before this update show "Not recorded" rather than anything broken.
- Fixed a real gap: logging a debt payment did not let you pick which account the money came from, it silently always used your first account. There is now a proper Account selector on Log Payment, matching the rest of the app.
- Fixed the PDF export currency symbol. The rupee symbol could render as a stray character in exported PDFs, since the PDF library's built-in fonts do not support that Unicode glyph. PDF exports now print "Rs." instead, which displays correctly in every PDF viewer. CSV exports and on-screen amounts were never affected, only the PDF.

## Older updates

- **Fixed a real bug**: clicking entries inside the category drill-down, and the X close button, used to need several taps before responding. Root cause was each click silently stacking up extra navigation history; now every action takes exactly one tap.
- **New: Transaction Details page** — tap any entry anywhere (Home, History, category lists) to see a clean, dedicated page with every field: date, category, account, type, particulars — plus Edit and Delete right there.
- **Top Categories on Home are now tappable** — tap any of the four category tiles to see exactly which entries make it up, same as tapping a ring slice.
- **Redesigned the Reports period selector** (Daily/Weekly/Monthly/Custom) — it used to wrap awkwardly with Custom bulging onto its own line; now it's a clean, intentional 2×2 tile grid.

## Older updates

- **Fixed a layout bug** where the Home page could push wider than the screen and get cut off — a CSS grid meant to stack cards full-width was instead forcing them into two squeezed columns. Now properly contained on any phone width.
- **Fixed the number font** — switched to a font that can never show a dotted/slashed zero, even as a fallback if a web font is slow to load.
- **Made the spending ring interactive** — tap any slice (or its % label) to see exactly which transactions make it up.
- **Made transactions interactive** — tap any entry anywhere (Home, History, Reports) to see all other entries in that same category.

## Older updates

- **Savings Goals** — track money you're saving FOR something (a trip, a gadget, an emergency fund), separate from debt. Add a target, log contributions as you save, see your progress. Contributions are just for tracking — they don't create a transaction, since that money is still yours.
- **EMI Payment Schedule** — tap "View Schedule" on any EMI debt to see the full month-by-month plan: which installments are paid, which are overdue, which are still upcoming.
- **Multiple Accounts** — tag each entry to Cash, Bank, Card, or any account you add, and see a separate balance for each, both on Home and under More → Accounts.
- Debts now show distinct colors — blue for EMI, gold for One-time — so you can tell them apart at a glance, in both light and dark mode.
- Switched the number font (the old one drew zeros with a dot in the middle — fixed).
- Fixed a PDF export bug where the Total Credit/Debit/Net line could run together with no space if the numbers were large.

## Older updates

- **Proper back navigation** — the system back gesture (swipe) now steps back one screen at a time, the same as the on-screen Back button, instead of closing the app
- **Debt Overview** — a clear Total Committed / Total Paid / Total Pending summary across all your debts, broken down separately for EMI vs One-time, on both the Debts & EMIs page and in Reports
- Debt and EMI totals are now also included in your PDF and CSV exports

## What's in this version

- **Home / Insights / Add Entry / Reports / More** with frosted glass cards, a sticky header, and a bottom nav with a raised "+"
- A spending ring chart (Week / Month / Year), Cash Flow Trend chart
- **Net Worth** — a combined Balance-minus-Debt figure shown on Home once you have any debt tracked
- **Debts & EMIs** under More — add a loan, credit card, or EMI; edit it later if something changes; log payments (recorded as a transaction too, under "EMI / Loan"); see a projected debt-free date for EMIs
- **Recurring "Quick Add"** on the Add Entry screen — tick "Save as a Quick Add" once on something you repeat (salary, rent, a subscription), then re-log it in one tap next time
- **Reminders** under More — for anything you need to remember to pay, monthly or one-time. Shows as a banner on Insights and adds to the bell badge. You can also turn on browser notifications for it (only fires while the app/tab is open — there's no server here, so true background phone notifications aren't possible without one)
- **Global search** (magnifying glass icon, top right) — search across transactions, categories, and debts from anywhere in the app
- **Dark Mode** — toggle in More → Settings & Backup
- Budgets with progress bars, full Reports (Daily/Weekly/Monthly/Custom) with PDF and CSV export
- Backup & Restore, with a gentle reminder if it's been a while since your last one

## A note on backups

Since everything lives only on this one phone/browser, open the app → **More** → **Settings & Backup** → **"Backup Data"** every now and then. That downloads a small `.json` file you can keep safe — e.g. in Google Drive — and restore from later if you ever switch phones or clear your browser data.
"# trackr" 
