---
name: virlo-api
description: Use when calling Virlo for short-form video research on TikTok, YouTube Shorts and Instagram Reels, over its API or MCP server, or when the user asks how to set up or connect Virlo, where to get a key, whether their key works, what their balance is, what a call costs, or why a Virlo call failed (401, 402, 429). Covers searching Virlo's analysed video and creator library, hooks, sounds, hashtags, Content Trends, Topic Trends, places, creator and video lookups, live posts, comments and transcripts, Meta ads, research agents and tracking. It is the data layer, setup guide, cost guide and research method that every other Virlo research skill uses; read it before any Virlo call. Checking the key and the balance is free.
license: MIT
allowed-tools: Bash(bash *virlo.sh *) Bash(jq *) Bash(date *) Read Write WebFetch
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
  openclaw: '{"primaryEnv":"VIRLO_API_KEY","homepage":"https://dev.virlo.ai","tags":["virlo","tiktok","instagram","youtube-shorts","social-media","research","viral","hooks","trends"]}'
---

# Virlo API: TikTok, Instagram Reels and YouTube Shorts data for AI agents

Virlo has analysed 23M+ social videos across TikTok, YouTube Shorts and Instagram Reels. For each one it knows the format, the hook, the sound and the topic, and how big an outlier the video was for its creator. This skill is how an agent reads that data cheaply and correctly. The research skills in this pack (niche-breakouts, hook-bank, trend-radar and the rest) all go through it.

Read these files in this skill's folder as you need them:
- `references/house-rules.md`: rules for every run (cost, grounding, output). **Read it before the first call.**
- `references/method.md`: how breakouts, patterns, ideas and thin results are measured.
- `references/endpoints.md`: every live endpoint, its inputs, cost and MCP tool. Generated from the live spec.
- `references/fields.md`: what the main responses contain.
- `scripts/virlo.sh`: makes one API call, saves the response and logs its cost.

Workflow skills are installed beside this one, so they call this folder `../virlo-api/` and its script `$S` = `<this skill's folder>/../virlo-api/scripts/virlo.sh` (the path only), always called as `bash $S …`. Run it from the user's project folder, never after a `cd` into a skill folder: the script writes `virlo-research/` (reports, `.cache/` and the spend log) under the folder it's run from, so that's where the user's research stays.

## 1. Pick the data path (in this order)

1. **Virlo MCP tools are available** (tool names such as `find_videos`, `search_hooks`, `raw_creator_videos`, any prefix): use them.
   - **Check before any paid call:** `get_credit_balance` (free). The Claude Code plugin always registers the Virlo MCP server, even for someone with no account, so the tools being there proves nothing.
   - **If the tools need a sign-in the person hasn't done, the balance check fails, or the balance is $0,** try an API key (2); without one, use preview mode (3). Don't start a sign-in or a paid call to get past it.
   - MCP replies don't show what a call cost. The balance before the first paid call and again at the end gives the spend.
2. **An API key is available:** run `bash <this skill's folder>/scripts/virlo.sh check` (free). It prints `status=200 key=set balance=$… credits=…` when ready.
   - The script finds the key in `$VIRLO_API_KEY`, `~/.config/virlo/env` or `./.env` without printing it.
   - `status=no_key` means there's no key: go to 3. `status=401` means the key is wrong: give the setup steps in §2.
