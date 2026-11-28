# Yeovil Handyman: project guide

Website for Yeovil Handyman, Yeovil, Somerset. Live at **https://yeovilhandyman.com** (bare domain is the main address; www redirects to it).

## The business (from Rich, 28 Nov 2026)
- **Focus: carpentry, building work and odd jobs.** Don't target painting and decorating, plumbing or electrics. The FAQ says Gary can turn his hand to most things if asked.
- **Gary** is the main contractor and has been a builder for 25 years.
- **Prices: £40 an hour or £300 a day.** Quotes are free. Materials policy not given: don't state one.
- **Area:** within about 30 minutes of Yeovil (the town list is in `build.js`).
- **No phone number** (cold calls). Contact is the web form plus web@yeovilhandyman.com.
- **No real job photos and no reviews yet.** Never invent either. The job pictures are line drawings, not photos.
- **Audience:** homeowners in their 30s, 40s and older. Keep it easy to read and navigate: big text, plain words, say what we do, no fluff.
- Rich to check: the "Typical jobs" lists in `build.js` are typical jobs for an experienced builder. Remove any Gary doesn't do.

## Folder layout and build
- `build.js` writes every HTML page, plus `sitemap.xml`, into `site/` (Node 18+, no packages). **All wording lives in `build.js`**: edit it, never the built HTML.
  - It also writes each page's head tags (canonical, icons, link-preview `og:` tags) and schema: WebSite and HomeAndConstructionBusiness (prices, areas) on the home page, Service and BreadcrumbList on the service pages.
- `scripts/check.js` checks the built pages. It must show **0 errors** before any commit. It checks:
  - one H1, title and description present, a canonical
  - valid schema
  - no broken internal links or `#` links
  - sitemap pages exist
  - no visible TODOs
  - no phone number or WhatsApp link
- Workflow: edit `build.js`, run `node build.js`, run `node scripts/check.js`, commit, push.
- `build.js` adds a version stamp to `style.css` and `app.js` links (`?v=<hash>`). Cloudflare lets browsers keep them for 4 hours, so without the stamp a change to the CSS shows new pages with the old stylesheet (this happened on 28 Nov 2026). Always rebuild after editing `style.css` or `app.js`.
- `site/` holds the static files that the build doesn't write: `style.css`, `app.js`, `fonts/`, the icons and `og-image.png`, `_headers`, `robots.txt`, `site.webmanifest`.
- `404.html` is the not-found page (noindex). Without it, Cloudflare Pages would serve the home page for every unknown URL.
- Preview: `.claude/launch.json` "site", or `python -m http.server 8080 --directory site`.

## Working style
- Plain English, short sentences, UK spelling.
- Don't change the business's wording, prices or contact details without asking Rich.
- Never put Rich's personal email address on the site.
- Keep it simple: static HTML from `build.js`, no frameworks.

## Hosting
- Code: GitHub **NoMhawk/yeovilhandyman** (public). Branch `main`.
- Cloudflare Pages project **yeovilhandyman**: Git-connected to that repo, no build command, output folder `site`. Every push to `main` goes live in about a minute. It also serves https://yeovilhandyman.pages.dev.
- Custom domains on the Pages project: `yeovilhandyman.com` and `www.yeovilhandyman.com`. Cloudflare made the proxied DNS records for them.
- Redirect rule "www to bare domain": `https://www.yeovilhandyman.com/*` → `https://yeovilhandyman.com/${1}`. It is a 301 and keeps the query string.
- Always Use HTTPS: on.
- Moved from GitHub Pages on 26 Nov 2026 (GitHub Pages is now disabled on the repo), after the domain's DNS moved from Fasthosts to Cloudflare the same day (records in `D:\storage\Claude\Move Domains\yeovilhandyman.com\`). The old GitHub Pages DNS was:
  - apex A records 185.199.108.153, .109, .110, .111
  - `www` CNAME `nomhawk.github.io`
  - To undo, put those back as DNS only, restore the `CNAME` file and the root layout, and turn GitHub Pages back on.
