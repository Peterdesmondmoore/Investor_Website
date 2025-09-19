module.exports = function(eleventyConfig) {
  // ...existing code...

  // Add 'safe' filter to mark HTML as safe for output
  eleventyConfig.addFilter("safe", function(value) {
    return value;
  });

  // ...existing code...
};