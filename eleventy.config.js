// Eleventy configuration for the Black Tallow website.
// Source in src/, output in _site/. Templates are Nunjucks (.njk) and Markdown (.md).

// "serve" under `npm start`, "build" under `npm run build`. Under serve, drafts and TODO placeholders show;
// a build leaves them out.
const isServe = process.env.ELEVENTY_RUN_MODE === "serve";

export default function (eleventyConfig) {
  // Port 8080, Eleventy's default, belongs to the Unity MCP bridge on this machine.
  eleventyConfig.setServerOptions({ port: 8090 });

  // Copied to the output as they are.
  eleventyConfig.addPassthroughCopy("src/assets/fonts");
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/img");
  // favicon.ico, apple-touch-icon.png and the manifest icons live at the site root.
  eleventyConfig.addPassthroughCopy({ "src/assets/icons/*": "/" });
  // src/assets/art/ holds the PNG exports `npm run images` reads; they are never published.

  // Devlog posts, newest first. A post with `draft: true` is left out of a build.
  eleventyConfig.addCollection("posts", (api) =>
    api
      .getFilteredByGlob("src/devlog/*.md")
      .filter((post) => isServe || !post.data.draft)
      .sort((a, b) => b.date - a.date),
  );

  // Dates: posts carry a calendar date (YYYY-MM-DD), read as UTC so it never shifts a day.
  const longDate = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  eleventyConfig.addFilter("readableDate", (date) => longDate.format(date));
  eleventyConfig.addFilter("isoDate", (date) => date.toISOString().slice(0, 10));
  eleventyConfig.addFilter("head", (list, n) => (Array.isArray(list) ? list.slice(0, n) : []));
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
