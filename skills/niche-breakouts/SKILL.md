---
name: niche-breakouts
description: "Use when the user asks what is going viral, breaking out, blowing up, trending or working right now in a niche, topic, industry or product category on TikTok, Instagram Reels or YouTube Shorts, and why (\"what's working in skincare?\", \"why are these videos blowing up?\", \"which formats and hooks work for SaaS founders?\"). Use it even for a quick ask, so the answer rests on measured breakouts instead of the biggest accounts. Finds the outlier videos (N× outlier, measured against each creator's other posts, not raw views), what those breakouts share that the rest of the niche doesn't (formats and hook types that over-perform, climb, fade or are crowded), which views were bought, and up to 3 moves to film next, each tied to a cited video. Not for this week's memes or sounds (trend-radar), one creator (creator-teardown) or one video (video-teardown). Typical run about $0.25."
license: MIT
allowed-tools: Bash(bash *virlo.sh* *) Bash(jq *) Bash(date *) Read Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Niche breakouts: what's going viral in your niche on TikTok, Reels and Shorts

"What's working in skincare right now?" usually gets a list of the biggest videos. That's the wrong list: a 2M-view post from a 10M-follower account is a normal day for them. This skill finds the **outlier videos**: the ones that did far better than their own creator normally does, shows what those breakouts share that the rest of the niche doesn't, and separates real breakouts from bought reach.

Every number comes from Virlo calls made in this run. The method is in `../virlo-api/references/method.md`.

## When to use
- "What's going viral in <niche>?", "what's working in <topic> right now?", "why are these videos blowing up?"
- "What formats/hooks work in <industry> on TikTok/Reels/Shorts?"
- Before writing content ideas, hooks or scripts for a niche (the other skills build on this one).

Not for: one named creator (→ creator-teardown), one video (→ video-teardown), this week's memes and formats spreading across all niches (→ trend-radar), sounds (→ sound-scout), a ready list of post ideas (→ content-ideas, which runs this first).

## Before you start
1. **Load the data layer.** It's the sibling folder `../virlo-api/`, installed alongside this skill. If it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`. Read `../virlo-api/SKILL.md` (data path, setup, errors) and `../virlo-api/references/house-rules.md` before the first call. `$S` in any command below means `<this skill's folder>/../virlo-api/scripts/virlo.sh`, run as `bash <this skill's folder>/../virlo-api/scripts/virlo.sh …` from the user's project folder (never `cd` into the skill folder, so `virlo-research/` stays in their project). If there is no MCP and no key, use **preview mode**: show the closest report from this skill's `samples/` folder, labelled as a sample, and the setup steps. Make no calls.
2. **Read `virlo-research/brief.md`** if it exists: search words, platforms, region and language, what they can film, creator size, avoid list. If it's missing, offer `brand-brief` in one line and go on.
3. **Set the ask** in one line before calling: topic words, window, platforms, any region, language or look.
   - **No `looks_like` in A, B or C** unless the user asked for a look in this request. It reranks away from Virality Score and narrows the niche, which can hide an under-supplied format. What the brief says they can film is applied in step 6, when picking moves.
   - Topic words: 2 to 4 words each, at most 3 alternatives joined with `|` (`"skincare|skin care|skincare routine"`). One item per idea. Check `applied` for any alternative that was dropped, and say so.
   - Window: the last 30 days, unless the user names one.
   - Platforms: one platform or all: never pass a 2- or 3-item `platforms` list (it lands in `not_applied` and searches everything). With several platforms in the brief, search all platforms and keep only the brief's platforms from the page yourself, and say so; run one search per platform ($0.05 each) only when the user asks.
4. **Say the price in a reply to the user,** before the first paid call: "3 library searches ($0.15) plus up to 8 creator checks ($0.08), about $0.25." With MCP, call `get_credit_balance` first (free).

## Workflow

### 1. Three searches with the same filters ($0.05 each)
Run them in parallel. Keep page 1 only; the free `overview` on each page already counts every match.

| Call | Purpose | Inputs on top of the shared filters |
|---|---|---|
| **A. Recent** | the niche now, top 25 by Virality Score | `posted_after` = today − 30, `sort: most_viral` |
| **B. Breakouts** | the outliers in the same set | A + `outliers_only: true` |
| **C. Baseline** | the 90 days before, for trend labels | `posted_after` = today − 120, `posted_before` = today − 31 |