- The old Fasthosts zone (not live, kept as a fallback) was also changed on 26 Nov 2026. Its apex A records now point to 104.21.72.175 and 172.67.153.84, and its `www` CNAME to `yeovilhandyman.pages.dev`. This is because some resolvers kept asking Fasthosts for up to 48 hours after the nameserver move. Its email records are unchanged.

## Analytics
- Cloudflare Web Analytics, automatic setup. There's no script in the code and no cookies. The beacon is added by Cloudflare at the edge.
- Google Search Console: domain property `yeovilhandyman.com` (already set up in 2025), verified by a `google-site-verification` TXT record in Cloudflare DNS. **Do not delete it.** Sitemap `https://yeovilhandyman.com/sitemap.xml` resubmitted on 26 Nov 2026.

## Email (not part of this site)
Email is still **Fasthosts mail** (livemail). The setup:
- MX `mailserver.livemail.co.uk`
- SPF, the 4 `livemailN._domainkey` DKIM CNAMEs, DMARC
- `mail`, `smtp` and `webmail` records

All of these are DNS only in Cloudflare. Don't change them. Don't turn on Cloudflare Email Routing: it would replace the MX records and cut off the Fasthosts mailboxes.

## Site notes
- Pages (rebuilt 28 Nov 2026):
  - `/` home
  - `/carpentry/`, `/building-work/` and `/odd-jobs/`: service pages
  - `/areas/`
  - `/privacy/`
  - `/thank-you/` (noindex)
  - `404.html`
  - Every page ends with the contact form (`#contact`) except privacy, thank-you and 404.
- `site/app.js` runs the mobile menu: opens and closes, closes on a link tap or Escape.
- **Contact form:** posts straight to Web3Forms (no script).
  - Account `yeovilhandyman@richietaylor.net` (Free plan, 250 a month). Form "Yeovil Handyman contact form", access key in `build.js` (public, not a secret).
  - Each enquiry is emailed to the account address, then on to Rich's Gmail. After sending, visitors go to `/thank-you/`.
  - A hidden `botcheck` box catches spam bots.
  - The privacy notice names Web3Forms. Change it if the form processor changes.
- **No third-party loads.**
  - Montserrat is self-hosted in `site/fonts/` (one variable woff2, SIL Open Font Licence).
  - Icons and job drawings are inline SVG line art in `build.js`.
  - The only outside requests are Cloudflare's analytics beacon and the form post.
- The AI-generated "project photos" were removed on 28 Nov 2026, because they carried a "Grok" watermark and claimed jobs that weren't done. Add real job photos when Rich has them.
- No home address, phone number or WhatsApp on the site, at Rich's request (26 Nov 2026).
- Search results and link previews (26 Nov 2026, Rich chose a branded card):
  - `favicon.ico`, `apple-touch-icon.png`, `icon-192/512.png`, `logo-512.png` and `og-image.png` (dark card: YH, "Yeovil Handyman", "Home repairs and maintenance in Yeovil") are made from `favicon.svg` by `python "D:\storage\Claude\Move Domains\tools\make_icons.py" --svg site/favicon.svg --out site --bg "#1f262e" --accent "#ff4d6a" --card-title "Yeovil Handyman" --card-sub "Home repairs and maintenance in Yeovil"`.
  - The tags in each page's `<!-- search-appearance -->` block are now written by `build.js` (since 28 Nov 2026). Don't run `search_tags.py` here: the next build would overwrite its output.
  - The link-preview card subtitle still says "Home repairs and maintenance in Yeovil". To change it, rerun `make_icons.py` with a new `--card-sub`.
  - Check it live: `node "D:\storage\Claude\Check Sites\scripts\search-appearance.mjs" yeovilhandyman.com`.
