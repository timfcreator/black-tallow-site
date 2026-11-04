// The site's full address, without a trailing slash, for everything that must be absolute: the canonical link,
// link previews (Open Graph, Twitter) and the feed.
//   1. SITE_URL, which the GitHub Actions workflow sets to the address Pages actually serves: your domain once it
//      is connected in Settings > Pages, https://<user>.github.io/<repo> before that. Using what Pages reports
//      keeps every address true during the switch-over;
//   2. otherwise https://<domain> from site.json (a local `npm run build`);
//   3. otherwise, under `npm start`, the local preview; a local build with no domain gets "" and leaves those
//      tags out.
import { readFileSync } from "node:fs";

const site = JSON.parse(readFileSync(new URL("./site.json", import.meta.url), "utf8"));
const domain = (site.domain || "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");

let url = "";
if (process.env.SITE_URL) url = process.env.SITE_URL.trim();
else if (domain) url = `https://${domain}`;
else if (process.env.ELEVENTY_RUN_MODE === "serve") url = "http://localhost:8090";

export default url.replace(/\/+$/, "");
