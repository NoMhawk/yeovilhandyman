#!/usr/bin/env node
// Builds every HTML page of yeovilhandyman.com into site/. No npm packages needed (Node 18+).
//   node build.js
// Wording lives in the PAGES and TOWNS data below. Static files (style.css, app.js, fonts,
// icons, og-image.png, _headers, robots.txt) live in site/ and are not touched.
'use strict';
const fs = require('fs');
const path = require('path');

const SITE = {
  url: 'https://yeovilhandyman.com',
  name: 'Yeovil Handyman',
  email: 'web@yeovilhandyman.com',
  web3formsKey: '97cf17ff-3743-4381-8904-7abdcceeb277', // public form key, not a secret
  hourly: '£40',
  daily: '£300',
};
const OUT = path.join(__dirname, 'site');

// Towns within about 30 minutes' drive of Yeovil.
const TOWNS = {
  Somerset: ['Yeovil', 'Martock', 'Ilchester', 'Stoke-sub-Hamdon', 'Montacute', 'East Coker', 'West Coker',
    'Crewkerne', 'South Petherton', 'Somerton', 'Langport', 'Queen Camel', 'Sparkford', 'Castle Cary',
    'Templecombe', 'Wincanton'],
  Dorset: ['Sherborne', 'Milborne Port', 'Bradford Abbas', 'Yetminster', 'Beaminster'],
};
const ALL_TOWNS = [...TOWNS.Somerset, ...TOWNS.Dorset];
const MAIN_TOWNS = ['Yeovil', 'Sherborne', 'Martock', 'Ilchester', 'Stoke-sub-Hamdon', 'Crewkerne', 'South Petherton', 'Somerton', 'Castle Cary', 'Wincanton'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- Drawings (line art, no photos) ----------
const D = '#29323c', R = '#dc143c';
const g = (inner, stroke = D) =>
  `<g fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
const art = (inner, label) =>
  `<svg viewBox="0 0 160 110" role="img" aria-label="${esc(label)}">${inner}</svg>`;

const ART = {
  door: art(g('<path d="M8 104h144"/><rect x="52" y="10" width="56" height="94"/><rect x="58" y="16" width="44" height="88"/><rect x="64" y="24" width="32" height="30" rx="2"/><rect x="64" y="62" width="32" height="34" rx="2"/>') +
    `<circle cx="95" cy="60" r="3.5" fill="${R}"/>` + g('<rect x="116" y="90" width="34" height="9" rx="2"/><path d="M130 94.5h6"/>', R), 'Drawing of a panelled door being fitted'),
  shelves: art(g('<path d="M8 104h144"/><rect x="34" y="8" width="92" height="96"/><path d="M34 38h92M34 70h92"/><path d="M44 38V20M51 38V22M58 38V18M65 38V24"/><path d="M90 70V52M97 70V55M104 70V50"/><rect x="48" y="84" width="34" height="20"/>') +
    g('<path d="M100 38c0-8 4-14 10-14s10 6 10 14z"/>', R), 'Drawing of fitted alcove shelving'),
  kitchen: art(g('<path d="M8 104h144"/><rect x="18" y="10" width="124" height="32"/><path d="M59 10v32M100 10v32"/><rect x="18" y="64" width="124" height="40"/><path d="M59 64v40M100 64v40"/><path d="M52 30v6M93 30v6M134 30v6M52 74v8M93 74v8M134 74v8"/>') +
    g('<path d="M12 60h136"/>', R), 'Drawing of kitchen cupboards and a new worktop'),
  shed: art(g('<path d="M6 104h148"/><path d="M28 46h104v58H28z"/><rect x="44" y="60" width="28" height="44"/><rect x="90" y="60" width="28" height="20"/><path d="M104 60v20M90 70h28"/>') +
    g('<path d="M20 50L80 14l60 36"/>', R) + `<circle cx="67" cy="84" r="2.5" fill="${D}"/>`, 'Drawing of a garden shed'),
  fence: art(g('<path d="M4 104h152"/><path d="M10 34v70M52 34v70M108 34v70M150 34v70"/><path d="M10 50h42M10 86h42M108 50h42M108 86h42"/><path d="M20 40v64M30 40v64M41 40v64M118 40v64M129 40v64M140 40v64"/><rect x="56" y="40" width="48" height="64"/>') +
    g('<path d="M58 100l44-56"/>', R), 'Drawing of a fence and garden gate'),
  bricks: art(g('<path d="M4 104h152"/><path d="M14 38h132v66H14z"/><path d="M14 60h132M14 82h132"/><path d="M47 38v22M80 38v22M113 38v22M30 60v22M63 60v22M96 60v22M129 60v22M47 82v22M80 82v22M113 82v22"/>') +
    g('<path d="M112 26l30-16M142 10l8 10-24 12z"/>', R), 'Drawing of a brick wall and trowel'),
  flatpack: art(g('<path d="M6 104h148"/><path d="M20 56l44-18 44 18v48H20z"/><path d="M20 56l44 18 44-18M64 74v30"/><path d="M42 47l44 18"/>') +
    g('<path d="M124 60v38h22"/><path d="M128 40l14 14"/>', R), 'Drawing of a flat-pack box and Allen key'),
  studwall: art(g('<path d="M6 104h148"/><path d="M14 14h132M14 100h132"/><path d="M18 14v86M50 14v86M82 14v86M114 14v86M142 14v86"/><path d="M18 56h32M50 50h32M82 56h32"/>') +
    `<rect x="114" y="14" width="32" height="86" fill="${R}" fill-opacity="0.12" stroke="${R}" stroke-width="3"/>`, 'Drawing of a timber stud wall with plasterboard'),
  repairs: art(g('<path d="M6 104h148"/><rect x="20" y="26" width="64" height="64" rx="4"/><path d="M28 34h48v48H28z"/><path d="M52 34v48M28 58h48"/>') +
    g('<path d="M104 92l34-34M132 52l14 14-8 8-14-14z"/><path d="M98 32h44"/><path d="M106 32v-8h28v8"/>', R), 'Drawing of a window being repaired with tools'),
  hero: `<svg viewBox="0 0 320 260" role="img" aria-label="Drawing of a timber house frame with a ladder and hammer">` +
    g('<path d="M20 240h280"/><path d="M50 120l110-80 110 80"/><path d="M70 106v134M250 106v134"/><path d="M70 160h180M70 200h180"/><path d="M115 120v120M160 74v166M205 120v120"/><path d="M70 106l45 54M250 106l-45 54"/>', '#ffffff') +
    g('<path d="M262 240l-30-160M292 240l-30-160M236 100h30M241 130h30M246 160h30M251 190h30M256 220h30"/>', '#ff4d6a') +
    g('<path d="M36 214l40-40M66 164l20 20-10 10-20-20z"/>', '#ff4d6a') + '</svg>',
  toolbox: `<svg viewBox="0 0 200 160" role="img" aria-label="Drawing of a toolbox">` +
    g('<path d="M10 150h180"/><rect x="24" y="62" width="152" height="84" rx="6"/><path d="M24 92h152"/><path d="M74 62V42h52v20"/><rect x="88" y="84" width="24" height="16" rx="3"/>') +
    g('<path d="M44 52l24-30M60 20l14 8-6 10-14-8z"/><path d="M140 52V18M134 18h12"/>', R) + '</svg>',
};

const ICON = {
  carpentry: `<svg class="icon" viewBox="0 0 48 48" aria-hidden="true">` + g('<path d="M6 34l22-22 8 8-22 22H6z"/><path d="M28 12l5-5 8 8-5 5"/><path d="M12 34l2 2M16 30l2 2M20 26l2 2"/>', R) + '</svg>',
  building: `<svg class="icon" viewBox="0 0 48 48" aria-hidden="true">` + g('<path d="M4 44h40"/><path d="M6 22h28v22H6zM6 33h28M20 22v11M13 33v11M27 33v11"/><path d="M30 14l12-8 3 4-12 8z"/>', R) + '</svg>',
  oddjobs: `<svg class="icon" viewBox="0 0 48 48" aria-hidden="true">` + g('<rect x="4" y="18" width="40" height="24" rx="3"/><path d="M4 28h40M17 18v-6h14v6"/><rect x="20" y="25" width="8" height="6" rx="1"/>', R) + '</svg>',
};

// ---------- Shared pieces ----------
const NAV = [
  ['/', 'Home'],
  ['/carpentry/', 'Carpentry'],
  ['/building-work/', 'Building work'],
  ['/odd-jobs/', 'Odd jobs'],
  ['/areas/', 'Areas we cover'],
];

function header(current) {
  const items = NAV.map(([href, label]) =>
    `<li><a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a></li>`).join('\n            ');
  return `  <a class="skip-link" href="#main">Skip to content</a>
  <header id="header">
    <div class="header">
      <div class="nav-bar">
        <div class="brand"><a href="/"><span>Y</span>eovil <span>H</span>andyman</a></div>
        <nav class="nav-list" aria-label="Main">
          <button type="button" class="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-menu"><span class="bar"></span></button>
          <ul id="nav-menu">
            ${items}
            <li class="nav-cta"><a href="#contact">Get a free quote</a></li>
          </ul>
        </nav>
      </div>
    </div>
  </header>`;
}

function footer() {
  return `  <footer class="site-footer">
    <div class="wrap">
      <div class="cols">
        <div>
          <h2>Yeovil Handyman</h2>
          <p>Carpentry, building work and odd jobs for homes within about 30 minutes of Yeovil. ${SITE.hourly} an hour or ${SITE.daily} a day.</p>
          <p>Email: <a href="mailto:${SITE.email}">${SITE.email}</a></p>
        </div>
        <div>
          <h2>What we do</h2>
          <ul>
            <li><a href="/carpentry/">Carpentry</a></li>
            <li><a href="/building-work/">Building work</a></li>
            <li><a href="/odd-jobs/">Odd jobs</a></li>
          </ul>
        </div>
        <div>
          <h2>More</h2>
          <ul>
            <li><a href="/areas/">Areas we cover</a></li>
            <li><a href="/#contact">Get a free quote</a></li>
            <li><a href="/privacy/">Privacy notice</a></li>
          </ul>
        </div>
      </div>
      <p class="legal">© Yeovil Handyman. Website by RT Web Design.</p>
    </div>
  </footer>
  <script src="/app.js" defer></script>`;
}

function contactSection(heading = 'Get a free quote') {
  return `  <section class="section section-alt" id="contact">
    <div class="wrap contact-wrap">
      <div>
        <h2>${heading}</h2>
        <p>Tell us what you need doing and where you are. Gary will get back to you by email.</p>
        <p><strong>${SITE.hourly} an hour or ${SITE.daily} a day.</strong> Quotes are free.</p>
        <p>Prefer email? Write to <a href="mailto:${SITE.email}">${SITE.email}</a></p>
      </div>
      <form class="contact-form" action="https://api.web3forms.com/submit" method="post">
        <input type="hidden" name="access_key" value="${SITE.web3formsKey}">
        <input type="hidden" name="subject" value="New enquiry from yeovilhandyman.com">
        <input type="hidden" name="from_name" value="Yeovil Handyman website">
        <input type="hidden" name="redirect" value="${SITE.url}/thank-you/">
        <input type="checkbox" name="botcheck" class="hidden-field" tabindex="-1" autocomplete="off">
        <div class="form-row">
          <label for="f-name">Your name</label>
          <input id="f-name" type="text" name="name" required autocomplete="name">
        </div>
        <div class="form-row">
          <label for="f-email">Email address</label>
          <input id="f-email" type="email" name="email" required autocomplete="email">
        </div>
        <div class="form-row form-row-wide">
          <label for="f-area">Town or postcode <span class="optional">(optional)</span></label>
          <input id="f-area" type="text" name="area" autocomplete="postal-code">
        </div>
        <div class="form-row form-row-wide">
          <label for="f-message">What do you need doing?</label>
          <textarea id="f-message" name="message" rows="6" required></textarea>
        </div>
        <p class="form-note form-row-wide">We only use your details to reply to your enquiry. See our <a href="/privacy/">privacy notice</a>.</p>
        <button type="submit" class="btn form-row-wide">Send enquiry</button>
      </form>
    </div>
  </section>`;
}

// Head: title, description, canonical, icons, link-preview tags, optional schema.
// Keeps the <!-- search-appearance --> markers so search_tags.py can still be rerun safely.
function head({ title, description, urlPath, noindex = false, schema = [] }) {
  const url = SITE.url + urlPath;
  const preview = noindex ? '' : `
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE.url}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${SITE.name}">
  <meta property="og:locale" content="en_GB">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE.url}/og-image.png">`;
  const ld = schema.map((o) => `\n  <script type="application/ld+json">${JSON.stringify(o)}</script>`).join('');
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">${noindex ? '\n  <meta name="robots" content="noindex">' : ''}
  <link rel="canonical" href="${url}">
  <link rel="preload" href="/fonts/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/style.css">
  <!-- search-appearance -->
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#29323c">${preview}${ld}
  <!-- /search-appearance -->
