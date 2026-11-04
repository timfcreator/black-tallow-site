// Writes _site/CNAME, the custom domain for GitHub Pages, from site.json's "domain".
// With no domain set, no file is written.
export default class {
  data() {
    return {
      permalink: (data) => (data.site.domain ? "/CNAME" : false),
      eleventyExcludeFromCollections: true,
      // CNAME has no file extension on purpose; Eleventy 3.1 refuses that without this flag.
      eleventyAllowMissingExtension: true,
    };
  }

  render(data) {
    return `${data.site.domain}\n`;
  }
}
