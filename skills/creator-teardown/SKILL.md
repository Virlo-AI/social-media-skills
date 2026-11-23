---
name: creator-teardown
description: "Use when the user asks about one creator or brand account on TikTok, Reels or Shorts: how they grow, what their formula, content strategy or content pillars are, which videos outperform, when they post, what format they repeat, or what to copy from them (\"break down @creator\", \"reverse-engineer this account\", \"how does this account get so many views\"). Use it even before they name the handle (ask for it). Reads the live profile and latest posts, groups posts into pillars with each pillar's median views and hit rate, finds the outliers against the creator's own typical views, reads the timed transcripts of the top two, gives posting cadence and best time slot, and ends with a playbook to borrow plus a first video built in their structure for the user. Not for one video (video-teardown), comparing several accounts (competitor-watch) or finding creators to hire (creator-finder). About $0.04."
license: MIT
allowed-tools: Bash, Read, Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Creator teardown: TikTok creator analysis, what to borrow

What does this account actually do, and which part of it works? This skill covers one creator or brand account from their live posts:
- their pillars, ranked by results;
- the outliers against their own typical views;
- the structure of their two best videos, from the timed transcripts;
- their cadence and best posting slot;
- the parts of their playbook the user can borrow, and a first video built in that structure.

## When to use
- "Break down @creator", "how does this account get so many views?", "what's their formula?", "reverse-engineer @brand's TikTok"
- "What should I copy from @competitor?". For comparing several accounts, use competitor-watch.

Not for: one video (→ video-teardown) or finding creators to work with (→ creator-finder).

## Before you start
1. **Use the data layer in the sibling folder `../virlo-api/`.** It's installed alongside this skill; if it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`.
   - Read `../virlo-api/SKILL.md` and `../virlo-api/references/house-rules.md` before the first call.
   - Every HTTP call below runs through `$S`, which means the path `<this skill's folder>/../virlo-api/scripts/virlo.sh`, always called as `bash $S …`, run from the user's project folder. Never `cd` into the skill folder, so `virlo-research/` stays in their project. With MCP, use the tool named beside each call.
   - With no MCP and no key, use preview mode: show this skill's `samples/` labelled as a sample, plus the setup steps.
2. **Get the handle and platform.** YouTube reads Shorts only; Instagram reads Reels only. Transcripts may come back empty for Instagram; if so, step 4 reads the captions instead.
3. **Read `virlo-research/brief.md`** if it exists, for the user's niche and voice in step 6.
4. **Say the price in a reply to the user,** before the first paid call: "profile, one page of latest posts, two transcripts, $0.01 each: $0.04. Each older page is $0.01 more." On Instagram say "$0.02–0.04, depending on whether the transcripts return": an empty transcript is still billed.
   - **The deep version, on request only:** Virlo's creator lookup reads up to 100 posts and tags each one's hook and format, with a "what's working" summary: `POST /v1/satellite/creator` with `max_videos: 100` and `data_intelligence: true`, $0.75, async (poll `GET /v1/satellite/creator/status/{job_id}`, then re-read `GET /v1/satellite/runs/{run_id}` once `intelligence_status` is ready). Mention it; never start it unasked.