</head>`;
}

const ORG_ID = SITE.url + '/#org';
const areaServed = ALL_TOWNS.map((t) => ({ '@type': 'City', name: t }));
const breadcrumb = (urlPath, name) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url + '/' },
    { '@type': 'ListItem', position: 2, name, item: SITE.url + urlPath },
  ],
});

function page({ urlPath, title, description, body, noindex, schema }) {
  return `${head({ title, description, urlPath, noindex, schema })}
<body>
${header(urlPath)}
  <main id="main">
${body}
  </main>
${footer()}
</body>
</html>
`;
}

const ticks = (items, cols = true) => `<ul class="ticks${cols ? ' cols' : ''}">\n${items.map((i) => `          <li>${i}</li>`).join('\n')}\n        </ul>`;
const towns = (list) => `<ul class="towns">${list.map((t) => `<li>${t}</li>`).join('')}</ul>`;
const priceBoxes = () => `<div class="prices">
          <div class="price"><div class="amount">${SITE.hourly}</div><div class="per">per hour</div></div>
          <div class="price"><div class="amount">${SITE.daily}</div><div class="per">per day</div></div>
        </div>
        <p class="price-note">Smaller jobs are charged by the hour. Bigger jobs by the day. Quotes are free.</p>`;
const steps = () => `<ol class="steps">
          <li><h3>Tell us about the job</h3><p>Use the form below. A few lines on what needs doing and where you are is plenty.</p></li>
          <li><h3>Get a free quote</h3><p>Gary gets back to you by email to talk it through and give you a price.</p></li>
          <li><h3>Job done</h3><p>Gary does the work at ${SITE.hourly} an hour or ${SITE.daily} a day, whichever suits the job.</p></li>
        </ol>`;
const jobCard = (key, h, p) => `<div class="job"><div class="art">${ART[key]}</div><div class="txt"><h3>${h}</h3><p>${p}</p></div></div>`;

// ---------- Service pages ----------
// "Rich to check": the job lists below are typical jobs for a builder of 25 years. Remove any Gary doesn't do.
const SERVICES = [
  {
    slug: 'carpentry', nav: 'Carpentry', icon: 'carpentry',
    title: 'Carpenter in Yeovil: Doors, Shelving, Sheds and More | Yeovil Handyman',
    description: `Carpentry in Yeovil by Gary, a builder for 25 years. Doors, skirting, shelving, cupboards, sheds, gates and fence repairs. ${SITE.hourly} an hour or ${SITE.daily} a day.`,
    h1: 'Carpentry in Yeovil',
    lead: 'Doors, shelves, cupboards, sheds and gates, done properly by a builder with 25 years of experience.',
    card: 'Doors, skirting, shelving, cupboards, sheds, gates and fence repairs.',
    jobs: ['Hanging new internal doors and fixing doors that stick', 'Fitting skirting boards, architrave and door frames',
      'Alcove shelves, cupboards and built-in storage', 'Boxing in pipes', 'Replacing kitchen cupboard doors and worktops',
      'Stud walls and loft hatches', 'Garden sheds, gates and fence repairs', 'Repairs to decking, steps and handrails'],
    art: [['door', 'Doors and frames', 'New doors hung, old ones eased and re-hung.'],
      ['shelves', 'Shelves and storage', 'Alcove shelves and cupboards made to fit.'],
      ['kitchen', 'Kitchen woodwork', 'Cupboard doors and worktops replaced.'],
      ['shed', 'Sheds and garden', 'Sheds, gates and fence repairs.']],
    faq: [['Can you match old skirting or architrave?', 'Tell us what you have in the form. Gary will let you know what he can do when he gets back to you.'],
      ['Do you supply the materials?', 'Tell us in the form if you have materials already. Gary will talk you through it when he gives you your quote.']],
  },
  {
    slug: 'building-work', nav: 'Building work', icon: 'building',
    title: 'Builder in Yeovil for Small Building Jobs and Repairs | Yeovil Handyman',
    description: `Small building jobs and repairs in Yeovil by Gary, a builder for 25 years. Brickwork, walls, paths, plaster patching and home improvements. ${SITE.hourly} an hour or ${SITE.daily} a day.`,
    h1: 'Building work in Yeovil',
    lead: 'Small building jobs, repairs and home improvements, from a builder with 25 years of experience.',
    card: 'Brickwork repairs, garden walls, paths, plaster patching and small alterations.',
    jobs: ['Brickwork repairs and repointing', 'Small garden walls', 'Patio and path repairs', 'Concrete bases for sheds',
      'Patching and repairing plaster', 'Stud walls and small alterations', 'Making good after other trades', 'General home improvements'],
    art: [['bricks', 'Brickwork', 'Repairs, repointing and small walls.'],
      ['studwall', 'Walls and alterations', 'Stud walls, patching and making good.'],
      ['fence', 'Outside jobs', 'Paths, bases and garden walls.'],
      ['repairs', 'Repairs', 'The jobs that have been waiting too long.']],
    faq: [['How big a job will you take on?', 'Our focus is smaller building jobs and repairs. Describe the job in the form and Gary will tell you if it is right for us.'],
      ['Do you charge by the day for building work?', `Usually, yes. A full day is ${SITE.daily}. Shorter jobs are ${SITE.hourly} an hour.`]],
  },
  {
    slug: 'odd-jobs', nav: 'Odd jobs', icon: 'oddjobs',
    title: 'Odd Job Man in Yeovil: Small Repairs Around the Home | Yeovil Handyman',
    description: `Odd jobs and small repairs in Yeovil. Flat-pack, shelves, curtain poles, sticking doors, fence panels and more. ${SITE.hourly} an hour. Free quotes.`,
    h1: 'Odd jobs and small repairs in Yeovil',
    lead: 'The list of little jobs around the house you never get round to. We will work through it for you.',
    card: 'Flat-pack, shelves, curtain poles, sticking doors and all the small jobs on your list.',
    jobs: ['Flat-pack furniture assembly', 'Putting up shelves, mirrors and pictures', 'Curtain poles and blinds', 'TV wall brackets',
      'Fixing sticking doors and drawers', 'Replacing door handles and hinges', 'Fence panels and gate repairs', 'Small repairs all round the house'],
    art: [['flatpack', 'Flat-pack', 'Built, fixed to the wall if needed, and the boxes cleared.'],
      ['shelves', 'Putting things up', 'Shelves, mirrors, poles and blinds.'],
      ['door', 'Sticking doors', 'Doors and drawers that catch or won\'t shut.'],
      ['fence', 'Outside', 'Fence panels and gates.']],
    faq: [['Is my job too small?', 'Small jobs are welcome. You pay by the hour, so it is often worth saving up a list of jobs for one visit.'],
      ['Can I send a list of jobs?', 'Yes. Put the whole list in the form and Gary will give you an idea of how long it will take.']],
  },
];

function servicePage(s) {
  const others = SERVICES.filter((o) => o !== s);
  const body = `    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="/">Home</a> › ${s.nav}</p>
        <h1>${s.h1}</h1>
        <p class="lead">${s.lead}</p>
        <div class="btn-row"><a class="btn" href="#contact">Get a free quote</a></div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <h2>Typical jobs</h2>
        <p class="section-intro">Gary has been a builder for 25 years, so if your job isn't listed, just ask.</p>
        ${ticks(s.jobs)}
      </div>
    </section>

    <section class="section section-alt">
      <div class="wrap">
        <div class="grid grid-4">
          ${s.art.map(([k, h, p]) => jobCard(k, h, p)).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <h2>Prices</h2>
        ${priceBoxes()}
      </div>
    </section>

    <section class="section section-alt">
      <div class="wrap">
        <h2>How it works</h2>
        ${steps()}
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <h2>Questions</h2>
        <div class="faq">
          ${s.faq.map(([q, a]) => `<details><summary>${q}</summary><div><p>${a}</p></div></details>`).join('\n          ')}
          <details><summary>Where do you cover?</summary><div><p>Homes within about 30 minutes of Yeovil, including Sherborne, Martock, Crewkerne, Somerton and Castle Cary. <a href="/areas/">See all the areas we cover</a>.</p></div></details>
        </div>
        <p style="margin-top:24px">Also see: ${others.map((o) => `<a href="/${o.slug}/">${o.nav}</a>`).join(' · ')}</p>
      </div>
    </section>

${contactSection()}`;
  return page({
    urlPath: `/${s.slug}/`, title: s.title, description: s.description, body,
    schema: [{
      '@context': 'https://schema.org', '@type': 'Service', name: s.h1, serviceType: s.nav,
      description: s.description, url: `${SITE.url}/${s.slug}/`,
      provider: { '@id': ORG_ID }, areaServed,
    }, breadcrumb(`/${s.slug}/`, s.nav)],
  });
}

// ---------- Home ----------
function homePage() {
  const title = 'Carpentry, Building Work and Odd Jobs in Yeovil | Yeovil Handyman';
  const description = `Gary has been a builder for 25 years. Carpentry, small building jobs and odd jobs for homes within 30 minutes of Yeovil. ${SITE.hourly} an hour or ${SITE.daily} a day. Free quotes.`;
  const body = `    <section class="hero">
      <div class="wrap">
        <div>
          <h1>Carpentry, building work and odd jobs in <span class="accent">Yeovil</span></h1>
          <p class="lead">Gary has been a builder for 25 years. From hanging a door to a small building job, he can turn his hand to most things around the home.</p>
          <ul class="facts">
            <li>${SITE.hourly} an hour</li>
            <li>${SITE.daily} a day</li>
            <li>Free quotes</li>
            <li>Within 30 minutes of Yeovil</li>
          </ul>
          <div class="btn-row">
            <a class="btn" href="#contact">Get a free quote</a>
            <a class="btn btn-ghost" href="#services">What we do</a>
          </div>
        </div>
        <div class="hero-art">${ART.hero}</div>
      </div>
    </section>

    <section class="section" id="services">
      <div class="wrap">
        <h2>What we do</h2>
        <p class="section-intro">Three kinds of job, all done by an experienced builder.</p>
        <div class="grid grid-3">
${SERVICES.map((s) => `          <div class="card">${ICON[s.icon]}<h3>${s.nav}</h3><p>${s.card}</p><a class="more" href="/${s.slug}/">More about ${s.nav.toLowerCase()} →</a></div>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="wrap">
        <h2>The kind of jobs we take on</h2>
        <div class="grid grid-4">
          ${jobCard('door', 'Doors and woodwork', 'New doors, skirting, frames and sticking doors.')}
          ${jobCard('shelves', 'Shelves and storage', 'Alcove shelves, cupboards and boxing in.')}
          ${jobCard('bricks', 'Brickwork and repairs', 'Repointing, small walls and patching up.')}
          ${jobCard('shed', 'Sheds, fences and gates', 'Garden woodwork, built or repaired.')}
          ${jobCard('kitchen', 'Kitchen woodwork', 'Cupboard doors and worktops replaced.')}
          ${jobCard('studwall', 'Small alterations', 'Stud walls and making good.')}
          ${jobCard('flatpack', 'Flat-pack', 'Furniture built and fixed in place.')}
          ${jobCard('repairs', 'Odd jobs', 'The list of jobs you never get round to.')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <h2>Simple prices</h2>
        ${priceBoxes()}
      </div>
    </section>

    <section class="section section-alt">
      <div class="wrap about">
        <div>
          <h2>About Gary</h2>
          <p>Gary is our main contractor. He has been a builder for 25 years, so he knows how a house goes together and can turn his hand to most jobs.</p>
          <p>He does the carpentry, building and repair jobs that are too small for a building firm but need someone who knows what they are doing.</p>
          ${ticks(['25 years as a builder', `Clear prices: ${SITE.hourly} an hour or ${SITE.daily} a day`, 'Free quotes', 'Local to Yeovil'], false)}
        </div>
        <div class="about-art">${ART.toolbox}</div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <h2>Areas we cover</h2>
        <p class="section-intro">Homes within about 30 minutes of Yeovil, in Somerset and Dorset.</p>
        ${towns(MAIN_TOWNS)}
        <p style="margin-top:18px">And the villages in between. <a href="/areas/">See all the areas we cover</a>.</p>
      </div>
    </section>

    <section class="section section-alt">
      <div class="wrap">
        <h2>How it works</h2>
        ${steps()}
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <h2>Questions</h2>
        <div class="faq">
          <details><summary>How much do you charge?</summary><div><p>${SITE.hourly} an hour or ${SITE.daily} for a full day. Quotes are free.</p></div></details>
          <details><summary>Do you take on small jobs?</summary><div><p>Yes. Odd jobs and small repairs are a big part of what we do. It is often worth saving up a few jobs for one visit.</p></div></details>
          <details><summary>Who does the work?</summary><div><p>Gary, our main contractor. He has been a builder for 25 years.</p></div></details>
          <details><summary>Where do you cover?</summary><div><p>Homes within about 30 minutes of Yeovil. <a href="/areas/">See the areas we cover</a>.</p></div></details>
          <details><summary>Do you do other jobs too?</summary><div><p>Our focus is carpentry, building work and odd jobs. If you need something else doing, ask. Gary can turn his hand to most things.</p></div></details>
          <details><summary>How do I get in touch?</summary><div><p>Use the form below or email <a href="mailto:${SITE.email}">${SITE.email}</a>. Gary will get back to you by email.</p></div></details>
        </div>
      </div>
    </section>

${contactSection()}`;
  return page({
    urlPath: '/', title, description, body,
    schema: [
      { '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE.url + '/#website', name: SITE.name,
        alternateName: 'yeovilhandyman.com', url: SITE.url + '/', publisher: { '@id': ORG_ID } },
      { '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness', '@id': ORG_ID, name: SITE.name,
        url: SITE.url + '/', description,
        logo: { '@type': 'ImageObject', url: SITE.url + '/logo-512.png', width: 512, height: 512 },
        image: SITE.url + '/og-image.png', email: SITE.email,
        priceRange: `${SITE.hourly} per hour, ${SITE.daily} per day`,
        address: { '@type': 'PostalAddress', addressLocality: 'Yeovil', addressRegion: 'Somerset', addressCountry: 'GB' },
        areaServed,
        makesOffer: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.nav, url: `${SITE.url}/${s.slug}/` } })) },
    ],
  });
}

