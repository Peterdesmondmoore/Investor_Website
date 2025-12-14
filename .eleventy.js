const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // Set markdown-it as the library for rendering markdown files
  eleventyConfig.setLibrary("md", markdownIt());

  // Create a custom collection for reports
  eleventyConfig.addCollection("reports", function(collectionApi) {
    return collectionApi.getFilteredByGlob("market-reports/*.html");
  });

  // Create a custom collection for summary reports
  eleventyConfig.addCollection("summaryReports", function(collectionApi) {
    return collectionApi.getFilteredByGlob("summary-reports/*.html");
  });

  // Create a custom collection for trading recommendations
  eleventyConfig.addCollection("tradingRecommendations", function(collectionApi) {
    return collectionApi.getFilteredByGlob("trading-recommendation/*.html");
  });

  // Copy HTML files from investment-strategy folder
  eleventyConfig.addPassthroughCopy("investment-strategy", function(collectionApi) {
    return collectionApi.getFilteredByGlob("investment-strategy/*.html");
  });

  // Create a custom collection for China Industrial reports
  eleventyConfig.addCollection("chinaIndustrial", function(collectionApi) {
      return collectionApi.getFilteredByGlob("china-industrial/*.html");
  });

  // Tell Eleventy to copy the 'css' and 'images' folders to the output folder
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");


  // Add a 'safe' filter for Liquid templates
  eleventyConfig.addLiquidFilter("safe", function(value) {
    return value;
  });

  return {
    pathPrefix: "", // Set to empty string for local development
    dir: {
      input: ".",      // Use the project root as the input directory
      includes: "_includes",
      data: "_data",
      output: "_site"  // Default output directory
    },
    templateFormats: ["html", "md", "liquid"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
  };


};