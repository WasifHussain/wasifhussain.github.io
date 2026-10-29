# Wasif Hussain — portfolio

A custom, responsive portfolio for a software engineer focused on backend systems and healthcare technology. Content comes from Wasif's current résumé. Project illustrations are conceptual artwork, not screenshots of live products.

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

-   `index.html`: résumé content, experience, skills, project links, and metadata.
-   `assets/app.js`: project details, filters, menu, and interactive system illustration.
-   `assets/Wasif-Hussain-Resume.pdf`: downloadable résumé.
-   `assets/wasif-hussain.jpg`: portrait from the previous portfolio.
-   `assets/fonts/`: DM Sans and Instrument Serif with their OFL licenses.

See [DEPLOYMENT.md](DEPLOYMENT.md) for Name.com, student-domain, and deployment instructions. `wasifhussain.com` is a requested domain, not a registered or configured domain. This repository deliberately has no custom-domain binding until ownership is confirmed.
