---
name: trend-radar
description: "Use when the user asks what trend to jump on this week, what's trending or viral on TikTok, Reels or Shorts right now, which formats, memes or templates are spreading, which sounds are breaking out, or what people are talking about today, and which of those fit their brand, business or creator account (\"any memes we could do?\", \"what's trending this week for a coffee brand?\"). Use it even for a quick ask, so the pick rests on live counts instead of last week's lists. Combines Virlo's Content Trends (formats creators are copying, with their lifecycle: new, rising, peaking, fading), Topic Trends (subjects people discuss today) and breakout sounds with their commercial-use clearance, then ranks them by timing, fit, brand safety and effort. You get up to 3 do-now moves, each with a shot list for your account and a proof video, plus watch and skip lists. Not for what works in one niche over the month (niche-breakouts) or a deep sound pick (sound-scout). Typical run $0.75, up to $0.90."
license: MIT
allowed-tools: Bash(bash *virlo.sh* *) Bash(jq *) Bash(date *) Read Write
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Trend radar: TikTok trends this week, ranked for you

Most "trending" lists are a week late and say nothing about fit. This skill reads three live signals and answers one question: **which 1–3 trends should this account make this week, and how?**
- **Content Trends:** formats creators are copying, with their lifecycle.
- **Topic Trends:** what people are talking about today.
- **Breakout sounds:** audio growing fastest against its own normal weekly rate.

Every claim comes from Virlo calls made this run.

## When to use
- "What trend should we jump on?", "what's trending on TikTok this week?", "any memes we could do?"
- "Which sounds are blowing up?", "what is everyone talking about today?"
- Planning next week's posts for a brand, a client or a creator account.

Not for: what works in one niche over the last month (→ niche-breakouts), choosing a sound in depth (→ sound-scout), writing the scripts (→ script-writer).

## Before you start
1. **Load the data layer.** It's the sibling folder `../virlo-api/`, installed alongside this skill. If it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`. Read `../virlo-api/SKILL.md` (data path, setup, errors) and `../virlo-api/references/house-rules.md` before the first call. `$S` in any command below means `<this skill's folder>/../virlo-api/scripts/virlo.sh`, run as `bash <this skill's folder>/../virlo-api/scripts/virlo.sh …` from the user's project folder (never `cd` into the skill folder, so `virlo-research/` stays in their project). With no MCP and no key, use preview mode: show the closest report in `samples/`, labelled as a sample, plus the setup steps.
2. **Read `virlo-research/brief.md`.** Its **Account type** line sets the `client_fit` used below:
   - `consumer_brand`, `b2b_saas`, `local_business`, `clinic_healthcare`;
   - or `creator`, which has no `client_fit`; judge fit by topic.
   - **No Account type line:** infer it from the brief's **Who** line and say so in one line ("Reading you as a consumer brand").
   - Also note platforms, region, language, tone and the avoid list.
   - With no brief, ask the account type in one line, or assume a creator and say so.
   - **Several platforms in the brief:** Content Trends and breakout sounds take one `platform`, so read TikTok (the only platform with sound clearance) and say so. Offer Reels or Shorts at $0.25 a list.
3. **Say the price in a reply to the user,** before the first paid call: "3 reads at $0.25: Content Trends, today's Topic Trends, breakout sounds. $0.75, plus up to $0.15 to open the picks for better proof videos." With MCP, call `get_credit_balance` first.

## Workflow

### 1. Three reads, in parallel ($0.25 each)
| Read | MCP | HTTP | Inputs |
|---|---|---|---|
| **Content Trends** | `get_content_trends` | `GET /v1/content-trends` | `client_fit` (brands); `brand_safety: safe` for brands and clinics; `platform`; `language` if the brief sets one, and `region` only when the user names a market in this request; `limit: 20`; `examples: 1` |
| **Topic Trends** | `get_topic_trends` | `GET /v1/topic-trends/today` | MCP `view: today`; `region` from the brief (`GET /v1/topic-trends/regions` lists them, free; default global; with two or more in the brief, use the one the user names, else the first, and say so); `exclude_category` politics and news for brands unless they're news-led; `limit: 25`; `top_exemplars: 1` |
| **Breakout sounds** | `get_trending_sounds` | `GET /v1/sounds/breakout` | MCP `view: breakout`; `platform` from the brief; `commerce_only: true` (exactly `true`) for any business account on TikTok; `limit: 30` |

- **If a reply says `data_truncated`,** the list was cut for size. Note how many came back, and narrow the next ask (`client_fit`, `platform`) rather than paging blindly.
- **`view: emerging` on Topic Trends** returns only new and rising topics, often just a few. Use it when the user asks what's "breaking right now".

### 2. Timing: is it still early?
For each Content Trend:
- **Momentum:** this week's creators (`creators_7d`) against last week's (`creators_prev_7d`). A previous week of 0 means it started this week.
- **Still moving** = `creators_3d_avg`, creators posting it per day over the last 3 days.
- **Label:**
  - **now:** lifecycle `new` or `rising`, and 10 or more creators a day in the last 3 days;
  - **this week only:** `peaking`, or `new` or `rising` with under 10 a day;
  - **stalled:** under 1 a day in the last 3 days and `last_seen_on` 4 or more days before the read, whatever the lifecycle says;
  - **late:** `fading`.
  - **`archived`:** skip.