3. **Neither, or MCP not usable yet: preview mode.** Make no paid calls.
   - Show the sample report from the requesting skill's `samples/` folder that's closest to the user's niche, and label it clearly: "Sample report (real data from <date>, not your niche, not live)".
   - Then give the short setup in §2, and say what the live run would cost for *their* ask (from the requesting skill's typical cost).
   - Never present the sample as live data, and never "fill in" the user's niche with made-up numbers.

## 2. Setup (for the person, when there is no key)

Give this in short form. It takes about two minutes.

1. **Sign up** at https://dev.virlo.ai/?via=skills&utm_source=github&utm_medium=skills&utm_campaign=social-media-skills and add API balance, from $10.
   - The balance never expires and there's no subscription. A typical research run costs $0.01–$1; a full niche-breakouts run is about $0.25.
2. **Connect, one of two ways** (both spend the same API balance):
   - **MCP, no key to copy (fastest in Claude Code):** `claude mcp add --transport http virlo https://dev.virlo.ai/api/mcp/mcp`, then sign in to Virlo when asked. Other apps: https://dev.virlo.ai/docs/mcp.
   - **API key:** create one at https://dev.virlo.ai/dashboard/api-keys (it starts with `virlo_tkn_`), then `export VIRLO_API_KEY=virlo_tkn_...`, or put a `VIRLO_API_KEY=` line in `~/.config/virlo/env` so every session finds it.
3. **Check it:** `bash <this skill's folder>/scripts/virlo.sh check` (free), or ask "what's my Virlo balance?".
4. **First useful answer:** "set up my brand" (brand-brief, free), then "what's breaking out in <your niche>?" (niche-breakouts, about $0.25).

Never ask the person to paste a key into the chat.

## 3. Making calls (HTTP)

```bash
S=<this skill's folder>/scripts/virlo.sh   # run from the user's project folder: it writes ./virlo-research/
bash $S POST /v1/search/videos '{"scope":"virlo_library","topics":["skincare routine"],"posted_after":"2026-10-22","sort":"most_viral"}'
bash $S GET  /v1/raw/tiktok/creator/somehandle/videos
bash $S GET  /v1/hooks/search q="nobody talks about" platform=tiktok limit=20
bash $S spend 1763740800      # what this run spent, since a unix time
```

- **Each call prints one line:** `status=200 cost=$0.05 credits=5 balance=... file=virlo-research/.cache/....json`. Read the file for the data.
  - With `jq`: `jq '.data.videos[] | {url, views, virality_score, u: .author.username}' FILE`.
  - Otherwise use the Read tool. Don't paste whole responses into the chat.
- **Note the start time first** (`date +%s`), so `spend <start>` reports this run only.
- **For GET calls,** pass query inputs as `name=value` arguments; the script URL-encodes them. For POST and PUT, pass a JSON string or `@file.json`.
- **No bash?** Use the same request with curl: `curl -sS "https://api.virlo.ai/v1/..." -H "Authorization: Bearer $VIRLO_API_KEY"`. Note the `X-Cost` response header.
- **Video search needs `scope`** on every first page (only a `cursor` page can leave it out): `virlo_library` for the whole library ($0.05 a page), `my_research` or `agent` (with `agent_id`) for the user's own research agents (free). Without it the call is refused.
- **List inputs are lists,** marked `[]` in `references/endpoints.md`: `"topics":["a|b"]`, `"platforms":["tiktok"]`, `"near":["-37.81,144.96,5"]` (lat, lng and km in one string, inside a list).
- **Platforms in a search: one, or leave it out for all three.** Two of three goes to `not_applied` and searches all. For two platforms, search all and filter the results by `platform` yourself.
- **Topic alternatives:** use at most 3 per item (`"skin barrier|barrier repair|barrier cream"`). A 4th was dropped without a word in a live run, listed in neither `applied` nor `not_applied`, so check `applied` for every word you sent.
- **If an input isn't in `references/endpoints.md`,** read that path in the live spec: `https://api.virlo.ai/openapi.json`. Inputs the API doesn't know are often ignored silently, so check `applied` and `not_applied` in search replies.

## 4. Route by intent

| You want | MCP tool | HTTP | Cost |
|---|---|---|---|
| Videos in a niche, by topic, look, region, language, creator size, place | `find_videos` | `POST /v1/search/videos` | $0.05 / page of 25 |
| Creators in a niche, or by a word in their bio | `find_creators` | `POST /v1/search/creators` | $0.05 / page |
| A creator's latest posts, live (for the outlier baseline) | `raw_creator_videos` | `GET /v1/raw/{platform}/creator/{handle}/videos` | $0.01 / page |
| One creator's profile, live | `raw_creator` | `GET /v1/raw/{platform}/creator/{handle}` | $0.01 |
| One video's numbers now (a URL or a short share link) | `raw_video` | `GET /v1/raw/{platform}/video` | $0.01 |
| Comments / transcript of a video | `raw_comments` / `raw_transcript` | `GET /v1/raw/{platform}/video/comments` · `/transcript` | $0.01 / page |
| Live keyword or hashtag videos (not analysed) | `raw_search` / `raw_hashtag` | `GET /v1/raw/{platform}/search` · `/hashtag/{hashtag}` | $0.01 / page |
| Proven hooks by phrase or type / the best hooks right now | `search_hooks` | `GET /v1/hooks/search` · `/v1/hooks/trending` | $0.25 |
| Which hook styles win (stats) | `search_hooks` (types) | `GET /v1/hooks/types` | free |
| Formats creators are copying (Content Trends) | `get_content_trends` | `GET /v1/content-trends` | $0.25 |
| What people talk about today, by region (Topic Trends) | `get_topic_trends` | `GET /v1/topic-trends/today` · `/emerging` | $0.25 |
| Sounds breaking out / trending | `get_trending_sounds` | `GET /v1/sounds/breakout` · `/trending` | $0.25 |
| Videos using one sound | `lookup_sound` | `GET /v1/sounds/{sound_id}/videos` | $0.25 |
| Hashtag ranking / one hashtag's numbers | `search_hashtags` | `GET /v1/hashtags` · `/{hashtag}/performance` | $0.05 |
| Places tagged on posts (beta) | `find_places` | `GET /v1/places` · `/{id}/videos` | $0.05 |
| Why one video was an outlier | `analyze_video` | `POST /v1/satellite/video` → poll | $0.50 |
| Deep creator profile with analytics | `lookup_creator` | `POST /v1/satellite/creator` → poll | $0.50; +$0.25 Data Intelligence, +$0.50 trend analysis, +$0.50 audience (up to $1.75) |
| Meta ads by keyword / one advertiser (pass `country`: the default is every country) | `raw_ad_search` / `raw_advertiser_ads` | `GET /v1/raw/meta/ads/search` · `/advertisers/{page_id}/ads` | $0.01 / page |
| Find an advertiser's page id | `raw_advertiser_search` | `GET /v1/raw/meta/advertisers/search` | $0.01 |
| Draft keywords for a research agent | none | `POST /v1/agents/suggest-keywords` | free |
| Fresh collection on a topic, once or on a schedule | `create_research_agent` | `POST /v1/agents` | $0.50 / run (asks first) |
| The user's existing research agents, and one agent's latest results | `list_my_research` / `get_agent_report`, `get_agent_data` | `GET /v1/agents` · `/v1/agents/{id}/summary` | free |
| Follow a creator or video over weeks | `track_creator` / `track_video` | `POST /v1/tracking/creators` · `/videos` | $0.25 / check (asks first) |
| Pause, change or delete an agent | `update_agent` / `delete_agent` | `PUT` · `DELETE /v1/agents/{id}` | free |
| Balance / a top-up checkout link | `get_credit_balance` / `top_up_credits` | `GET /v1/account/balance` · `POST /v1/account/top-up` | free |

Every other endpoint is in `references/endpoints.md`.

**MCP inputs with no HTTP field of the same name** (every other MCP input uses the HTTP field's name):

| Tool | Input | What it does |
|---|---|---|
| `search_hooks` | `view`: `types`, `trending` or `search` | picks `GET /v1/hooks/types`, `/trending` or `/search`, at that route's price |
| `get_topic_trends` | `view`: `today` or `emerging` | picks `GET /v1/topic-trends/today` or `/emerging` |
| `get_trending_sounds` | `view`: `breakout` or `trending` | picks `GET /v1/sounds/breakout` or `/trending` ($0.25) |
| `get_trending_sounds` | `q` (a sound title) | `GET /v1/sounds/search` ($0.10) |
| `lookup_sound` | `sound_id` = the sound's `id` (Virlo's UUID from a breakout or search reply; never `external_id` or a raw video's `sound.id`, which start the $0.50 lookup below) with `view: videos` | `GET /v1/sounds/{sound_id}/videos` ($0.25). The same tool also covers `GET /v1/sounds/{sound_id}` ($0.05), `/usage-history` ($0.05) and `GET /v1/sounds/by-creator/{platform}/{handle}` ($0.25); the `view` names for those aren't documented here, so check the tool's own input list |
| `lookup_sound` | a platform music id (a sound's `external_id`) | the **async lookup**, `GET /v1/satellite/sounds/{platform}/{music_id}` or `POST /v1/satellite/sound`: **$0.50, $1.00 with trend analysis**. Only on request; say the price first |
| `find_places` | `place_id` | `GET /v1/places/{id}/videos` ($0.05) instead of the place search |
| `get_content_trends` | `id` | `GET /v1/content-trends/{id}`, one trend in full ($0.05) instead of the list ($0.25) |
| `create_research_agent` | `user_approved` | left out, it returns Virlo's proposal and price and creates nothing; `true` creates the agent and starts billing |
| `show_hooks` | the hooks, each with its `source_video` | MCP only, free: shows a hook set with each source video's live numbers |

## 5. Cost

- **1 credit = $0.01.** Failed calls are never billed. Empty library search pages are free. Raw calls are billed even when empty.
- **Estimate before you start** and say it to the user in one line, in a reply, before the first paid call. A library estimate is a ceiling ("at most $0.20"): empty pages are free.
- **Raw pages hold fewer videos than a library page of 25** (a creator page is about 15) and cover one platform per call, so say how many pages a raw count needs.
- **Ask first** when a run will go over **$1.00** (exactly $1.00 needs no ask), or creates anything that **bills again by itself**: agents with a cadence, tracking. Say what it costs per run and how to stop it.
- **Report the spend at the end:** `virlo.sh spend <start time>`, or the balance difference with MCP.
- **Cheapest route to "N× outlier":** one `raw` creator videos page ($0.01) per creator. Use `analyze_video` ($0.50) only when the person wants the full breakdown of one video.

## 6. Async jobs (lookups, agents, post collection)

- A start call returns a `job_id` (lookups) or an agent `id`.
- **Poll the free status route** (`.../status/{job_id}`, or `GET /v1/agents/{id}`) every 10–15 seconds, or as `retry_after_seconds` says.
- **It's done when `finalized: true`.**
  - `completed` can still mean the AI report is being written.
  - `intelligence_status: "skipped"` means that item was left out on purpose.
- **Lookups** take under a minute to about 3 minutes. **An agent's first run** and its report take about 10–25 minutes.
- **Don't loop longer than about 3 minutes.** Say it's still running, give the id, and say when to check back.
- **Re-read a finished lookup for free:** `GET /v1/satellite/runs/{run_id}`.

## 7. Pagination

- **Search:** 25 per page. Pass `next_cursor` back as `cursor` (it lasts 1 hour). Every page with results is billed.
- **Raw lists:** pass `pagination.next_cursor` as `cursor`, with the same path and inputs, until `has_more` is false. Every page is billed.
- **Hooks and sounds:** `page` / `limit`, until `has_next_page` is false or a page is empty.
- **Agent lists** (`GET /v1/agents`): the reply is `data.limit`, `data.page`, `data.count` and `data.agents`, with no `has_next_page`, and `count` is only this page's size. Stop when a page returns fewer agents than `limit`.

## 8. Errors

Every error reply has a `code`; branch on it, not on the message. Errors are never billed.

| Status | `code` | Do |
|---|---|---|
| 400 | `validation_error` and others | Read the message (it often lists the valid values), fix the input, call once more |
| 400 | `invalid_cursor` | The cursor expired or the inputs changed. Start again from page 1 |
| 400 | `creator_login_required` / `creator_not_found` | The profile is private or the handle doesn't exist on that platform. Say so; check the handle and platform |
| 401 | `missing_api_key` / `invalid_api_key` | Give the setup steps (§2) |
| 402 | `insufficient_credits` | Quote `required_credits` and `remaining_credits`; top up at https://dev.virlo.ai/dashboard/billing?via=skills&utm_source=github&utm_medium=skills&utm_campaign=social-media-skills (MCP: `top_up_credits` gives a checkout link). Stop. |
| 404 | `not_found` | No such creator, video or id. Say so; check the handle and platform |
| 429 | `rate_limit_exceeded` | Wait `Retry-After` once; if it happens again, stop and say so |
| 502 / 503 / 504 | `upstream_error` / `service_unavailable` / `request_timeout` | The platform or Virlo didn't answer. Retry once, then say so |

`virlo.sh` exits 0 on success, 3 with no key, 4 on a 4xx and 5 on a 5xx or a network failure (`status=000`).

## 9. Reading results

- **`virality_score`:** how far a video outran its creator's audience, comparable across sizes and platforms. 10 promising, 18 strong, 25 very strong, 35 exceptional. Rank by this, never by raw views across platforms.
- **`intelligence`:** what Virlo's analysis read for each video: topic, format, hook, hook type, setting, tone, summary. It's what explains *why* a video worked.
- **`overview` on every search page:** counts across **all** matches (platforms, top creators, formats, hook types, posting weeks, median views). It's free and is the fastest read of a niche.
- **`thin: true`** (fewer than 10 matches) comes with `next_step`: a prefilled research agent and its price. Offer it; never start it unasked.
- **`applied` / `not_applied`:** what the search used and what it couldn't use, in plain words. Pass the caveats on.
- **Search order is topic-first:** `sort: most_viral` ranks the closest topic matches first, so a page's top isn't the niche's highest Virality Scores. Re-sort by `virality_score` yourself before taking a top N, and use `outliers_only: true` to find the strongest.
- **Meta advertiser ads:** the advertiser's total is `advertiser.platform_data.ad_count`: ads matching your filters, as the Ad Library counts them (it stops at 50,001).
- **Raw lists:** `stats.views`, `published_at`, `author.handle`, `url` are live counts at request time. Thumbnail and ad media links expire within days, so link the post, not the image.
  - A creator page that comes back with 0 posts is still billed. Say so, and count that creator as unmeasured.
- **Videos for one sound** (`GET /v1/sounds/{sound_id}/videos`) carry views, likes, shares, comments, bookmarks, the publish date, hashtags, duet or stitch, the author with followers, and the tagged place. They have no `intelligence`, `is_paid`, `duration` or Virality Score: measure them with a creator page, and check paid reach by the like rate.
- **Videos for one place** (`GET /v1/places/{id}/videos`) come as `data.place` plus `data.videos`, in the video-search item shape.

Then follow `references/method.md` for the analysis and `references/house-rules.md` for the answer.
