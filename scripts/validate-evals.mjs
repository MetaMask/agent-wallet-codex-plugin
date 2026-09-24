#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evalsDir = path.join(root, "tests/evals");
const errors = [];

function load(name) {
  const full = path.join(evalsDir, name);
  if (!fs.existsSync(full)) {
    errors.push(`missing tests/evals/${name}`);
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (err) {
    errors.push(`${name} is not valid JSON: ${err.message}`);
    return [];
  }
}

const positive = load("positive.json");
const negative = load("negative.json");

if (positive.length < 5) errors.push(`need at least 5 positive cases, found ${positive.length}`);
if (negative.length < 3) errors.push(`need at least 3 negative cases, found ${negative.length}`);

const ids = new Set();
function checkCase(kind, item, i) {
  const prefix = `${kind}[${i}]`;
  for (const key of ["id", "prompt", "expectedSkill", "expectedBehavior", "expectedResultShape"]) {
    if (!item[key]) errors.push(`${prefix} missing ${key}`);
  }
  if (item.id) {
    if (ids.has(item.id)) errors.push(`duplicate id ${item.id}`);
    ids.add(item.id);
  }
  if (kind === "positive" && !item.fixtures) errors.push(`${prefix} missing fixtures`);
  if (kind === "negative" && !item.whyNot) errors.push(`${prefix} missing whyNot`);
}

positive.forEach((item, i) => checkCase("positive", item, i));
negative.forEach((item, i) => checkCase("negative", item, i));

if (errors.length) {
  console.error("validate-evals failed:");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(`validate-evals: ok (${positive.length} positive, ${negative.length} negative)`);
