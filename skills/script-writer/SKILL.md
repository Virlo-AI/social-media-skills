---
name: script-writer
description: "Use when the user wants a script, voiceover, shot list, storyboard, talking points or timings for a TikTok, Reel or Short, asks what exactly to say or show on camera, or wants a content idea, hook or viral video turned into something they can film (\"write a 30 second TikTok about our new serum\"). Use it even for a quick one-off script about their product, so the script is modelled on a real breakout instead of made up. Writes shoot-ready scripts, each modelled on one cited outlier video (its timed transcript when it has speech), with second-by-second beats, on-screen text, a shot list, caption, hashtags, the comment to invite, a claims check, and brackets for facts only the user can supply. Not for choosing what to make (content-ideas) or opening lines only (hook-bank). About $0.01 a script; free when the source was already read; about $0.07 when it has to find a source first."
license: MIT
allowed-tools: Bash(bash *virlo.sh* *) Bash(jq *) Bash(date *) Read Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Script writer: TikTok scripts modelled on real breakouts

A script that works borrows a structure that already worked, not someone's words. Each script here is modelled on **one** cited video:
- its timing, from the timed transcript when it has speech;
- its beats and its kind of opening;
- rewritten for the user's account, voice and what they can film.

## When to use
- "Write me a script for…", "turn this idea into a video", "give me a shot list", "what do I say?"
- After content-ideas, hook-bank or video-teardown.

Not for: choosing what to make (→ content-ideas) or opening lines only (→ hook-bank).

## Before you start
1. **Load the data layer.** It's the sibling folder `../virlo-api/`, installed alongside this skill. If it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`. Read `../virlo-api/SKILL.md` (data path, setup, errors) and `../virlo-api/references/house-rules.md` before the first call. `$S` in any command below means `<this skill's folder>/../virlo-api/scripts/virlo.sh`, run as `bash <this skill's folder>/../virlo-api/scripts/virlo.sh …` from the user's project folder (never `cd` into the skill folder, so `virlo-research/` stays in their project). With no MCP and no key, use preview mode: show `samples/` labelled as a sample, plus the setup steps.
2. **Read `virlo-research/brief.md`:** voice, who's on camera, what they can film, the avoid list, and claims the brand can and can't make (regulated categories: skincare, finance, health).
3. **Get the source video for each script.**
   - It comes from the idea's "built on" line, a hook-bank source or a teardown.
   - **With no source,** find one ($0.06 to $0.08): one library search (`POST /v1/search/videos` with `scope: virlo_library`, which is required; MCP `find_videos`) with the product's topic in 2 to 4 words, the last 90 days, `outliers_only: true`, `sort: most_viral`, `platforms` as one platform or all (with several in the brief, search all and keep the brief's platforms from the page yourself, and say so; never pass a 2- or 3-item list) (no `looks_like` unless the user asked for a look in this request; what they can film only decides which source you pick). Label the page's videos on or off brief (`description`, `intelligence.summary`); with fewer than 4 on-brief, say so. Sort the page by `virality_score` (it comes back ranked by topic match too) and take the top on-brief, organic video (not `is_paid`; if the user named a length, one whose `duration` is within 20% of it) and measure it on one page of its creator's posts (`GET /v1/raw/{platform}/creator/{handle}/videos`, $0.01; outlier as in `../virlo-api/references/method.md` §1). If it isn't measurable, take the next one or cite its Virality Score instead.
   - Prefer a source the user can film with their own product and setup (a homemade recipe doesn't carry to a packaged bar), and one with a transcript or readable on-screen text. With neither, say which beats are inferred.
4. **Say the price in a reply to the user,** before the first paid call: "a transcript for each source at $0.01. Sources already read this week are free." Add the search and creator check when there's no source: about $0.07.

## Workflow
1. **The source's structure.**
   - **With speech:** MCP `raw_transcript`; HTTP `GET /v1/raw/{platform}/video/transcript`. Instagram transcripts may come back empty; if so, use `visual_format` and `setting` from Virlo's `intelligence`, and label the beats estimated. Prefer a TikTok or YouTube source when the user wants spoken lines.
   - **Split it into beats** from `segments` (`start_seconds`, `end_seconds`, `text`): the hook (about 0 to 3 s), the setup, each turn or list item, the payoff, the ending. Time each beat from its own segments. If `segments` is null, use `text` and the video's length, and label the timings "estimated".
   - **With no speech** (`has_transcript: false`): use the caption, Virlo's `intelligence` (`summary`, `hook_text`, `visual_format`, `setting`) and the length. Say it's built from those.
   - **Note the length,** and whether the hook is spoken, on-screen text or both.
2. **One script per source.** Keep the source's length (±20%) and beat order; replace every line.
   - **How many:** as many as the user asked for, one by default. A list idea ("3 mistakes") is one script with a beat per item. Name a runner-up source in one line instead of writing a second script.
   - Answer something the audience asked, if an audience-voice report exists.
3. **Each script has:**
   - **The beat table:** time, on screen (8 words or fewer), voice or action, shot.
   - **A numbered shot list:** framing, props, light and location.
   - **Caption:** one line, plus 3–5 hashtags taken from the source and the niche.
   - **The comment loop:** what the ending invites people to comment, and the reply video it sets up.
   - **The claims check:** each claim, and whether it's the user's fact (a bracket) or safe as written. In skincare, finance and health, never write a result, cure or return as fact.
     - Bracket any product attribute the demo depends on (texture, bend, size, melt), and flag every comparison with other products ("most bars…") as needing backing.
4. **Don't-copy note:** list the source's personal details, exact lines and signature bits that stay with the source.
5. **Two other openings to test** (free): if a hook-bank report exists, add 2 alternative first lines from its six, of a different hook type from the script's. Otherwise skip this.

## Output

**In chat:**
```
<n> scripts, each modelled on a breakout:
1. <title> (<length>), built on @<handle> (<n>× outlier)
…
<script 1's beat table in full, so they can film from the chat>
Report: virlo-research/<date>-script-writer-<slug>.md · Spent $<x>
```

**The report** (`virlo-research/<YYYY-MM-DD>-script-writer-<slug>.md`):
```markdown
# Scripts: <account> · <date>

## 1. <title> · <length> · <format>
**Built on:** [@handle](link), <n>× outlier. **What we borrow:** <the structure, in one line>

| Time | On screen | Voice / action | Shot |

**Shot list:** 1. … 2. …
**Caption:** … **Hashtags:** …
**Comment loop:** …
**Claims check:** …
**Don't copy:** …
**Other openings to test:** … (only with a hook-bank report)

## Sources
**Method · Spend**
```

## Rules
- One source per script and one script per source, cited with its outlier or Virality Score.
- New words only. The structure is borrowed; the lines are original. After writing, check every spoken line against the source transcript: rewrite any line that shares 4 or more words in a row or the same sentence frame, and never use a line you listed under Don't copy.
- Brackets for every fact only the user has: numbers, results, customer names, prices.
- No invented testimonials, results or before/afters. A before/after script needs real footage, shot in the same light and from the same angle.
- Keep the source's length unless the user asks otherwise.

## Next
- → Get more openings to test: hook-bank
- → After posting, see how it did: launch-monitor
