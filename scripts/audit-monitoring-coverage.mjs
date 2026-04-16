import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

const WEBSITE_REQUIRED_SNIPPETS = [
  { label: "monitoring include", test: (text) => text.includes('/js/monitoring.js') },
  { label: "monitoring config", test: (text) => text.includes("IA_MONITORING_CONFIG") },
  { label: "page metadata", test: (text) => text.includes("data-ia-page-family") },
];

const GENERATOR_FILES = [
  "reports/signal_report_page.py",
  "podcast_modules/audio_report_page.py",
  "reports/signal_catalogue.py",
  "reports/document_library_webpage_generator.py",
  "reports/rss_webpage_generator_fixed.py",
  "reports/build_feature_development_page.py",
  "reports/readme_page.py",
  "reports/consolidated_report_V1_1.py",
  "podcast_modules/insights_page.py",
];

function listHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(repoRoot, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if (["_site", "_site_ga4_test", "node_modules", ".git", "components", "_includes"].includes(entry.name)) {
        continue;
      }
      files.push(...listHtmlFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      files.push(relPath);
    }
  }

  return files;
}

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function validateFile(filePath, checks, failures) {
  const text = readFile(filePath);
  if (!/<html/i.test(text) || !/<body/i.test(text)) return;

  for (const check of checks) {
    if (!check.test(text)) {
      failures.push(`${filePath}: missing ${check.label}`);
    }
  }
}

function main() {
  const failures = [];
  const htmlFiles = listHtmlFiles(repoRoot);

  for (const relPath of htmlFiles) {
    validateFile(path.join(repoRoot, relPath), WEBSITE_REQUIRED_SNIPPETS, failures);
  }

  const layoutPath = path.join(repoRoot, "_includes", "layout.html");
  validateFile(layoutPath, WEBSITE_REQUIRED_SNIPPETS, failures);

  const siblingGeneratorRoot = path.resolve(repoRoot, "..", "Investor_Anatomy_Code");
  if (fs.existsSync(siblingGeneratorRoot)) {
    for (const relPath of GENERATOR_FILES) {
      const fullPath = path.join(siblingGeneratorRoot, relPath);
      if (!fs.existsSync(fullPath)) {
        failures.push(`${fullPath}: generator template not found`);
        continue;
      }

      const text = readFile(fullPath);
      for (const check of WEBSITE_REQUIRED_SNIPPETS) {
        if (!check.test(text)) {
          failures.push(`${fullPath}: missing ${check.label}`);
        }
      }
    }
  } else {
    console.warn("[monitoring-audit] Skipping generator template audit because ../Investor_Anatomy_Code is not available.");
  }

  if (failures.length) {
    console.error("[monitoring-audit] Coverage audit failed:");
    for (const failure of failures) {
      console.error(` - ${failure}`);
    }
    process.exit(1);
  }

  console.log(`[monitoring-audit] Coverage audit passed for ${htmlFiles.length} HTML source pages.`);
}

main();
