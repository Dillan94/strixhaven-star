# The Strixhaven Star: Maintenance and Handoff Notes

This is the living reference for the project. When you (or a future assistant) come
back after a long gap, read this first. Keep it up to date whenever the site changes,
using the "Review log" at the bottom.

Last full review: 2026-07-21.
Live site: https://dillan94.github.io/strixhaven-star/

---

## 1. What this project is

An in-world magical university newspaper, "The Strixhaven Star", for a Dungeons and
Dragons "Strixhaven: A Curriculum of Chaos" campaign. It is a static website published
through GitHub Pages.

Design goal: an old magical newspaper on parchment, with a traditional newspaper
layout, subtle magical effects, and readable text on desktop and mobile.

The root `index.html` is always the latest issue. Past issues live in `editions/`.

---

## 2. Repository map (what each file is)

```text
strixhaven-star/
├── index.html              Latest issue. The live front page.
├── new-edition.sh          Helper script that archives the current issue.
├── MAINTENANCE.md          This file.
├── assets/
│   ├── css/star.css        All shared styling for issues and effects.
│   └── js/star.js          All shared behavior (effects, glossary, easter eggs).
├── images/
│   └── Muffin.png          Local image used by the front page.
├── editions/
│   ├── index.html          The Archive page. Lists past issues.
│   ├── editions.json       The data the Archive page reads.
│   └── 2025-07-22.html     An archived issue (a frozen copy of a past front page).
├── historical/
│   └── first-attempt.html  An old standalone version. Not linked. Kept for history.
└── Random/
    └── thrum_letter.html   A separate in-world letter page. Not linked from the site.
```

Note: `historical/` and `Random/` are not linked from the newspaper, but GitHub Pages
still publishes them, so their URLs work if someone knows them. They are harmless.
Leave them unless the owner asks to remove them.

---

## 3. The golden rule: where each kind of change lives

Before editing, know which single file you need. Do not edit a different file on a guess.

- Behavior and interactivity (effects, glossary, easter eggs): `assets/js/star.js`
- Shared look and layout: `assets/css/star.css`
- Story text and page markup for the current issue: `index.html`
- Story text for an old issue: that issue's file in `editions/`
- The list of past issues shown on the Archive page: `editions/editions.json`

Prefer small, focused edits over rewriting a whole file. Preserve the current look
unless a redesign is explicitly requested.

---

## 4. GitHub Pages path rules (important)

This is a "project site" served under `/strixhaven-star/`, so all asset paths must be
relative. Do not use paths that start with `/`, because those broke on Pages before.

- Root `index.html` uses `./assets/...`, `./images/...`
- Files inside `editions/` use `../assets/...`, `../images/...`

The archiving script converts `./assets/` to `../assets/` and `./images/` to
`../images/` automatically when it makes an edition copy.

---

## 5. Feature reference (what exists and where the code is)

### Visual and layout (star.css)
- Dark brown background with soft radial glows: `body::before`.
- Parchment newspaper panel, ornate borders, dark masthead with gold accents.
- Two-column main article on desktop (`.story-text` uses CSS columns).
- Sidebar with events, gossip (Campus Whispers), and a safety warning box.
- Two bottom stories side by side on desktop, stacked on mobile (fixed).
- Fonts: IM Fell (body) and Cinzel / Cinzel Decorative (headings), from Google Fonts.
- Drop cap on the first paragraph of the main story.
- Mobile breakpoint at `max-width: 900px`.
- Bottom-story type is intentionally `IM Fell DW Pica`, 14px, line-height 1.6. Keep it.

### Magical effects (star.js + star.css)
- Headline reveal: the headline gets a `reveal` class on load (wipe animation).
- Floating motes: soft particles generated in JS, skipped under reduced motion.
- Living photographs: every `.photo-placeholder` gets a `living` class for a slow
  zoom ("Ken Burns") effect.
- Photo frame glow on hover.
- Rune corners: JS adds four rune symbols to each photo frame, and guards against
  adding them twice.
- Floating dust inside photo frames.
- Reduced motion is respected via `@media (prefers-reduced-motion: reduce)` in CSS
  and a matchMedia check in JS. Do not remove this.

### Glossary tooltips (star.js + star.css)
Wrap an in-world term like this in the HTML:

