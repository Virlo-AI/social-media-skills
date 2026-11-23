---
name: creator-finder
description: "Use when the user wants to find, shortlist or vet creators, influencers, micro-influencers or UGC creators on TikTok, Reels or Shorts for a partnership or campaign (by topic, a bio word such as dermatologist or nurse, follower range, account type, country or city), or asks whether an influencer is worth a fee, whether their numbers, views or followers are real, or whether to pay them. Use it even for one named creator (\"is @x worth $2,000?\"), so the answer rests on their live posts, not their profile. Searches Virlo's creator library, then vets each pick on their live posts (typical views, how many posts are 3× outliers or more, sponsored share, like rates on paid posts, posting gaps, claims risk), says what each fee costs per 1,000 of their typical views, and recommends yes, maybe or skip with reasons, a brief angle for each pick and a CSV. Optional: their inferred audience countries ($1 per creator, asks first). Not for one creator's content playbook (creator-teardown). About $0.10."
license: MIT
allowed-tools: Bash, Read, Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Creator finder: find TikTok influencers, vetted on their real posts

Finding creators is easy. Knowing which ones will actually reach people for you is the job. This skill searches, then **vets every shortlisted creator on their live posts**, because live posts show current reach. Each pick comes with a verdict, the numbers behind it and what to brief them on.

## When to use
- "Find creators for…", "who should we work with?", "UGC creators for skincare", "dermatologists on TikTok", "micro-influencers in London"
- "Is this creator worth $2,000?", "are her numbers real?", "vet this list"

Not for: one creator's full playbook (→ creator-teardown) or watching competitors (→ competitor-watch).

## Before you start
1. **Use the data layer in the sibling folder `../virlo-api/`.** It's installed alongside this skill; if it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`.
   - Read `../virlo-api/SKILL.md` and `../virlo-api/references/house-rules.md` before the first call.
   - Every HTTP call below runs through `$S`, which means the path `<this skill's folder>/../virlo-api/scripts/virlo.sh`, always called as `bash $S …`, run from the user's project folder. Never `cd` into the skill folder, so `virlo-research/` stays in their project. With MCP, use the tool named beside each call.
   - With no MCP and no key, use preview mode: show this skill's `samples/` labelled as a sample, plus the setup steps.
2. **Read `virlo-research/brief.md`:** the niche, creator size, platforms, region and language, the avoid list, and claims the brand can't make. With no size given, use 10K–500K (`../virlo-api/references/method.md` §7).
3. **Pick the path:**
   - **Named creators to vet** (a handle, a list, "is @x worth it"): skip to step 3 of the workflow.
   - **A country or city:** the creator search can't filter by place, so step 1 searches videos instead.
   - **Otherwise:** the creator search.
4. **Say the price in a reply to the user,** before the first paid call: "one creator search ($0.05) plus up to 5 live checks ($0.01 each): about $0.10." For named creators: "$0.02 each (profile and latest posts)."
   - The audience check is $1.00 per creator and always asks first.

## Workflow
1. **Search:**
   - **By topic or bio:** MCP `find_creators`; HTTP `POST /v1/search/creators`. Inputs: `topics` (alternatives with `|`), `bio_keywords` (one word they use for themselves), `creator_followers_min`/`max`, `creator_type: individual` (or `brand`), `platforms` (one or all three), `sort: top_performing` (or `rising` for creators whose typical video beats their follower count; use `rising` when the user asks for creators who "consistently post outlier videos", then judge that on the live page with the consistency count in step 3).
   - **YouTube handles** can come back as "@@Name": strip every leading "@" before the raw creator call.
   - **By country or city:** MCP `find_videos`; HTTP `POST /v1/search/videos` with `scope: virlo_library` (required), `topics`, `regions` (2-letter codes) or `places` (a city or suburb name), `creator_type: individual`, `creator_followers_min`/`max`, `posted_after` = today − 90, $0.05. Shortlist from the videos' authors, and from `overview.top_creators`.
   - Read `applied` and `not_applied`; a filter in `not_applied` is a caveat.
   - **Platforms:** the search takes one platform or all three, never a list of two. With several platforms in the brief, search all three and filter the page yourself, and say so.
2. **Shortlist as many as the user asked for** (4–5 by default, up to 10 at $0.01 each).
   - **Asked for more than 10?** Say so up front, in the price line: this run vets 10, and the next 10 cost the next search page ($0.05) plus their live checks ($0.10). Never return 10 silently.
   - If fewer pass vetting than they asked for, say so and offer the next search page ($0.05).
   - Expect live typical views to differ from the library median; that's never a reason to drop someone on its own.
   - Ranking:
   - rank by how `median_views` compares with `followers`, and by `on_topic_videos`;
   - treat `last_posted_at` more than 6 weeks ago as a reason to rank lower, never to drop: the library date can be stale. The live page in step 3 decides whether they're active;
   - drop off-topic bios, and bios that describe a meme, repost or clip page: rank only creators who present as the profession or niche;
   - prefer creators who show up in `breakout_videos` more than once.
   - From a video search there's no `median_views`. The page comes back topic-ranked, so sort it by `virality_score` first, then rank authors by their videos' Virality Score and by how many matching videos they have (`overview.top_creators[].videos`), and let the live check in step 3 do the rest.
