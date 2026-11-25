---
name: competitor-watch
description: "Use when the user wants to spy on, benchmark or compare competitor brands or rival creators on TikTok, Instagram Reels or YouTube Shorts: what they post, which of their videos work and why, whether a campaign or launch is working or fading, or how the user's own account stacks up. Use it even for a quick \"what is @brand doing on TikTok\", so the answer is measured against each account's own typical views instead of raw views. Reads each account's latest posts live, measures how big an outlier every post is for that account, sorts posts by type (person-led, product drop, campaign, expert, creator partner, shop or live), shows what their best posts do that the rest don't, finds the gaps they leave open, and turns them into up to 3 moves the user can post this month. Not for one account's full playbook (creator-teardown), their Meta ads (ad-watch) or a whole niche (niche-breakouts). About $0.01 per account; a typical run is $0.03 to $0.06."
license: MIT
allowed-tools: Bash(bash *virlo.sh *) Bash(jq *) Bash(date *) Read Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Competitor watch: TikTok competitor analysis against each account's typical views

Big accounts look successful because their numbers are big. The useful question is narrower: **what do this competitor's best posts do that its other posts don't, and what are they leaving open?** Measured against each account's own typical views, the answer usually points at one or two things the user can post this month.

## When to use
- "What are our competitors posting?", "spy on @brand", "what's working for X?", "how do we compare with X and Y?"
- "Is their new campaign working?", "should we copy their launch?", "benchmark us against our top 3 competitors"

Not for: one account's full playbook (→ creator-teardown), one video (→ video-teardown) or ads (→ ad-watch).

## Before you start
1. **Use the data layer in the sibling folder `../virlo-api/`.** It's installed alongside this skill; if it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`.
   - Read `../virlo-api/SKILL.md` and `../virlo-api/references/house-rules.md` before the first call.
   - Every HTTP call below runs through `$S`, which means the path `<this skill's folder>/../virlo-api/scripts/virlo.sh`, always called as `bash $S …`, run from the user's project folder. Never `cd` into the skill folder, so `virlo-research/` stays in their project. With MCP, use the tool named beside each call.
   - With no MCP and no key, use preview mode: show this skill's `samples/` labelled as a sample, plus the setup steps.
2. **Get the competitors** from the user or from the brief's competitor list (`virlo-research/brief.md`): 2–5 accounts, plus the user's own if they want a comparison.
   - **Platform:** the one the user names, else the brief's, else TikTok. Say the assumption in one line.
   - **Brand names, not handles?** Try the brand's main handle as it's usually written ("The Ordinary" → `theordinary`). Step 1 checks it's really theirs.
3. **Say the price in a reply to the user,** before the first paid call: "one page of latest posts per account at $0.01 (3 competitors plus you: $0.04), plus $0.01 for any best post whose caption says nothing."

## Workflow
1. **Read each account's latest posts,** one page each.
   - MCP `raw_creator_videos`; HTTP `GET /v1/raw/{platform}/creator/{handle}/videos`.
   - **Check it's the right account from its posts:** `author.display_name` and `author.verified` often come back null on this page, so check that the captions and hashtags name the brand or its products, and that the posting volume fits a brand account. Read the bio too if you made a profile read (`raw_creator`, $0.01, only when the posts leave doubt). Say in the report how each account was confirmed. A fan page, a regional account or a staff member's account isn't the brand: say so and ask.
   - A billed page that comes back with 0 posts: say so, mark that account unmeasured, and don't retry.
   - A 404 means the handle is wrong or private. It isn't billed; ask for the right handle.
