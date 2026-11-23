# Authoring rules

These rules apply to anyone, person or agent, adding or changing a skill in this repo.

## Layout
- One folder per skill: `skills/<name>/SKILL.md`. The folder name and the `name:` field are the same lowercase kebab-case word.
- `skills/virlo-api/` is the data layer: setup, the helper script, every endpoint, costs, the research method (`references/method.md`) and the house rules (`references/house-rules.md`). Every workflow skill says to use it, and never repeats its tables.
- Each workflow skill has `samples/<niche>.md`: one or two real reports from real runs. Preview mode shows these when there's no key, so they must be real.
- `npx skills` can install a single skill, so a skill folder must make sense on its own, apart from its pointer to `virlo-api`.

## Frontmatter
```yaml
---
name: niche-breakouts
description: Use when the user wants … (one or two sentences: the jobs, the trigger words people say, and what they get; <= 1024 chars)
license: MIT
allowed-tools: Bash, Read, Write, WebFetch
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---
```

## Body of a workflow skill (these sections, in this order)
1. `# Title` plus one short paragraph: what the person gets.
2. `## When to use`: the asks that should trigger it, and the near-misses that belong to another skill.
3. `## Before you start`: use `virlo-api`, read the brief, state the plan and price. Give the typical cost.
4. `## Workflow`: numbered steps with the exact calls, inputs, thresholds and how to read the result.
5. `## Output`: the report template, written to `virlo-research/<date>-<skill>-<slug>.md`.
6. `## Rules`: guardrails specific to this skill.
7. `## Next`: up to three "→ " hand-offs to other skills.

Keep a skill under about 200 lines, in plain words. Put long tables in `references/`.

## Research quality (non-negotiable)
- Measure the way `skills/virlo-api/references/method.md` says. If a skill needs a different threshold, say why in the skill.
- **Never publish scoring math.** Describe a score by what it means ("how many times more views the video got than its creator normally gets", said as "N× outlier"), never its formula or exact calculation. Reading bands (3× breakout, 35+ exceptional) are fine.
- **Never invent** a number, creator, video, comment, trend or date.
  - Samples are copied from real runs, with the date they ran.
  - Example prompts in docs may be made up; example *results* may not.
- **Every paid step has a cost** in the skill. Anything over $1 or recurring asks first.
- Cite public posts and public creators only. Never build a profile of a private person, and never use places to track where someone is.

## Endpoints
- Write endpoints as `METHOD` plus the full path (e.g. `GET /v1/hooks/search`). The validator checks every one against the live spec.
- `skills/virlo-api/references/endpoints.md` and `fields.md` are generated: run `node scripts/gen-reference.mjs`. Don't edit them by hand.
  - A new endpoint's price goes in `COSTS` in that script.
- Never use deprecated or undocumented routes.

## Before you commit
```bash
node scripts/validate.mjs
node scripts/gen-reference.mjs --check
node evals/check-samples.mjs   # sample reports: handles match links, no personal data, Method + Spend present
node evals/check-links.mjs <report.md> <run>/virlo-research/.cache   # optional, when you add a sample and still have its run's cache: every video link must come from a saved reply
claude plugin validate .   # if you have Claude Code; one expected warning: the root CLAUDE.md is for people working in this repo, not plugin context
```

## Trigger evals (when you change a description or add a skill)
`evals/triggers.jsonl` holds realistic requests, each with the skill that should answer it; "none" means no Virlo skill should fire.
- **Add a skill:** add at least 3 prompts for it, including one that sits close to a neighbouring skill.
- **Run them:**
```bash
node evals/gen-trigger-cases.mjs
claude plugin eval . --tag trigger --runs 1 --ablation none --no-publish --trust-plugin --model sonnet -j 4 --max-cost-usd 6 --threshold 0
```
- **What a run is:** each case is one headless Claude run on your own account, about $0.05–0.11 of model usage. It makes no Virlo calls, because the plugin's MCP server isn't started without a mock.
- **The target:** 90% or more of cases pass.
  - One run per case moves by a case or two between runs. For a steadier number use `--runs 3`, which costs three times as much.
- **When a case misses with "Skill called 0x",** the model answered the request itself. Say in the description that the skill is for that ask even when it's quick, and why (the answer is built on real breakouts). Don't add a new trigger word for every miss.

Release quality is checked by the Virlo team on live data.
