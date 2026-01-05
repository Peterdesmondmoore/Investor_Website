/**
 * Authentication Enforcement Script
 * Checks authentication status and displays popup for protected pages
 * Works with Netlify Identity
 */

(function() {
  'use strict';
  
  // Wait for AuthConfig to be loaded
  if (typeof window.AuthConfig === 'undefined') {
    console.error('AuthConfig not loaded. Please include auth-config.js before auth-guard.js');
    return;
  }
  
  const AuthGuard = {
    /**
     * Check if user is authenticated via Netlify Identity
     * @returns {boolean} True if user is logged in
     */
    isAuthenticated: function() {
      // Check if Netlify Identity is available
      if (typeof netlifyIdentity === 'undefined') {
        console.warn('Netlify Identity not loaded');
        return false;
      }
      
      const user = netlifyIdentity.currentUser();
      return user !== null;
    },
    
    /**
     * Show authentication popup modal
     */
    showAuthPopup: function() {
      const currentPath = window.AuthConfig.getCurrentPath();
      const category = window.AuthConfig.getCategoryForPath(currentPath);
      const categoryInfo = window.AuthConfig.categories[category];
      const redirectUrl = window.AuthConfig.redirectUrl;
      
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.id = 'auth-guard-overlay';
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
      `;
      
      // Create modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 24px;
        padding: 48px;
        max-width: 480px;
        width: 90%;
        box-shadow: 0 20px 80px rgba(139, 92, 246, 0.4);
        text-align: center;
        animation: slideUp 0.3s ease-out;
      `;
      
      modal.innerHTML = `
        <style>
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
        </style>
        
        <!-- Icon -->
        <div style="
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.15));
          border: 2px solid rgba(139, 92, 246, 0.4);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(139, 92, 246, 0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        
        <!-- Title -->
        <h2 style="
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 16px;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        ">Authentication Required</h2>
        
        <!-- Message -->
        <p style="
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        ">This content is protected and requires authentication.</p>
        
        <p style="
          font-size: 14px;
          color: rgba(139, 92, 246, 0.8);
          margin: 0 0 32px;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        ">Access Category: ${categoryInfo.name}</p>
        
        <!-- Button -->
        <a 
          href="${redirectUrl}"
          style="
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
            color: white;
            text-decoration: none;
            padding: 16px 48px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
            transition: all 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          "
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 15px 40px rgba(139, 92, 246, 0.5)';"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 30px rgba(139, 92, 246, 0.4)';"
        >
          Go to Login Page
        </a>
        
        <!-- Footer text -->
        <p style="
          margin-top: 24px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        ">Please log in to access premium content</p>
      `;
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    },
    
    /**
     * Enforce authentication for current page
     */
    enforce: function() {
      const currentPath = window.AuthConfig.getCurrentPath();
      const requiresAuth = window.AuthConfig.requiresAuth(currentPath);
      
      // If page doesn't require auth, do nothing
      if (!requiresAuth) {
        console.log('AuthGuard: Page is public, no authentication required');
        return;
      }
      
      // Check authentication status
      const isAuthenticated = this.isAuthenticated();
      
      if (!isAuthenticated) {
        console.log('AuthGuard: User not authenticated, showing popup');
        this.showAuthPopup();
      } else {
        console.log('AuthGuard: User authenticated, access granted');
      }
    },
    
    /**
     * Initialize auth guard
     */
    init: function() {
      // Wait for Netlify Identity to be ready
      if (typeof netlifyIdentity !== 'undefined') {
        netlifyIdentity.on('init', () => {
          this.enforce();
        });
      } else {
        // If Netlify Identity isn't loaded, wait a bit and try again
        setTimeout(() => {
          if (typeof netlifyIdentity !== 'undefined') {
            netlifyIdentity.on('init', () => {
              this.enforce();
            });
          } else {
            // No Netlify Identity, enforce anyway
            this.enforce();
          }
        }, 500);
      }
    }
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      AuthGuard.init();
    });
  } else {
    AuthGuard.init();
  }
  
  // Make available globally for debugging
  window.AuthGuard = AuthGuard;
})();
