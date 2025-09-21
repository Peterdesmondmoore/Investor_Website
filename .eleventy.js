module.exports = function(eleventyConfig) {
  // Create a custom collection for reports
  eleventyConfig.addCollection("reports", function(collectionApi) {
    return collectionApi.getFilteredByGlob("market-reports/*.html");
  });

  // Create a custom collection for summary reports
  eleventyConfig.addCollection("summaryReports", function(collectionApi) {
    return collectionApi.getFilteredByGlob("summary-reports/*.html");
  });

  // Tell Eleventy to copy the 'css' and 'images' folders to the output folder
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");

  // Add a 'safe' filter to mark HTML as safe
  eleventyConfig.addFilter("safe", function(value) {
    return value;
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
    templateFormats: ["html", "md", "liquid"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
  };
};