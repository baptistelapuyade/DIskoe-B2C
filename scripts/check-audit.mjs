#!/usr/bin/env node
// Fails on high/critical npm audit advisories unless an entry in
// .github/audit-allowlist.json accepts that exact advisory, package and
// install path, and the entry has not expired. Expired entries fail too,
// so every accepted risk gets revisited.
//
// Usage: node scripts/check-audit.mjs [--input audit.json]

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BLOCKING = new Set(["high", "critical"]);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readAudit() {
  const inputFlag = process.argv.indexOf("--input");
  if (inputFlag !== -1) {
    return readFileSync(process.argv[inputFlag + 1], "utf8");
  }
  try {
    return execFileSync("npm", ["audit", "--json"], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    // npm audit exits non-zero when it finds anything; JSON is on stdout.
    if (error.stdout) return error.stdout;
    throw error;
  }
}

export function collectFindings(report) {
  if (!report || typeof report.vulnerabilities !== "object") {
    const detail = JSON.stringify(report?.error ?? report);
    throw new Error(`Unexpected npm audit output: ${detail.slice(0, 500)}`);
  }
  const findings = [];
  for (const [pkg, vuln] of Object.entries(report.vulnerabilities)) {
    for (const via of vuln.via ?? []) {
      if (typeof via !== "object" || !BLOCKING.has(via.severity)) continue;
      const ghsa = via.url?.match(/GHSA-[\w-]+/)?.[0];
      findings.push({
        advisory: ghsa ?? `npm-${via.source}`,
        package: via.name ?? pkg,
        severity: via.severity,
        title: via.title ?? "",
        range: via.range ?? "",
        nodes: vuln.nodes ?? [],
      });
    }
  }
  return findings;
}

function describe(entry) {
  return `${entry.advisory} (${entry.package})`;
}

export function evaluate(findings, allowlist, today) {
  const errors = [];
  const accepted = [];
  const used = new Set();

  for (const entry of allowlist) {
    const complete =
      entry.advisory && entry.package && entry.expires && entry.reason;
    if (!complete) {
      errors.push(`Allowlist entry is incomplete: ${JSON.stringify(entry)}`);
    } else if (entry.expires < today) {
      errors.push(
        `Allowlist entry ${describe(entry)} expired on ${entry.expires}; ` +
          "re-assess and renew or remove it.",
      );
    }
  }

  for (const finding of findings) {
    const entry = allowlist.find(
      (candidate) =>
        candidate.advisory === finding.advisory &&
        candidate.package === finding.package &&
        candidate.expires >= today &&
        finding.nodes.every((node) => (candidate.paths ?? []).includes(node)),
    );
    if (entry) {
      used.add(entry);
      accepted.push(finding);
      continue;
    }
    const where = finding.nodes.join(", ") || "(unknown path)";
    errors.push(
      `${finding.severity.toUpperCase()} ${finding.advisory} in ` +
        `${finding.package} ${finding.range} at ${where}: ${finding.title}`,
    );
  }

  const unused = allowlist.filter((entry) => !used.has(entry));
  return { errors, accepted, unused };
}

function main() {
  const report = JSON.parse(readAudit());
  const allowlistPath = join(root, ".github/audit-allowlist.json");
  const allowlist = JSON.parse(readFileSync(allowlistPath, "utf8")).entries;
  const today = new Date().toISOString().slice(0, 10);
  const findings = collectFindings(report);
  const { errors, accepted, unused } = evaluate(findings, allowlist, today);

  for (const finding of accepted) {
    const where = finding.nodes.join(", ");
    console.log(
      `accepted (allowlisted): ${finding.severity} ${finding.advisory} ` +
        `in ${finding.package} at ${where}`,
    );
  }
  for (const entry of unused) {
    console.warn(
      `warning: allowlist entry ${describe(entry)} matches no finding; ` +
        "remove it.",
    );
  }
  if (errors.length > 0) {
    console.error(`npm audit gate failed:\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  console.log("npm audit gate passed: no unaccepted high/critical advisories.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
