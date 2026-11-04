// npm run check-links   (after npm run build)
//
// Checks every internal link in the built site: each href, src, srcset and poster in every page, and the
// links in the feed, must point at a file that exists, and a #fragment must name an id on its page.
// Links to other sites are not fetched; links to this site's own domain (from site.json) count as internal.
// Paths are compared with their exact letter case, because GitHub Pages is case-sensitive even though
// Windows is not. Exits with an error, listing each broken link and the page it is on.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const dir = resolve(root, process.argv[2] || "_site");
if (!existsSync(dir)) {
  console.error(`No built site at ${dir}. Run npm run build first.`);
  process.exit(1);
}
const site = JSON.parse(readFileSync(join(root, "src/_data/site.json"), "utf8"));
const LOCAL = "http://localhost:8090";
// With a domain set, the site's own addresses are internal and any localhost address is a leftover from a
// preview (broken once live). Without one, the feed's localhost addresses stand in for the domain.
const ownOrigins = site.domain
  ? [`https://${site.domain}`, `http://${site.domain}`, `https://www.${site.domain}`, `http://www.${site.domain}`]
  : [LOCAL];

// Every built file, as a site path with its exact case: "devlog/index.html".
const all = new Set();
(function walk(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) walk(p);
    else all.add(relative(dir, p).split(sep).join("/"));
  }
})(dir);
const pages = [...all].filter((p) => /\.(html|xml)$/.test(p));

const idCache = new Map();
function idsOf(path) {
  if (!idCache.has(path)) {
    const html = readFileSync(join(dir, path), "utf8");
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const anchors = [...html.matchAll(/<a\s[^>]*\bname="([^"]+)"/g)].map((m) => m[1]);
    idCache.set(path, new Set([...ids, ...anchors]));
  }
  return idCache.get(path);
}

// The URL a built file is served at: devlog/x/index.html -> /devlog/x/
const urlOf = (path) => "/" + path.replace(/(^|\/)index\.html$/, "$1");

// The built file a site path resolves to (exact case), or null.
function fileFor(pathname) {
  let p = decodeURIComponent(pathname).replace(/^\/+/, "");
  if (p === "" || p.endsWith("/")) p += "index.html";
  if (all.has(p)) return p;
  if (all.has(p + "/index.html")) return p + "/index.html";
  return null;
}

const broken = [];
let checked = 0;
for (const path of pages) {
  const text = readFileSync(join(dir, path), "utf8");
  const isXml = path.endsWith(".xml");
  const is404 = path === "404.html";
  // In the feed only real attributes are links; the escaped post HTML inside <content> is skipped.
  const attrRe = isXml ? /\shref="([^"]*)"/g : /\s(?:href|src|poster)="([^"]*)"|\ssrcset="([^"]*)"/g;
  const urls = [];
  for (const m of text.matchAll(attrRe)) {
    if (m[1] !== undefined) urls.push(m[1]);
    else for (const part of m[2].split(",")) { const u = part.trim().split(/\s+/)[0]; if (u) urls.push(u); }
  }
  const here = urlOf(path);
  const report = (raw, why) => broken.push(`${here}  ->  ${raw}  (${why})`);
  for (let raw of urls) {
    raw = raw.replace(/&amp;/g, "&");
    if (/^(mailto|tel|javascript|data):/i.test(raw) || raw.startsWith("//")) continue;
    let url;
    if (/^https?:\/\//i.test(raw)) {
      const lower = raw.toLowerCase();
      if (site.domain && lower.startsWith("http://localhost")) { report(raw, "a localhost address in a build with a domain set"); continue; }
      const own = ownOrigins.find((o) => lower === o || lower.startsWith(o + "/") || lower.startsWith(o + "#"));
      if (!own) continue;              // another site: not checked
      url = new URL(raw);
    } else {
      // GitHub Pages serves 404.html at whatever address was asked for, so a relative link there breaks.
      if (is404 && !raw.startsWith("/") && !raw.startsWith("#")) { report(raw, "relative link on the 404 page"); continue; }
      url = new URL(raw, "http://site.invalid" + here);
    }
    checked++;
    const target = raw.startsWith("#") ? path : fileFor(url.pathname);
    if (!target) { report(raw, "no such file"); continue; }
    const frag = decodeURIComponent(url.hash.slice(1));
    if (frag && target.endsWith(".html") && !idsOf(target).has(frag)) report(raw, `no id "${frag}" on that page`);
  }
}

if (broken.length) {
  console.error(`Broken internal links: ${broken.length} (of ${checked} checked in ${pages.length} files)\n  ` + broken.join("\n  "));
  process.exit(1);
}
console.log(`Internal links OK: ${checked} checked in ${pages.length} files.`);