2. **Per account:**
   - **Clean the page first:** leave out pinned posts and missing counts. List bought reach apart (a paid label such as #ad or "paid partnership", or likes under 0.5% of views on a post with 1,000+ views): it stays in typical views, but never counts as a best post or in a type (`../virlo-api/references/method.md` §1).
   - **The account's typical views:** what its posts on the cleaned page typically get.
   - **Each post's outlier** is measured against the account's *other* posts; a post never counts toward its own typical views.
   - **Best** = the top 3 by multiple. **Rest** = everything else.
   - **Cadence:** posts per week over the page's date range, and the longest gap with its dates.
3. **Label every post by type, from the caption:**
   - person-led (a founder, a named person, "with <name>");
   - product drop ("available now", "live tomorrow", a launch);
   - campaign or tie-in (a shared campaign hashtag or partner);
   - expert (a dermatologist, doctor, pharmacist, coach);
   - creator partner (#partner, a creator tagged);
   - shop or live;
   - other: posts that fit none of these (an explainer, a tip, a meme). Name what most of them are about, e.g. "other (condition help)", when 3 or more share a subject.
   - **One type per post.** Tie-break: person-led wins when a named person is on camera or speaking; otherwise the product type (product drop, shop or live) wins; campaign beats creator partner only when the campaign hashtag is present. Say the tie-break in the Method line.
   - A best-three post whose caption says nothing ("SPECIAL OCCASION"): read its transcript first ($0.01; it may come back empty on Instagram), MCP `raw_transcript`, HTTP `GET /v1/raw/{platform}/video/transcript`. Still unclear: mark it unknown.
4. **Best vs rest, per type:** posts, share of the account's posts, median views and typical outlier (`method.md` §6). The account's **best type** has the highest typical outlier among the typed types with 2 or more posts; a single huge post is a one-off, named apart. Unknown posts don't block it: judge from the posts that could be typed, and say how many couldn't ("best type from 12 of 15 posts; 3 unknown"). Then flag:
   - **works but rare:** a typical outlier of 1.5× or more (above typical or a breakout, `../virlo-api/references/method.md` §1) on 3 or fewer posts. The account under-uses its own best type.
   - **over-posted:** a type that's a third or more of the account's posts with a typical outlier under 1×, so most of its posts fall short of the account's own typical views.
   - A type on 1–2 posts is a lead, not a pattern. Say "on 2 posts".
5. **Across accounts:** a type that's the best type in 2 or more accounts is the strongest signal. Count it ("person-led beat product in 3 of 3 accounts").
6. **Over time, when asked:**
   - **A campaign:** its posts in date order with views and outlier. Building, flat or decaying? Where did it fall below typical views?
   - **A launch:** the posts, the days they ran over, and how the launch posts did against the rest of the page.
7. **The user's own account,** when given: read it the same way. Compare **multiples and type mix, never raw views**:
   - the competitors' winning types the user posts rarely or never: the gap to take;
   - the user's own types running under their typical views: what to cut;
   - cadence against theirs.
8. **Moves for the user: up to 3.** Each one names:
   - **post it:** the type and a first concrete video, with its opening line in the user's own voice;
   - **built on:** the competitor posts and multiples behind it, and how many accounts show it;
   - **instead of:** the over-posted type it replaces, if there is one.
   - Never "do what they do". Borrow what works and take the gap they leave.

## Output

**In chat:**
```
<A>: best posts are <type> (<n> posts, <n>× outlier); <weak type> sits at <n>×.
<B>: …
Across <n> accounts: <type> beat <type> in <n> of <n>.
Gap to take: <type they under-use or you never post>, <evidence>.
Make next: <move 1>; <move 2>.
Report: virlo-research/<date>-competitor-watch-<slug>.md · Spent $<x>
```

**The report** (`virlo-research/<YYYY-MM-DD>-competitor-watch-<slug>.md`):
```markdown
# Competitor watch: <names> · <date>

**The short version:** …

## At a glance
| Account | Posts read (dates) | Posts / week | Typical views | Best post | Best type | Weakest type |

## <Account>
| Type | Posts | Share | Median views | Typical outlier | Flag |
- Best three: …
- Low like rate or paid (listed apart): …
- Campaign / launch over time: …

## You vs them
(only with the user's account) | Type | Your posts | Your outlier | Their best outlier |

## Moves for you
1. **<move>.** Post it: … · Built on: <competitor posts, outlier, n of n accounts> · Instead of: …

## Sources
**Method · Spend**
```

## Rules
- Describe a post only by what its caption, or a transcript you read, says. When the format is unknown, write "format unknown" in the chat and the moves too. If a best-three post can't be typed, say so, keep it out of the type table, judge the best type from the typed posts with the count of unknowns beside it, and offer video-teardown for the unknown post.
- Compare each account with itself before comparing accounts. Big brands get small multiples and small brands big ones.
- Never compare raw views across accounts or platforms.
- One account, one page: say the date range. A type's result on 1–2 posts is a lead, not a finding.
- Report what competitors post; don't speculate about their budgets, sales or results off-platform.

## Next
- → Break down a competitor's best video and get a remix: video-teardown
- → See their Meta ads: ad-watch
- → Turn the gap into a week of posts: content-ideas
