(function () {
  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function parseJsonLines(text) {
    if (!text) return [];

    return String(text)
      .split(/\r?\n/)
      .map(function (line) { return line.trim(); })
      .filter(Boolean)
      .map(function (line) {
        try {
          return JSON.parse(line);
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);
  }

  function getEmbeddedRecords() {
    var embeddedEl = document.getElementById("reporting-history-embedded");
    if (!embeddedEl) return [];
    return parseJsonLines(embeddedEl.textContent || "");
  }

  function getWeekStart(record) {
    if (!record || !record.reporting_week_starts) {
      return record && record.date ? record.date : "";
    }

    if (Array.isArray(record.reporting_week_starts) && record.reporting_week_starts.length) {
      return record.reporting_week_starts[0];
    }

    if (typeof record.reporting_week_starts === "string") {
      return record.reporting_week_starts;
    }

    return record.date || "";
  }

  function getTimestamp(value) {
    if (!value) return 0;
    var timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function getRecordTimestamp(record) {
    if (!record) return 0;
    return Math.max(getTimestamp(record.run_id), getTimestamp(record.date));
  }

  function compareRecordsDescending(left, right) {
    return getRecordTimestamp(right) - getRecordTimestamp(left);
  }

  function normalizeRecords(records, transformRecord) {
    return toArray(records)
      .map(function (record) {
        return typeof transformRecord === "function" ? transformRecord(record) : record;
      })
      .filter(Boolean);
  }

  function pickReportingRecords(records) {
    var reportingRecords = records.filter(function (record) {
      return String(record.reporting_flag || "").toUpperCase() === "Y";
    });

    if (!reportingRecords.length) {
      reportingRecords = records.slice();
    }

    reportingRecords.sort(compareRecordsDescending);

    var byWeek = new Map();
    reportingRecords.forEach(function (record) {
      var weekKey = getWeekStart(record) || record.date || record.run_id || String(byWeek.size);
      if (!byWeek.has(weekKey)) {
        byWeek.set(weekKey, record);
      }
    });

    return Array.from(byWeek.values()).sort(compareRecordsDescending);
  }

  function formatDateLabel(value) {
    if (!value) return "Unknown";

    var parsed = Date.parse(value);
    if (!Number.isFinite(parsed)) return value;

    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
      }).format(new Date(parsed));
    } catch (error) {
      return value;
    }
  }

  function getColumnClass(field) {
    if (!field || !field.key) return "";
    if (field.key === "trade_call") return "trade-call-column";
    if (field.key === "price") return "price-column";
    if (field.key === "commentary") return "commentary-column";
    if (field.doubleWidth) return "double-width-column";
    return "";
  }

  function createCellContent(value, isHtmlField) {
    var wrapper = document.createElement("span");
    wrapper.className = "reporting-cell-content";

    if (isHtmlField) {
      wrapper.innerHTML = value;
    } else {
      wrapper.textContent = value;
    }

    return wrapper;
  }

  function getRecordLabel(record) {
    if (!record) return "Unknown";

    var primaryDate = getWeekStart(record) || record.date || "";
    return formatDateLabel(primaryDate);
  }

  function renderTable(targetEl, records, fields, htmlFieldSet, visibleWeekCount) {
    targetEl.innerHTML = "";

    if (!records.length) {
      return;
    }

    var visibleRecords = records.slice(0, visibleWeekCount);
    var table = document.createElement("table");
    table.className = "reporting-table";

    var thead = document.createElement("thead");
    var headerRow = document.createElement("tr");

    var cornerTh = document.createElement("th");
    cornerTh.textContent = "Date";
    headerRow.appendChild(cornerTh);

    fields.forEach(function (field) {
      var th = document.createElement("th");
      var className = getColumnClass(field);
      if (className) {
        th.className = className;
      }
      th.textContent = field.label || field.key;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");

    visibleRecords.forEach(function (record) {
      var row = document.createElement("tr");

      var dateTh = document.createElement("th");
      var weekStart = getWeekStart(record);
      var reportDate = record && record.date ? formatDateLabel(record.date) : "";
      var dateLabel = getRecordLabel(record);
      dateTh.textContent = dateLabel;

      if (reportDate && reportDate !== dateLabel) {
        dateTh.title = "Report date: " + reportDate;
      } else if (weekStart) {
        dateTh.title = "Week of " + formatDateLabel(weekStart);
      }

      row.appendChild(dateTh);

      fields.forEach(function (field) {
        var td = document.createElement("td");
        var className = getColumnClass(field);
        var rawValue = record[field.key];
        var hasValue = !(rawValue === null || rawValue === undefined || rawValue === "");

        if (className) {
          td.classList.add(className);
        }

        if (!hasValue) {
          td.classList.add("na");
          td.textContent = "NA";
        } else {
          td.classList.add("has-value");
          td.appendChild(createCellContent(String(rawValue), htmlFieldSet.has(field.key)));
        }

        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    targetEl.appendChild(table);
  }

  async function fetchHistory(urls) {
    var errors = [];

    for (var index = 0; index < urls.length; index += 1) {
      var url = urls[index];

      try {
        var response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }

        var text = await response.text();
        var records = parseJsonLines(text);
        if (records.length) {
          return { records: records, source: url, usedFallback: false };
        }

        errors.push(url + " returned no records");
      } catch (error) {
        errors.push(url + " failed: " + error.message);
      }
    }

    throw new Error(errors.join(" | "));
  }

  async function init(config) {
    var options = config || {};
    var statusEl = document.getElementById(options.statusId || "reporting-status");
    var gridEl = document.getElementById(options.gridId || "reporting-grid");
    var weeksSelectEl = document.getElementById(options.weeksSelectId || "reporting-weeks-select");
    var reportingFields = toArray(options.reportingFields);
    var htmlFieldSet = new Set(toArray(options.htmlFields));
    var transformRecord = options.transformRecord;

    if (!statusEl || !gridEl || !reportingFields.length) {
      return;
    }

    var historyUrls = toArray(options.historyUrls);
    var sourceLabel = historyUrls[0] || "local JSONL file";
    var records = [];

    if (!historyUrls.length) {
      statusEl.textContent = "No reporting history file configured.";
      statusEl.classList.add("error");
      gridEl.innerHTML = "";
      return;
    }

    try {
      var loaded = await fetchHistory(historyUrls);
      records = normalizeRecords(loaded.records, transformRecord);
      sourceLabel = loaded.source;
    } catch (error) {
      statusEl.textContent = "Unable to load reporting history from " + sourceLabel + ".";
      statusEl.classList.add("error");
      gridEl.innerHTML = "";
      return;
    }

    var reportingRecords = pickReportingRecords(records);

    if (!reportingRecords.length) {
      statusEl.textContent = "No reporting history available in " + sourceLabel + ".";
      statusEl.classList.add("error");
      gridEl.innerHTML = "";
      return;
    }

    statusEl.classList.remove("error");

    function updateView() {
      var visibleCount = reportingRecords.length;

      if (weeksSelectEl) {
        var selectedWeekCount = parseInt(weeksSelectEl.value, 10);
        var weekCount = Number.isFinite(selectedWeekCount) && selectedWeekCount > 0
          ? selectedWeekCount
          : reportingRecords.length;
        visibleCount = Math.min(weekCount, reportingRecords.length);
      }

      renderTable(gridEl, reportingRecords, reportingFields, htmlFieldSet, visibleCount);

      var statusSummary = weeksSelectEl
        ? "Showing " + visibleCount + " of " + reportingRecords.length + " reporting week" + (reportingRecords.length === 1 ? "" : "s")
        : "Showing " + reportingRecords.length + " reporting week" + (reportingRecords.length === 1 ? "" : "s");
      statusEl.textContent = statusSummary + " from " + sourceLabel;
    }

    if (weeksSelectEl) {
      weeksSelectEl.addEventListener("change", updateView);
    }
    updateView();
  }

  window.InvestorAnatomyReportingHistoryLoader = {
    init: init
  };
})();
