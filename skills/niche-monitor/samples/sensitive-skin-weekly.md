<!-- Sample from a real run on Nov 22 2026 (Virlo MCP, Claude Code). Prompt: "watch sensitive-skin content for us every week and send me a digest." Brief: indie sensitive-skin brand. The user approved the setup as a one-time run for this sample ($0.50); a weekly agent would repeat it every week. -->

# Niche monitor: sensitive skin · setup and run 1 · Nov 22 2026

## The proposal (shown before anything was created)
| | |
|---|---|
| **Name** | Sensitive skin weekly |
| **Intent** | Track what breaks out in sensitive-skin and skin-barrier skincare on TikTok, Reels and Shorts, to brief an indie sensitive-skin brand's content; exclude makeup tutorials and paid promos. |
| **Keywords (8)** | sensitive skin routine · skin barrier repair · fragrance free skincare · rosacea skincare · eczema skincare · redness skincare · skincare for sensitive skin · damaged skin barrier |
| **Excluded words** | makeup · foundation · concealer |
| **Platforms** | TikTok, Instagram Reels, YouTube Shorts · English-speaking regions |
| **Cadence** | weekly, with autopilot on (it rewords searches and adds up to 15 keywords, never removes yours, no extra charge) |
| **Cost** | $0 to create, then **$0.50 a run**: about **$2.15 a month** weekly. Data Intelligence would add $1.00 a run; it was left off. |
| **Stop** | pause with `update_agent` (`active: false`) or delete with `delete_agent`; over HTTP, `PUT` or `DELETE /v1/agents/{id}` |

**Approved:** as a one-time run for this sample ($0.50). The digest below is that run.

---

# Sensitive skin weekly · week of Nov 22 2026 · run 1 (baseline)

**This week in one line:** sensitive-skin viewers reward content that names their exact problem.
- **What that looks like:** barrier-damage "signs" lists, eczema flare stories and the pimple patch that left a red mark.
- **Before/after hooks** are 3× as common among the top videos as in the rest.
- **Two of the top 8 videos** were already in this month's library runs, so two sources agree.

**The run:**
- **Collected:** 856 videos and 415 slideshows linked in 7 minutes.
- **Filtered out:** 418 off the intent, 82 for language, and 35 by the excluded words.
- **The report:** it reads the 299 most-viewed of the 710 videos kept and scores 268 organic ones. 31 paid posts are left out.

## New this week
This is the first run, so everything here is new and sets the baseline for next week.

**Trends Virlo found in this run (all labelled new):**

| Trend | Videos | Views | Why it works (Virlo's read) |
|---|---|---|---|
| "Signs your skin barrier is damaged" explainers | 10 | 6.5M | A numbered list lets people self-diagnose, so they watch to the end and save it |
| Eczema storytime and relatable flare clips | 4 | 7.5M | Viewers recognise their own flare in a specific, slightly embarrassing story |
| The pimple patch that left a red mark | 7 | 2.8M | A precise problem plus surprise ("the pimple patch made my skin barrier worse") |
| "Day N of healing my skin barrier" | 7 | 976K | A day count turns a routine into a story people follow |
| Eczema occlusive and moisturiser explainers | 3 | 388K | Naming the mechanism, such as sealing in moisture, gives a reason to trust a product |

**What over-performs:** the top quarter of videos by Virality Score, compared with the organic sample.

| Pattern | Top videos | All | Lift |
|---|---|---|---|
| Before/after hook | 9% | 3% | **3.0×** |
| Extreme close-up first frame | 9% | 3% | **3.0×** |
| Storytime format | 12% | 5% | 2.7× |
| Neutral tone | 12% | 5% | 2.7× |
| Hands only or POV | 9% | 4% | 2.4× |
| Question hook | 9% | 5% | 2.0× |
| Explainer format | 27% | 17% | 1.6× |

**Opening lines from the top videos:**
- "Someone genuinely looked at me in the eyes today and said, what eyeshadow are you wearing?" (a 2.6K-follower account: 5.3M views on 2,640 followers, VS 59.9; an eczema storytime)
- "This was my skin two days ago, covered in bumps and closed comedones." (a skincare creator, 1.3M)
- "You thought this was just eczema for years, but no matter how much moisturizing you use, the scales just keep coming back." ([@DrSinaSkin](https://www.youtube.com/shorts/X_Xp15n1zd8), 9.9M)
- "If you have this, use that." ([Sparklesandskin](https://www.youtube.com/shorts/Ox8tYQpJjMs), 1.5M)

## Still working · Faded
No baseline yet. From run 2, this section compares each pattern and trend with this week's.

## Rising creators and sounds
| Creator | Followers | × their followers | Angle |
|---|---|---|---|
| an 830-follower account | 830 | 161× | candid acne and sensitive-skin product reactions |
| a 2.3K-follower account | 2,257 | 137× | patches and moisturisers for sensitive skin, red marks |
| a 1.8K-follower account | 1,778 | 135× | pimple-patch tests on sensitive skin |
| [@koreaschoice.acne](https://www.tiktok.com/@koreaschoice.acne) | 5,855 | 113× | acne myth-busting and cleanser reviews |

**Sounds:**
- "Tattoo (Instrumental)": 2 videos, an average of 2.7M views.
- "Idyllic jazz bossa nova with piano and guitar": 6 videos, an average of 1.0M.
- The report doesn't give commercial-use clearance for these. Check them in sound-scout before a brand uses one.

## Autopilot changes
Autopilot already reworded one search: "redness skincare" became "redness skincare post-viral reactions". Your 8 keywords stay pinned.

## One move for this week
**Make "7 signs your skin barrier is damaged", hands only, with an extreme close-up first frame.**
- It's the biggest new trend here (10 videos, 6.5M views), and it combines the two strongest first-frame and presentation patterns: close-ups at 3.0×, hands only at 2.4×.
- End on the pimple-patch question, which is the next video.
- Name signs a dermatologist would sign off on; no cure claims.

## Caveats
- **Not all of it is new:** 2 of the top 8 videos are from 2023, by @beautythewolf and @AveneUSA. The trends are recent; some top videos aren't.
- **Pattern lifts are thin:** they rest on 132 videos with Virlo's analysis, because Data Intelligence was off. With Data Intelligence on, every video would be analysed.

**Agent:** one-time sample run · $0.50 · to make it weekly, create it with `is_recurring: true, cadence: "weekly"`; to stop a weekly agent, `delete_agent`

**Method:**
- One research-agent run on the approved setup.
- The digest uses that agent's own report and run counts. The only outside reference is the line noting that 2 of the top videos also appeared in the library runs.
- Trend descriptions are Virlo's summaries, shortened.

**Spend:** $0.50 (one agent run; the report reads are free).
