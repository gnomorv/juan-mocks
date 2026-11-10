# Page format

Every mock-up page follows the review format used in `razorvision/cs-mocks` (Luciana Oliveira's mock-ups), so the two collections look and behave the same. The shared styles and script in `assets/` are copied from her `visual-hierarchy/assets/` unchanged, except that the script stores choices under `jm-` instead of `vh-`.

## Folder and files

- One folder per mock-up at the root, named in kebab case (`documents-navigation/`).
- The page is that folder's `index.html`. It links `../assets/mockup.css` and `../assets/mockup.js`. Page-specific CSS goes in a `<style>` block in the page; a large mock-up may add its own files inside its folder.
- All data is synthetic. No real clients, people, emails, IDs or repositories.
- Text is in English.

## Page skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Documents Navigation</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/mockup.css">
<style>/* page-only styles */</style>
</head>
<body data-show="proposed">
<div class="review-bar">
  <a href="../">← All mock-ups</a>
  <span class="rb-title">Documents navigation</span>
  <span class="t-meta" style="color:#9ca3af">November 5, 2026 · /w/… and /p/… Documents tab</span>
  <span class="rb-spacer"></span>
  <span class="seg" role="group" aria-label="Variant"><button data-set="show:current">Current</button><button data-set="show:proposed">Proposed</button><button data-set="show:split">Side by side</button></span>
  <span class="seg" role="group" aria-label="Theme"><button data-set="theme:light">Light</button><button data-set="theme:dark">Dark</button></span>
  <span class="seg" role="group" aria-label="Notes"><button data-set="notes:on">Notes on</button><button data-set="notes:off">Off</button></span>
</div>
<div class="review-layout">
<div class="split-wrap">
  <div data-variant="current" class="cur"><div class="variant-tag">Current</div> … app frame … </div>
  <div data-variant="proposed" class="pro"><div class="variant-tag">Proposed</div> … app frame with <span class="pin">1</span> pins … </div>
</div>
<aside class="notes">
  <h2>What changed and why</h2>
  <p class="notes-sub">One or two sentences: the idea, and what the live page does today.</p>
  <ol>
    <li><b>The change, as a short sentence.</b> Detail. <span class="why">Why it is better than today.</span></li>
  </ol>
</aside>
</div>
<script src="../assets/mockup.js"></script>
</body>
</html>
```

## Rules

- **Controls:** the review bar always has Theme and Notes. Variant (Current / Proposed / Side by side) appears only when the page has a Current view.
- **Concept pages** (no "today" to compare with): leave out the Variant group and the Current block; keep `body data-show="proposed"` and the single `data-variant="proposed"` block.
- **Pins:** each numbered note has a matching `<span class="pin">N</span>` placed on the proposed view where the change is. Pins hide when Notes are off or the view is Current.
- **App frame:** reuse the shared `.app`, `.side`, `.side-item`, `.topbar`, `.main`, `.page` classes. Current views use the `c-*` classes (today's measured styles); proposed views use the `t-*` type roles.
- **Theme:** `mockup.js` toggles `html.dark`; page styles that set colours need an `html.dark` pair.
- **Keyboard:** `c`, `p`, `s` switch the view and `d` toggles dark (built into `mockup.js`).

## Adding a mock-up

Create the folder with its `index.html`, add a card to the root `index.html` (newest first), and add a row to the table in `README.md`.
