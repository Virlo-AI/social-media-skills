---
name: audience-voice
description: "Use when the user wants to know what their audience or a niche's viewers actually say, ask, want, doubt or complain about, in their own words, from TikTok, Reels or Shorts comments: \"what are people saying in the comments\", \"voice of customer\", \"comment research\", \"what objections or pain points come up\", \"what should our FAQ video answer\", \"what words do customers use\" (for hooks, ads or a landing page). Use it even for a quick ask, so every theme rests on real comments quoted word for word. Reads the comments under a niche's breakout videos (or the user's own), sorts them into praise, questions, requests, complaints and other, ranks themes by likes, lists the most-liked questions nobody answered and the exact words viewers repeat, then turns the strongest themes into videos and lines to make. Not for tracking the user's own launch over time (launch-monitor). About $0.06 for six videos, $0.11 with the search."
license: MIT
allowed-tools: Bash(bash *virlo.sh* *) Bash(jq *) Bash(date *) Read Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Audience voice: TikTok comments analysis, what viewers ask for

The comment section is free market research. Under the videos that broke out, viewers say what they believe, what they doubt, what it costs them and what they want next. This skill reads those comments, sorts them, ranks them by likes, keeps every quote exact, and ends with:
- the questions to answer next, most-liked first;
- the words viewers use, for hooks, ads and FAQs;
- the moves the themes point to.

## When to use
- "What are people saying about…?", "what does my audience want?", "what questions do people ask in this niche?"
- "What objections come up?", "voice of customer", "comment research", "what should our FAQ video answer?", "what words do customers use?"
- Checking a few of the user's own posts. For ongoing checks after a launch, use launch-monitor.

Not for: what format or hook is working (→ niche-breakouts) or one video's full breakdown (→ video-teardown).

## Before you start
1. **Use the data layer in the sibling folder `../virlo-api/`.** It's installed alongside this skill; if it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`.
   - Read `../virlo-api/SKILL.md` and `../virlo-api/references/house-rules.md` before the first call.
   - Every HTTP call below runs through `$S`, which means the path `<this skill's folder>/../virlo-api/scripts/virlo.sh`, always called as `bash $S …`, run from the user's project folder. Never `cd` into the skill folder, so `virlo-research/` stays in their project. With MCP, use the tool named beside each call.
   - With no MCP and no key, use preview mode: show this skill's `samples/` labelled as a sample, plus the setup steps.
2. **Pick the videos: 6 to 10.**
   - **Best:** the measured breakouts from a niche-breakouts report under 7 days old, free to reuse when its topic words and platforms match this ask (`../virlo-api/references/house-rules.md`). Name the file you reused. A report made before the brief existed may feed a briefed run: apply the brief on top and say the data predates it. A report for a different brief or client isn't reused; run the search below.
   - **The user's own posts,** when they ask about their audience.
   - **Otherwise one library search** ($0.05): MCP `find_videos`; HTTP `POST /v1/search/videos` with `scope: virlo_library` (required), `topics`, `posted_after` = today − 30, `outliers_only: true`, `sort: most_viral`, and `platforms` with one platform or none (never a list of two: with several platforms in the brief, search all and filter the page yourself, and say so). If it's thin, run it once more without `outliers_only`.
     - The page comes back topic-ranked even with `sort: most_viral`: sort it by `virality_score` first. Keep on-brief videos only (from `description` and `intelligence.summary`), one per creator, then take the 6 with the most `comments`.
   - **Leave out paid posts** (`is_paid: true`). Their comments are about the ad.
3. **Say the price in a reply to the user,** before the first paid call: "one page of comments per video at $0.01: about $0.06 for six, plus $0.05 if I search for the videos." Pages bill even when empty.

## Workflow
1. **Read one comment page per video.**
   - MCP `raw_comments {platform, url or id}`; HTTP `GET /v1/raw/{platform}/video/comments`.
   - One page is usually 15–20 top comments, without replies. Read a second page only if the user asks.
   - Save each page's comments to `virlo-research/.cache/` so every quote and sum can be checked.
