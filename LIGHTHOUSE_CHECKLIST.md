# Lighthouse accessibility evidence

Run this after the application is stable so the video can show real results.

1. Open `http://localhost:3000/dashboard` in Chrome.
2. DevTools → Lighthouse.
3. Select **Accessibility** (Desktop is easiest for repeatable evidence).
4. Run the audit and save/screenshot the result.
5. Repeat for `/wordle` and `/word-search` if time allows.
6. Fix any straightforward issues, rerun, and keep before/after evidence if the score changes.

Accessibility work already present in the project includes semantic headings/sections, labelled form controls, focus-visible outlines, keyboard-operable buttons/links, `aria-label` navigation, status/alert roles, descriptive iframe titles and high-contrast theme variables. The Lighthouse score must still be generated on your machine and shown in the video; do not claim a score until it has actually been run.
