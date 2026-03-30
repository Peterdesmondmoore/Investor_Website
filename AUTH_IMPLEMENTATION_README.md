# Authentication Implementation Review

Audit date: 2026-03-30  
Repo: `Investor_Website`

## Scope and Method

- Scanned all source `.html` files in the repo.
- Excluded generated and dependency trees: `_site/**`, `node_modules/**`.
- Treated `components/**` and `_includes/**` as non-routable fragments.
- Considered authentication **implemented** only when a page includes all three:
  - `https://identity.netlify.com/v1/netlify-identity-widget.js`
  - `/js/auth-config.js`
  - `/js/auth-guard.js`

## Overall Coverage (Routable Pages)

- Total routable HTML pages: **368**
- Full auth implemented: **123**
- Partial auth implementation: **2**
- No auth implementation: **243**
- Pages classified as requiring auth by `js/auth-config.js`: **367**
- Public pages by `js/auth-config.js`: **1** (`/`)
- Pages requiring auth but not fully implemented: **244**

## Where Authentication Is Implemented

### By directory

| Directory | Total | Implemented | Partial | Not Implemented |
|---|---:|---:|---:|---:|
| `(root)` | 32 | 4 | 2 | 26 |
| `historic_reports` | 2 | 1 | 0 | 1 |
| `signal_report` | 153 | 118 | 0 | 35 |
| `ia_explained` | 2 | 0 | 0 | 2 |
| `investment-strategy` | 24 | 0 | 0 | 24 |
| `methodology` | 78 | 0 | 0 | 78 |
| `portfolio_characteristics` | 1 | 0 | 0 | 1 |
| `signal_monitor` | 75 | 0 | 0 | 75 |
| `thesis` | 1 | 0 | 0 | 1 |

### Fully implemented root pages (4)

- `document_library.html`
- `feature_development.html`
- `rss_feed.html`
- `signal_catalogue.html`

### Fully implemented historic report (1)

- `historic_reports/Federal_Reserve_Watcher_26_January_26.html`

## Partial Implementations (2)

- `index.html`
  - Includes Netlify Identity widget only.
  - Category resolves to `public`, so this is not a blocking auth gap.
- `signal_map.html`
  - Includes Netlify Identity widget only (missing `/js/auth-config.js` and `/js/auth-guard.js`).
  - Category resolves to `signals` (requires auth) -> **auth gap**.

## Where Authentication Is Not Implemented

### Entire directories with no full auth implementation

- `ia_explained/` (2/2 not implemented)
- `investment-strategy/` (24/24 not implemented)
- `methodology/` (78/78 not implemented)
- `portfolio_characteristics/` (1/1 not implemented)
- `signal_monitor/` (75/75 not implemented)
- `thesis/` (1/1 not implemented)

### Root pages missing auth (26 pages)

- `copper.html`
- `copper_news.html`
- `gold.html`
- `gold_news.html`
- `insights.html`
- `insights_redirect.html`
- `Investor_Anatomy_Ops_Model.html`
- `lithium.html`
- `lithium_news.html`
- `Podcast_Copper.html`
- `Podcast_Cross_Asset_Positioning_Sentiment.html`
- `Podcast_Fed_Reserve_Watcher.html`
- `Podcast_Global_Growth_Economic_Cycles.html`
- `Podcast_Global_Inflation_FX_Dynamics.html`
- `Podcast_Global_Trade_Demand.html`
- `Podcast_Gold.html`
- `Podcast_Lithium.html`
- `Podcast_Silver.html`
- `Podcast_US_Credit_Conditions.html`
- `Podcast_US_Growth_Business_Cycle.html`
- `Podcast_US_Inflation_Price_Dynamics.html`
- `Podcast_US_Labour_Market.html`
- `Podcast_US_Liquidity_Monetary_Conditions.html`
- `Podcast_US_Macro_Regime_State_Momentum_Transition_Risk.html`
- `silver.html`
- `silver_news.html`

### `historic_reports/` missing auth (1 page)

- `historic_reports/Fed_Reserve_Watcher_10_December_25.html`

### `signal_report/` missing auth (35 pages)

