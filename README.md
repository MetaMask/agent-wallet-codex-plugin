# MetaMask Agent Wallet for Codex

Official skills-only plugin that teaches Codex how to drive the MetaMask Agent Wallet CLI (`mm`). The wallet remains self-custodial. Guard Mode, 2FA, simulation, and threat scanning still apply before funds move.

The CLI skill is a **pinned snapshot** of [`MetaMask/agent-skills`](https://github.com/MetaMask/agent-skills). Skill docs are not authored in this repository. See [SKILL_SOURCE.md](./SKILL_SOURCE.md).

## What it does

After `mm` is installed and signed in, you can ask Codex to:

- Check CLI health with `mm doctor`
- Show the active address and balances
- Transfer native tokens or ERC-20s
- Quote, then execute, swaps and bridges
- Trade Hyperliquid perps (quote / dry-run first)
- Search, quote, and trade Polymarket
- Supply or withdraw from yield vaults
- Decode unfamiliar calldata before signing

## Surfaces

This plugin runs **local `mm`**. Use it from:

- Codex CLI (`/plugins`)
- Codex in the ChatGPT desktop app

It is not a remote MCP server. ChatGPT on the web, ChatGPT mobile, and the Codex IDE extension cannot execute `mm` on your machine.

## Requirements

- Node.js **22.18** or later
- `@metamask/agent-wallet` matching the pinned skill `cliVersion` (currently **7.0.0** major.minor)
- A MetaMask Agent Wallet account (Google, email, or MetaMask Mobile QR)

```bash
npm install -g @metamask/agent-wallet@latest
mm doctor
```

Do not paste mnemonics, passwords, or CLI tokens into chat. Set `MM_MNEMONIC` / `MM_PASSWORD` in your own terminal, or complete `mm login` in the CLI.

## Local install (authoring)

Repo marketplace:

```bash
codex plugin marketplace add /path/to/agent-wallet-codex-plugin
# or from this repo after restarting ChatGPT desktop / Codex:
# marketplace file is .agents/plugins/marketplace.json
```

Then install `metamask-agent-wallet` from that marketplace and start a **new** session.

Personal marketplace alternative: copy this folder to `~/.codex/plugins/metamask-agent-wallet` and point `~/.agents/plugins/marketplace.json` at it. See [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins).

## Public listing

Public directory listing goes through the [OpenAI plugin submission portal](https://platform.openai.com/plugins) as a **skills-only** plugin. Materials are in [SUBMISSION.md](./SUBMISSION.md).

## Validate this package

```bash
node scripts/validate-plugin.mjs
```

## License

MIT. Fox logo from the official Agent Wallet skill repository.