3. **Vet each one on their live page,** $0.01: MCP `raw_creator_videos`; HTTP `GET /v1/raw/{platform}/creator/{handle}/videos`. For a named creator, also `raw_creator`, HTTP `GET /v1/raw/{platform}/creator/{handle}` ($0.01), for followers and bio.
   - A billed page that comes back with 0 posts: say so, mark that creator unmeasured (no verdict), and don't retry.
   - **Live typical views:** what the page's posts typically get. If 3 or more posts look bought (a paid label, or under 0.5% likes on a post with 1,000+ views), say so beside it: typical views aren't all organic reach. The live typical views is their real reach, and the fee check in step 4 uses it. Show the library `median_views` only as a note, never as a verdict on its own.
   - **Sponsored share:** posts tagged #ad, AD, partner, ambassador, a discount code or "I may make a commission". Note which brands, since an existing partner can be a conflict.
   - **Like rate on sponsored posts.** Under 0.5% on a post with 1,000+ views means that reach was most likely bought (a brand boosted it), so it says nothing about the creator's own reach. In the report, give the numbers, not the label.
   - **Consistency:** how many of the latest posts (up to 15) beat their live typical views by 3× or more, each measured against the creator's *other* posts (`../virlo-api/references/method.md` §1). Write it "6 of 15 at 3×+". It's the answer to "who consistently posts outliers".
   - **Like rates:** the lowest and highest on the page, from its counts, in the Vetted table.
   - **Gaps in posting,** and whether recent posts match the older ones. Any every / all / none claim about their posts carries its count ("14 of 15").
   - **Claims risk:** a disclosed factor, not a block. Count the captions that state a result (a skin, weight or money outcome), give the count ("4 of 15"), and always quote one exactly. Half or more, or any claim the brief rules out, means maybe at best.
   - **Saves vs shares:** for a product creator, high saves mean people keep the recommendation.
   - **Best on-topic post:** their best post on the brief's topic, with its outlier. It's what to brief them on.
4. **Fee check, when the user names a fee:** what the fee costs per 1,000 of their live typical views ("$2,000 for typical views of 40K views is $50 per 1,000 views"). Compare it only with the user's other options or their own numbers; never quote a "market rate" you didn't read.
5. **Audience check, only if asked** ($1.00 per creator; ask first, with the total): `POST /v1/satellite/creator` with `handle`, `platform` and `audience_geography: true`. Poll `GET /v1/satellite/creator/status/{job_id}`; if the audience is still in `pending_jobs`, re-read `GET /v1/satellite/runs/{run_id}` later.
   - Read `audience_geography.country_distribution` (top 3 `name` and `pct`), `confidence_level` and `sample_size`. It's inferred from people who comment: say so, and treat a low confidence as unknown.
6. **Verdict per creator,** with 2–3 reasons, each with a number:
   - **yes:** a live typical views measured on 3 or more posts and big enough for the brief, at least 2 posts at 3×+ when the user asked for consistency, most reach not bought, the live page has a post in the last 6 weeks, on topic, and result claims are in under half the captions and not ruled out by the brief (a check such as exclusivity or approved wording can still apply);
   - **maybe:** a real doubt to resolve first (reach not back after a gap, captions stating results, a sponsored post under 0.5% likes per view, captions that say they don't take sponsorships);
   - **skip:** reach mostly bought (half or more of the page's posts with a paid label or under 0.5% likes per view), no post on the live page in the last 6 weeks, or off brief. When the user asked for consistency, 0 posts at 3×+ is a skip too. A live typical views far below the library median is never a skip on its own.
   - For each yes or maybe, one **brief angle**: the format of their best on-topic post, what to ask them for, and what to check before signing (exclusivity, approved wording).
7. **Write the CSV** `virlo-research/<date>-creator-finder-<slug>.csv`. Columns: handle, platform, followers, live typical views, consistency (posts at 3×+ of those read), library median (note only), sponsored share, flags, verdict, brief angle, profile URL.
   - Never copy emails or phone numbers from bios. Say "contact in bio".

## Output

**In chat:**
```
Vetted <n> of <total> matches on their live posts:
Yes: @<handle> (live typical views <n> on <followers> followers, <n> of <n> posts at 3×+, <reason>). Brief: <angle>.
Maybe: @<handle> (<reason, in numbers>)   Skip: @<handle> (<reason, in numbers>)
<Fee: $<x> is $<n> per 1,000 of their typical views.>
Report + CSV: virlo-research/<date>-creator-finder-<slug>.md · Spent $<x>
→ <next step>
```

**The report** (`virlo-research/<YYYY-MM-DD>-creator-finder-<slug>.md`):
```markdown
# Creator shortlist: <brief> · <date>

**The short version:** …

## Vetted
| Creator | Followers | Typical views (live) | Consistency (3×+) | Library median (note) | Like rate (low–high) | Sponsored | Verdict | Why |

### @<handle>: <verdict>
- …
- **Brief them on:** …

## Also matched (not vetted)
| Creator | Followers | Library median | On topic | Last posted |

## CSV
## Sources
| Platform | @handle | Views | Posted | URL |
(every video the report cites)

**Method · Spend**
```

## Rules
- Never recommend a creator from library numbers alone. Every yes has a live check.
- The verdict rests on the live page: the live typical views for reach and the consistency count for "posts outliers". The library median is a note, never a skip trigger.
- Boosted reach isn't the creator's reach. Flag sponsored posts under 0.5% likes per view.
- Public creator accounts only. Never look up a private person, and never use the place search to work out where a creator lives or goes.
- No personal contact details in reports. Link the profile.
- Don't judge a creator's character, looks or identity. Judge their numbers, their topic fit and claims risk.
- Describe named creators by evidence, never by judgement: "2 of 15 posts carry a paid label; likes per view on those are 0.2% vs 4.1% on the rest", not "looks boosted"; "3 of 15 captions state a skin result", not "makes claims a brand can't". The verdict follows from the numbers.

## Next
- → Study a "yes" creator's whole playbook: creator-teardown
- → Find what to brief them on: content-ideas
- → Write the brief as a script they can film: script-writer
