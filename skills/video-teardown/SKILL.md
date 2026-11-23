---
name: video-teardown
description: "Use when the user asks about one TikTok, Reels or Shorts video: why it went viral, blew up, worked or flopped, whether it really popped or the account always gets those numbers, how it is structured, or how to reverse-engineer, recreate or remake it for their own brand. Also for the user's own post that flopped. Use it even before they paste the link (ask for it). Measures it against the creator's typical views, reads the live numbers (shared vs saved), checks whether it rode a sound or hashtag the creator rarely uses, reads the timed transcript beat by beat and the top comments, then gives the reasons in specifics and a filmable remix with openings to test. Not for a whole account (creator-teardown) or a niche (niche-breakouts). About $0.04; Virlo's full video analysis adds $0.50 on request."
license: MIT
allowed-tools: Bash, Read, Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Video teardown: why this TikTok went viral, and a remix for you

"Why did this blow up?" deserves more than "great hook, relatable content". This skill answers with five readings of one video:
- **The numbers:** how big an outlier it is for its creator, and whether people shared it or saved it.
- **Repeats and riding:** whether the creator has done it before, and whether it rode a sound or hashtag they rarely use.
- **The timeline:** what's said when, second by second.
- **The comments:** what viewers responded to.
- **For a flop:** what the creator's best post did that this one didn't.

Then it writes a remix the user can film, with openings to test.

## When to use
- "Why did this go viral?" plus a link, "break down this video", "how do I make something like this?", "reverse-engineer this reel"
- "Did this video actually pop, or does this account always get these numbers?"
- A competitor's hit, the user's own hit, or the user's own flop ("why did my video flop?").

Not for: a whole account (→ creator-teardown) or a niche (→ niche-breakouts).

## Before you start
1. **Use the data layer in the sibling folder `../virlo-api/`.** It's installed alongside this skill; if it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`.
   - Read `../virlo-api/SKILL.md` and `../virlo-api/references/house-rules.md` before the first call.
   - Every HTTP call below runs through `$S`, which means the path `<this skill's folder>/../virlo-api/scripts/virlo.sh`, always called as `bash $S …`, run from the user's project folder. Never `cd` into the skill folder, so `virlo-research/` stays in their project. With MCP, use the tool named beside each call.
   - With no MCP and no key, use preview mode: show this skill's `samples/` labelled as a sample, plus the setup steps.
2. **Get the video URL** (or the platform and ID). Transcripts may come back empty for Instagram; if so, step 3 reads the caption and on-screen text instead (the call is still billed).
3. **Read `virlo-research/brief.md`** if it exists, for the remix. Without it, ask what the user sells or makes in one line, or write the remix for a general account and say so.
4. **Say the price in a reply to the user,** before the first paid call: "live numbers, the creator's latest posts, transcript and one page of comments, $0.01 each: $0.04. A flop adds $0.01 for the creator's best post."
   - **Virlo's full video analysis, on request only:** `analyze_video`, `POST /v1/satellite/video`, $0.50, async, free again for the same video within 6 hours. Offer it when the creator's page has fewer than 3 other posts, or the user wants the video ranked against up to 100 of the creator's posts.

