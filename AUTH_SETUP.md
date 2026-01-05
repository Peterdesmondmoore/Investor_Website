# Centralized Authentication System

This authentication system provides category-based access control for your Netlify-hosted website. It uses Netlify Identity for user authentication and enforces access rules based on page categories.

## Features

- ✅ Centralized configuration for all protected pages
- ✅ Category-based access control (signals, reports, strategy, methodology, etc.)
- ✅ Beautiful popup modal for non-authenticated users
- ✅ Automatic redirection to investoranatomy.com
- ✅ Works seamlessly with Netlify Identity
- ✅ Easy to add to any page with just 3 script tags

## File Structure

```
js/
├── auth-config.js    # Central configuration file
└── auth-guard.js     # Authentication enforcement script
```

## Quick Start

### 1. Add Authentication to a Page

To protect any page, add these three script tags in the `<head>` section:

```html
<!-- Netlify Identity Widget for Authentication -->
<script defer src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>

<!-- Authentication System -->
<script defer src="/js/auth-config.js"></script>
<script defer src="/js/auth-guard.js"></script>
```

**Example:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>My Protected Page</title>
  
  <!-- Add these three lines -->
  <script defer src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  <script defer src="/js/auth-config.js"></script>
  <script defer src="/js/auth-guard.js"></script>
  
  <!-- Your other scripts and styles -->
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

### 2. Configure Page Categories

Edit `js/auth-config.js` to configure which pages require authentication:

```javascript
pageCategories: {
  // Public pages (no authentication needed)
  '/': 'public',
  '/index.html': 'public',
  '/login.html': 'public',
  '/pricing.html': 'public',
  
  // Protected pages
  '/signal_catalogue.html': 'signals',
  '/market-reports/*': 'reports',
  '/investment-strategy/*': 'strategy',
  // ... add more pages
}
```

## Access Categories

The system includes these predefined categories:

| Category | Requires Auth | Description |
|----------|--------------|-------------|
| `public` | ❌ No | Accessible to everyone |
| `premium` | ✅ Yes | Premium content |
| `reports` | ✅ Yes | Market reports and analysis |
| `signals` | ✅ Yes | Trading signals and catalogues |
| `strategy` | ✅ Yes | Investment strategy documents |
| `methodology` | ✅ Yes | Technical methodology |
| `portfolio` | ✅ Yes | Portfolio characteristics |

## Configuration Options

### Change Redirect URL

To change where users are sent when not authenticated, edit `auth-config.js`:

```javascript
const AuthConfig = {
  redirectUrl: 'https://your-login-page.com', // Change this
  // ...
};
```

### Add a New Category

1. Open `js/auth-config.js`
2. Add your category to the `categories` object:

```javascript
categories: {
  // ... existing categories
  
  mycategory: {
    name: 'My Custom Category',
    requiresAuth: true,
    description: 'Description of this category'
  }
}
```

3. Map pages to your new category:

```javascript
pageCategories: {
  // ... existing mappings
  
  '/my-page.html': 'mycategory',
  '/my-folder/*': 'mycategory'
}
```

### Use Wildcard Patterns

You can use wildcards (`*`) to match multiple pages:

```javascript
pageCategories: {
  '/reports/*': 'reports',           // Matches all pages under /reports/
  '/strategy/*.html': 'strategy',     // Matches all .html files in /strategy/
  '/api/*/data.json': 'premium'       // Matches nested paths
}
```

## How It Works

1. **Page Load**: When a protected page loads, `auth-guard.js` runs automatically
2. **Check Path**: The script checks the current page path against `auth-config.js`
3. **Determine Category**: Based on the path, it determines which category the page belongs to
4. **Check Auth**: If the category requires authentication, it checks if user is logged in via Netlify Identity
5. **Show Popup**: If not authenticated, a modal popup appears with a button to redirect to `investoranatomy.com`
6. **Grant Access**: If authenticated, the page loads normally

## Authentication Status

### Check if User is Logged In

The system uses Netlify Identity. Users are considered authenticated if:
- They have logged in through Netlify Identity Widget
- Their session token is still valid
- They haven't logged out

