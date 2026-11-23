# The research method

This is how these skills read the numbers. Every skill in this pack follows it, so a "breakout" or a "climbing pattern" means the same thing everywhere.

## 1. Breakouts: outliers against the creator, not the internet

Raw views mislead. A 2M-view video from a 10M-follower account is a normal day; 400K from a 15K account is a breakout.

- **Outlier** = how many times more views a video got than its creator normally gets (judged on their other recent posts). Said as "N× outlier"; after this, never any other wording.
  - **Typical views** is the baseline: what the creator's other recent posts typically get, so one big hit doesn't move it. A video never counts toward its own typical views.
  - Get the baseline from `GET /v1/raw/{platform}/creator/{handle}/videos`: one page, $0.01, newest first.
- **At least 3 other posts** are needed. With fewer, or typical views of 0, the video is **unmeasured**: say so and don't guess. A creator page that comes back with 0 posts is billed anyway: say so and count the creator as unmeasured.
- **Clean the baseline page.**
  - Pinned posts: no reply flags a pin (a raw TikTok page carries only duet and stitch flags). A post at the top that is far older than the posts after it is probably pinned: leave it out of typical views and say "probably pinned". Never claim a pin flag.
  - 0 or no views on a post that has comments is a missing count. Leave it out and say how many were missing.
  - Bought reach (below) stays in typical views: it's part of what the page gets. When 3 or more posts on the page look bought, say so beside typical views, because typical views then aren't all organic reach.
- **Labels** (every skill uses these four bands):
  - **3× or more:** breakout.
  - **1.5× to 3×:** above typical.
  - **0.67× to 1.5×:** about typical.
  - **Under 0.67×:** below typical (under two-thirds of typical views).
- **Tuning the shortlist:** start at 3×.
  - If fewer than about 5 videos pass, drop to 2× and say so.
  - If more than half pass, raise it to 5×.
  - Tuning changes which videos you shortlist and measure, never the labels: a 2.1× video is still "above typical", even in a shortlist cut at 2×.
- **One video is never a creator's "defining hit"** from one above-typical result. Cite "N of M measured videos were outliers", never one lucky hit.
- **Repeat check:** on the same page, count the creator's other posts at 10× outlier or more, and whether they share the breakout's format.
  - 2 or more: **repeatable**. The creator has a formula worth studying.
  - Exactly 1: **possibly repeatable**. One more would confirm it; don't build a move on it yet.
  - None: **one-off**. Borrow the idea, not the creator's playbook.
  - Small accounts make 3× easy: 5K views on typical views of 1.5K is a 3.3× outlier. That's why the repeat check uses 10×.
- **Bought reach isn't a breakout.** `is_paid: true`, or likes under about 0.5% of views, means the views were most likely bought (Spark Ads, a boosted partnership).
  - Only judge the like rate on posts with 1,000 views or more. Below that, one like more or less swings it, and a weak post isn't a boosted one.
  - Organic short-form usually earns several likes per 100 views. A paid post with 7M views and 7K likes is an ad budget.
  - List these separately. Never count them as breakouts or in patterns.
- **Cross-platform ranking uses Virality Score**, never raw views.
  - Virality Score is how far a video outran its creator's audience: 10 promising, 18 strong, 25 very strong, 35 exceptional.
  - `outliers_only: true` keeps only videos that far outperformed their creator's follower count.
  - **Search results are topic-ranked:** with `topics`, `sort: most_viral` puts the closest topic matches first, so a page's top isn't the highest Virality Scores. Sort the page by `virality_score` yourself before taking a top N.
  - Use it for the first pass, then confirm the top candidates with the multiple.

## 2. Freshness

- **Default window:** the last 30 days for "what's working now", 90 days for patterns and ideas.
- **Say how fresh the set is.** Give the date range or the median age of the videos you used. Say "this week" only if the dates support it.
- **Stored posts can be weeks old.** For the very latest from named creators, read `raw` creator videos (live).
- A creator or agent with no posts in the window is dormant: say so and don't build on it.

## 3. Filter by meaning, not by keyword

Library search matches words, not meaning. "indie pop" also brings back brands, covers and fan edits.

- **Platforms:** a search takes one platform or all three. Two of three goes to `not_applied` and searches all, so search all and filter by `platform` yourself.
- **Search with short topics:** 2 to 4 words each. Run several searches and merge them, removing duplicates by video `id`. Use `topics` alternatives with `|` ("skin barrier|barrier repair"), at most 3 per item: a 4th was dropped silently in a live run, so check `applied` for every word you sent.
- **Then label every video** against the brief with two sharp labels, e.g. `on_brief` / `off_brief`, from its `description` and `intelligence.summary`.
  - Count and analyse only `on_brief`.
  - If more than about a quarter can't be placed, your labels are too vague: rewrite them.
- **Report what the search used:** read `applied` and `not_applied`. A filter the API couldn't use is a caveat in the report.

## 4. Patterns: what the breakouts have in common

Count **formats** (`intelligence` content format), **hook types**, **sounds** and **hashtags** across the on-brief set.

