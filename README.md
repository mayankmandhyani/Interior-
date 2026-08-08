# STRATA — Interior Design Studio Site

Flat-file build: `index.html` + `style.css` + `script.js` + `assets/`.
No build step — drag the whole folder into GitHub (or GitHub Pages), same as your other projects.

## To deploy
Upload everything in this folder, keeping the structure intact:
```
index.html
style.css
script.js
assets/
  craft-reveal.mp4      ← your supplied video, untouched
  craft-poster.jpg       ← auto-generated first-frame poster (shows before video loads)
  vendor/
    gsap.min.js
    ScrollTrigger.min.js
```
GSAP is vendored locally (not CDN-linked) so the site never depends on a third-party
script host being reachable — one less thing that can break on GitHub Pages.

## What to swap before launch
1. **Studio name/copy** — "STRATA" is a placeholder name I picked (ties to the
   layered/exploded-view theme of your video). Find/replace it in `index.html`
   if you want the real client name instead.
2. **Contact details** — the WhatsApp link, email, and phone in the Contact
   section (`#contact`) are placeholders (`+91 00000 00000`). Update the
   `wa.me/...` link, `mailto:`, and `tel:` hrefs.
3. **Stock images** — all photography except the hero and the first material
   shot (marble close-up) are Unsplash IDs I picked from memory and have not
   individually verified load correctly. Open the site in Safari before
   sending it anywhere and swap any broken ones — same workflow you already
   use on your other projects. Search terms are in each `alt=` attribute if
   you want matching replacements.
4. **Project data** (Vermeer Residence, Marbella Penthouse, etc. in `#work`)
   and **social links** (`#contact`) are placeholder content — swap for real
   projects/handles.

## How the scroll-scrubbed video works (Section 02)
`script.js` maps scroll progress inside `.craft-scroller` (420vh tall) to
`video.currentTime` via GSAP ScrollTrigger, pinned + scrubbed with a small
rAF-throttled easing so it doesn't jitter. It includes the standard iOS Safari
unlock trick (a muted play→pause on load) so scrubbing works on iPhone, which
matters given you're testing from Safari. If `prefers-reduced-motion` is on,
it falls back to a normal `<video controls>` in a static layout instead of
pinning — no motion sickness risk, still accessible.

## Known limitations
- Draft/placeholder copy throughout — written to match the brief's tone, not
  final client copy.
- No analytics/forms wired up — the CTAs are plain mailto/tel/WhatsApp links.
