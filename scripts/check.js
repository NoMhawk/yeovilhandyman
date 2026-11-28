#!/usr/bin/env node
// Checks the built site in site/. Run after node build.js. Must show 0 errors before a commit.
//   node scripts/check.js
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'site');
const ORIGIN = 'https://yeovilhandyman.com';
let errors = 0, warnings = 0;
const err = (f, m) => { errors++; console.log(`ERROR  ${f}: ${m}`); };
const warn = (f, m) => { warnings++; console.log(`warn   ${f}: ${m}`); };

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(p);
  }
})(ROOT);

const exists = (urlPath) => {
  const clean = decodeURI(urlPath.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return fs.existsSync(path.join(ROOT, 'index.html'));
  const p = path.join(ROOT, clean);
  return clean.endsWith('/') ? fs.existsSync(path.join(p, 'index.html')) : fs.existsSync(p);
};

for (const file of pages) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  const noindex = /<meta name="robots" content="noindex">/.test(html);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (!title) err(rel, 'no <title>');
  else if (!noindex && (title.length < 30 || title.length > 75)) warn(rel, `title is ${title.length} characters`);
  if (!desc) err(rel, 'no meta description');
  else if (!noindex && (desc.length < 70 || desc.length > 170)) warn(rel, `description is ${desc.length} characters`);
  if (h1s.length !== 1) err(rel, `${h1s.length} <h1> headings (should be 1)`);
  if (!/<link rel="canonical" href="https:\/\/yeovilhandyman\.com\//.test(html)) err(rel, 'no canonical link');
  if (/TODO|Rich to update/i.test(html.replace(/<!--[\s\S]*?-->/g, ''))) err(rel, 'visible TODO or "Rich to update"');
  if (/07817|wa\.me|tel:/i.test(html)) err(rel, 'phone number or WhatsApp link on the page');
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { err(rel, 'invalid JSON-LD: ' + e.message); }
  }
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    let u = m[1];
    if (u.startsWith(ORIGIN)) u = u.slice(ORIGIN.length) || '/';
    if (/^(https?:|mailto:|#)/.test(u)) continue;
    if (!u.startsWith('/')) { err(rel, `relative link "${u}" (use a root path)`); continue; }
    if (!exists(u)) err(rel, `broken link ${u}`);
  }
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/\shref="#([^"]+)"/g)) if (!ids.has(m[1])) err(rel, `link to missing #${m[1]}`);
}

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  if (!exists(m[1].slice(ORIGIN.length) || '/')) err('sitemap.xml', `lists missing page ${m[1]}`);
}

console.log(`\n${pages.length} pages checked: ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
