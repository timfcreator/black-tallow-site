// Eleventy configuration for the Black Tallow website.
// Source in src/, output in _site/. Templates are Nunjucks (.njk) and Markdown (.md).

import { createHash } from "node:crypto";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginRss from "@11ty/eleventy-plugin-rss";

// "serve" under `npm start`, "build" under `npm run build`. Under serve, drafts and TODO placeholders show;
// a build leaves them out.
const isServe = process.env.ELEVENTY_RUN_MODE === "serve";

const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default function (eleventyConfig) {
  // Port 8080, Eleventy's default, belongs to the Unity MCP bridge on this machine.
  eleventyConfig.setServerOptions({ port: 8090 });

  // Copied to the output as they are.
  eleventyConfig.addPassthroughCopy("src/assets/fonts");
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/img");
  eleventyConfig.addPassthroughCopy("src/assets/video");   // looping clips for the home page's blocks
  // favicon.ico, apple-touch-icon.png and the manifest icons live at the site root.
  eleventyConfig.addPassthroughCopy({ "src/assets/icons/*": "/" });
  // src/assets/art/ holds the PNG exports `npm run images` reads; they are never published.

  // Images in posts: any <img> (from Markdown ![alt](img/x.png) or the figure shortcode) becomes WebP at two
  // widths with width and height filled in. Paths are relative to the post. Images the site makes itself
  // with `npm run images` carry `eleventy:ignore` and are left alone.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp"],
    widths: [760, 1520],
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async",
        sizes: "(min-width: 42rem) 38rem, calc(100vw - 2rem)",
      },
    },
  });

  // Feed helpers: dateToRfc3339, getNewestCollectionItemDate, absoluteUrl, htmlToAbsoluteUrls.
  eleventyConfig.addPlugin(pluginRss);

  // Devlog posts, newest first. A post with `draft: true` is left out of a build. A post missing its title or
  // summary, named without its date, dated differently in its front matter and its file name, or with an
  // image but no imageAlt, stops the build with a message saying which.
  eleventyConfig.addCollection("posts", (api) => {
    const posts = api.getFilteredByGlob("src/devlog/*.md").filter((post) => isServe || !post.data.draft);
    for (const post of posts) {
      const d = post.data, where = post.inputPath;
      if (!d.title) throw new Error(`${where}: the front matter needs a title`);
      if (!d.summary) throw new Error(`${where}: the front matter needs a summary (one line)`);
      const named = where.replace(/\\/g, "/").match(/\/(\d{4}-\d{2}-\d{2})-[^/]+\.md$/);
      if (!named) throw new Error(`${where}: name the file YYYY-MM-DD-slug.md`);
      const dated = post.date.toISOString().slice(0, 10);
      if (dated !== named[1])
        throw new Error(`${where}: the front matter date (${dated}) and the file name's date (${named[1]}) differ; make them the same`);
      if (d.image && !d.imageAlt) throw new Error(`${where}: an image needs imageAlt (what the image shows)`);
    }
    return posts.sort((a, b) => b.date - a.date);
  });

  // {% figure "img/cart.png", "What the image shows", "An optional caption." %}
  eleventyConfig.addShortcode("figure", (src, alt, caption) => {
    if (!alt) throw new Error(`figure "${src}": the second value, the alt text, is required`);
    return `<figure class="figure"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">` +
      (caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "") + `</figure>`;
  });

  // Dates: posts carry a calendar date (YYYY-MM-DD), read as UTC so it never shifts a day.
  const longDate = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  eleventyConfig.addFilter("readableDate", (date) => longDate.format(date));
  eleventyConfig.addFilter("isoDate", (date) => date.toISOString().slice(0, 10));
  eleventyConfig.addFilter("head", (list, n) => (Array.isArray(list) ? list.slice(0, n) : []));

  // A feed entry's id must never change, or feed readers show the post again as new. Built from the name alone
  // (a name-based UUID), it survives the move from the github.io address to the domain.
  eleventyConfig.addFilter("stableId", (name) => {
    const h = createHash("sha1").update(`black-tallow:${name}`).digest("hex");
    const variant = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16);
    return `urn:uuid:${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${variant}${h.slice(17, 20)}-${h.slice(20, 32)}`;
  });
}

export const config = {
  dir: {
    input: "src",
    includes: "_includes",
    data: "_data",
    // `npm start` writes to its own folder, so running `npm run build` alongside it never swaps the
    // preview for the build (or the other way round).
    output: isServe ? ".preview" : "_site",
  },
  templateFormats: ["njk", "md", "11ty.js"],
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};
