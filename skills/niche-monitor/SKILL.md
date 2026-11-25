---
name: niche-monitor
description: Use when the user wants ongoing research on a niche, topic, product category or competitors on TikTok, Reels and Shorts ("track this niche every week", "keep an eye on X for me", "send me a weekly digest", "alert me when something new breaks out", "set up always-on research"), wants this week's digest from a Virlo research agent they already have, or wants to change, pause or stop one. Sets up a Virlo research agent that collects fresh videos on the user's keywords on a schedule, only after the user approves the price, cadence and how to stop it, then writes a digest each run with what's new, what's still working, what faded, rising creators and sounds, and the 3 things to make this week. Reading an existing agent's results is free. Not for a one-time look at what's working now (niche-breakouts). $0.50 per run (about $2.15 a month weekly); always asked first.
license: MIT
allowed-tools: Bash(bash *virlo.sh *) Bash(jq *) Bash(date *) Read Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Niche monitor: a weekly TikTok trend digest for your niche

Library searches tell you what Virlo has already analysed. A research agent goes out and **collects fresh videos on your exact keywords, on a schedule**, and this skill turns each run into a short digest of what changed and what to make this week. It's the one skill that keeps spending by itself, so it always proposes first and only starts on a clear yes. Reading the results is free.

## When to use
- "Watch sensitive-skin content for me every week", "send me a weekly digest", "monitor my niche", "track these competitors' keywords"
- "Give me this week's digest from my research agent", "what did my agent find?"
- "Pause my monitor", "add a keyword", "make it daily"
- After a thin library result: niche-breakouts and local-scout replies carry a `next_step` with a one-time agent.

Not for: a one-time read of what's working now (→ niche-breakouts, about $0.25, nothing recurring).

## Before you start
1. **Use the data layer in the sibling folder `../virlo-api/`.** If it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`. Read `../virlo-api/SKILL.md` and `../virlo-api/references/house-rules.md` before the first call; `$S` means the path `<this skill's folder>/../virlo-api/scripts/virlo.sh`, always called as `bash $S …`, run from the user's project folder (never `cd` into the skill folder, so `virlo-research/` stays in their project). With no usable MCP and no key, use preview mode: show `samples/` labelled as a sample, plus the setup steps and this run's price.
2. **Read the brief** (`virlo-research/brief.md`): search words, competitors, avoid list, platforms, language. With no brief, offer brand-brief in one line and carry on.
3. **Check what already exists (free):** MCP `list_my_research`; HTTP `GET /v1/agents`. It lists agents made over the API and in the Virlo app. Also read `virlo-research/monitors.md` if it exists.
   - The user asked for a digest: go to **B**. Several agents? Use the one they name, else ask which. None? Say so and offer **A**.
   - An active recurring agent already covers this topic: say so and go to **B**; never create a second one.
   - Otherwise go to **A**.
4. **Creating bills by itself.** Nothing is created until the user says yes to the price per run, the cadence and monthly estimate, and how to stop it.

## Workflow

### A. Set up a monitor (asks first)
1. **Draft the agent:**
   - **name;**
   - **intent:** one concrete sentence covering the goal, niche, content type and exclusions. It drives the on-topic filter, so say what the videos are *for*;
   - **keywords:** 7–12 specific multi-word phrases for one concept. Draft them free with `POST /v1/agents/suggest-keywords` (`intent`, `platforms`) and keep the brief's search words;
   - **exclude_keywords:** single words for the other meaning, such as "makeup" when the topic is skincare. Never a word from the topic itself;
   - **platforms;** **english_only:** true by default; false for other languages, with the keywords written in that language;
   - **cadence:** weekly by default (`daily`, `weekly` or `monthly`);
   - **autopilot:** on by default. After each run it rewords searches and adds up to 15 keywords. It never removes the user's keywords and adds no charge.
2. **Propose it in plain words** (Output below).
   - **Price:** $0.50 per run. Data Intelligence adds $1.00 a run; Meta ads collection is free but runs take up to 45 minutes. Never switch either on unasked.
   - **Monthly estimate:** weekly is 4–5 runs, about $2.15; daily about $15; monthly $0.50.
   - **Timing:** the first run starts at once; it and its report take about 10–25 minutes.
   - **How to stop:** say "pause" or "delete my <name> monitor". Pause: MCP `update_agent` (set it inactive); HTTP `PUT /v1/agents/{id}` with `{"active": false}`. Delete: MCP `delete_agent`; HTTP `DELETE /v1/agents/{id}`.
   - **For a one-off,** offer a one-time run ($0.50, `is_recurring: false`) instead.
   - With MCP, `create_research_agent` without `user_approved` returns Virlo's own proposal. Show it.
3. **On a clear yes,** create it.
   - MCP: `create_research_agent` with `user_approved: true`.
   - HTTP: `POST /v1/agents` with `is_recurring: true`, `cadence`, `intent`, `keywords`, `exclude_keywords`, `platforms`, `english_only` and `autopilot`.
   - Add a row to `virlo-research/monitors.md`: name, id, created date, cadence, price a run, the stop command.
   - Tell the user how the digest arrives: Virlo runs the agent on its cadence by itself; the digest is written when they ask ("this week's digest for <name>"). If their app can run scheduled prompts, suggest scheduling that line for the day after each run.