// ---------- Areas ----------
function areasPage() {
  const body = `    <section class="banner">
      <div class="wrap">
        <p class="crumbs"><a href="/">Home</a> › Areas we cover</p>
        <h1>Areas we cover</h1>
        <p class="lead">We work in homes within about 30 minutes' drive of Yeovil, across south Somerset and north Dorset.</p>
        <div class="btn-row"><a class="btn" href="#contact">Get a free quote</a></div>
      </div>
    </section>

    <section class="section">
      <div class="wrap grid grid-2">
        <div>
          <h2>Somerset</h2>
          ${towns(TOWNS.Somerset)}
        </div>
        <div>
          <h2>Dorset</h2>
          ${towns(TOWNS.Dorset)}
        </div>
      </div>
      <div class="wrap">
        <p style="margin-top:30px">These are the main towns and villages. We also cover the villages in between. If you are not sure whether you are in our area, ask in the form below.</p>
      </div>
    </section>

    <section class="section section-alt">
      <div class="wrap">
        <h2>What we do</h2>
        <div class="grid grid-3">
${SERVICES.map((s) => `          <div class="card">${ICON[s.icon]}<h3>${s.nav}</h3><p>${s.card}</p><a class="more" href="/${s.slug}/">More about ${s.nav.toLowerCase()} →</a></div>`).join('\n')}
        </div>
      </div>
    </section>

${contactSection()}`;
  return page({
    urlPath: '/areas/', title: 'Areas We Cover: Within 30 Minutes of Yeovil | Yeovil Handyman',
    description: 'Carpentry, building work and odd jobs within about 30 minutes of Yeovil, including Sherborne, Martock, Crewkerne, Somerton, Castle Cary and Wincanton.',
    body, schema: [breadcrumb('/areas/', 'Areas we cover')],
  });
}