```html
<span data-glossary="Explanation shown to the reader.">Lorehold</span>
```

JS shows a tooltip on hover or keyboard focus. Terms in use include Lorehold,
Prismari, Witherbloom, Biblioplex, Iron-Lifters Society, and Rose Stage.

### Hidden Ink system (star.js + star.css + HTML)
- Trigger in the HTML: `<span class="ink-hotspot">...</span>`. The preferred explicit
  form is `<span class="ink-hotspot" data-ink="trigger">...</span>`, but the JS also
  falls back to the first `.ink-hotspot` if `data-ink="trigger"` is absent.
- Hidden clues in the HTML use `<div class="ink-note" data-ink-note hidden>...</div>`.
- On activation: all `data-ink-note` elements appear, the hotspot glows, a ring and
  sparkle burst play, and a brief golden page flash happens. It does not auto-scroll.
- Keyboard: Enter or Space activates it. It has `role="button"`.
- The breaking-news banner has a moving light sweep in `.breaking-banner::before`,
  which is set to `pointer-events: none` so it does not block clicks. The hotspot sits
  above it with `z-index`.

### Konami saving-throw easter egg (star.js, styled in star.css)
- Desktop sequence: Up, Up, Down, Down, Left, Right, Left, Right, B, A.
- It opens a themed modal, picks a random saving throw and a secret DC from 10 to 18,
  asks for the player's roll total, then shows success or failure.
- Success tells the player to claim Inspiration and gives the weekly code.
- Failure tells the player to roll a d100 and report it to the DM.
- The modal stays for about 7.6 seconds after submitting.
- The modal is built in JS; its styling lives in star.css (the `.modal-*` rules).

### Mobile easter-egg activation (star.js)
- Long-press the hidden-ink hotspot for about 0.9 seconds.
- Swipe sequence anywhere: Up, Up, Down, Down, Left, Right, Left, Right (no B, A).

---

## 6. Weekly / per-issue settings you change by hand

In `assets/js/star.js`, near the Konami code:

```js
const WEEKLY = {
    inspirationCode: 'GILDED MUFFIN'
};
```

Change `inspirationCode` when you want a new secret phrase. Because `star.js` is shared
by every page, this same code currently applies to all issues, including archived ones.
Per-issue codes are a possible future improvement (see section 9).

---

## 7. Publishing workflow

### Local preview
Open the project in VS Code and use the Live Server extension. That serves the site
locally so relative paths behave like they do on GitHub Pages.

### Making an edit
1. Edit the correct file (see section 3).
2. Save.
3. In a browser, do a hard refresh so you are not seeing a cached CSS or JS file.
   - Windows: Ctrl and F5.
   - Mac: Cmd and Shift and R.

### Publishing to the live site
The owner's normal commands are:

```bash
git status
git add .
git commit -m "Describe what changed"
git push origin main
```

GitHub Pages then redeploys automatically, usually within a minute or two. A hard
refresh may be needed after it deploys.

Note for assistants: automated sessions push to a separate working branch, not to
`main`. When work is done on a branch, it reaches the live site only after that branch
is merged into `main`.

### Archiving the current issue (starting a new one)
Run the helper script from the project root:

```bash
./new-edition.sh
```

It asks for a Title, a Slug (usually the date as YYYY-MM-DD), and an Issue number. It
then:
1. Copies the current `index.html` into `editions/[slug].html`.
2. Leaves the root `index.html` untouched.
3. Removes the archive link from the copy.
4. Fixes the asset paths in the copy (`./assets/` to `../assets/`, `./images/` to
   `../images/`).
5. Adds a new entry to the top of `editions/editions.json`.

After archiving, you edit the root `index.html` to become the new latest issue.

Requirements for the script: `jq`, `perl`, and a bash shell. On macOS, install jq with
`brew install jq`.

---

## 8. Known issues and review findings (prioritized)

Status as of the last review date at the top. Nothing here stops the site from working;
the page loads and all major features function. These are refinements.

### Broken relative to intent
1. FIXED 2026-07-21: the custom cursor URL was changed from `http://` to `https://`
   (star.css, `.ink-hotspot`), so it is no longer blocked as mixed content on the live
   site. It still depends on an external site (rw-designer.com); if that site ever fails,
   the cursor simply falls back to a normal pointer. Hosting the cursor locally is still
   an option for later.
