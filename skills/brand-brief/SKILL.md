---
name: brand-brief
description: "Use when the user tells you who they are so future research fits them (\"set up my brand\", \"remember I'm a finance creator\", \"here's my brand\", \"my client is a gym in Austin\", \"save our competitors\"), wants Virlo research tailored to them, or wants to set up or update a brand, creator or client profile: what they sell, platforms, audience, voice, competitors and topics to avoid; or when another Virlo skill suggests creating a brief. Writes virlo-research/brief.md in one step from what they said, their website or their handle, with sensible defaults and at most three follow-up questions. Every Virlo research skill reads it first, so its searches, ideas, hooks and creator picks fit the user's audience, voice and avoid list. Agencies get one brief per client. Free; it calls no paid Virlo endpoint."
license: MIT
allowed-tools: Read, Write, WebFetch
metadata:
  author: Virlo
  version: 1.0.0
  homepage: https://dev.virlo.ai/docs/skills
  repository: https://github.com/Virlo-AI/social-media-skills
---

# Brand brief: set up your brand once for every social media skill

One short file that makes every other skill specific to you. With it:
- niche-breakouts searches the words your audience uses;
- content-ideas, hook-bank and script-writer write in your voice and respect your avoid list;
- creator-finder looks for creators your size;
- competitor-watch and ad-watch already know your competitors.

The output is `virlo-research/brief.md`, which every Virlo research skill reads before it calls anything. It takes one message: the brief is written from what you've already said, and anything missing is marked so you can fill it in later.

## When to use
- "Set me up", "here's my brand", "remember who I am", "my client is…", "here's our website".
- Another Virlo skill offered it because no brief exists.
- The user wants to change something: new platform, new competitor, new thing to avoid.

Not for: researching the brand's own posts (→ launch-monitor) or its competitors (→ competitor-watch). This skill only records who the user is.

## Before you start
1. **This skill needs no key:** it calls no Virlo endpoint, so it works before setup. It may read the user's own website if they give one. The research skills that read the brief use the data layer in the sibling folder `../virlo-api/`; if it's missing, install it with `npx skills add Virlo-AI/social-media-skills --skill virlo-api`.

## Workflow

1. **Check for an existing brief.** If `virlo-research/brief.md` (or, for an agency, `virlo-research/briefs/<client-slug>.md`) exists, read it, show it in a few lines, and change only what the user changed. Keep everything else. Check before writing, as its own step: never check and overwrite in one command.
2. **Gather what you can without asking.**
   - Use everything the user already said in this conversation.
   - If they give a website, read it (WebFetch) for what they sell, who it's for, how they talk and any social links. Quote nothing you didn't read.
   - If they give a social handle, store it exactly. Don't guess follower counts or content from the handle alone.
   - Never guess facts you didn't read or hear.
3. **Write the brief straight away** from the template below. Don't hold it back for questions.
   - **Search words:** 3 to 6 short topics of 2 to 4 words each, in the words *their audience* searches, not industry jargon ("dry skin routine", not "dermocosmetic hydration"). Leave out words the avoid list rules out (a brand that avoids weight-loss claims gets no "weight loss snacks"). Keep place names out; they go on the Region line (local-scout handles places).
   - **Defaults,** marked `(default)` so the user sees them: platforms TikTok, Instagram Reels and YouTube Shorts when none were named (keep the list the user gives, even two platforms: the research skills search all platforms and filter to these themselves, because a search takes one platform or all); creator size 10K–500K followers (the working band for vetting partners).
   - **Account type:** creator, consumer_brand, b2b_saas, local_business or clinic_healthcare, inferred from what they sell and marked `(inferred)` unless they said it. Skills use it to pick examples that fit (for example Content Trends' `client_fit`).
   - **Anything else unknown** is written `unknown`. Never fill a gap with a guess.
   - **Competitors** named without a handle stay names only ("Grenade (handle unknown)"). Never guess a handle.
4. **Confirm in chat,** in 6 to 8 lines: the brief's key lines, the file path, and **at most 3 questions** for the gaps that change research most, in this order: competitors' handles, platforms (if defaulted), region and language, what they can film. Say the brief already works as is and can be edited any time.
5. **Suggest the next skill:** "→ See what's breaking out in your niche: niche-breakouts".

**Agencies:** keep a brief per client in `virlo-research/briefs/<client-slug>.md`. Every research skill uses the client the user names, and asks which when there are several and none is named.

## Template

```markdown
# Brief: <name>
Updated: <YYYY-MM-DD>

- **Who:** <brand, creator or client>: <what they make or sell>, for <whom>
- **Account type:** <creator | consumer_brand | b2b_saas | local_business | clinic_healthcare> (inferred from what they said; mark `(inferred)` unless they said it)
- **Goal:** <followers | sales of X | bookings | launch of Y on DATE>
- **Platforms:** <tiktok, instagram, youtube>
- **Search words:** "<2-4 words>", "<2-4 words>", "<2-4 words>"
- **Audience:** <who watches; age, interests, problems>
- **Region and language:** <US, GB…> · <en, es…>
- **Voice:** <3-5 words: e.g. dry, expert, no hype>
- **What we can film:** <talking head, faceless, product close-ups, UGC, skits…> (used to pick filmable moves and sources, not as a search filter unless the user asks for a look)
- **Creator size to compare with:** <e.g. 10K-500K followers>
- **Competitors and peers:** <@handle (platform)>, …
- **Avoid:** <topics, sounds, claims, styles, names>
- **Notes:** <only facts the user gave that fit no other line, such as how often they post; leave it out rather than repeat a line>
```

## Output

**In chat:**
```
Saved your brief: virlo-research/brief.md
<Who> · <Platforms> · searching "<word>", "<word>", "<word>"
Avoiding: <list> · Competitors: <list>
To sharpen it (optional): 1. <question> 2. <question> 3. <question>
→ See what's breaking out in your niche: niche-breakouts
```

A finished brief from a real run, with the chat reply and its questions: `samples/protein-bar-brand.md`.

## Rules
- Write only what the user said or what their own pages say, plus the marked defaults. Mark anything unknown `unknown`; don't fill it in.
- Never store passwords, keys, private customer data or someone else's personal details.
- Store `@handles` exactly as given, without the `@` inside links.
- Never ask for, or write, a Virlo API key here.

## Next
- → See what's breaking out in your niche: niche-breakouts
- → Benchmark the competitors you named: competitor-watch
- → Get ideas built on real breakouts: content-ideas
