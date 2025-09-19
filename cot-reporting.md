---
title: COT Reporting
layout: layout.html
---

## Commitments of Traders Reports

Click on the title of a report below to expand and view its content.

{% for report in collections.reports %}
<details class="report-accordion">
  <summary>{{ report.data.title | default: report.fileSlug }}</summary>
  <div class="report-content">
    {{ report.templateContent | safe }}
  </div>
</details>
{% endfor %}