// Eleventy configuration for the Black Tallow website.
// Source in src/, output in _site/. Templates are Nunjucks (.njk) and Markdown (.md).

export default function (eleventyConfig) {
  // Copied to the output as they are.
  eleventyConfig.addPassthroughCopy("src/assets/fonts");
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/img");
  // favicon.ico, apple-touch-icon.png and the manifest icons live at the site root.
  eleventyConfig.addPassthroughCopy({ "src/assets/icons/*": "/" });
  // src/assets/art/ holds the PNG exports `npm run images` reads; they are never published.
}

export const config = {
  dir: {
    input: "src",
    includes: "_includes",
    data: "_data",
    output: "_site",
  },
  templateFormats: ["njk", "md", "11ty.js"],
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};
