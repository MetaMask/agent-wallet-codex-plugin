#!/usr/bin/env node
/**
 * Static checks for the Codex plugin package. Does not call mm or move funds.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}

function warn(msg) {
  warnings.push(msg);
}

function readJson(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    fail(`missing ${rel}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (err) {
    fail(`${rel} is not valid JSON: ${err.message}`);
    return null;
  }
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function walkMarkdown(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) walkMarkdown(next, acc);
    else if (entry.name.endsWith(".md")) acc.push(next);
  }
  return acc;
}

const plugin = readJson("plugin.json");
if (plugin) {
  if (plugin.$schema !== "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json") {
    fail("plugin.json must declare Agent Plugins 1.0 schema");
  }
  if (plugin.name !== "metamask-agent-wallet") fail("plugin.json name must be metamask-agent-wallet");
  if (!plugin.version) fail("plugin.json missing version");
  if (!plugin.description) fail("plugin.json missing description");
  const iface = plugin.extensions?.["com.openai"]?.interface;
  if (!iface) fail("plugin.json missing extensions.com.openai.interface");
  else {
    for (const key of [
      "displayName",
      "shortDescription",
      "longDescription",
      "developerName",
      "category",
      "websiteURL",
      "privacyPolicyURL",
      "termsOfServiceURL",
      "logo",
    ]) {
      if (!iface[key]) fail(`interface missing ${key}`);
    }
    if (!Array.isArray(iface.defaultPrompt) || iface.defaultPrompt.length < 3) {
      fail("interface.defaultPrompt needs at least 3 starter prompts");
    }
    if (iface.logo && !exists(iface.logo.replace(/^\.\//, ""))) fail(`logo not found: ${iface.logo}`);
    if (iface.composerIcon && !exists(iface.composerIcon.replace(/^\.\//, ""))) {
      fail(`composerIcon not found: ${iface.composerIcon}`);
    }
  }
}

const overlay = readJson(".codex-plugin/plugin.json");
if (overlay && overlay.name !== "metamask-agent-wallet") {
  fail(".codex-plugin/plugin.json name mismatch");
}

const market = readJson(".agents/plugins/marketplace.json");
if (market) {
  if (!market.plugins?.length) fail("marketplace.json has no plugins");
  const entry = market.plugins[0];
  if (entry?.name !== "metamask-agent-wallet") fail("marketplace plugin name mismatch");
  if (!entry?.policy?.installation || !entry?.policy?.authentication || !entry?.category) {
    fail("marketplace entry missing policy.installation, policy.authentication, or category");
  }
}

for (const rel of [
  "skills/metamask-agent-wallet/SKILL.md",
  "skills/metamask-codex-surface/SKILL.md",
  "SKILL_SOURCE.md",
  "UPSTREAM.md",
  "README.md",
  "SUBMISSION.md",
  "assets/logo.svg",
  "LICENSE",
]) {
  if (!exists(rel)) fail(`missing ${rel}`);
}

const skillMd = path.join(root, "skills/metamask-agent-wallet/SKILL.md");
if (fs.existsSync(skillMd)) {
  const text = fs.readFileSync(skillMd, "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) fail("metamask-agent-wallet SKILL.md missing frontmatter");
  else {
    if (!/name:\s*metamask-agent-wallet/.test(fm[1])) fail("skill name mismatch");
    if (!/cliVersion:\s*"?[\d.]+/.test(fm[1])) fail("skill missing cliVersion");
  }

  const skillRoot = path.join(root, "skills/metamask-agent-wallet");
  const mdLinks = [...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((m) => m[1]);
  for (const href of mdLinks) {
    if (!href.endsWith(".md")) continue;
    if (href.startsWith("http")) continue;
    const target = path.normalize(path.join(skillRoot, href));
    if (!target.startsWith(skillRoot)) fail(`link escapes skill root: ${href}`);
    else if (!fs.existsSync(target)) fail(`broken skill link: ${href}`);
  }

  const refs = walkMarkdown(path.join(skillRoot, "references"));
  const workflows = walkMarkdown(path.join(skillRoot, "workflows"));
  if (refs.length < 10) fail(`expected many reference files, found ${refs.length}`);
  if (workflows.length < 5) fail(`expected workflow files, found ${workflows.length}`);

  const requiredRules = [
    "mm doctor",
    "Confirmation Requirements",
    "Credential Safety",
    "MM_PASSWORD",
    "MM_MNEMONIC",
  ];
  for (const rule of requiredRules) {
    if (!text.includes(rule)) fail(`pinned SKILL.md missing expected rule text: ${rule}`);
  }
}

const overlayMd = path.join(root, "skills/metamask-codex-surface/SKILL.md");
if (fs.existsSync(overlayMd)) {
  const text = fs.readFileSync(overlayMd, "utf8");
  if (!text.includes("--json")) fail("codex overlay must prefer --json");
  if (!text.includes("--yes")) fail("codex overlay must constrain --yes");
  if (!/paste into the conversation/i.test(text) && !/out of chat/i.test(text)) {
    fail("codex overlay must forbid pasting secrets into chat");
  }
}

const secretNeedles = [
  /paste (your )?(mnemonic|seed phrase|private key)/i,
  /send me (your )?(mnemonic|private key|cli token)/i,
];
for (const file of walkMarkdown(path.join(root, "skills/metamask-codex-surface"))) {
  const text = fs.readFileSync(file, "utf8");
  for (const re of secretNeedles) {
    if (re.test(text)) fail(`${path.relative(root, file)} asks user to paste secrets`);
  }
}

const source = exists("SKILL_SOURCE.md") ? fs.readFileSync(path.join(root, "SKILL_SOURCE.md"), "utf8") : "";
if (source && !/bfb4123a47fb1cae45133823f62a14f452bdb9cd/.test(source)) {
  warn("SKILL_SOURCE.md pin SHA may be stale relative to validator expectation");
}

if (warnings.length) {
  console.log("warnings:");
  for (const w of warnings) console.log(`- ${w}`);
}
if (errors.length) {
  console.error("validate-plugin failed:");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log("validate-plugin: ok");
