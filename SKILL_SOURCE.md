# Skill snapshot provenance

The files under `skills/metamask-agent-wallet/` are a **pinned copy** of the official skill. Do not edit them in this repo.

| Field | Value |
| --- | --- |
| Source repository | https://github.com/MetaMask/agent-skills |
| Source path | `skills/metamask-agent-wallet/` |
| Pinned commit | `bfb4123a47fb1cae45133823f62a14f452bdb9cd` |
| Commit date | 2026-09-16 |
| Commit subject | Update SKILLs for v6.2.0 (#51) |
| Skill `metadata.version` | 7.7.0 |
| Skill `metadata.cliVersion` | 7.0.0 |
| Compatible CLI | `@metamask/agent-wallet@7.0.0` (major.minor) |
| Node.js | 22.18 or later |

Refresh the snapshot:

```bash
git clone --depth 1 https://github.com/MetaMask/agent-skills.git /tmp/agent-skills
rsync -a --delete /tmp/agent-skills/skills/metamask-agent-wallet/ ./skills/metamask-agent-wallet/
# then update this file with the new SHA, date, and cliVersion from SKILL.md frontmatter
```

Skill-level fixes (routing, confirmation, secrets, command drift) belong in `MetaMask/agent-skills`. Codex-only constraints live in `skills/metamask-codex-surface/`.
