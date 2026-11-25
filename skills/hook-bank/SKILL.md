---
name: hook-bank
description: "Use when the user wants hooks, opening lines, first lines, intros, scroll-stoppers or attention grabbers for TikTok, Reels or Shorts, asks how to open or start their next video, wants the first 3 seconds fixed or their own first lines rewritten, or asks which hook styles work in their niche. Use it even for a quick ask like \"give me 5 hooks\", so every hook is modelled on a real opening that worked instead of made up. Pulls verbatim hooks from Virlo's database of real hooks (this month's top hooks in the category plus hooks that mention the niche), shows which hook types hit a strong Virality Score most often there (often not the most common ones), drops paid and boosted sources, then writes six hooks for the user (or as many as asked), each with on-screen text, a first frame and the cited source it borrows from. Not for whole video ideas (content-ideas) or full scripts (script-writer). Typical run $0.50; rewriting your own lines $0.25."
license: MIT
allowed-tools: Bash(bash *virlo.sh *) Bash(jq *) Bash(date *) Read Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Hook bank: viral TikTok hooks that work in your niche

A hook is the first line, said or shown in the first ~3 seconds. This skill does three things:
- shows which hook types actually hit in the user's category, which isn't the same as which are common;
- builds a bank of real, verbatim openings that worked;
- writes six new ones for the user, each borrowing a proven structure from a cited source.

## When to use
- "Give me hooks for…", "how should I open this video?", "what are good first lines for skincare?"
- "Which hook styles work in finance?", "rewrite this hook", "steal some hooks for me"
- Before scripting: script-writer uses the bank if it exists.

Not for: whole video ideas (→ content-ideas) or full scripts (→ script-writer). Both use this bank.

## Before you start
1. **Load the data layer.** It's the sibling folder `../virlo-api/`, installed alongside this skill. If it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`. Read `../virlo-api/SKILL.md` (data path, setup, errors) and `../virlo-api/references/house-rules.md` before the first call. `$S` in any command below means `<this skill's folder>/../virlo-api/scripts/virlo.sh`, run as `bash <this skill's folder>/../virlo-api/scripts/virlo.sh …` from the user's project folder (never `cd` into the skill folder, so `virlo-research/` stays in their project). With no MCP and no key, use preview mode: show the closest report in `samples/`, labelled as a sample, plus the setup steps.
2. **Read `virlo-research/brief.md`:** what they make, voice, audience, avoid list, platforms, language.
3. **Pick the category:** one of art_design, automotive, beauty, business_career, crafts_diy, education, entertainment, fashion, finance, fitness, food_beverage, gaming, health_wellness, home_garden, kids_content, lifestyle, music, news_politics, parenting_family, pets, real_estate, relationships_dating, religion_spirituality, science_nature, sports, tech, travel.
4. **Pick one search word** that appears in hooks in the niche, 3 letters or more: "skin", "budget", "saas", "coffee".
5. **Say the price in a reply to the user,** before the first paid call: "Hook-type stats (free), this month's top hooks in <category> ($0.25), hooks that mention '<word>' ($0.25). $0.50." Only rewriting lines the user pasted: $0.25.

## Workflow

### 1. Read (in parallel)
| Read | MCP `search_hooks` | HTTP | Cost |
|---|---|---|---|
| **What hits** | `view: types`, `category`, `dimension: hook_type`, `sort: strong_hit_rate`, `platform` if the brief names one | `GET /v1/hooks/types` | free |
| **Top hooks this month** | `view: trending`, `category`, `days: 30`, `language`, `platform` if the brief names one, `limit: 25` | `GET /v1/hooks/trending` | $0.25 |
| **Hooks that mention the niche** | `view: search`, `q: <word>`, `category`, `language`, `platform` if the brief names one, `min_views: 100000`, `limit: 25` | `GET /v1/hooks/search` | $0.25 |

- **Free extra source:** if `virlo-research/` has a niche-breakouts report from the last 7 days whose topic words and platforms match this ask, its measured breakouts' `hook_text` are the best sources of all. They're measured outliers for their creator. Name the report you reused in Method. A report run before the brief existed can be reused: apply the brief on top (avoid list, brand safety) and say so. A report made for a different brief or client slug isn't reused. If the topic words or platforms differ, don't reuse it.
- **The search view isn't limited by date.** Show each source's date, and prefer the last 6 months when two hooks are close.
- **When the category already is the niche** (finance for a budgeting creator), a word search adds little. Spend that $0.25 on the best type instead: `GET /v1/hooks/search` with `hook_type` set to the top type from `types`, plus `category`, `language`, `platform` (if the brief names one) and `min_views: 100000`. Use the word search when the niche is a slice of a broad category: skincare within beauty, SaaS within business.
- **Only rewriting lines the user pasted?** Read `types` (free) and one paid read (the word search, or the top type when the category is the niche), then do step 5b. $0.25.

### 2. Which hook types win here
- **From `types`:** rank by `strong_hit_rate`, the share of videos with that hook type that scored strong (Virality Score 18 or more).
  - Keep types with 50 or more videos (50 counts); drop only those under 50. Name the sample when one looks best.