### Login Page

Your login page (`login.html`) should already have Netlify Identity Widget configured. Users log in there, then can access protected pages.

## Styling the Popup

The authentication popup is styled inline in `auth-guard.js`. To customize:

1. Open `js/auth-guard.js`
2. Find the `showAuthPopup` function
3. Modify the CSS styles in the `style.cssText` and `innerHTML` sections

Example customizations:
- Change colors by modifying gradient and border colors
- Adjust border radius for different rounded corners
- Modify padding and spacing
- Change font sizes and families

## Testing

### Test Public Pages
1. Visit a public page (e.g., `/index.html`)
2. Should load without popup

### Test Protected Pages
1. Log out of Netlify Identity
2. Visit a protected page (e.g., `/signal_catalogue_v1.0.html`)
3. Should see authentication popup
4. Click "Go to Login Page" button
5. Should redirect to `investoranatomy.com`

### Test After Login
1. Log in through your login page
2. Visit a protected page
3. Should load without popup

## Netlify Configuration

Ensure Netlify Identity is enabled:

1. Go to your Netlify dashboard
2. Navigate to Site settings → Identity
3. Enable Identity
4. Configure registration preferences
5. Set external providers if needed (Google, GitHub, etc.)

### Enable Identity on Specific Pages

Add this to your `netlify.toml`:

```toml
[[redirects]]
  from = "/admin/*"
  to = "/.netlify/identity/admin/:splat"
  status = 200
```

## Troubleshooting

### Popup doesn't appear on protected pages
- Check browser console for errors
- Verify the script tags are in the correct order
- Ensure Netlify Identity Widget is loaded (check Network tab)

### Popup appears on public pages
- Check the path mapping in `auth-config.js`
- Verify the page path matches exactly (including trailing slashes)

### Users see popup even after logging in
- Check Netlify Identity is properly initialized
- Verify user is actually logged in (check `netlifyIdentity.currentUser()` in console)
- Clear browser cache and cookies

### Console error: "AuthConfig not loaded"
- Ensure `auth-config.js` loads before `auth-guard.js`
- Use `defer` attribute on both scripts
- Check file paths are correct

## Advanced Usage

### Custom Authentication Check

To add custom authentication logic, modify `auth-guard.js`:

```javascript
isAuthenticated: function() {
  // Custom logic here
  const user = netlifyIdentity.currentUser();
  
  // Example: Check if user has specific role
  if (user && user.app_metadata && user.app_metadata.roles) {
    return user.app_metadata.roles.includes('premium');
  }
  
  return user !== null;
}
```

### Role-Based Access

To implement role-based access, modify the categories:

```javascript
categories: {
  premium: {
    name: 'Premium Content',
    requiresAuth: true,
    requiredRoles: ['premium', 'admin']
  }
}
```

Then update the authentication check to verify roles.

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Netlify Identity is properly configured
3. Test authentication flow manually
4. Review the configuration in `auth-config.js`

## Migration Guide

### Adding Authentication to Existing Pages

For each page you want to protect:

1. ✅ Add the three script tags to the `<head>` section
2. ✅ Add the page path to `auth-config.js` with appropriate category
3. ✅ Test the page while logged out
4. ✅ Test the page while logged in
5. ✅ Deploy to Netlify

### Bulk Update

To add authentication to all pages at once, you can:

1. Create a template header file with the script tags
2. Use a build tool to inject the header into all HTML files
3. Or manually add to each page's `<head>` section

## Example: Complete Protected Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Protected Content</title>
  
  <!-- Netlify Identity Widget -->
  <script defer src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  
  <!-- Authentication System -->
  <script defer src="/js/auth-config.js"></script>
  <script defer src="/js/auth-guard.js"></script>
  
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 2rem;
    }
  </style>
</head>
<body>
  <h1>This is Protected Content</h1>
  <p>Only authenticated users can see this page.</p>
  
  <!-- Your protected content here -->
</body>
</html>
```

Then add to `auth-config.js`:
```javascript
pageCategories: {
  // ... other mappings
  '/protected-content.html': 'premium'
}
```

That's it! Your page is now protected. 🔒