// ---------- Privacy, thank-you, 404 ----------
function textPage({ urlPath, title, description, inner, noindex }) {
  return page({ urlPath, title, description, noindex, body: `    <div class="text-page">\n${inner}\n    </div>` });
}

const privacy = textPage({
  urlPath: '/privacy/', title: 'Privacy notice | Yeovil Handyman',
  description: 'How Yeovil Handyman uses the details you send through this website.',
  inner: `      <h1>Privacy notice</h1>
      <p>This notice explains what Yeovil Handyman does with the details you give us through this website.</p>
      <h2>Who we are</h2>
      <p>Yeovil Handyman, Yeovil, Somerset. You can contact us about your data at <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
      <h2>What we collect and why</h2>
      <p>When you send an enquiry we receive your name, email address, and anything else you choose to add (your town or postcode, and details of the job). We use this only to reply to you, give you a quote and arrange any work you ask for. We don't sell it or pass it to anyone else for marketing.</p>
      <h2>How the contact form works</h2>
      <p>The form is run by <a href="https://web3forms.com/privacy" rel="noopener">Web3Forms</a>, which passes your message to us by email. Your message is then kept in our email account.</p>
      <h2>How long we keep it</h2>
      <p>We keep enquiries only for as long as we need them to deal with your enquiry and any work that follows, and for any records we must keep by law.</p>
      <h2>Website analytics and cookies</h2>
      <p>This site uses Cloudflare Web Analytics to count visits. It doesn't use cookies and doesn't identify you. The site is hosted by Cloudflare. We don't use advertising or tracking cookies.</p>
      <h2>Your rights</h2>
      <p>You can ask to see the details we hold about you, ask us to correct them, or ask us to delete them, by emailing <a href="mailto:${SITE.email}">${SITE.email}</a>. If you're unhappy with how we've handled your data, you can complain to the Information Commissioner's Office at <a href="https://ico.org.uk/make-a-complaint/" rel="noopener">ico.org.uk</a>.</p>`,
});