## Workflow
1. **Profile:** MCP `raw_creator`; HTTP `GET /v1/raw/{platform}/creator/{handle}`. Read `stats.followers`, `stats.likes`, `stats.videos`, `bio`, and account age only if `platform_data` gives it.
2. **Latest posts:** MCP `raw_creator_videos`; HTTP `GET /v1/raw/{platform}/creator/{handle}/videos`, one page.
   - A billed page that comes back with 0 posts: say so, stop, and don't retry; there's nothing to measure.
   - **Clean the page first:** leave out pinned posts and missing counts. List bought reach apart (a paid label such as #ad or "paid partnership", or likes under 0.5% of views on a post with 1,000+ views): it stays in typical views, but never counts as an outlier or in a pillar's result (`../virlo-api/references/method.md` §1).
   - **Typical views:** what the creator's posts on the cleaned page typically get. **A post's outlier** is measured against their *other* posts; a post never counts toward its own typical views.
   - **Outliers:** posts at 10× outlier or more, and at 3× outlier or more. For each, note whether it was share-led or save-led (shares and saves per 100 views, from `stats`).
   - No post at 3× or more: say the page shows no outliers, so there's no formula to borrow yet, and offer an older page ($0.01).
3. **Pillars:** group every post by what it's about, from the caption. Keep it to 3–5 pillars.
   - For each pillar give the post count, the median views, and how many posts reached 10× outlier.
   - Then look for the sharper split inside the best pillar: a sub-topic, a kind of story, a recurring name. Test it with counts ("4 of 6 Silicon Valley stories hit 10×; 0 of 6 from other industries").
4. **Structure of the top two** (by outlier, bought reach excluded): MCP `raw_transcript`; HTTP `GET /v1/raw/{platform}/video/transcript`.
   - Note the timed beats from `segments`: the first line, the setup, the turn, the numbers, the closing line, and the length.
   - Name what both share. With `has_transcript: false`, or an empty reply on Instagram, read the structure from the captions and say the transcript was unavailable.
5. **Cadence and timing:**
   - Posts per week over the page's date range, and the longest gap between posts, with its dates. Never write "no gaps over N days" without that number.
   - The best slot by median views (`method.md` §5: morning 06–12, afternoon 12–17, evening 17–22, late 22–06 UTC), with at least 2 posts in it. Otherwise say there's not enough to call it.
6. **The playbook:**
   - **Borrow this:** 3–5 things the user can borrow. Each points at a count, a transcript beat or a number.
   - **Your first video in their structure:** one outline for the user's niche (from the brief, or ask): the subject choice the sharper split points to, an opening line written for the user, the beats with timings, the length and the slot. Original wording; no line shares 4 or more words in a row with the creator's transcript.
   - **Don't copy:** their voice, their identity, their exact lines, anything that works only because of who they are.

## Output

**In chat:**
```
@<handle>: <followers> followers, typical views <n>. <n> of <n> posts hit 10×+, <n> of them in <pillar>.
Their formula: <one line>. Best slot: <slot> (<n> posts, median <n>).
Your first one: "<opening line>" · <length> · <slot> (outline in the report)
Report: virlo-research/<date>-creator-teardown-<handle>.md · Spent $<x>
→ <next step>
```

**The report** (`virlo-research/<YYYY-MM-DD>-creator-teardown-<handle>.md`):
```markdown
# Teardown: @<handle> · <date>

**The formula:** …

## The account
| Followers | Total likes | Videos | Typical views (latest <n>) | Posts / week |

## Pillars
| Pillar | Posts | Median views | 10×+ posts | Examples |

## The sharper split
…

## How the top two are built
| Time | Video 1 | Video 2 |

## When they post
| Slot (UTC) | Posts | Median views |

## Borrow this
1. …

## Your first video in their structure
| Time | Beat | Line / on screen |
**Don't copy:** …

## Sources
**Method · Spend**
```

## Rules
- Recheck every count about captions ("4 of 5 state size") caption by caption, and name the posts. A trait goes in the formula only if the top post has it.
- Every claim about what works carries a count from the page ("3 of 9"). Call it a formula only when 2 or more posts hit 10× and share the trait; one hit is a one-off, never a pillar's result.
- A page is the latest 15–20 posts, so say the date range. Older history needs another page or the deep version.
- Quote transcripts exactly and keep them short. The playbook borrows structure, never lines.
- Don't speculate about the creator's private life, income or deals beyond what their posts state.
- Private people who appear in their videos (interviewees, passers-by, guests) and commenters are never named. A public figure who is a video's subject (the CEO a story is about) may be named as its subject.

## Next
- → Break down their best video beat by beat: video-teardown
- → Write your first video as a shoot-ready script: script-writer
- → Compare them with other accounts: competitor-watch
