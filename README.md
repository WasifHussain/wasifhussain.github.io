# Wasif Hussain — portfolio

A custom, responsive portfolio for a software engineer focused on backend systems, healthcare technology, and client websites. Professional contributions lead the page; academic and personal projects form a supporting section. Content comes from Wasif's current résumé and his confirmed Astra Technology experience.

## Develop

Use Node.js 24 (`.nvmrc`). There are no third-party runtime or build dependencies.

```sh
npm ci --ignore-scripts
npm start
```

The development server uses port 4173 by default. Set `PORT` to change it. Edit `index.html`, `assets/styles.css`, and `assets/app.js`; refresh the browser after changes.

```sh
npm test
npm run build
npm run preview
```

The build writes the complete deployable website to `_site/`. It never rewrites source files. Assets, fonts, and the downloadable résumé are hosted locally; no third-party scripts, analytics, or external font requests are used. Contact uses email links and clipboard copy, without collecting form data.

## Browser checks

An optional acceptance suite exercises mobile navigation, project filters and dialogs, downloads, clipboard fallbacks, nine responsive sizes, and automated WCAG checks. Install its tools outside the checkout, then run it against `npm start` (Chromium must be installed):

```sh
npm install --prefix /tmp/portfolio-browser --no-audit --no-fund playwright @axe-core/playwright
NODE_PATH=/tmp/portfolio-browser/node_modules node tests/browser.cjs
```

Set `SITE_URL`, `CHROMIUM_PATH`, or `ARTIFACT_DIR` to override the defaults. Screenshots default to `/tmp/portfolio-review`. Automated accessibility checks complement manual review; they do not establish full accessibility conformance.

## Content

- `index.html`: résumé content, experience, skills, project links, and metadata.
- `assets/app.js`: professional and side-project details, filters, accessible menu, and clipboard handling.
- `assets/Wasif-Hussain-Resume.pdf`: downloadable résumé.
- `assets/wasif-hussain-headshot.jpg`: web-ready headshot based on the photo supplied by Wasif.
- `assets/fonts/`: DM Sans and Instrument Serif with their OFL licenses.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the exact DNS and GitHub Pages settings for **wasifhussain.tech**, the domain purchased by Wasif. The build includes its custom-domain declaration and canonical metadata; these files do not prove DNS or certificate readiness.

## Content and visual references

- Namaste Roving website contribution and Software Engineer role at Astra Technology were confirmed by Wasif. Dates, framework, ownership of the whole website, and performance claims are deliberately not inferred. The client and [Astra portfolio reference](https://astratechnology.com.np/portfolio/5) are linked directly.
- Qure4u, Deerhold/PRIZM, university, and Soft9 descriptions are based on the supplied résumé. Professional work is credited as a contribution within a team.
- The project covers are original editorial illustrations and engineering overviews, not captured product interfaces. No client screenshots were available under the current network policy.
- Company names are rendered as linked text, not claimed to be official logo artwork. Official logo sources are blocked in this environment; replace these text treatments with verified assets when access is enabled.
- Structural reference: Brittany Chiang’s public [portfolio source](https://github.com/bchiang7/v4), specifically its clear role context, featured-project hierarchy, and employer-specific experience. The layout, artwork, copy, and styling here are independently authored for Wasif.