- **The newest days are still being counted** (`series[].partial`: videos are found a few days after they go up). Never read a dip in the last few days as a decline on its own; that's why stalled also needs `last_seen_on`.
- Put `meta.updated_at` (the list's refresh time) in the report.
- **For a Topic Trend,** use `momentum.status` (new, rising, steady, fading) and `views_per_hour`. `momentum: null` means not measured; never read it as zero.
- **For a sound,** use `acceleration`: this week's videos against its normal weekly rate over the 4 weeks before. A high number on a small base means it just took off.

### 3. Fit: should this account touch it?
- **Brands and clinics:**
  - Use the trend's own `client_fit[type]` (yes, maybe or no) and `brand_safety`, and the brief's avoid list.
  - A `no` or `caution` is a skip, whatever the timing.
  - `client_fit.how` is a starting idea; rewrite it for this brand.
- **Creators:** judge by topic. Does the format's `swapped_part` hold their subject naturally? If it only fits by forcing it, it's a skip. Judge this from the `recipe`, `constant_part` and `swapped_part`; the examples carry no caption, so don't claim a proof video is in their subject.
- **Sounds:**
  - A business account on TikTok needs `is_commerce_music: true`. Otherwise it can't safely use the sound.
  - Instagram and YouTube sounds report no clearance (`null`). For a brand, treat them as not cleared and say so.
  - A sound meme whose sound isn't in the breakout list has unknown clearance: say "check the sound is in TikTok's Commercial Music Library first". For a brand whose avoid list names unlicensed music, that move goes under Watch, not Do now. For a creator, say the clearance is unknown; don't call it usually fine.
- **Topic Trends:**
  - Only use a topic the account can speak to credibly.
  - Never use a death, disaster or tragedy for marketing.
  - Skip politics for brands unless the brief says otherwise.

### 4. Link the signals
A Content Trend whose `sound_title` (or sound owner) is also in the breakout sounds is two independent signals agreeing. Rank it higher and name both numbers. A topic that already has a format (a Content Trend about it) is easier to join than a bare topic.

### 5. Choose
- **Do now: at most 3.** Each needs timing **now** or **this week only**, fit yes (or maybe, with a real angle), and safe. Two moves that are the same joke or come from one shoot count as one.
  - Prefer low effort when two are close.
  - Each move says:
    - what the format is (`recipe`, what stays the same and what's swapped in);
    - why now, with numbers (creators this week vs last, per day now, sound acceleration);
    - how this account does it (one or two lines), tied to the brief's goal (for a sales goal, what the viewer does next);
    - **film it:** 3 shots and the on-screen line, kept to the format's `constant_part` with the account's subject as the `swapped_part` (a sound meme runs as long as its sound);
    - effort;
    - one proof link (prefer `verified_fit: true` examples; `is_paid` examples are ads, not proof).
  - **Better proof ($0.05 each, up to 3):** when a pick's one example is paid or not `verified_fit`, read the trend in full with `GET /v1/content-trends/{id}` (MCP `get_content_trends` with the id). It returns more examples and the 30-day series; pick the organic `verified_fit` example with the most views. Examples carry no caption, so say it was picked by views, not by subject.
- **Watch:** up to 3 that fit but are early or small.
- **Skip:** the big ones the user will have seen, each with its reason (fading, stalled, caution, wrong fit, no cleared sound). Saying no is half the value. A count or maximum in a Skip row covers every item the row names; recount from the read before writing it.
- **Fewer is fine.** If nothing passes, say so and say what would change it: another platform, a region, or a week from now.

## Output

**In chat:**
```
This week: <move 1> (<the reason in numbers>), then <move 2>. Skip <the obvious one> (<why>).
Film <move 1>: <the 3 shots in one line> · on screen "<line>" · proof: <link>, <views>
Read 3 live lists on <date>: <n> Content Trends, <n> Topic Trends, <n> breakout sounds. Spent $<x>.
Report: virlo-research/<date>-trend-radar-<slug>.md
→ <next step>
```

**The report** (`virlo-research/<YYYY-MM-DD>-trend-radar-<slug>.md`):
```markdown
# Trend radar: <account> · week of <date>

**This week:** <one or two sentences>

## Do now
### 1. <format name>
- **The format:** <recipe; what stays, what you swap in>
- **Why now:** <creators this week vs last, per day now, sound acceleration if linked>
- **Your version:** <one or two lines for this account>
- **Film it:** 1. <shot> 2. <shot> 3. <shot> · on screen: "<line>"
- **Effort:** <low/medium/high> · **Fit:** <yes / maybe> · **Safety:** <safe> · **Sound:** <cleared / check>
- **Proof:** <link, views>
(up to 3)

## Watch
| Trend | Why not yet | Signal to wait for |

## Skip
| Trend | Why |

## Topic Trends today
<which topics, if any, this account can credibly join, and which to leave>

## Sounds to keep in your pocket
| Sound | Videos this week | × its normal rate | Cleared | Tied to |

## Sources
| Item | Type | Numbers | Link |

**Method:** <reads, date, filters, how timing and fit were judged>
**Spend:** <actual>
```

## Rules
- Content Trends are formats; Topic Trends are subjects. Never call one the other.
- Never promote a `fading`, `stalled` or `caution` trend as a move (`fading` here is a Content Trend's lifecycle, not a niche pattern's share of posts), and never use a tragedy.
- Never tell a business account to use a sound that isn't cleared for commercial use.
- Every number (creators, per day, acceleration, views) comes from this run's reads. Don't add release dates, prices or other facts from outside them (calendar dates such as holidays are fine). When you quote a Topic Trend's `description`, say it's Virlo's summary.
- These lists change by the day. Put the read date on everything, and don't call a week-old report current.
- Don't compare raw views across platforms.

## Next
- → Check a niche's own breakouts before betting the week on a meme: niche-breakouts
- → Pick the right sound in depth: sound-scout
- → Write the three moves as scripts: script-writer