2. FIXED 2026-07-21: the missing `.warning-title` rule was added to star.css (matching
   the look from `historical/first-attempt.html`), so the "Campus Safety Reminder"
   heading is styled as a proper title again.

### Cleanup (obsolete or unreachable code)
3. Old "Reveal Hidden Ink" button. `star.js` (roughly lines 32 to 64) looks for an
   element with `id="hidden-ink"`. No page has that id, so this block never runs. The
   related CSS (`.hidden-ink-trigger`, `.hidden-ink-panel`, `.hidden-ink-title`,
   `.hidden-ink-text`) is unused. The newer `.ink-hotspot` system replaced it. This is
   safe to remove later, but confirm with the owner first. It does not conflict with
   the working hidden-ink feature; it simply does nothing.

### Risky or fragile
4. FIXED 2026-07-21: in `index.html` the `<section class="ink-notes">` was moved out of
   the surrounding `<p>` in the Campus Whispers area, so the HTML is valid. The clues
   still sit in the same place and still reveal correctly. (The archived edition file is
   a frozen snapshot and still has the old nesting, which is fine and left as is.)
5. Long-press conflict on mobile: long-pressing the hidden-ink hotspot opens the Konami
   modal, but the browser may also fire a normal tap afterward, which reveals the hidden
   ink at the same time. Minor, but the two actions overlap.
6. Swipe easter egg can, in theory, be triggered by scrolling, because vertical scroll
   swipes register as Up/Down. Triggering the full sequence by accident is unlikely
   because it also needs Left/Right swipes, but it is worth knowing.

### External dependencies
7. Two photos on the front page are hotlinked from `5e.tools`
   (the stadium and studying images). If that site blocks hotlinking or removes the
   files, those photos break. Consider saving local copies. Do not redistribute
   copyrighted sourcebook art without the owner deciding to first.
8. Google Fonts are loaded from Google's servers. This is normal and low risk.

### Accessibility
9. Glossary tooltips can run off the bottom of the screen and do not have a clean
   tap-to-toggle on touch devices. Keyboard focus styles are default only.

### Mobile
10. Bottom stories stacking on mobile is fixed and working.
11. Glossary tooltips on touch could be improved (tap to open and close cleanly).

### Archiving script safety
12. `new-edition.sh` does not stop you from overwriting an existing edition file, and it
    does not warn about a duplicate slug already in `editions.json`. Re-running it with a
    slug you already used will overwrite the file and add a duplicate list entry. Adding a
    confirmation summary and an overwrite guard is a good future improvement.

---

## 9. Possible future improvements

- Better mobile glossary tooltip behavior (tap to open and close, stay on screen).
- Prevent repeated Konami rewards within the same issue.
- Store per-issue easter-egg settings (code and challenge) outside the shared JS.
- Give each archived issue its own secret code and challenge.
- Optional subtle sound with a mute preference.
- Improve the Archive page design and add issue thumbnails.
- Improve keyboard focus styles.
- Add automated HTML, CSS, and JS validation.
- Add a simple local preview command.
- Add a confirmation summary and overwrite guard to `new-edition.sh`.
- Separate reusable issue content from the page template.
- Add a `.nojekyll` file (belt and suspenders for GitHub Pages; not required today).

---

## 10. Working preferences for anyone editing this project

- Explain steps clearly; the owner is a beginner with HTML, CSS, JS, Git, and Pages.
- The owner uses speech-to-text, so unusual spellings may be transcription slips. Do not
  assume a file was misnamed unless the owner says so.
- State exactly which file you need before editing it.
- Do not change files other than the one provided or explicitly approved.
- Preserve the existing look unless a redesign is requested.
- Ask questions in small groups, not all at once.
- Avoid em dashes in writing.

---

## 11. Review log (keep this current)

Add a dated line each time the site changes in a meaningful way, so this file stays a
reliable history.

- 2026-07-21: Full review of the repository. Created this maintenance file. No site
  files changed. Findings recorded in section 8.
- 2026-07-21: Applied three approved targeted fixes. Added the `.warning-title` rule to
  star.css, changed the hidden-ink cursor URL from http to https in star.css, and moved
  the ink-notes section out of a paragraph in index.html. See findings 1, 2, and 4.
