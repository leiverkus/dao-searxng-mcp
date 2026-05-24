#!/usr/bin/env node
// Run the test suite with Node's built-in coverage reporter and fail if the
// overall line coverage is below MIN_LINES (default 30). Avoids c8 so we don't
// depend on its yargs CJS shim, which breaks on bleeding-edge Node releases.

import { spawnSync } from "node:child_process";

const MIN_LINES = Number(process.env.MIN_LINES || 30);

const result = spawnSync(
  process.execPath,
  ["--test", "--experimental-test-coverage", "test/*.test.js"],
  { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], shell: false }
);

const output = result.stdout || "";
process.stdout.write(output);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

// Parse "ℹ all files             |  59.56 |    79.22 |   78.95 |"
const match = output.match(/^\D*all files\s*\|\s*([\d.]+)\s*\|/m);
if (!match) {
  console.error("check-coverage: could not parse 'all files' line from coverage output");
  process.exit(1);
}

const linePct = Number(match[1]);
if (linePct < MIN_LINES) {
  console.error(`check-coverage: line coverage ${linePct}% is below threshold ${MIN_LINES}%`);
  process.exit(1);
}

console.log(`check-coverage: line coverage ${linePct}% meets threshold ${MIN_LINES}%`);
