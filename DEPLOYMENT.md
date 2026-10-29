# Deploy Wasif's portfolio

The portfolio is a static website. It needs no application server, database, API keys, or paid hosting subscription.

## Build and inspect

From the repository root, run:

```sh
node scripts/build.mjs
python3 -m http.server 8000 --bind 127.0.0.1 --directory _site
```

The build produces `_site/`. Upload **the contents** of that directory, including `index.html` and `assets/`, to the host's website root. Local serving is for validation; it does not publish the site. Keep account credentials out of this repository.

## Free hosting with GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds the site with `node scripts/build.mjs` and deploys the `_site` artifact.

1. In `WasifHussain/wasifhussain.github.io`, open **Settings → Pages** and choose **GitHub Actions** as the source.
2. Push the reviewed changes to `master`, or run the deployment workflow manually from GitHub Actions.
3. Confirm the deployment succeeds and check the URL reported by the Pages deployment.

Without a custom domain, this repository's Pages address is `https://wasifhussain.github.io/`. Publishing still requires usable GitHub access and Pages configuration. A local build or saved workflow does not establish that the site is live.

## Register the domain through Name.com

Open the [GitHub Student Developer Pack](https://education.github.com/pack), find Name.com's offer, and redeem it using your own verified student account. GitHub's [student eligibility page](https://github.com/education/students) describes the enrollment and verification requirements.

Search for `wasifhussain.com` before checkout. Its availability and eligibility for a free registration have **not** been verified. Check eligible extensions, the first-year total, renewal prices, and any conditions before accepting an offer. Free registration does not imply free hosting or free renewals. Do not buy a paid domain or hosting plan merely to follow these instructions.

The environment currently blocks direct research requests to `name.com`, `www.name.com`, `education.github.com`, and `rdap.verisign.com`. Access to those destinations is needed to verify the current offer and public registration status. No Name.com account connection is configured. Complete sign-in and student verification privately; do not send passwords, API keys, or verification documents in chat.

## Connect a Name.com domain to GitHub Pages

Only proceed once you control the domain and the Pages deployment works:

1. Add and verify the domain in your GitHub account's Pages settings, following GitHub's domain-verification instructions.
2. In the repository's **Settings → Pages**, set the custom domain to `wasifhussain.com`.
3. In Name.com's DNS settings, use the current records documented by GitHub. For an apex domain, GitHub documents these four `A` records with host `@`:

    | Type  | Host | Value                  |
    | ----- | ---- | ---------------------- |
    | A     | @    | 185.199.108.153        |
    | A     | @    | 185.199.109.153        |
    | A     | @    | 185.199.110.153        |
    | A     | @    | 185.199.111.153        |
    | CNAME | www  | WasifHussain.github.io |

4. Reconcile conflicting `A`, `AAAA`, or `CNAME` records for these same website hosts against the actual hosting provider's instructions. Preserve unrelated records, especially email `MX` and verification `TXT` records. Do not replace the whole DNS zone.
5. Once DNS and certificate provisioning complete, enable **Enforce HTTPS** in Pages and verify the apex and `www` addresses.

See GitHub's [custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) for current record values and troubleshooting.

The old `CNAME` naming `wasifhussain.me` is removed for this redesign. Do not add a `CNAME` file for `wasifhussain.com`, set a production canonical URL, or change DNS before domain ownership and the hosting destination are confirmed. With an Actions deployment, ensure the Pages custom-domain setting is configured; adding a file alone does not establish the configuration.

## If you already have Name.com web hosting

Confirm the actual hosting plan and its upload instructions. If the plan provides cPanel, upload an archive of the `_site/` **contents** into the site's `public_html` directory and extract it so `public_html/index.html` exists. Back up any existing website before replacing it. Use the hosting plan's own DNS targets, enable its SSL certificate, and test HTTPS. Do not use the GitHub Pages DNS records for a website hosted on Name.com's servers.

No domain registration, account redemption, DNS changes, or public deployment is implied by these files.
