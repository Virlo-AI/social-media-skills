---
name: sound-scout
description: "Use when the user asks which TikTok, Reels or Shorts sounds, songs or audio are trending or blowing up, which sound to use on their next video or this week before it peaks, whether a specific song or sound is safe or cleared for a brand or business account (\"can our brand use this song?\"), or what a trending sound is actually being used for. Use it even for a quick ask, so the pick rests on live growth and clearance instead of a guess. Reads Virlo's breakout sounds (fastest-growing against their own normal weekly rate, with TikTok's commercial-use flag), opens the top candidates to see the format each one carries, and gives sounds to use now (each with how to film it), to watch and to avoid. Not for memes and formats in general (trend-radar). About $0.75; checking one named song $0.10 to $0.40."
license: MIT
allowed-tools: Bash(bash *virlo.sh* *) Bash(jq *) Bash(date *) Read Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Sound scout: trending TikTok sounds before they peak, cleared for brands

A sound is worth using when it's early, when you know what people are doing with it, and, for any business account, when it's cleared for commercial use. This skill checks all three before recommending anything, then says how to film each pick.

## When to use
- "What sounds are trending?", "which audio should we use this week?", "what song should I put on this reel?", "is this sound blowing up?"
- "Can our brand use this song?", "is this sound cleared for business?", "what is everyone using this sound for?"

