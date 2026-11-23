---
name: content-ideas
description: "Use when the user asks what to post next, what to make this week, wants video or post ideas, a content plan, a content calendar or a week of posts for TikTok, Reels or Shorts, or says they're stuck or out of ideas in their niche (\"plan next week's TikToks for my bakery\", \"give me 5 ideas based on what's working\"). Use it even for a quick ask, so every idea stands on real breakouts instead of guesswork. Gives up to five original ideas for the user's brand or account, each built on named outlier videos (outlier, from Virlo data) and a pattern that over-performs and isn't crowded, with why now, why it works, a 3-shot plan, an opening line and which to post first. Says how many ideas passed the checks. Not for this week's memes (trend-radar), opening lines only (hook-bank) or a full script (script-writer). Reuses a recent niche-breakouts run for free; otherwise runs one (about $0.25)."
license: MIT
allowed-tools: Bash, Read, Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Content ideas: what to post on TikTok, Reels and Shorts next

Ideas are cheap; ideas built on proof aren't. Every idea here stands on:
- named outlier videos (measured against each video's own creator);
- a pattern that over-performs and isn't crowded.

Each one is rewritten for the user's own account. When fewer than five pass, you get fewer, and the report says so.

## When to use
- "What should I post?", "give me video ideas", "plan next week's TikToks", "content calendar for this month", "I'm out of ideas"
- After niche-breakouts or trend-radar, to turn findings into posts.

Not for: the opening line alone (→ hook-bank), a full script (→ script-writer), this week's memes (→ trend-radar).

## Before you start
1. **Load the data layer.** It's the sibling folder `../virlo-api/`, installed alongside this skill. If it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`. Read `../virlo-api/SKILL.md` (data path, setup, errors) and `../virlo-api/references/house-rules.md` before the first call. `$S` in any command below means `<this skill's folder>/../virlo-api/scripts/virlo.sh`, run as `bash <this skill's folder>/../virlo-api/scripts/virlo.sh …` from the user's project folder (never `cd` into the skill folder, so `virlo-research/` stays in their project). With no MCP and no key, use preview mode: show `samples/` labelled as a sample, plus the setup steps.
2. **Read `virlo-research/brief.md`:** who it's for, what they can film, voice, avoid list, platforms. Ideas the user can't film are useless. If the brief doesn't say what they can film, assume one person with a phone in their own space, say so in one line, and mark any idea that needs more (a second person, a location, props).
3. **Find the evidence.**
   - **A niche-breakouts report under 7 days old** in `virlo-research/` whose topic words and platforms match this ask, plus its `.cache/`: use it, free, and name the report in Method. A report run before the brief existed can be reused: apply the brief on top (on-brief labels, what they can film, avoid list) and say in the report that the data predates the brief. A report made for a different brief or client slug isn't reused. If the topic words or platforms differ, run fresh.
   - **Otherwise, run a fresh breakouts read** (about $0.25) and say so. If the niche-breakouts skill is installed, follow it instead; this is the compact version:
     1. **Three library searches with the same filters** (`POST /v1/search/videos` with `scope: virlo_library`, which is required; MCP `find_videos`; $0.05 each, page 1 only): A, the last 30 days with `sort: most_viral`; B, the same plus `outliers_only: true`; C, the baseline from today − 120 to today − 31 days. Topic words of 2 to 4 words from the brief, at most 3 alternatives joined with `|` (check `applied` for any dropped); `platforms`: one platform or all: never pass a 2- or 3-item `platforms` list (it lands in `not_applied` and searches everything). With several platforms in the brief, search all platforms and keep only the brief's platforms from the page yourself, and say so; run one search per platform ($0.05 each) only when the user asks. No `looks_like`. Pages are ranked by topic match too, so sort each by `virality_score` before taking the top.
     2. **Clean:** label each video on or off brief from `description` and `intelligence.summary`; drop `is_paid` posts and likes under 0.5% of views (on 1,000+ views); keep one video per creator.
     3. **Measure up to 8 creators** ($0.01 each): one page of `GET /v1/raw/{platform}/creator/{handle}/videos` (MCP `raw_creator_videos`), outlier and the repeat check (2+ other posts at 10×+ is repeatable, exactly 1 is possibly repeatable) as in `../virlo-api/references/method.md` §1.
     4. **Patterns from the three free overviews:** the breakout index (how much more often a format or hook type shows up in B than in A: over at 1.25+, under at 0.8 or less) and the supply trend (A against C), as in method.md §4.
     - Thin (A has `thin: true` or under 10 matches): say the count and offer the looser asks in method.md §10. Don't build ideas on it.
   - **Also read, if they're present:** a trend-radar report from this week (for timing) and a hook-bank report (for openings).

## Workflow
1. **List the qualifying patterns,** using `../virlo-api/references/method.md` §8:
   - over (breakout index 1.25+) and not crowded, including over and fading (under-supplied, the best opening);
   - new or climbing and not under;
   - or a creator's repeatable formula (2+ posts at 10× outlier on one page).
   - Skip under, crowded and one-off patterns.
   - Compute a breakout index only when the all-matches and breakouts searches used the same topics and platforms. If `not_applied` shows one was widened or lost a filter, give no index and say so.
2. **Pick the sources:** at least 4 real videos across the set, from the last 90 days, ranked by outlier. Paid and boosted posts never count.
   - Each idea cites at least one breakout from the current window, measured where possible. Older baseline videos may support an idea but never carry it alone.
   - Say "measured" or "n× outlier" only for videos measured this run; cite the rest as "Virality Score N, not measured".
3. **Write each idea:**
   - **The idea:** what the viewer sees, in two lines, for this account.
   - **Built on:** the pattern with its number, plus 1–3 cited videos with outlier or Virality Score.
   - **Why now:** the moment, from the data (supply fading while breakouts favour it, a trend that started this week).
   - **Why it works:** for a viewer (saves, comments, recognition). This must be a different point from why now.
   - **Format and length:** taken from the cited videos (`visual_format`, `duration`).
   - **Film it:** 3 shots in order, one line each (what's in frame, who, where), plus the on-screen text.
   - **Opening line:** one hook, modelled on a source line (`hook_text`), with no 4 words in a row from it. No more than 2 ideas may share a hook type.
   - **Brand note:** the brand-account version, when the brief is a brand.
4. **Check each idea.** Drop any idea that fails one of these:
   - original (adapts a structure, copies no one's video);
   - possible to film with what the brief says the user can film;
   - clear of the avoid list;
   - free of invented results, numbers or testimonials (brackets for facts only the user has);
   - built on a rule, named in the idea: over at index X, climbing from A% to B%, or @creator's N other posts at 10×+. Two creators with one hit each is not a rule, and an idea whose sources are all one-offs is dropped, not pitched as weak;
   - in the user's own subject: when the source comes from another field (yoga for a strength coach), say what changes and cite a source in the user's subject too.
5. **Count:** "4 of 5 passed the checks" when that's what happened.
6. **Post order:** which idea goes up first and why, from the data: a timed idea (a format that started this week, a climbing share) goes before an evergreen one. For "plan my week", give each idea a day and say the days are a suggestion, not a measured best time.

## Output

**In chat:**
```
<n> ideas, each built on measured breakouts:
1. <idea title>: <one line>. Built on @<handle> (<n>× outlier).
…
Post first: <idea> (<the timing reason in numbers>).
Report: virlo-research/<date>-content-ideas-<slug>.md · Spent $<x>
→ <next step>
```

**The report** (`virlo-research/<YYYY-MM-DD>-content-ideas-<slug>.md`):
```markdown
# Content ideas: <account> · <date>

**The short version:** <one or two lines>
**Post first:** <idea> (<the timing reason in numbers>)

## 1. <idea title>
- **The idea:** …
- **Built on:** <pattern + number>; <cited videos with links and outlier>
- **Why now:** …
- **Why it works:** …
- **Format · length:** …
- **Film it:** 1. … 2. … 3. … · on screen: "…"
- **Opening line:** "…" (modelled on @<handle>: "<source line>")
- **For a brand account:** …

(up to 5)

## Not pitched
<patterns that looked tempting and why they failed the checks>

## Sources
| Video | Creator | Outlier or VS | Posted | Link |
(one row for every video named anywhere in the report, including ideas not pitched and comparison posts)

**Method:** <which reports and patterns this used>
**Spend:** <actual>
```

## Rules
- Every idea cites real videos with real numbers from this run or a matching saved report under 7 days old.
- Never pitch an under, crowded or fading-and-not-over pattern, and never a one-off as a formula.
- Why now and why it works make different points.
- Give fewer ideas rather than weak ones. Say how many passed.
- Never invent results, customers or testimonials. Use brackets for the user's own facts.

## Next
- → Write the best one as a script: script-writer
- → More opening lines for these ideas: hook-bank
- → Check this week's timing before posting: trend-radar