2. **If a page comes back empty,** comments are off or hidden (a breakout's creator sometimes turns them off). Say so; don't count it as silence.
3. **Label every comment** by what it says:
   - **praise**;
   - **question** (asks something);
   - **request** (asks for content, a product or a follow-up);
   - **complaint** (an objection, doubt, price or correction);
   - **other** (jokes, guesses, tags, chatter). A joke about a name or a claim is other, not a complaint.
   - A comment with a high `reply_count` is a live debate: note it.
4. **Group the themes across videos:** price, trust in results, "what about my case", doing less, a person's appeal. Rank by total likes, then by how many videos the theme appears on. A theme on one video only is that video's quirk; say so.
   - If one comment holds over half a theme's likes, rank the theme without it as well. A joke or meme is never the top quote or the basis of a move.
   - Give theme totals as exact sums of the comments behind them.
5. **Quote exactly.**
   - Up to 2 quotes per theme, word for word, with likes and a link to the video.
   - Leave typos as they are.
   - Skip a comment with slurs or personal details (a commenter's age, health, gender identity or location), and pick another.
   - Quote marks are only for verbatim comments. Write theme names and suggested lines without them.
6. **Questions to answer:** the questions and requests, verbatim, ranked by likes (top 10), with the video. Mark one "answered" only when the creator's own comment on the page answers it; otherwise "not seen" (replies aren't read). Unanswered, well-liked questions are the gaps a video can fill.
7. **Their words:** short words and phrases (1–4 words) that recur, exactly as written ("dupe", "same lighting", "out of my price range"), with how many comments use each. Keep a phrase only when 2 or more comments use it, and recount before you write the count.
8. **Moves: the top 3–4 themes, each turned into something to make.** Name the video or line, the theme's likes and video count behind it, and where it goes (a video, a hook, an ad line, an FAQ). For example: a video that answers the top question, a claim to stop making, a proof format the doubters ask for, a price framing. Suggested lines are written for the user, never copied from a commenter.

## Output

**In chat:**
```
Across <n> comments on <n> videos, the loudest themes are <theme> (<likes> likes, <n> videos) and <theme>.
Top open question: "<exact question>" (<likes> likes).
Their words: "<phrase>" (<n> comments), "<phrase>" (<n>).
Make next: <move 1>.
Report: virlo-research/<date>-audience-voice-<slug>.md · Spent $<x>
→ <next step>
```

**The report** (`virlo-research/<YYYY-MM-DD>-audience-voice-<slug>.md`):
```markdown
# Audience voice: <niche> · <date>

**What they're telling you:** <two or three lines>

## The mix
| Label | Comments | Share |

## Themes, by likes
### <theme> · <likes> likes across <n> videos
- "<exact quote>" · <likes> likes · [video]
- **What to do:** …

## Questions to answer
| Question (exact) | Likes | Video | Answered? |

## Their words
| Word or phrase (exact) | Comments using it | Example video |

## Moves
1. …

## Sources (videos read)
| Video | Creator | Views | Posted | Comments read | Note |

**Method:** <videos, pages, how comments were labelled>
**Spend:** <actual>
```

## Rules
- Quote comments exactly, and never invent, merge or "clean up" one.
- Count only comments you read this run. Say "78 comments on 5 videos", not "the audience".
- Likes rank themes; a single viral joke doesn't make a theme.
- No personal data: private people (interviewees, passers-by, guests, commenters) are never named. A public figure who is the subject of a video (the CEO it's about) may be named as its subject, never profiled. Don't show commenters' handles, link the video instead, and never profile a commenter.
- A video's `intelligence.emotional_tone` is the creator's mood, not the audience's. Only comments tell you what viewers feel.

## Next
- → Answer the top question in a video: script-writer
- → Turn the themes into a set of posts: content-ideas
- → Open with their words: hook-bank