Not for: formats and memes in general (→ trend-radar, which lists breakout sounds too but doesn't open them), what works in one niche (→ niche-breakouts).

## Before you start
1. **Load the data layer.** It's the sibling folder `../virlo-api/`, installed alongside this skill. If it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`. Read `../virlo-api/SKILL.md` (data path, setup, errors) and `../virlo-api/references/house-rules.md` before the first call. `$S` in any command below means `<this skill's folder>/../virlo-api/scripts/virlo.sh`, run as `bash <this skill's folder>/../virlo-api/scripts/virlo.sh …` from the user's project folder (never `cd` into the skill folder, so `virlo-research/` stays in their project). With no MCP and no key, use preview mode: show `samples/` labelled as a sample, plus the setup steps.
2. **Read `virlo-research/brief.md`.** A brand or business account on TikTok can only use sounds cleared for commercial use; a creator can use any. Instagram and YouTube sounds carry no clearance flag in Virlo.
3. **Pick the path:**
   - **One named sound** ("can we use <song>?"): step A.
   - **What to use:** steps 1 to 5.
4. **Say the price in a reply to the user,** before the first paid call:
   - What to use: "the breakout list ($0.25) plus the videos behind 2 sounds ($0.25 each): $0.75." A third sound brings it to exactly $1.00, which needs no ask.
   - **Ask first once the run would pass $1.00,** counting only what this run actually pays (a breakout list reused for free counts $0): for example a fourth sound, or a usage-history read on top of a paid list and three opened sounds. Say the new total ("that brings it to $1.05") and wait for a yes.
   - One named sound: "a title search ($0.10), plus $0.05 for its details if the search doesn't show clearance, plus $0.25 to see what it's used for."
   - If a trend-radar run from today saved the breakout list, reuse it for free and say so.

## Workflow

### A. One named sound
1. **Find it:** MCP `get_trending_sounds` (title search); HTTP `GET /v1/sounds/search` with `q` = the title and `platform`.
   - Match the title and owner the user named. If 2 or more results could be it, show the top 3 (title, owner, uses) and ask which.
   - Nothing found: say Virlo hasn't indexed it, and that clearance is unknown. Never guess.
2. **Clearance:** read `is_commerce_music`. If the search reply doesn't carry it, read `GET /v1/sounds/{sound_id}` ($0.05).
   - `true`: cleared for commercial use on TikTok. `false`: not cleared, so a business account shouldn't use it. `null`: not reported (always on Instagram and YouTube).
3. **What it carries** (if they want to use it): step 4 for this one sound.
4. **Answer in one line:** yes, no or unknown, with the reason. If it's no, offer the breakout list ($0.25) to find a cleared sound that carries the same mood.

### 1. The breakout list
- MCP `get_trending_sounds {view: breakout}`; HTTP `GET /v1/sounds/breakout`.
- Inputs: `platform` from the brief, `limit: 30`, and `commerce_only: true` (exactly `true`) for any business account on TikTok.
- **Several platforms in the brief:** the list takes one `platform`, so read TikTok (the only platform with sound clearance) and say so. Offer Reels or Shorts at $0.25 a list.

### 2. How early is each sound?
- **`acceleration`:** how much faster it's being used this week than its normal weekly rate over the 4 weeks before. Quote it as the API gives it; never work it out yourself.
- **Make it readable** with `videos_7d` and `prior_weekly`: "560 videos this week, against about 4 a week before."
- **How much of its last 30 days is this week** (`videos_7d` against `videos_30d`): nearly all means the sound is days old in Virlo's sample; much less means it's been around.
- **`usage_count`** is TikTok's own count of posts using it: how big the sound already is beyond Virlo's sample. Quote it as the sound's size; never call it lagged or tell the user to ignore it.
- **Small base:** a high acceleration on a few dozen videos this week is a Watch, not a Use now, unless its videos already show a clear format.
- **"Has it peaked?"** (optional, $0.05 a sound; counts toward the $1.00 ask): `GET /v1/sounds/{sound_id}/usage-history` (MCP `lookup_sound`) gives its daily use. The newest days are still being counted as videos are found, so judge the curve on days at least 4 days old.

### 3. Clearance and safety
- Drop sounds with `is_commerce_music: false` for business accounts.
- Drop explicit or tragedy-linked audio for brands.
- Instagram and YouTube sounds report no clearance (`null`). Say so; never assume they're cleared.

### 4. What it carries
For the top 2 candidates (pass each sound's `id`, never `external_id`; see Rules): MCP `lookup_sound {sound_id, view: videos, sort: views_desc, limit: 5}`; HTTP `GET /v1/sounds/{sound_id}/videos` with `sort: views_desc`, `limit: 5`.
- Read the top videos' captions to find the format the sound carries: a meme line, a dance, a montage, a story.
- This reply carries no `intelligence`, `is_paid` or video `duration`. Read the format from the captions.
- Take the length from the sound's own `duration` (TikTok, on the breakout or search reply): the video runs about that long.
- Leave likely paid posts out of the proof: likes under 0.5% of views on a post with 1,000 views or more.
- A sound tied to a Content Trend (trend-radar) is two signals agreeing. Say so.

### 5. Recommend
- **Use now: 1 to 3 sounds.** Each with the format it carries, its numbers, its clearance and:
  - **Your version:** the user's own subject in that format (for a gaming clips account, a gameplay clip cut on the beat, not a guide).
  - **Film it:** 3 shots that fit in the sound's length, following what its top videos do, and the on-screen line.
  - When every candidate is tied to one subject (one game, one show), say so in the first chat line.
- **Watch:** early, small or unopened sounds, each with what would move it up.
- **Avoid:** not cleared, fading or the wrong mood, with the reason. Only put a sound here if you opened its videos or its clearance rules it out; unopened sounds go under Watch.

## Output

**In chat:**
```
Use now: <sound> (<videos this week>, <n>× its normal rate, cleared): it carries <format>.
Film it: <3 shots in one line> · on screen "<line>" · proof: <link>, <views>
Watch: <sound>. Avoid: <sound> (<reason>).
Report: virlo-research/<date>-sound-scout-<slug>.md · Spent $<x>
```
For one named sound: `<sound>: <cleared / not cleared / unknown> for commercial use on TikTok. <what it carries, or what to use instead>.`

**The report** (`virlo-research/<YYYY-MM-DD>-sound-scout-<slug>.md`):
```markdown
# Sound scout: <account> · <date>

## Use now
### <sound title> · <owner>
- **Numbers:** <videos 7d> this week (about <prior_weekly> a week before) · <acceleration>× · <share of 30-day videos in the last 7 days> · TikTok uses <usage_count>
- **Cleared:** yes / no / unknown
- **What it carries:** <the format, from the top videos>
- **Your version:** …
- **Film it:** 1. … 2. … 3. … · on screen: "…"
- **Proof:** <top video links>

## Watch
| Sound | Why not yet | What would move it up |

## Avoid
| Sound | Why |

## Sources
| Sound | Videos 7d | × its normal rate | Cleared | Page |

**Method:** <list read, sounds opened, how timing and clearance were judged>
**Spend:** <actual>
```

## Rules
- Never tell a business account to use a sound with `is_commerce_music` false or unknown without saying so plainly.
- "Cleared" is TikTok's commercial-use flag, not legal advice. Before running a sound in paid ads, confirm it in TikTok's Commercial Music Library.
- Virlo's video counts are its own sample; `usage_count` is TikTok's total. Say which number you quote.
- Read the videos before recommending a sound. A sound's mood comes from how people use it, not from its title.
- **Which id:** every `/v1/sounds/{sound_id}…` read and every MCP `lookup_sound` call takes the sound's `id` (Virlo's UUID from the breakout or search reply). Never pass `external_id` or a raw video's `sound.id`: `lookup_sound` treats a platform music id as the async sound lookup, which costs $0.50 ($1.00 with trend analysis).
- **Links:** link the proof videos by their `url`. The only built link allowed is the TikTok sound page, `https://www.tiktok.com/music/x-<external_id>` (TikTok sounds only, from `external_id`, never from `id`). Never download audio.

## Next
- → Turn the sound into post ideas: content-ideas
- → Script the video on the sound: script-writer
- → See whether it's used in your niche: niche-breakouts