- MCP: `find_videos` with `scope: virlo_library`, `topics`, `posted_after`, `posted_before`, `sort`, `outliers_only`, `platforms`, `regions`, `languages`, `creator_followers_min/max` (and `looks_like` only when the user asked for a look in this request).
- HTTP: `bash $S POST /v1/search/videos '{"scope":"virlo_library","topics":["..."],"posted_after":"YYYY-MM-DD","sort":"most_viral"}'` with the same field names. `scope` is required: without it the API refuses the search.
- Read `applied` and `not_applied` on each. A filter in `not_applied` is a caveat in the report.
- **A `prefer: …` you didn't ask for** means a topic word was read as a look, for example "founder" became "prefer: Founder". Results with that look rank first, so the order is no longer by Virality Score. Measure from B, where order matters least, or rerun without that word. Either way, say so. Keep person nouns (gamer, founder, mom) out of topic words to avoid it.
- **Thin:** if A has `thin: true` or fewer than 10 matches, stop here. Say the count and offer looser asks (`method.md` §10); a thin reply carries `next_step`, a prefilled research agent and its price. Offer it, never start it.

### 2. Clean the candidates
The page comes back ranked by topic match as well as virality, so first sort each page by `virality_score` yourself, highest first. Then take B's top 25, then A's top 25 that aren't in B.
1. **On brief or not:** label each video from its `description` and `intelligence.summary`. Drop off-brief ones (`method.md` §3).
2. **Bought reach out:** `is_paid: true`, or likes under 0.5% of views on a post with 1,000 views or more, means the views were most likely bought (Spark Ads, a boosted partnership). Keep these in their own list. Never call them breakouts and never count them in patterns.
3. **One per creator:** keep each creator's best video.
4. **Who posted it:** label each candidate creator, brand, or official account (a game's or product's own account). When the user asks about creators, measure creators first and list brand and official accounts apart.

### 3. Measure "N× outlier" for up to 8 creators ($0.01 each, up to 10)
For the top on-brief, organic candidates by `virality_score` (sorted as in step 2), read one page of the creator's latest posts.
- **Reserve slots for the patterns that qualify.** Read the free overviews (step 4) before you pick. For each format or hook type that qualifies (over and not crowded, or new or climbing and not under), measure at least one candidate that uses it (`intelligence.visual_format` / `hook_type`). Fill the rest by `virality_score`. If that needs more than 8, go up to 10 ($0.10 in all) and say so. Otherwise step 6 has no measured video to build the move on.
- MCP `raw_creator_videos {platform, handle}`; HTTP `GET /v1/raw/{platform}/creator/{handle}/videos`. YouTube returns Shorts only, Instagram Reels only.
- **Typical views:** what the creator's **other** posts on that page typically get. If the breakout is on the page, use its live views there (fresher), and never count it toward its own typical views.
- **Breakout older than the page** (common: the page shows the newest posts): compare its stored views with typical views of the newer posts, and say "typical views from posts after it" with their dates. If the video is gone from the account, mark it **unmeasured**.
- **outlier:** how many times over the breakout beat those typical views. It needs at least 3 other posts; otherwise mark it **unmeasured** and cite its Virality Score with its band (10 promising, 18 strong, 25 very strong, 35 exceptional) instead.
- **Clean the page first.**
  - Raw pages carry no pin flag. A post at the top of the page that's far older than the rest is probably pinned: leave it out of typical views (count it in the repeat check), and never say the API flagged it as pinned. Instagram pages aren't always in date order below the top, so judge age by `published_at`, not position.
  - A post showing 0 or no views while it has comments is a missing count, not a flop. Leave it out and say how many.
- **Repeat check:** count the creator's other posts on the page at 10× outlier or more, and note whether they share the breakout's format. Build a move on a repeatable creator only when those posts share the format; if it's unchecked or differs, say "repeatable by count only". 2 or more: **repeatable**, a formula worth studying. Exactly 1: **possibly repeatable**; cite it, but don't call it a formula. None: **one-off**; borrow the idea, not the playbook.
- Read what the page says beyond the numbers: did the creator follow up, and did the follow-up carry? Has the account moved on to other content?

### 4. Patterns from the three overviews (free)
For each visual format and hook type that appears in the overviews:
- **share of all** (A), **share of breakouts** (B) and **share of the baseline** (C): what part of each overview's videos it makes up.
- **Breakout index:** how much more often it shows up among breakouts (B) than among all matches (A). **over** at 1.25 or more, **under** at 0.8 or less.
- **Supply trend** = A vs C by `method.md` §4: new, climbing, steady or fading.
- **Read:**
  - over and not climbing (steady or fading): **under-supplied**, the best opening;
  - climbing and under: **crowded**;
  - under: **skip**.