4. **The first digest:** poll `GET /v1/agents/{id}` (free) for up to about 3 minutes. Not finished? Give the id and say to ask for the digest in about 10–25 minutes from the start.

### B. Write the digest (free reads)
1. **Read the run (all free):**
   - **Overview:** MCP `get_agent_report` / `get_agent_data`; HTTP `GET /v1/agents/{id}/summary`: state, the latest run's counts, top creators, trend themes and the analysis headline.
   - **Detail:** `GET /v1/agents/{id}/trends/latest`, `GET /v1/agents/{id}/analysis/latest`, `GET /v1/agents/{id}/creators/outliers`, `GET /v1/agents/{id}/sounds`, `GET /v1/agents/{id}/videos` (`start_date` = the last run's window, `order_by: views`), and `GET /v1/agents/{id}/activity` for what autopilot changed.
   - Ranked hooks (`GET /v1/agents/{id}/hooks`) are free with Data Intelligence and $0.25 without: say the price before reading them.
   - **Breakout index on the agent's own videos (free):** `POST /v1/search/videos` with `scope: agent` and `agent_id`, once as is and once with `outliers_only: true`. Search in an agent's scope is free, and each reply's `overview` counts formats and hook types across every match. Work out each format's and hook type's index and trend label from the two overviews (`../virlo-api/references/method.md` §4); pass `posted_after` for this run's window and run it again for the window before, for the trend.
2. **Start from the agent's own analysis** (the summary's analysis highlight and `analysis/latest`): quote its headline finding, and say where your read differs.
3. **Compare with the last digest:** the newest `virlo-research/*-niche-monitor-<slug>.md`. No earlier digest means this run is the baseline: say so.
4. **The digest's sections:**
   - **New:** trends, formats, hooks and creators not in the last digest.
   - **Still working:** what was there last time too.
   - **Faded:** in the last digest, missing or much smaller now.
   - **Rising creators and sounds.** The agent's creator outlier ratio is views against followers, not an N× outlier from the creator's own posts: label it "views vs followers". Sounds carry no commercial-use clearance here; point brands to sound-scout.
   - **Autopilot changes.**
   - **Make this week (up to 3):** each built on a pattern that qualifies under `../virlo-api/references/method.md` §8 on the breakout index above (over and not crowded, or new or climbing and not under), or on a trend the agent marks new, citing its videos and numbers, written for the account in the brief or the agent's intent. Fewer pass? Give fewer and say so.
5. **Keep it honest:**
   - A run with few videos says so.
   - When the run's top videos are older than the cadence window, say so in the one-line summary: they were collected this run, not posted this week.
   - Never predict what an agent will collect from library counts. Give the library count as library, and let the first run show the yield.
   - A run still in progress gets checked once and then reported as pending, with its id.

### C. Change, pause or stop (free)
- `PUT /v1/agents/{id}` (MCP `update_agent`) with only the fields that change: `keywords` (replaces the whole list), `cadence`, `active`. Pausing and deleting need no price check; turning an agent back on or making it run more often does.
- Update `virlo-research/monitors.md` and confirm in one line, with the new monthly estimate.

## Output

**Setup (in chat, before anything is created):**
```
Proposed: a weekly research agent "<name>" on <n> keywords (<examples>), <platforms>.
Intent: <one sentence: goal, niche, content type, exclusions>
Excluding: <words, or none>
Cost: $0.50 a run, about $2.15 a month. First results in about 10–25 minutes.
Your digest: Virlo collects <weekly> by itself; to get the digest, ask "this week's digest for <name>" (free), or schedule that prompt if your app can run scheduled tasks.
Stop any time: say "pause my <name> monitor".
Create it? (Nothing happens until you say yes.)
```

**Each digest** (`virlo-research/<YYYY-MM-DD>-niche-monitor-<slug>.md`):
```markdown
# <name> · week of <date> · run <n>

**This week in one line:** …

## Make this week
1. <what to make>: built on <trend or pattern> (<n> videos, <views>), e.g. [<@handle>](<url>)
2. …

## New this week
## Still working
## Faded
## Rising creators and sounds
## Autopilot changes
## Sources
| Video | Platform | Creator | Views | Posted | Link |

**Agent:** <id> · <cadence> · $0.50 a run · stop: <command>
**Method · Spend**
```

## Rules
- Never create, re-enable or change the cadence of an agent without a clear yes to the price. Say the monthly estimate.
- Never create a second agent on a topic one already covers; read the existing one.
- Every digest ends with the stop command.
- Never switch on Data Intelligence (+$1.00 a run) or Meta ads collection unasked.
- The digest uses only the agent's own data and the user's saved digests. Library numbers are labelled as library.

## Next
- → Dig into a breakout from the digest: video-teardown
- → Turn the week's findings into posts: content-ideas
- → Write the scripts for this week's picks: script-writer
