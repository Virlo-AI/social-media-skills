---
name: local-scout
description: "Use when a local business (cafe, restaurant, bar, salon, gym, clinic, shop, studio) or a brand asks what's working on TikTok or Instagram Reels in their city, suburb, postcode or near an address: \"TikTok ideas for my cafe in Melbourne\", \"what do people film near us\", \"what's trending near me\", \"which venues around here get tagged most\", \"local creators who review places like mine\". Use it even for a quick local ask, so the answer rests on real videos tagged in the area, not guesses. Finds the places creators tag nearby, the videos tagged there ranked by Virality Score, which of them are outliers for their creator, and the local creators behind them, then gives up to 3 filmable moves. Says plainly when coverage is thin (few posts carry a place tag, and Shorts carry none) and offers the next step. Not for niche-wide trends with no place (niche-breakouts), and never for tracking a person. About $0.15 to $0.25."
license: MIT
allowed-tools: Bash(bash *virlo.sh* *) Bash(jq *) Bash(date *) Read Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Local scout: local TikTok and Reels trends for businesses near you

For a cafe in Carlton or a salon in Brooklyn, "what's trending" means what's working **near them**. Virlo knows which videos creators tagged at a place. This skill finds:
- the places in the area that get filmed;
- what the videos tagged there do, and which of them are outliers for their creator;
- the local creators who post about businesses like the user's;
- up to 3 moves the business can film this week.

Place data is still sparse. The skill says so with counts, and offers the next step instead of guessing.

## When to use
- "What's working for cafes in Melbourne?", "what do people film near us?", "TikTok ideas for my salon in Fitzroy", "what's trending near me?"
- "Which venues around here get tagged the most?", "local creators who review places like ours"

Not for: a niche with no place in it (→ niche-breakouts), formats spreading everywhere (→ trend-radar), or vetting a creator you already found (→ creator-finder).

## Before you start
1. **Use the data layer in the sibling folder `../virlo-api/`.** It's installed alongside this skill; if it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`.
   - Read `../virlo-api/SKILL.md` and `../virlo-api/references/house-rules.md` before the first call.
   - Every HTTP call below runs through `$S`, which means the path `<this skill's folder>/../virlo-api/scripts/virlo.sh`, always called as `bash $S …`, run from the user's project folder. Never `cd` into the skill folder, so `virlo-research/` stays in their project. With MCP, use the tool named beside each call.
   - With no MCP and no key, use preview mode: show this skill's `samples/` labelled as a sample, plus the setup steps.
2. **Get the business type and the area:** a suburb, city, postcode or venue name, plus the country.
   - "Near me" with no place: ask for the suburb or postcode. Never guess it.
   - For a radius you need real coordinates, from a place result or from the user. Never guess them.
3. **Read `virlo-research/brief.md`** if it exists (what they sell, what they can film, avoid list). What they can film only shapes the moves in step 7: never pass it as `looks_like` into a search, since that reranks away from Virality Score and narrows the area. Use `looks_like` only when the user asks for a look in this request.
4. **Say the price in a reply to the user,** before the first paid call: "a place search ($0.05), a tagged-video search ($0.05), the videos at one venue ($0.05) and up to 3 creator checks ($0.01 each): about $0.18. Searches that return nothing are free."

## Workflow
1. **Places:** MCP `find_places {q, locality | postcode, country}`; HTTP `GET /v1/places`.
   - `q` is a word in the place name ("cafe", "coffee"); `locality` is the suburb or city, matched exactly; `country` is a 2-letter code (AU, US, GB).
   - Leave `kind` out unless the user wants venues only: Instagram places carry no kind, so `kind` drops them all.
   - Read `name`, `locality`, `video_count`, `lat`, `lng`, `id`, and rank by `video_count`; break ties by the venue's most recent tagged video. It's Virlo's count of tagged videos, never TikTok's.