- **A pattern in B's overview but not in A's** (each lists only its top 6): its share of all is below A's sixth entry. Give the index as a floor ("at least 2.3×") and say the numbers are small.
- Overview counts are videos, not creators. The measured table is the check on whether a pattern comes from many creators or one.

### 5. Why each breakout worked
One line per measured breakout, specific: the actual hook text, what's on screen, the setting, the length, the comment count when it's unusual. Use `intelligence` (`hook_text`, `hook_type`, `content_format`, `visual_format`, `setting`, `emotional_tone`, `summary`) and the caption. Never write "engaging content" or "strong hook".

### 6. What to do with it
At most 3 moves for the user, each built on a pattern that's over and not crowded (over and fading counts: it's under-supplied, the best opening), a pattern that's new or climbing and not under, or a creator formula whose repeats share the format, each citing at least one measured video with its number. If a move has none of these under it, drop it and give fewer moves; never call it a "craft move" to get round this.

Each move is something the user could film tomorrow:
- **Film it:** what's on screen, who's on camera and the length, taken from the cited video (`duration`, `visual_format`, `setting`) and fitted to what the brief says they can film.
- **Open with:** one line modelled on the cited video's `hook_text`, written for the user. No 4 words in a row from the source.
- **Built on:** the pattern with its index, and the cited video with its outlier.

Add one line on what to stop doing (an under or crowded pattern). If nothing is under or crowded, say "Stop: nothing in this niche is under-performing or crowded right now". Never invent one. Respect the brief's avoid list. If the brief names a brand, say how a brand account (not a creator) would use the move.

## Output

**In chat** (short):
```
<the answer in one or two lines, with numbers>
Top breakouts: @<handle> <n>× outlier (<what it is, 3-5 words>) · @<handle> <n>× · @<handle> <n>×
Make next: <move 1 in one line: what to film, the pattern's index>
Stop: <the under or crowded pattern, with its index, or "nothing in this niche is under-performing or crowded right now">
<one line of method: "3 searches of 6,717 skincare videos since Oct 23; 8 outliers measured against their creator's other posts.">
Report: virlo-research/<date>-niche-breakouts-<slug>.md · Spent $0.23
→ <next step 1>
→ <next step 2>
```
Link each @handle to its video.

**The report** (`virlo-research/<YYYY-MM-DD>-niche-breakouts-<slug>.md`):
```markdown
# What's breaking out in <niche>
<window> · <platforms> · <region/language if set>

**The answer:** <two or three sentences, numbers in>

## Outlier videos, measured against each creator's other posts
| # | Video | Views | Typical views | Outlier | Repeat | Why it worked |

## What the breakouts have in common
| Pattern | Breakouts | All posts | Index | <baseline months> → now | Read |
(formats, then hook types; counts and shares, from the overviews)

## Paid or low like rate (left out)
<how many, their like rate against organic, what they were selling>

## What to do with this
1. **<move>.** Film it: <shot, who, length>. Open with: "<line>". Built on: <pattern + index>; <cited video + outlier>
2. ...
3. ...
**Stop:** <the under or crowded pattern, with its index, or "nothing in this niche is under-performing or crowded right now">

## Caveats
<not_applied filters, platform mix, stored vs live views, sample size of the measured table>

## Sources
| Video | Platform | Creator | Followers | Views | Outlier or VS | Posted | Link |

**Method:** <searches, windows, how outlier and the index were measured>
**Spend:** <actual, from the balance difference or virlo.sh spend>
```

## Rules
- Never call a paid or boosted post a breakout, and never rank by raw views across platforms.
- A one-off is never a creator's "formula". Say "1 of 15 posts", and say when the account has since moved on.
- Counts carry their scope: "91 of 803 breakouts", "since Oct 23", "on TikTok".
- The measured table is a sample (8 creators, one page each). Say so; the overviews carry the niche-wide claims.
- Fetch page 2 of a search, or a second page of a creator, only when the user asks.
- If B (`outliers_only`) is thin, measure A's top candidates instead and say so.
- Don't pitch an under or crowded pattern, or one that's fading and not over, as an opportunity. Over and fading is under-supplied: that's an opening, not a stop.
- Never guess a number the calls didn't return. Missing data is "unmeasured".
- Want this every week? Point to niche-monitor, which runs on a schedule and asks before it bills. Want one repeatable creator's whole playbook? Point to creator-teardown.

## Next
- → Turn the over-performing patterns into a week of posts: content-ideas
- → Steal the openings that worked: hook-bank
- → Hear what viewers ask under these breakouts: audience-voice
