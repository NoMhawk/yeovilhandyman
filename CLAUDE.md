# Yeovil Handyman: project guide

One-page website for Yeovil Handyman, a handyman business in Yeovil, Somerset. Live at **https://yeovilhandyman.com** (bare domain is the main address; www redirects to it).

The site is plain static HTML and CSS, made before this repo was reorganised. There is no build step: edit the files in `site/` directly.

## Folder layout
- `site/`: everything the browser gets. `index.html`, `style.css`, `img/`, plus:
  - `_headers`: Cloudflare security headers
  - `404.html`: the not-found page (noindex). Without it, Cloudflare Pages would serve the home page for every unknown URL.
  - `sitemap.xml` and `robots.txt`: written by `python -I "D:\storage\Claude\Move Domains\tools\make_sitemap.py" site https://yeovilhandyman.com`. Re-run it after adding a page.
- `.claude/launch.json`: "site" preview. Or run `python -m http.server 8080 --directory site`.

## Working style
- Plain English, short sentences, UK spelling.
- Don't change the business's wording, prices or contact details without asking Rich.
- Never put Rich's personal email address on the site.
- Keep it simple: static HTML, no frameworks.

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
- Pages: `/` (one-page site), `/privacy/` (privacy notice), `/thank-you/` (after the form, noindex), `404.html`.
- `site/app.js` runs the mobile menu (open, close on link tap or Escape) and darkens the header after scrolling. On pages without the dark hero picture, the header is always solid.
- **Contact form:** posts straight to Web3Forms (no script).
  - Account `yeovilhandyman@richietaylor.net` (Free plan, 250 a month). Form "Yeovil Handyman contact form", access key in `index.html` (public, not a secret).
  - Each enquiry is emailed to the account address, then on to Rich's Gmail. After sending, visitors go to `/thank-you/`.
  - A hidden `botcheck` box catches spam bots.
  - The privacy notice names Web3Forms. Change it if the form processor changes.
- **No third-party loads.**
  - Montserrat is self-hosted in `site/fonts/` (one variable woff2, SIL Open Font Licence).
  - Service icons are inline SVGs.
  - The only outside requests are Cloudflare's analytics beacon and the form post.
- `favicon.svg`: "YH" in crimson on dark grey (the source for all the icons). Every page has a canonical link.
- The project pictures in `site/img/` are AI-generated (they carry a "Grok" watermark), not photos of real jobs. `lighting.jpg` is a crop of `kitchen.jpg`. The hero background is `painting.jpg` under a dark overlay. Rich to update: swap in real job photos when available.
- No home address, phone number or WhatsApp on the site, at Rich's request (26 Nov 2026). Contact is the form plus web@yeovilhandyman.com.
- Search results and link previews (26 Nov 2026, Rich chose a branded card):
  - `favicon.ico`, `apple-touch-icon.png`, `icon-192/512.png`, `logo-512.png` and `og-image.png` (dark card: YH, "Yeovil Handyman", "Home repairs and maintenance in Yeovil") are made from `favicon.svg` by `python "D:\storage\Claude\Move Domains\tools\make_icons.py" --svg site/favicon.svg --out site --bg "#1f262e" --accent "#ff4d6a" --card-title "Yeovil Handyman" --card-sub "Home repairs and maintenance in Yeovil"`.
  - The tags in each page's `<!-- search-appearance -->` block (icons, manifest, og:/twitter:, and WebSite + business schema on the home page) are written by `search_tags.py` in the same folder. Rerun it after adding a page or changing a title or description (in Git Bash, prefix `MSYS_NO_PATHCONV=1`).
  - Check it live: `node "D:\storage\Claude\Check Sites\scripts\search-appearance.mjs" yeovilhandyman.com`.
