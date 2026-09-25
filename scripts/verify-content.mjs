// Guards against invented project content: every feature item shown on the
// site must be an exact (case-insensitive) excerpt of that project's original
// long description, and every project must have an entry.
import { readFileSync } from "node:fs";

const source = JSON.parse(readFileSync("legacy/content-extracted.json", "utf8"));
const details = JSON.parse(readFileSync("src/content/projectDetails.json", "utf8"));
const problems = [];

for (const p of source.projects) {
  const groups = details[p.id];
  if (!Array.isArray(groups)) {
    problems.push(`${p.id}: missing entry`);
    continue;
  }
  const haystack = p.longDescription.toLowerCase();
  for (const g of groups) {
    for (const item of g.items) {
      if (!haystack.includes(item.toLowerCase())) problems.push(`${p.id}: "${item}" is not in the original description`);
    }
  }
}
for (const id of Object.keys(details)) {
  if (!id.startsWith("_") && !source.projects.some((p) => p.id === id)) problems.push(`${id}: unknown project`);
}

if (problems.length) {
  console.error("Content check failed:\n  " + problems.join("\n  "));
  process.exit(1);
}
const count = Object.values(details).flat().reduce((n, g) => n + (g.items?.length ?? 0), 0);
console.log(`Content check passed: ${count} feature items, all verbatim from the original descriptions.`);
