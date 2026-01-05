/**
 * Centralized Authentication Configuration
 * Define access categories and page mappings
 */

const AuthConfig = {
  // Redirect URL for non-authenticated users
  redirectUrl: 'https://investoranatomy.com',
  
  // Access categories with their required authentication level
  categories: {
    public: {
      name: 'Public Access',
      requiresAuth: false,
      description: 'Pages accessible to everyone'
    },
    premium: {
      name: 'Premium Content',
      requiresAuth: true,
      description: 'Requires active subscription'
    },
    reports: {
      name: 'Reports & Analysis',
      requiresAuth: true,
      description: 'Market reports and analysis'
    },
    signals: {
      name: 'Trading Signals',
      requiresAuth: true,
      description: 'Signal catalogue and trading recommendations'
    },
    strategy: {
      name: 'Investment Strategy',
      requiresAuth: true,
      description: 'Investment strategy documents'
    },
    methodology: {
      name: 'Methodology',
      requiresAuth: true,
      description: 'Technical methodology documentation'
    },
    portfolio: {
      name: 'Portfolio',
      requiresAuth: true,
      description: 'Portfolio characteristics and analysis'
    }
  },
  
  // Page to category mappings
  // Use patterns with wildcards (*) or exact paths
  pageCategories: {
    // Public pages
    '/': 'public',
    '/index.html': 'public',
    '/login.html': 'public',
    '/login/index.html': 'public',
    '/pricing.html': 'public',
    '/pricing/index.html': 'public',
    '/README.html': 'public',
    '/README/index.html': 'public',
    
    // Signal pages
    '/signal_catalogue_v1.0.html': 'signals',
    '/signal_catalogue_v1.0/*': 'signals',
    '/signal_catalogue_v1.0': 'signals',
    '/signal_catalogue.html': 'signals',
    '/signal_catalogue/*': 'signals',
    '/signal_catalogue': 'signals',
    '/signal_map.html': 'signals',
    '/signal_map/*': 'signals',
    '/signal_map': 'signals',
    '/signal_report/*': 'signals',
    '/trading-recommendation/*': 'signals',
    
    // Market reports
    '/market-reports/*': 'reports',
    '/historic_reports/*': 'reports',
    '/summary-reports/*': 'reports',
    '/pricing-reports/*': 'reports',
    '/rss_feed.html': 'reports',
    '/rss_feed/*': 'reports',
    
    // Investment strategy
    '/investment-strategy/*': 'strategy',
    '/thesis/*': 'strategy',
    
    // Methodology
    '/methodology/*': 'methodology',
    '/ia_explained/*': 'methodology',
    
    // Portfolio
    '/portfolio_characteristics/*': 'portfolio',
    
    // Other premium content
    '/document_library.html': 'premium',
    '/document_library/*': 'premium',
    '/metals-comparative-analysis.html': 'premium',
    '/metals-comparative-analysis/*': 'premium',
    '/quantum-companies/*': 'premium'
  },
  
  /**
   * Get the category for a given page path
   * @param {string} path - The page path (e.g., '/signal_catalogue.html')
   * @returns {string} The category name
   */
  getCategoryForPath: function(path) {
    // Normalize path
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Remove trailing slash for consistency
    const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
    
    // Check for exact match first
    if (this.pageCategories[normalizedPath]) {
      return this.pageCategories[normalizedPath];
    }
    
    // Also check with original path (with trailing slash)
    if (this.pageCategories[path]) {
      return this.pageCategories[path];
    }
    
    // Check for wildcard matches
    for (const [pattern, category] of Object.entries(this.pageCategories)) {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(normalizedPath) || regex.test(path)) {
          return category;
        }
      }
    }
    
    // Default to premium if no match found
    return 'premium';
  },
  
  /**
   * Check if a page requires authentication
   * @param {string} path - The page path
   * @returns {boolean} True if authentication is required
   */
  requiresAuth: function(path) {
    const category = this.getCategoryForPath(path);
    return this.categories[category]?.requiresAuth || false;
  },
  
  /**
   * Get the current page path
   * @returns {string} The current page path
   */
  getCurrentPath: function() {
    return window.location.pathname;
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.AuthConfig = AuthConfig;
}