- **Skip empty values:** none, unknown, other, mixed, no_hook. For sounds, skip original audio.
- **Drop any pattern with fewer than 3 videos.**
- **Lift:** how well the videos using a pattern typically do (their outlier, or Virality Score) against the set as a whole.
  - **over:** clearly above the set (1.25× or more).
  - **under:** clearly below it (0.8× or less).
- **Rank** by the number of different creators using the pattern, then by lift. One creator posting something 10 times is not a pattern.
- **Trend label:** how a pattern's share of videos in the last 30 days compares with its share in the 90 days before. Shares are in percent of each window's videos.
  - **new:** absent from the baseline's top list and present now, with at least 3 videos.
  - **climbing:** the share rose by at least 25% of its old value **and** by at least 1 point (2.7% → 3.8% is climbing; 3.5% → 4.2% is steady).
  - **fading:** the share fell by at least 25% of its old value and by at least 1 point.
  - **steady:** everything else.
  - **Missing from the baseline overview** (its top list only names the most common patterns, so the old share is just "under X%", the smallest share listed): call it **new** if it's at least 2% now; otherwise it's **unmeasured**, and never climbing or fading.
- The search `overview` (free, on every page) already counts formats, hook types, top creators and posting weeks for **every** match, not just the page. Start there.
- **Breakout index from overviews,** the cheap niche-wide lift:
  - Run the same search twice, once with `outliers_only: true`.
  - The index says how much more often a pattern shows up among the breakouts than among all matches. **over** at 1.25 or more, **under** at 0.8 or less.
  - Run it once more for the 90 days before, and label the supply trend with the rules above.
  - **over** and not climbing: **under-supplied**, an opening. **climbing** and **under**: **crowded**.
- **Measured examples:** many videos carry no `visual_format` or `hook_type`. When a qualifying pattern has no labelled video among the candidates you read, write "no measured example on the first page" beside it and build no move on it. Never pull extra pages, or search with `looks_like`, to fill the gap.

## 5. Posting times

- **Slots:** morning 06–12, afternoon 12–17, evening 17–22, late 22–06. Times are UTC unless the platform gives local time; say which.
- **The best slot** is the one whose posts are typically the biggest outliers, with at least 2 posts in it. With thin data, say "not enough posts to call a best time".

## 6. A vs B (competitors, before/after)

- For each format, hook type or sound: how many points more (or less) of A it makes up than of B, biggest gaps first. "Their breakouts use talking-head tutorials 38 points more than their other videos."
- Group summaries carry the count, the share, typical views and the typical outlier.

## 7. Creators

- **A common working band is 5K–1M followers.** For vetting partners, start at 10K–500K.
- **Prefer consistency** (a high median against followers, several breakouts) over one viral spike.
- **Vet with posts:** read their latest posts' multiples, not just the profile numbers.
  - A creator search's `median_views` reflects the videos Virlo analysed, which can include a creator's older hits, so confirm reach on their live page.
  - Judge on the live page: typical views, the share of sponsored or affiliate posts, the like rates on them (under 0.5% means boosted), any gaps in posting, and claims the brand couldn't make.

## 8. Ideas, hooks and scripts

- **Need at least 4 real source videos.** Use the last 90 days, ranked by multiple.
- **Build only on patterns that earn it.** A pattern qualifies when it's either:
  - **over** (breakout index 1.25 or more) and not crowded, including the under-supplied ones whose share of posts is fading; or
  - **new or climbing** in share and not **under**;
  - or a creator's **repeatable** formula (2+ other posts at 10× outlier).
- **Never pitch** an under, crowded or fading-and-not-over pattern as an opportunity, and never a one-off as a formula.
- **Every idea names what it's built on**, with numbers ("built on @x's 4.1× tutorial and 3 others"). **why now** (the moment) and **why it works** (for a viewer) must make different points.
- **Original to the user.** Adapt, never copy a creator's video. Respect the brief's avoid list.
- **No more than 2 hooks of one hook type in a set.** Each script is modelled on one cited video.
- **Never present an invented story, result or testimonial as true.**
- **If fewer ideas pass these checks than were asked for, give fewer** and say "3 of 5 passed the checks".

## 9. Comments (the audience's own words)

- Read comments on the breakouts, not on random videos: 6 to 10 videos, about 20 comments each.
- Sort them into praise, question, request, complaint and other.
- Quote real comments word for word. Never invent one.

## 10. Thin results

- **Say the count honestly:** "only 6 on-brief videos in 30 days".
- **Then offer looser versions of the same ask:** a lower multiple, a wider window, another platform, a broader word, or a research agent that collects fresh data. A thin search returns `next_step` with a prefilled agent and its price.
- **Never end a thin result with no way forward.**

## 11. Check your own work before answering

- **Remove a step that changed nothing:** a filter that kept everything, a sort into the order it was already in, a classification where nearly everything got one label.
- **Every number, @handle, title and link in the answer** must come from a response saved this run.
- **Counts carry their scope:** "12 of 140 on-brief videos", "since Oct 21".
- **Quality bar:** would a senior strategist send this to a client as it stands? Score it on specific, grounded, tailored and useful. If any would be under 4 of 5, fix it first.
