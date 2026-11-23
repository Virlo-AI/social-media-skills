---
name: ad-watch
description: Use when the user wants to spy on a brand's or competitor's Meta ads (Facebook, Instagram, Messenger, Threads), see what ads are running for a keyword, product or problem in a country, check the Facebook Ad Library, or get ad angles, hooks and offers to test ("what ads is Gymshark running?", "show me competitor ads for protein powder", "what offers are they pushing for Black Friday?", "ad inspiration for my niche"). Use it even for a quick look, so the answer quotes the real ads instead of guessing. Reads the Meta Ad Library live, groups the ads by product, message, offer and format, shows how long each has run and what is new or was stopped, drops keyword noise, and ends with up to 3 ad angles to test, each built on named ads and written in the user's own words. Not for organic TikTok, Reels or Shorts posts (competitor-watch) or hooks from organic breakouts (hook-bank). About $0.01 per brand or keyword; a typical run is $0.01 to $0.05.
license: MIT
allowed-tools: Bash, Read, Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Ad watch: Meta Ad Library research on any brand's Facebook and Instagram ads

What a competitor pays to show tells you what they're betting on: which product, which claim, which offer, which format. This skill reads the Meta Ad Library live, turns a wall of ads into those four answers, and ends with ad angles you can test this week, built on the ads you just read.

## When to use
- "What ads is @brand running?", "spy on our competitor's Facebook ads", "show me Medik8's Meta ads", "what's in their Ad Library?"
- "What ads run for 'sensitive skin' in the US?", "what offers are competitors pushing for Black Friday?", "give me ad angles to test for protein powder"
- Comparing two or three brands' ads side by side.

Not for: organic TikTok, Reels or Shorts posts (→ competitor-watch), proven opening lines from organic breakouts (→ hook-bank), a full video ad script (→ script-writer). The Ad Library covers Meta platforms only.

## Before you start
1. **Use the data layer in the sibling folder `../virlo-api/`.** If it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`. Read `../virlo-api/SKILL.md` and `../virlo-api/references/house-rules.md` before the first call; `$S` means the path `<this skill's folder>/../virlo-api/scripts/virlo.sh`, always called as `bash $S …`, run from the user's project folder (never `cd` into the skill folder, so `virlo-research/` stays in their project). With no usable MCP and no key, use preview mode: show `samples/` labelled as a sample, plus the setup steps and this run's price.
2. **Read the brief** (`virlo-research/brief.md`): competitors, region, category, avoid list, the proof the user owns. "My competitors" means the brief's list; with no brief, ask for the names in one line.
3. **Set the country:** the one the user names, else the brief's region. With neither, leave `country` out and say so in the answer: the API's default is every country, which mixes languages and markets.
4. **Say the price in a reply to the user,** before the first paid call: "one page of ads per brand or keyword at $0.01 (about 30 ads). An extra $0.01 if a name is ambiguous, and $0.01 more per brand for the ads they've stopped." Three brands with stopped ads is about $0.06.

## Workflow
1. **A brand's ads:** MCP `raw_advertiser_ads {name | page_id, country, status: active}`; HTTP `GET /v1/raw/meta/advertisers/{page_id}/ads`, or `GET /v1/raw/meta/advertisers/ads` by `name`.
   - A name resolves to the first match the Ad Library suggests. Check the returned `advertiser`.
   - If it's the wrong page, find the right `page_id` with `raw_advertiser_search` (HTTP `GET /v1/raw/meta/advertisers/search`).
   - Give the advertiser's total from `advertiser.platform_data.ad_count` (ads matching your filters, as the Ad Library counts them; if it's absent, say "total not shown"), and every count as "n of the N read". A first page is a sample, never the advertiser's whole strategy.
   - Zero active ads is an answer: say so, and offer the stopped ads (step 3).
2. **Ads for a keyword:** MCP `raw_ad_search {q, country, media_type}`; HTTP `GET /v1/raw/meta/ads/search`.
   - Keyword matches are text matches, so expect noise: jewellery and pet food mention "sensitive skin" too.
   - Keep the ads whose `page_categories` or product fit the user's category, and say how many you dropped.
   - A keyword page is a text-match sample, not a ranking: say "n of the m on-topic ads I read", never "dominates" or "loudest". If you searched a different keyword than the user's, say so in chat.
