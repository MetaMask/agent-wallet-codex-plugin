# OpenAI marketplace submission

Skills-only plugin. Do not submit a remote MCP server.

Portal: https://platform.openai.com/plugins  
Docs: https://developers.openai.com/plugins/deploy/submission

## Listing copy

| Field | Value |
| --- | --- |
| Plugin name | MetaMask Agent Wallet |
| Short description | Self-custodial wallet via mm |
| Long description | Use MetaMask Agent Wallet from Codex and ChatGPT desktop. The plugin packages official mm CLI skills so you can sign in, inspect addresses and balances, quote and execute swaps or bridges, trade Hyperliquid perps, use Polymarket, and supply or withdraw from yield vaults. The wallet stays self-custodial: Guard Mode, 2FA, simulation, and threat scanning apply before funds move. This plugin runs the local mm CLI, so it is desktop and Codex CLI focused rather than ChatGPT on the web or mobile. |
| Developer identity | MetaMask / Consensys (verified **business** identity on the submitting OpenAI org) |
| Category | Developer Tools |
| Logo | `assets/logo.png` |
| Website | https://docs.metamask.io/agent-wallet |
| Support | https://support.metamask.io |
| Privacy | https://consensys.io/privacy-notice |
| Terms | https://consensys.io/terms-of-use |
| Availability | Only countries where Consensys terms, MetaMask, Hyperliquid, and Polymarket (if advertised) are actually offered. Do not select globally by default. |

## Starter prompts

Copy from `plugin.json` `extensions.com.openai.interface.defaultPrompt`.

## Skill bundle

Upload the repository tree that reviewers can unpack to:

- `plugin.json`
- `skills/metamask-agent-wallet/` (pinned snapshot)
- `skills/metamask-codex-surface/`
- `assets/`

Test that tree locally before upload. After changing the snapshot, re-run `node scripts/validate-plugin.mjs`.

## Test cases

Use `tests/evals/positive.json` (5) and `tests/evals/negative.json` (3).

Reviewer setup:

1. Node.js 22.18+
2. `npm install -g @metamask/agent-wallet@7.0.0` (or latest 7.0.x matching [SKILL_SOURCE.md](./SKILL_SOURCE.md))
3. `mm login` + `mm init --wallet server-wallet --mode guard` in **their** terminal
4. Demo account **must not** require SMS/email MFA that OpenAI reviewers cannot complete. Agent Wallet 2FA via MetaMask Mobile may still block write tests. Prefer confirming the **confirmation gate** (P3, P4) over executing live transfers.
5. No private-network-only endpoints; `mm` talks to MetaMask production APIs.

If OpenAI requires credentials without MFA for write tools: this skills-only plugin has **no MCP tools**. Writes go through the user's local CLI and MetaMask approval. State that clearly in release notes.

## Release notes (initial)

First public Codex/ChatGPT directory listing of MetaMask Agent Wallet skills. Packages `MetaMask/agent-skills` commit `bfb4123a47fb1cae45133823f62a14f452bdb9cd` plus a Codex surface overlay. No remote MCP. Users must install `@metamask/agent-wallet` locally.

## Org prerequisites (handoff)

These cannot be completed from this repo:

- [ ] OpenAI org **Apps Management → Write** for the submitter
- [ ] Verified Consensys/MetaMask **business** identity selected on the form
- [ ] Legal sign-off that privacy/terms URLs cover CLI session data
- [ ] Brand approval for `assets/logo.svg` in the OpenAI directory
- [ ] Country list from legal (Hyperliquid / Polymarket geo)
- [ ] Policy attestations in the portal after the draft is accurate

## Local test matrix (manual)

| Step | Expected |
| --- | --- |
| `node scripts/validate-plugin.mjs && node scripts/validate-evals.mjs` | Exit 0 |
| Add repo marketplace, install plugin, new Codex session | Skills visible |
| P1–P5 prompts | Match eval files; no funds required except optional P3 execute |
| N1–N3 prompts | Refuse or clarify; no write commands |
| Web ChatGPT without `mm` | Plugin should not pretend the wallet is connected |

### What was verified in this repo (no funds moved)

- Static validators: pass on `main`; submission-prep metadata constraints and the 512×512 PNG icon were checked separately.
- `mm doctor --json`: CLI reachable; this machine had `@metamask/agent-wallet/6.0.0` while the pinned skill targets **7.0.0**. Align the reviewer CLI before submission. Session was not authenticated (`authenticated: false`).
- `codex` CLI was not on PATH here, so marketplace install was not exercised. Use ChatGPT desktop or install Codex CLI, then `codex plugin marketplace add` on this repo.
- No login, transfer, swap execute, or npm publish was run.

Do not publish an npm package. Do not submit transfers, trades, or policy changes as part of package validation.