2. **Videos about the business type there:** MCP `find_videos`; HTTP `POST /v1/search/videos`.
   - Inputs: `scope: virlo_library` (required), `topics` (the type, 2–4 words, alternatives with `|`, e.g. `"cafe|coffee shop"`), `places` (area or venue names or postcodes as written, e.g. `["carlton", "3053"]`) **or** `near`, an array: `["lat,lng,km"]` from a place result, 0.1–200 km (a bare string is refused), `posted_after` = today − 90 (local data is sparse; 30 days rarely holds 10 videos), `sort: most_viral`.
   - Read `applied`, `not_applied`, `thin` and `next_step`.
   - **Platforms:** the search takes one platform or all three, never a list of two. With several platforms in the brief, search all three and filter the page yourself, and say so.
   - The page comes back topic-ranked, even with `sort: most_viral`. Sort it by `virality_score` yourself before taking any top N.
   - **Check the place:** a name matches anywhere it appears ("Carlton" can be a hotel in another country). Keep a video only when its `location.locality`, `location.city` or `location.country` is the user's area.
   - **Label every result** on-type (about a business like the user's) or off-type (a venue event, unrelated). Make the breakdown add up to the total.
   - **Who posted each one:** a local creator, the business itself (the handle or bio names the venue), a chain's brand account, or a visitor. Call something a partnership only when the caption or `is_paid` says so.
   - `is_paid: true`, or likes under 0.5% of views on 1,000+ views: bought reach. List apart, never cite as what works.
3. **The venue most like the user's** with the most tagged videos (skip this if none has 2 or more): MCP `find_places {place_id}`; HTTP `GET /v1/places/{id}/videos` with `sort: most_views` ($0.05). Read the videos from `data.videos` (`data.place` is the venue). What gets filmed there, and by whom. Count it separately from step 2, with dates, and drop anything older than the window.
4. **Measure the top 3 on-type videos by Virality Score** against their creator's other posts (N× outlier): `raw_creator_videos`; HTTP `GET /v1/raw/{platform}/creator/{handle}/videos`, one page, $0.01 each.
   - A billed page that comes back with 0 posts: say so, mark that creator unmeasured, and don't retry.
   - outlier and the repeat check as in `../virlo-api/references/method.md` §1. Under 3 other posts: unmeasured.
   - This splits a real local breakout from a creator who always gets those views, and tells you which local creators are worth approaching.
5. **Thin results:** fewer than 10 on-type videos after labelling, or `thin: true`.
   - Say the counts first.
   - If a venue gave real coordinates, run the wider `near` search once (5–10 km, $0.05) before writing moves.
   - Then offer, in this order, each with its price:
     - a wider area (the city instead of the suburb, a radius up to 10 km);
     - a broader topic (food instead of cafe);
     - formats local businesses are copying everywhere right now (trend-radar, with Content Trends filtered to local businesses, about $0.25);
     - the niche-wide view without the place filter (niche-breakouts, about $0.25);
     - the reply's `next_step`: a one-time research agent ($0.50) that collects fresh videos. Never started unasked.
6. **What works locally:** for each video worth citing, the opening (its `intelligence.hook_text` if analysed, else the caption), the format, the claim it makes about the place (a price, a dish, a view, a wait), who posted it, its Virality Score and outlier.
7. **Moves for the business: up to 3.** Each one is filmable tomorrow:
   - **film it:** what's on screen and who's on camera; **open with:** the first line or on-screen text, written for this business (no 4 words in a row from a source video);
   - **who posts it:** the business, or a local creator (say what to ask them for);
   - **built on:** the cited local video and its outlier (or its Virality Score and band when unmeasured), or the count behind it.
   - If no on-type video earns a move, give fewer moves and say why.

## Output

**In chat:**
```
<Area>, <type>: Virlo holds <n> tagged videos since <date> (<thin / enough to read>).
Best local signal: <@handle>'s <what it shows>, <views> views, <n>× outlier.
Make next: <move 1: what to film, who posts it>.
Local creators to approach: <@a> (typical views <n>), <@b>.
Report: virlo-research/<date>-local-scout-<slug>.md · Spent $<x>
→ <next step>
```

**The report** (`virlo-research/<YYYY-MM-DD>-local-scout-<slug>.md`):
```markdown
# Local scout: <type> in <area> · <date>

**The honest picture:** <counts, window and coverage, in two or three lines>

## Places that get tagged
| Place | Suburb | Tagged videos (Virlo) |

## What's working locally
| Video | Who posted | Views | VS | Outlier | What it shows |

## Local creators who post about places like yours
| Creator | Followers | Typical views | Their local video | Outlier |

## Moves for you
1. **<move>.** Film it: … · Open with: "…" · Who posts: … · Built on: <cited video, outlier or VS>

## To go further
<wider asks and the research agent, each with its price>

## Sources
**Method · Spend**
```

## Rules
- Places are venues and areas, never people. Never track, map or describe one person's movements, never list the places one creator has tagged, and never infer where anyone lives from tags.
- Use `near` only around a business, venue or area, never around a home address or a person. If asked to locate a person, decline that part.
- People who appear in a video aren't "creators". List only the public accounts that posted, and only for the post cited.
- Say "tagged at". A place count is Virlo's count of tagged posts, never TikTok's total.
- Beta coverage is thin in many cities. Say the count before drawing any conclusion from it, and never call one video "what works in <city>".

## Next
- → Vet the local creators before you pay them: creator-finder
- → The niche-wide view without the place filter: niche-breakouts
- → Fresh local videos every week: niche-monitor
