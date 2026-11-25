---
name: launch-monitor
description: Use when the user asks how their recent posts, a launch or a campaign are doing on TikTok, Reels or Shorts right now ("how is my video doing?", "how did my last 5 posts do?", "is this post taking off or flopping?", "did our launch work?", "check it again tomorrow"), pastes a post link and asks how it's going, or wants to know what commenters are saying under it. Use it even for one quick check, so the answer is measured against the account's own typical views, not raw views. Reads live counts, compares each post with the account's typical views from before the launch and with the last saved check, flags stalled, boosted or comment-off posts, quotes the comments, and ends with one action per post (a follow-up for a post that's taking off, or one change to test after one that's below typical). Not for a full breakdown of why one video worked (video-teardown) or benchmarking a rival (competitor-watch). About $0.01 to $0.05 a check; ongoing tracking is optional and asked first.
license: MIT
allowed-tools: Bash(bash *virlo.sh *) Bash(jq *) Bash(date *) Read Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Launch monitor: TikTok analytics for your posts against your typical views

After you post, three questions matter:
- **Is it an outlier for us?**
- **Is it still growing?**
- **What are people saying?**

This skill answers all three from live numbers, then says what to do next for each post. It saves each check, so the next check can say exactly what changed.

## When to use
- "How's our launch doing?", "how did my last 5 posts do?", "is this video taking off?", "is my post flopping?"
- "How is this post doing? <link>", "check again tomorrow", "what are people saying under our new post?"

Not for: benchmarking a rival (what they post, what works for them, the gaps they leave: → competitor-watch) or a full breakdown of why one video worked (→ video-teardown). "How are this account's latest posts doing against its typical views?" works for any public account; the account's own typical views are the yardstick either way.

## Before you start
1. **Use the data layer in the sibling folder `../virlo-api/`.** If it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`. Read `../virlo-api/SKILL.md` and `../virlo-api/references/house-rules.md` before the first call; `$S` means the path `<this skill's folder>/../virlo-api/scripts/virlo.sh`, always called as `bash $S …`, run from the user's project folder (never `cd` into the skill folder, so `virlo-research/` stays in their project). With no usable MCP and no key, use preview mode: show `samples/` labelled as a sample, plus the setup steps and this run's price.
2. **Get the account handle and platform,** plus the launch post URLs if they're older than the latest page. A pasted link gives both (a short share link resolves through `raw_video`). Cross-posted to several platforms? One page per platform.
3. **Say the price in a reply to the user,** before the first paid call: "a page of your latest posts ($0.01) plus one comment page per launch post ($0.01 each)." A post below typical can add two opening-line reads ($0.01 each, step 8). Most checks are $0.01–$0.05.
   - Ongoing tracking (`track_video` / `track_creator`, $0.25 a check, it runs by itself) is offered only when the user wants alerts. Say how to stop it.

## Workflow
1. **Live counts.**
   - **Latest posts:** MCP `raw_creator_videos`; HTTP `GET /v1/raw/{platform}/creator/{handle}/videos`. One page covers about 15.
   - **A specific older post, or a pasted link:** MCP `raw_video`; HTTP `GET /v1/raw/{platform}/video` with `url`.
2. **Typical views:** what the posts **before** the launch window typically got, from the same page (`../virlo-api/references/method.md` §1). Say which dates it covers.
   - Never use posts newer than the launch post. If the page holds only newer posts and `has_more` is true, read the next page ($0.01).
   - With no launch date given, the window is the last 7 days and typical views come from the posts before it.
   - List bought reach in the baseline apart (paid, or under 0.5% likes on a post with 1,000+ views). It stays in typical views; if 3 or more baseline posts look bought, say typical views aren't all organic reach.
   - Say the days since the latest post. If it's over 14, say the account has gone quiet before calling any post stalled.
