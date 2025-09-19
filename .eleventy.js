const { Liquid } = require('liquidjs');
const liquidOptions = {
    extname: '.liquid',
    dynamicPartials: true,
};

module.exports = function(eleventyConfig) {
  // === New additions for the 'safe' filter ===
  eleventyConfig.setLiquidOptions(liquidOptions);
  eleventyConfig.addFilter('safe', function(value) {
    return value;
  });
  // ==========================================

  // Create a custom collection for all files in the "market-reports" folder
  eleventyConfig.addCollection("reports", function(collectionApi) {
    return collectionApi.getFilteredByGlob("market-reports/*.html");
  });

  // Passthrough any assets or folders you might need
  // eleventyConfig.addPassthroughCopy("css"); // Example

  // Return your site's configuration
  return {
    dir: {
      input: ".", // Root directory is the input
      includes: "_includes",
      output: "_site",
    },
    templateFormats: ["html", "md", "liquid"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
  };
};