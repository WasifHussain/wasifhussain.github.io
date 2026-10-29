# Deploy Wasif's portfolio

The website uses free GitHub Pages hosting. Wasif has confirmed purchasing **wasifhussain.tech** through Name.com. There is no need to buy a hosting plan.

## Custom domain: wasifhussain.tech

The repository declares `wasifhussain.tech` in `CNAME`, and the page's canonical and Open Graph URLs use `https://wasifhussain.tech/`. These declarations do not establish that DNS, GitHub's custom-domain setting, or its HTTPS certificate are active.

### GitHub Pages

Open [Settings → Pages](https://github.com/WasifHussain/wasifhussain.github.io/settings/pages). Select GitHub Actions as the publishing source. Enter **wasifhussain.tech** in **Custom domain** and save. If it is already present, leave it in place. GitHub's Actions publisher ignores the `CNAME` file, so the setting must be checked even when the file is deployed.

For domain verification, follow GitHub's verification instructions in the account's Pages settings and add the exact TXT record GitHub provides. Do not guess a verification token.

### Name.com DNS

In the Name.com account, open **wasifhussain.tech → DNS Records** and add the following website records. Use `@` for the root/apex, or leave Host empty if Name.com's form represents the root that way. Keep the default TTL.

| Type | Host | Answer |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | wasifhussain.github.io |

Replace only conflicting parking/website records for the root and `www`. Preserve unrelated MX, TXT, and other records. If Name.com is not the domain's authoritative DNS provider, make these changes at the provider named by the domain's current nameservers.

Wait for GitHub's DNS check and certificate provisioning. Then enable **Enforce HTTPS** in Pages. Confirm `https://wasifhussain.tech/` loads the portfolio, `www` redirects to the chosen apex, and the portrait and résumé download work. DNS propagation and certificate issuance can take time; a successful build alone does not prove the domain works.

Official reference: [GitHub custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

No Name.com account connection is available in this workspace. Account settings must be changed in the user's own session; do not send credentials in chat or commit them to Git.

## Build and deploy

From the checkout:

```sh
npm ci --ignore-scripts
npm test
npm run build
npm run preview
```

The complete deployable website is `_site/`. The workflow in `.github/workflows/deploy.yml` runs the checks and publishes that directory when `master` changes. The GitHub Pages URL before custom-domain activation is `https://wasifhussain.github.io/`.

To use a different static host, upload the **contents** of `_site/` into that host's website root and use that host's DNS instructions instead of the GitHub addresses above.