const thankYou = textPage({
  urlPath: '/thank-you/', title: 'Thank you | Yeovil Handyman', noindex: true,
  description: 'Thank you for your enquiry to Yeovil Handyman.',
  inner: `      <h1>Thank you</h1>
      <p>We've received your enquiry. Gary will get back to you by email.</p>
      <p><a href="/">Back to the home page</a></p>`,
});

const notFound = textPage({
  urlPath: '/404.html', title: 'Page not found | Yeovil Handyman', noindex: true,
  description: 'Page not found.',
  inner: `      <h1>Page not found</h1>
      <p>Sorry, that page doesn't exist.</p>
      <ul class="ticks" style="margin-top:18px">
        <li><a href="/">Home page</a></li>
        <li><a href="/carpentry/">Carpentry</a></li>
        <li><a href="/building-work/">Building work</a></li>
        <li><a href="/odd-jobs/">Odd jobs</a></li>
        <li><a href="/areas/">Areas we cover</a></li>
      </ul>`,
});

// ---------- Write ----------
const files = {
  'index.html': homePage(),
  'areas/index.html': areasPage(),
  'privacy/index.html': privacy,
  'thank-you/index.html': thankYou,
  // The 404 page has no contact section, so its "Get a free quote" menu link goes to the home page form.
  '404.html': notFound.replace('href="#contact">Get a free quote', 'href="/#contact">Get a free quote'),
};
for (const s of SERVICES) files[`${s.slug}/index.html`] = servicePage(s);
// Text pages have no form either.
for (const k of ['privacy/index.html', 'thank-you/index.html']) {
  files[k] = files[k].replace('href="#contact">Get a free quote', 'href="/#contact">Get a free quote');
}

for (const [rel, html] of Object.entries(files)) {
  const out = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

// Sitemap: every indexable page.
const today = new Date().toISOString().slice(0, 10);
const urls = ['/', ...SERVICES.map((s) => `/${s.slug}/`), '/areas/', '/privacy/'];
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${SITE.url}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n</urlset>\n');

console.log(`Built ${Object.keys(files).length} pages and sitemap.xml (${urls.length} URLs) into site/`);