- `signal_report/Changes_in_Weekly_Macro_Themes_and_Composites.html`
- `signal_report/Composite_Global_Macro_Overview.html`
- `signal_report/Composite_US_Macro_Overview.html`
- `signal_report/Federal_Reserve_Beige_Book_Summary.html`
- `signal_report/Federal_Reserve_Tone_Decoder.html`
- `signal_report/Gold_Macro_Signal_Outlook.html`
- `signal_report/Gold_Supply_Demand_Analyst.html`
- `signal_report/Gold_Supply_Demand_News_and_Document_Selection.html`
- `signal_report/Macro_Theme_Cross_Asset_Positioning_and_Sentiment.html`
- `signal_report/Macro_Theme_Global_Growth.html`
- `signal_report/Macro_Theme_Global_Inflation_and_FX_Dynamics.html`
- `signal_report/Macro_Theme_Global_Trade_and_Demand.html`
- `signal_report/Macro_Theme_US_Credit_Conditions.html`
- `signal_report/Macro_Theme_US_Growth_and_Business_Cycle.html`
- `signal_report/Macro_Theme_US_Inflation_and_Price_Dynamics.html`
- `signal_report/Macro_Theme_US_Labour_Market.html`
- `signal_report/Macro_Theme_US_Liquidity_and_Monetary_Conditions.html`
- `signal_report/News_and_Document_Selection.html`
- `signal_report/Outlook_Gold_Thesis_Applied.html`
- `signal_report/Podcast_Copper_News_Signal_48H.html`
- `signal_report/Podcast_Copper_News_Signal_7D.html`
- `signal_report/Podcast_Copper_News_Signal_Compression_7D.html`
- `signal_report/Podcast_Gold_News_Signal_48H.html`
- `signal_report/Podcast_Gold_News_Signal_7D.html`
- `signal_report/Podcast_Gold_News_Signal_Compression_7D.html`
- `signal_report/Podcast_Lithium_News_Signal_48H.html`
- `signal_report/Podcast_Lithium_News_Signal_7D.html`
- `signal_report/Podcast_Lithium_News_Signal_Compression_7D.html`
- `signal_report/Podcast_Silver_News_Signal_48H.html`
- `signal_report/Podcast_Silver_News_Signal_7D.html`
- `signal_report/Podcast_Silver_News_Signal_Compression_7D.html`
- `signal_report/Portfolio_Advisor_Portfolio_Guidance.html`
- `signal_report/Predictor_Fed_Rate_Decision.html`
- `signal_report/Silver_Market_Analyst_Podcast.html`
- `signal_report/Silver_Outlook_Podcast.html`

## Non-Routable HTML Fragments (Not Page-Level Auth Targets)

- `components/nav.html`
- `components/footer.html`
- `_includes/layout.html`

These are include/template fragments and do not currently include page-level guard scripts.

## Config and Enforcement Findings

### Auth control points found

- `js/auth-config.js`: category model + path/category mapping.
- `js/auth-guard.js`: client-side enforcement modal and Netlify Identity session check.
- `components/nav.html`: login/logout controls (Netlify Identity open/logout hooks).
- `index.html` and `signal_map.html`: explicit `netlifyIdentity.on(...)` event handlers.

### Important gaps

- Server-side route protection is effectively disabled:
  - `_redirects` contains protected route rules, but they are commented out.
  - Without server-side protection, guarded pages can still be fetched directly and hidden only by client-side modal.
- `js/auth-config.js` defaults unmatched paths to `premium` (requires auth), but many pages do not include guard scripts, so classification and enforcement diverge.
- `login.html` is referenced in config and nav, but no `login.html` exists in repo.
- Additional public/configured paths in `auth-config.js` are not present in repo:
  - `pricing.html`, `README.html`, `signal_catalogue_v1.0.html`
  - `market-reports/*`, `summary-reports/*`, `pricing-reports/*`, `trading-recommendation/*`
  - `metals-comparative-analysis.html`, `quantum-companies/*`

## Practical Interpretation

- Authentication is **partially rolled out** and **concentrated mainly in `signal_report/`**, plus a few root pages.
- Most other routable content currently has **no page-level auth enforcement scripts**.
- Even where scripts are present, enforcement is currently **client-side only** unless Netlify redirect-based protection is enabled.