- **Name the gap:** the most-used type and its hit rate against the best type's. Common isn't always effective, but read it off this table: say a type "hits least" only when it is actually the lowest kept type.
- **Don't rank by `avg_weighted_score`:** it's negative for most types.
- **A niche index beats the category rate.** If a matching niche-breakouts report gives a breakout index for a hook type in this niche, that index decides over the category-wide hit rate (a type can hit below average across beauty and still over-index in sensitive skin). Say which signal decided each type: "niche index 1.46×" or "category hit rate 27.6%".

### 3. Clean the sources
- **Drop paid and bought hooks:** `video.is_paid: true`, or likes under 0.5% of views on a post with 1,000 views or more. Ad spend inflated their score.
- **For brands,** drop `brand_safety_tier` of medium risk or higher.
- **Templates:** `usage_count` over 1 means that many posts open with the exact line. Usually it's a sound meme: it works with the audio, not as writing. Mark it as a template; don't present it as an original line to copy.
- **Off-topic:** drop hooks the user's audience wouldn't recognise as their world. A hair hook in a skincare bank only stays if the structure is the point.

### 4. The bank
- 10–15 real hooks, **verbatim**, grouped by hook type, best types first.
- Each one: the line, platform, Virality Score (35+ exceptional, 25 very strong, 18 strong), views, date and link.
- Never paraphrase a source hook. If the line is long, cut it with "…".

### 5. Six hooks for the user (or the number asked)
- **Each one is modelled on exactly one cited source** hook from the bank. Name it.
- **No more than 2 of one hook type.** At least 4 of the 6 use the top 3 types that have sources. Never use a type whose hit rate (or niche index, when it decided) is at or below one you tell the user to avoid.
- **Write from the user's side of the sale.** A hook never argues against what they sell (an agent who sells homes doesn't open with "rent, don't buy") unless the line says the video turns it.
- **Write it to be said, in the brief's voice:** first person if they're on camera, brand voice if not.
- **Add on-screen text** of 8 words or fewer, and the first frame, borrowed from the source's `visual_hook_type` when it has one (a before state, an extreme close-up, a product reveal).
- **Check overlap:** no hook shares 4 or more words in a row with its source. Rewrite any that does.
- **Add one line on what it borrows,** a structure in plain words: "two numbers that contradict each other", "names the reader's exact situation".
- **Brackets mark facts only the user can supply:** `[your age]`, `[real ARR]`, `[a real customer's month-3 photo]`.
  - Never invent a result, a number, a customer or a testimonial.
  - A before/after hook needs real before/after footage.
- **With MCP, `show_hooks` (free)** renders the set with each source video's live numbers as a receipt. Pass each hook's `source_video` exactly as a Virlo result gave it.

### 5b. Rewriting the user's own lines (when they pasted some)
For each line:
- **Name its hook type** and that type's strong hit rate here, beside the best type's.
- **Keep it** if it's already one of the top 3 types; say why in one line, and only move the point up if it comes after the first sentence.
- **Otherwise rewrite it** on one cited source of a better type, keeping the user's facts and promise. Show "before → after", the source and what it borrows.
- Never add a fact the user didn't give; bracket it instead.

### 6. What to avoid
At most 3 lines:
- the most common, least effective type in this category, with both rates;
- any template that only works with its sound;
- anything on the brief's avoid list.

## Output

**In chat:**
```
In <category>, <best type> hooks hit strong <x>% of the time; <most common type>, the most used, hits <y>%.
Six for you, each built on a real hook:
1. "<hook>" · on screen: <text> (from @<handle>, VS <n>)
… (all six, one line each)
Report: virlo-research/<date>-hook-bank-<slug>.md · Spent $0.50
→ <next step>
```

**The report** (`virlo-research/<YYYY-MM-DD>-hook-bank-<slug>.md`):
```markdown
# Hook bank: <niche> · <date>

**The finding:** <which types hit, which are just common, in one or two sentences>

## What hits in <category>
| Hook type | Strong hit rate | Videos | Share of all hooks |

## Your six
| # | Hook (say it like this) | On screen · first frame | Type | Built on | What it borrows |

## Your lines, rewritten (only when the user gave some)
| Yours | Type · hit rate | Rewrite | Built on |

## The bank (real hooks, verbatim)
### <type>
- "<hook>" · <platform> · VS <n> · <views> · <date> · [link]

## Avoid
- …

## Sources
| Hook | Creator | Platform | VS | Views | Date | Paid? | Link |

One row for every hook in the bank (all 10–15), each with its @handle, not only the six you built on.

**Method:** <reads, filters, what was dropped and why>
**Spend:** <actual>
```

## Rules
- Source hooks are quoted exactly. Your hooks are original: adapt the structure, never copy a line.
- Every hook you write names its source. If fewer than 6 pass the checks, give fewer and say so.
- No invented facts in a hook. A number in a hook is the user's real number or a bracket.
- Paid hooks never serve as templates. Rank by Virality Score, never raw views across platforms.
- Hit rates are category-wide. Say so when the brief's niche is narrower than the category.

## Next
- → Turn the best three into scripts: script-writer
- → Find ideas the hooks can open: content-ideas
- → See which of these openings are breaking out in your niche now: niche-breakouts
