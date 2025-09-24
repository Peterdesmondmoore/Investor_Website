---
title: Home
layout: layout.html
---

<div class="hero">
    <h1>Investor Anatomy</h1>
    <p id="typewriter-text">
        Investor Anatomy is the AI-driven intelligence platform for institutional investors. We empower you to codify your experience into a quantifiable edge, delivering the deep, synthesized insights needed to act with conviction.
    </p>
    <a href="/about/" class="cta-button">
        Learn About Our Approach
    </a>
</div>

<div class="features-section">
    <div class="features-grid">
        <div class="feature-item">
            <h4>Your Experience, Codified</h4>
            <p>Our platform translates your market wisdom into a powerful, AI-driven analytical process. We don't replace your expertise; we amplify it.</p>
        </div>
        <div class="feature-item">
            <h4>The Bilingual Advantage</h4>
            <p>We are a team of investment professionals and expert technologists. We speak your language and build solutions for your specific challenges.</p>
        </div>
    </div>
</div>

<div class="home-reports-section">
    <h3>Trading Recommendations</h3>
    {% for report in collections.tradingRecommendations %}
    <details class="report-accordion" open>
      <summary>
        <span>{{ report.data.title | default: report.fileSlug }}</span>
      </summary>
      <div class="report-content">
        {{ report.templateContent | safe }}
      </div>
    </details>
    {% endfor %}
</div>

<div class="home-reports-section">
    <h3>State of the Market Summaries</h3>
    {% for report in collections.summaryReports %}
    <details class="report-accordion">
      <summary>
        <span>{{ report.data.title | default: report.fileSlug }}</span>
      </summary>
      <div class="report-content">
        {{ report.templateContent | safe }}
      </div>
    </details>
    {% endfor %}
</div>