3. **What they stopped (optional, $0.01 a brand):** the same call with `status: inactive`. Use it for seasonal asks ("what did they run last Black Friday?", read `started_at` and `ended_at`) or when the user wants to see what was tried and dropped. Say "ran Nov 20 – Dec 2 2025", never "it failed": an ad can stop for any reason.
4. **If a reply says `data_truncated`,** the page was cut for size. Say how many came back. Narrow with `media_type`, or read the next page only if the user wants it.
5. **Group the ads** (from `creatives[].body`, `title`, `cta_text`, `link_url`):
   - by product (the landing page or title);
   - by message, in the ad's own words: the claim, the proof style (a clinical stat, a testimonial, the founder, a symptom), the offer (a discount, a code, free shipping) and the call to action;
   - by format (video or image, and dynamic creative `dco`, catalog `dpa` or single), counted from the fields (`display_format`, `media_type`, the creatives' videos). Check that each table's rows add up to the ads read;
   - by start date: new this month vs running for months;
   - by where they run (`publisher_platforms`) when it differs between ads.
   - A high `variant_count`, or several ads with near-identical text, means the advertiser is testing versions of that message. Say which message.
6. **Read run time carefully.** An ad running for months is usually one the advertiser keeps paying for, but the Ad Library gives no results for commercial ads. Never present run time as proof that an ad works.
   - Reach shows only for ads shown in the EU or UK; spend and impressions only for political or issue ads. `null` means not published, not zero.
7. **Angles to test (up to 3).** Each one:
   - is built on named ads you read, with their IDs and run time ("4 of 15 ads, running since June");
   - gives the user's own hook for it: the competitor's structure in the user's words and proof, sharing no run of 4 or more words with the source;
   - names the proof the user needs (from the brief, or "you need: a customer quote") and the format;
   - suggests the cheapest first test: run the hook as an organic post first, then put money behind the version that earns saves and shares.
   - Claims a competitor backs with its own study, and anything on the brief's avoid list, are never an angle.
   - If fewer than 3 angles rest on real ads, give fewer and say so.

## Output

**In chat:**
```
<brand> is running <n> active Meta ads in <country> (<n> of <ad_count, or "total not shown"> read): <product> leads (<n> ads), mostly <message type>. Newest: <date>, <what>.
Angle to test: <angle>, built on <n> ads running since <date>. Your hook: "<user's line>".
Report: virlo-research/<date>-ad-watch-<slug>.md · Spent $<x>
→ <next step>
```

**The report** (`virlo-research/<YYYY-MM-DD>-ad-watch-<slug>.md`):
```markdown
# Ad watch: <brand or keyword> · <country> · <date>

**The short version:** …

## By product
| Product | Ads | Formats | Running since | Lands on |

## What they say
| Message | Ads | Example (exact words) |

## Offers and calls to action
## New this month
## Stopped (if read)
| Ad | Ran | Message |
## Keyword scan (if any)
| Advertiser | Category | Hook (exact) | Running since | On brief? |

## Angles to test
| Angle | Built on (ads, run time) | Your hook | Proof you need | Format | First test |

## Sources
| Advertiser | Ad ID | Started | Ad Library link |
(one row for every ad quoted anywhere above, keyword-scan rows included)

**Method · Spend**
```

## Rules
- Quote ad text exactly, and link each ad's Ad Library page (`url`). Media links expire within days, so link the page, not the file.
- Never claim an ad performs well; the Ad Library shows no results for commercial ads. Never call a stopped ad a failure.
- Keep keyword noise out of conclusions, the offers and the angles, and say how much was dropped. Dropped ads appear only in the keyword-scan count.
- Don't copy a competitor's claims, study numbers or lines into the user's ads. Copy the structure, with the user's own proof.

## Next
- → See their organic TikTok, Reels and Shorts side: competitor-watch
- → Check the angle's hook against openings that broke out organically: hook-bank
- → Turn an angle into a video ad script: script-writer
