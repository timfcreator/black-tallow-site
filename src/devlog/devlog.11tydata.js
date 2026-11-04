// Settings for every post in src/devlog/. A post lives at /devlog/<slug>/, where the slug is the file name
// without its date: 2026-11-20-first-light.md becomes /devlog/first-light/.
// `draft: true` keeps a post out of a build (it still shows under `npm start`, marked as a draft).
// A post's `image` (relative to the post, like img/cart.png) also becomes its link-preview picture when it is
// at least 1200 px wide; a smaller one would be blown up and blurred, so the site's own preview is used instead.
import Image from "@11ty/eleventy-img";
import sharp from "sharp";
import path from "node:path";

const isServe = process.env.ELEVENTY_RUN_MODE === "serve";
const hidden = (data) => Boolean(data.draft) && !isServe;

export default {
  layout: "layouts/post.njk",
  ogType: "article",
  eleventyComputed: {
    permalink: (data) => (hidden(data) ? false : `/devlog/${data.page.fileSlug}/`),
    eleventyExcludeFromCollections: (data) => hidden(data) || Boolean(data.eleventyExcludeFromCollections),
    // The link-preview image: the post's image cropped to 1200x630 as a JPEG (link scrapers accept JPEG
    // everywhere). Without an image, the base layout falls back to the site's own preview.
    ogImage: async (data) => {
      if (!data.image || hidden(data)) return undefined;
      const src = path.join(path.dirname(data.page.inputPath), data.image);
      const { width } = await sharp(src).metadata();
      if (width < 1200) return undefined;
      const out = data.eleventy.directories.output;
      const meta = await Image(src, {
        widths: [1200],
        formats: ["jpeg"],
        outputDir: path.join(out, "img", "og"),
        urlPath: "/img/og/",
        sharpJpegOptions: { quality: 85 },
        transform: (sharp) => sharp.resize({ width: 1200, height: 630, fit: "cover" }),
      });
      const jpeg = meta.jpeg[0];
      return { src: jpeg.url, width: 1200, height: 630 };
    },
  },
};