## Workflow
1. **Live numbers:** MCP `raw_video`; HTTP `GET /v1/raw/{platform}/video`.
   - Read `stats` (views, likes, comments, shares, saves), `duration_seconds`, `published_at` (UTC), `caption`, `hashtags`, `sound` and `author.handle`.
   - **Shares vs saves, per 100 views:**
     - share-led means people sent it to someone (identity, humour, outrage);
     - save-led means people kept it (reference, recipe, tutorial).
     - Say which, with both rates. A null count isn't exposed on that platform: say so and leave that rate out.
   - **Bought reach:** a paid label (#ad, "paid partnership") or likes under 0.5% of views on 1,000+ views means the views were most likely bought. Say so, and don't call it viral.
   - **Comments reading 0** on a video that clearly has some means comments are off now.
2. **Against the creator's typical views:** MCP `raw_creator_videos`; HTTP `GET /v1/raw/{platform}/creator/{handle}/videos`, one page.
   - **Typical views:** what their other posts typically get; the video never counts toward its own typical views. Leave out pinned posts and missing counts (`../virlo-api/references/method.md` §1). Fewer than 3 other posts: unmeasured; offer the full analysis.
   - A billed page that comes back with 0 posts: say so, mark the video unmeasured, offer the full analysis, and don't retry.
   - If the video is older than the page, say typical views comes from newer posts, with their dates.
   - **Verdict,** in the bands of `../virlo-api/references/method.md` §1: breakout (3× or more), above typical (1.5× to 3×), about typical (0.67× to 1.5×), or below typical (under 0.67×: a flop for this account).
   - **Repeat check:** their other posts at 10×+, and whether they share the format: 2 or more is repeatable, none is a one-off (`method.md` §1). If every caption on the page is the same, captions can't show a shared format: read the transcripts of up to 2 other 10×+ posts ($0.01 each), or say the format repeat is unchecked.
   - **Did it ride something?** Compare this video's `sound.title` and `hashtags` with the other posts on the page. A named sound (not the creator's own "original sound") or a trend, challenge or meme hashtag (not a topic word like #skincare) that's on none of their other posts, or a caption that says it joined a trend, is evidence it rode one. Name it as evidence, not a proven cause; confirm with sound-scout or trend-radar.
3. **The timeline:** MCP `raw_transcript`; HTTP `GET /v1/raw/{platform}/video/transcript`.
   - Split `segments` into beats with timestamps: the hook (0–3 s), the setup, each turn, the payoff, the ending. Time each quoted line from its own segments; never give a merged line the first segment's range.
   - Note anything the edit did: a line moved to the front, an ending that loops back to the start, a cut on the payoff.
   - With `has_transcript: false`, or an empty reply on Instagram, read its structure from the caption and the on-screen text the user can see, and say the transcript was unavailable.
4. **What viewers responded to:** MCP `raw_comments`; HTTP `GET /v1/raw/{platform}/video/comments`.
   - Read one page and group it by what each comment reacts to (the person, the product, the claim, the joke).
   - Quote the top 2–3 exactly, with likes.
   - If the product draws few comments while the person draws thousands, say so: it tells the user what actually sold the video.
5. **A flop** (below typical): read the transcript of the creator's best post on the same page ($0.01) and compare the two beat by beat: the first line, how fast the point arrives, the length, the ending. The differences are the reasons.
6. **Why it worked (or didn't):** 3 to 5 reasons, each pointing at a beat, a number or a comment. Never "good hook" or "relatable". A count of lines or beats must match the beat table row by row.
7. **The remix:** the same structure for the user's account.
   - A beat-by-beat outline with timings, the opening line and on-screen text, and brackets for facts only the user has.
   - **Two more openings to test,** each a different hook type from the main one.
   - Keep the format's cast and setting: a two-person clip or an overheard conversation stays two voices.
   - No remix line repeats 4 or more words in a row from the transcript; write it in the user's own voice.
   - Add what not to copy: the creator's personal details, their exact words, anything that only works because of who they are.

## Output

**In chat:**
```
Verdict: <breakout / above typical / about typical / below typical>. <n>× outlier (<views> vs typical views of <n>), <share-led / save-led> (<shares>% shared, <saves>% saved).
<Repeat: n other posts at 10×+ in the same format / a one-off>. <Rode: a sound or hashtag they rarely use, or nothing>.
Why: <reason 1>; <reason 2>; <reason 3>.
Your version opens: "<opening line>" (full outline and 2 more openings in the report)
Report: virlo-research/<date>-video-teardown-<slug>.md · Spent $<x>
→ <next step>
```

**The report** (`virlo-research/<YYYY-MM-DD>-video-teardown-<slug>.md`):
```markdown
# Teardown: <creator> · "<first line>"

**Verdict:** <one or two lines>

## The numbers
| Views | Outlier | Likes | Comments | Shares | Saves | Length | Posted (UTC) |
- Repeat check: … · Rode: …

## Beat by beat
| Time | What happens | Why it's there |

## What viewers responded to
- "<exact comment>" · <likes>

## Why it worked
1. …

## Your remix
| Time | Beat | Line / on screen | Shot |
**Openings to test:** 1. … 2. …
**Don't copy:** …

## Sources
**Method · Spend**
```

## Rules
- Every reason points at something you read: a beat with its timestamp, a number or a quoted comment.
- outlier comes from the creator's own page; never call a video viral from raw views alone.
- A sound or hashtag the creator rarely uses is evidence it rode something, never proof of why it worked.
- Quote the transcript and the comments exactly. The remix is original: the structure, never the words.
- Private people (interviewees, passers-by, guests) and commenters are never named in the report or the remix: describe them ("a 70-year-old woman stopped in the street"). A public figure who is the video's subject (the CEO a story is about) may be named as its subject. Name the account that posted.
- Never put a real person's private details into the user's remix. Brackets for anything the user must supply.

## Next
- → Write the remix as a full script: script-writer
- → See whether this creator repeats it: creator-teardown
- → Find more breakouts like it in the niche: niche-breakouts