3. **Each post in the window:** outlier, likes, comments, shares and saves per view, and age in hours or days.
4. **Since the last check:**
   - Read `virlo-research/launch/<handle>.jsonl` if it exists. Report views gained and views per hour for each post.
   - No saved check yet? This read seeds the log: say "first check, saved as the baseline for the next one", and report no growth.
   - Append this check: the real UTC time (`date -u`, never a rounded or guessed one), then each post's id and counts.
   - **Settled** needs at least 24 hours between the two checks and under 5% view growth across them. Say so, and stop re-checking it. Under 24 hours apart, say "too soon to tell" for posts that barely moved.
5. **Flags:**
   - likes under 0.5% of views (bought reach, yours or a boost);
   - comments reading 0 on a post that had comments (turned off);
   - a 404 (deleted or private);
   - a post that tags a partner brand, or an account whose big posts mostly sit under 0.5% likes: say "may be boosted" before calling it taking off.
6. **Comments:** one page on each launch post with 10 or more comments (MCP `raw_comments`; HTTP `GET /v1/raw/{platform}/video/comments`).
   - Label them praise, question, request, complaint or other, and quote the top ones exactly.
   - Questions with lots of likes are the next video.
7. **Verdict.**
   - **Verdict, per post,** using the bands in `../virlo-api/references/method.md` §1: taking off (a breakout, 3× or more, and still growing since the last check), breakout (growth unknown) when there's no earlier check to compare with, above typical, about typical, below typical, or settled (under 5% growth over at least 24 hours). A settled post keeps its band too: "settled, below typical".
   - **The window as a whole:** the window's typical post against typical views.
8. **One thing to do, per post:**
   - **Taking off, breakout or above typical:** post a follow-up in the same format within a day or two, and answer the most-liked question in it. Name the question.
   - **Below typical:** compare it with the page's outlier posts, using only what the page shows: length (`duration_seconds`), sound, caption opener, hashtags, posting slot (`../virlo-api/references/method.md` §5). Name the one difference that most of the above-typical posts share and this one doesn't, and suggest testing it on the next post. Say it's a difference, not a proven cause. If the user wants the opening line compared too, read the transcripts of this post and the best one (`raw_transcript`, $0.01 each) and quote both first lines.
   - **About typical:** nothing to change; say when the next post is a fair test.
   - If no above-typical posts are on the page, say there's nothing on the account to compare against, and point to niche-breakouts for what's working in the niche.
9. **Next check:** always set one for a breakout (growth unknown), so growth can be measured. Otherwise suggest the next time (2 hours, 24 hours, 3 days after posting), and stop suggesting checks once posts have settled.

## Output

**In chat:**
```
Since <date>: <n> posts, median <n> views against your typical views <n> (<±x%>). Best: "<caption>" at <n>× outlier.
Since the last check: <post> +<n> views (<n>/hour); <n> posts settled.
Comments: "<top question>" (<likes> likes).
Do next: <one action, tied to a post and a number>.
Next check: <when>, or none needed.
Report: virlo-research/<date>-launch-monitor-<handle>.md · Spent $<x>
```

**The report** (`virlo-research/<YYYY-MM-DD>-launch-monitor-<handle>.md`):
```markdown
# Launch check: @<handle> · <date, time UTC>

**The verdict:** …

## Posts in the window
| Posted | Post | Views | Outlier | Since last check | Likes / view | Verdict |

## Before vs after
| Window | Posts | Median views |

## What people are saying
…

## Do next
| Post | Verdict | Action | Based on |

## Next check
…

## Sources
| Post | Platform | Posted | Views | Outlier | URL |

**Method · Spend**
```

## Rules
- Public posts only. For a rival, answer the "how are the posts doing" question here, and hand strategy questions to competitor-watch.
- Compare with the account's own typical views from before the window, never with other accounts.
- A below-typical diagnosis names a difference on the page, never a cause the data can't show, and never blames the algorithm.
- Never start tracking without a yes. It bills $0.25 a check by itself.
- Keep the saved checks in `virlo-research/launch/`. They're the only way to measure growth honestly.

## Next
- → Answer the top comment in a video: script-writer
- → Understand why a post took off or flopped: video-teardown
- → See what's working in your niche right now: niche-breakouts
