---
title: Home
layout: layout.html
---

<div class="report-container" style="text-align: center; border: none; box-shadow: none;">
    <h2 style="font-size: 38px; color: #0a3d62; font-weight: 700; margin: 0 0 20px 0;">Stop Wrestling with Your Tools.<br/>It’s Time to Advance Your Thinking.</h2>

    <p style="font-size: 1.1em; max-width: 700px; margin: 0 auto 30px auto; line-height: 1.7;">
        Investor Anatomy is the AI-driven intelligence platform built for institutional investors who are frustrated with the limitations of their current technology. We empower you to codify your experience into a quantifiable edge, delivering the deep, synthesized insights needed to act with conviction.
    </p>

    <a href="/about/" style="display: inline-block; background-color: #0a3d62; color: white; padding: 15px 30px; text-decoration: none; font-weight: 600; border-radius: 5px; margin-top: 10px;">
        Learn About Our Approach
    </a>
</div>

<div class="report-container" style="margin-top: 40px;">
    <h3 style="font-size: 22px; color: #0a3d62; font-weight: 600; text-align: center; margin-bottom: 30px; border-bottom: none;">The Intelligence Behind Our Reports</h3>
    <p style="text-align: center; margin-top: -20px; margin-bottom: 30px;">The reports below are a direct output of the Investor Anatomy engine—showcasing our ability to synthesize quantitative and qualitative data into actionable intelligence.</p>

    <div class="highlights-grid">
        <div class="highlight-card opportunities">
            <h4>Your Experience, Codified</h4>
            <p>Our platform translates your market wisdom into a powerful, AI-driven analytical process. We don't replace your expertise; we amplify it.</p>
        </div>
        <div class="highlight-card risks">
            <h4>The Bilingual Advantage</h4>
            <p>We are a team of investment professionals and expert technologists. We speak your language and build solutions for your specific challenges.</p>
        </div>
    </div>
</div>

<div class="report-container" style="margin-top: 40px;">
    <h3 style="font-size: 22px; color: #0a3d62; font-weight: 600; text-align: center; margin-bottom: 30px; border-bottom: none;">Summary Reports</h3>
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