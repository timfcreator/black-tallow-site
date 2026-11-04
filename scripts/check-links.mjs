// npm run check-links   (after npm run build)
//
// Checks every internal link in the built site: each href, src, srcset and poster in every page, the links in
// the feed and the icons in the web manifest must point at a file that exists, and a #fragment must name an id
// on its page. Links to other sites are not fetched. The site's own full addresses count as internal: the
// domain in site.json and SITE_URL (set by the GitHub workflow to where Pages serves the site). PATH_PREFIX
// (also set by the workflow) is the subfolder the build was made for, before a custom domain is connected.
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
const domain = (site.domain || "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
// The subfolder the site is built for (GitHub Actions sets PATH_PREFIX, e.g. "/repo/", before a custom domain
// is connected): every root-relative link must start with it, and it is removed before looking up the file.
const prefix = ("/" + (process.env.PATH_PREFIX || "/").replace(/^\/+|\/+$/g, "") + "/").replace(/^\/\/$/, "/");
// The site's own addresses count as internal: SITE_URL (set by the workflow, as in src/_data/siteUrl.js) and
// the domain. Once there is a real address, any localhost address is a leftover from a preview.
const siteUrl = (process.env.SITE_URL || "").trim().replace(/\/+$/, "");
const domainUrls = domain ? [`https://${domain}`, `http://${domain}`, `https://www.${domain}`, `http://www.${domain}`] : [];
const published = siteUrl || domainUrls[0] || "";
const ownOrigins = published ? [...(siteUrl ? [siteUrl] : []), ...domainUrls] : [LOCAL];

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

// The URL a built file is served at: devlog/x/index.html -> /devlog/x/ (plus the prefix, if any)
const urlOf = (path) => prefix + path.replace(/(^|\/)index\.html$/, "$1");

// The built file a path resolves to (exact case), or null. `sitePath` is the path inside the site, without any
// prefix: "/devlog/" or "/assets/css/site.css".
function fileFor(sitePath) {
  let p = decodeURIComponent(sitePath).replace(/^\/+/, "");
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
    let url, sitePath;
    if (/^https?:\/\//i.test(raw)) {
      const lower = raw.toLowerCase();
      if (published && lower.startsWith("http://localhost")) { report(raw, "a localhost address in a build for a published address"); continue; }
      const own = ownOrigins.find((o) => lower === o.toLowerCase() || lower.startsWith(o.toLowerCase() + "/") || lower.startsWith(o.toLowerCase() + "#"));
      if (!own) continue;              // another site: not checked
      // A full address names the final page directly (https://domain/devlog/ is the built devlog/index.html),
      // whatever subfolder this particular build was made for.
      url = new URL(raw.slice(own.length) || "/", "http://site.invalid");
      sitePath = url.pathname;
    } else {
      // GitHub Pages serves 404.html at whatever address was asked for, so a relative link there breaks.
      if (is404 && !raw.startsWith("/") && !raw.startsWith("#")) { report(raw, "relative link on the 404 page"); continue; }
      url = new URL(raw, "http://site.invalid" + here);
      if (!url.pathname.startsWith(prefix)) { report(raw, `outside the site's folder ${prefix}`); continue; }
      sitePath = "/" + url.pathname.slice(prefix.length);
    }
    checked++;
    const target = raw.startsWith("#") ? path : fileFor(sitePath);
    if (!target) { report(raw, "no such file"); continue; }
    const frag = decodeURIComponent(url.hash.slice(1));
    if (frag && target.endsWith(".html") && !idsOf(target).has(frag)) report(raw, `no id "${frag}" on that page`);
  }
}

// The web manifest's icons resolve relative to the manifest itself, which sits at the site root.
if (all.has("site.webmanifest")) {
  const manifest = JSON.parse(readFileSync(join(dir, "site.webmanifest"), "utf8"));
  for (const icon of manifest.icons || []) {
    checked++;
    const url = new URL(icon.src, "http://site.invalid" + prefix + "site.webmanifest");
    const ok = url.pathname.startsWith(prefix) && fileFor("/" + url.pathname.slice(prefix.length));
    if (!ok) broken.push(`${prefix}site.webmanifest  ->  ${icon.src}  (no such file)`);
  }
}

if (broken.length) {
  console.error(`Broken internal links: ${broken.length} (of ${checked} checked in ${pages.length} files)\n  ` + broken.join("\n  "));
  process.exit(1);
}
console.log(`Internal links OK: ${checked} checked in ${pages.length} files.`);
