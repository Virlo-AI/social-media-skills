#!/usr/bin/env node
// Builds skills/virlo-api/references/endpoints.md and fields.md from Virlo's
// live public OpenAPI spec, so the skills never route to a path that no longer
// exists. Prices are not in the spec for every route, so they live in COSTS
// below (from https://dev.virlo.ai/docs/mcp and /docs/credits).
//
//   node scripts/gen-reference.mjs            write the two files
//   node scripts/gen-reference.mjs --check    exit 1 if they are out of date
//   SPEC_FILE=spec.json node scripts/gen-reference.mjs   use a saved spec
//
// No dependencies (Node 18+).
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'skills/virlo-api/references')
const SPEC_URL = 'https://api.virlo.ai/openapi.json'

// What a call costs, by "METHOD path". 1 credit = $0.01. Failed calls are never billed.
export const COSTS = {
  'POST /v1/search/videos': '$0.05 per library page of 25 (empty page free; `my_research` / `agent` scope free)',
  'POST /v1/search/creators': '$0.05 per page of 25 (empty page free)',
  'GET /v1/videos/digest': '$0.25',
  'GET /v1/tiktok/videos/digest': '$0.25',
  'GET /v1/youtube/videos/digest': '$0.25',
  'GET /v1/instagram/videos/digest': '$0.25',
  'GET /v1/hooks/search': '$0.25',
  'GET /v1/hooks/trending': '$0.25',
  'GET /v1/hooks/library': '$0.10',
  'GET /v1/hooks/library/categories': 'free',
  'GET /v1/hooks/types': 'free',
  'GET /v1/hashtags': '$0.05',
  'GET /v1/tiktok/hashtags': '$0.05',
  'GET /v1/youtube/hashtags': '$0.05',
  'GET /v1/instagram/hashtags': '$0.05',
  'GET /v1/hashtags/{hashtag}/performance': '$0.05',
  'GET /v1/sounds/trending': '$0.25',
  'GET /v1/sounds/breakout': '$0.25',
  'GET /v1/sounds/search': '$0.10',
  'GET /v1/sounds/{sound_id}': '$0.05',
  'GET /v1/sounds/{sound_id}/usage-history': '$0.05',
  'GET /v1/sounds/{sound_id}/videos': '$0.25',
  'GET /v1/sounds/by-creator/{platform}/{handle}': '$0.25',
  'GET /v1/topic-trends': '$0.25',
  'GET /v1/topic-trends/today': '$0.25',
  'GET /v1/topic-trends/emerging': '$0.25',
  'GET /v1/topic-trends/regions': 'free',
  'GET /v1/content-trends': '$0.25',
  'GET /v1/content-trends/{id}': '$0.05',
  'GET /v1/places': '$0.05 (free when nothing matches)',
  'GET /v1/places/{id}/videos': '$0.05',
  'GET /v1/satellite/creator/{platform}/{username}': '$0.50 base; add-ons: `data_intelligence` +$0.25, `trend_analysis` +$0.50, `audience_demographics` and/or `audience_geography` +$0.50 (one shared snapshot, free if a fresh one is cached); up to $1.75; refunded on failure',
  'POST /v1/satellite/creator': '$0.50 base; add-ons: `data_intelligence` +$0.25, `trend_analysis` +$0.50, `audience_demographics` and/or `audience_geography` +$0.50 (one shared snapshot, free if a fresh one is cached); up to $1.75; refunded on failure',
  'POST /v1/satellite/creators/batch': '$0.50 per creator (free if looked up in the last 6 h with the same options)',
  'POST /v1/satellite/video-outlier': '$0.50 (free for the same video within 6 h)',
  'POST /v1/satellite/video': '$0.50 (free for the same video within 6 h)',
  'GET /v1/satellite/sounds/{platform}/{music_id}': '$0.50 ($1.00 with trend analysis)',
  'POST /v1/satellite/sound': '$0.50 ($1.00 with trend analysis)',
  'GET /v1/satellite/hashtags/{platform}/{hashtag}': '$0.50 standard (up to 100 videos); `depth` deep +$0.50, full +$1.50; `trend_analysis` +$0.50 (includes the deep fetch, so trends alone are $1.00); up to $2.50 (full + trends)',
  'POST /v1/satellite/hashtag': '$0.50 standard (up to 100 videos); `depth` deep +$0.50, full +$1.50; `trend_analysis` +$0.50 (includes the deep fetch, so trends alone are $1.00); up to $2.50 (full + trends)',
  'POST /v1/satellite/place': '$0.50 per lookup started (beta)',
  'POST /v1/satellite/runs/{run_id}/refresh': 'what the lookup costs today (free if a run from the last 6 h covers it)',
  'POST /v1/agents': '$0.50 per run ($1.50 with Data Intelligence); recurring agents bill every run',
  'GET /v1/agents/{id}/hooks': '$0.25 (free with Data Intelligence)',
  'POST /v1/tracking/creators': '$0.25 per check (recurring until paused)',
  'POST /v1/tracking/videos': '$0.25 per check (recurring until paused)',
  'POST /v1/tracking/creators/{id}/posts/collect': '$0.50 / $1.00 / $2.00 for 50 / 200 / 500 posts (refunded if none)',
  'POST /v1/tracking/creators/{id}/audience-refresh': '$0.50',
  'POST /v1/account/top-up': 'free (returns a checkout link; nothing is charged until the user pays on it)',
}
const RAW_COST = '$0.01 per call or page (even when empty)'
const FREE = 'free'

// The MCP tool that does the same job (https://dev.virlo.ai/api/mcp/mcp).
const MCP = [
  [/^POST \/v1\/search\/videos$/, 'find_videos'],
  [/^POST \/v1\/search\/creators$/, 'find_creators'],
  [/^GET \/v1\/places/, 'find_places'],
  [/^GET \/v1\/hooks\/(search|trending|library|types)/, 'search_hooks'],
  [/^GET \/v1\/content-trends/, 'get_content_trends'],
  [/^GET \/v1\/topic-trends/, 'get_topic_trends'],
  [/^GET \/v1\/sounds\/(trending|breakout|search)$/, 'get_trending_sounds'],
  [/^GET \/v1\/sounds\//, 'lookup_sound (sound_id / handle)'],
  [/hashtags$|hashtags\/\{hashtag\}\/performance$/, 'search_hashtags'],
  [/^POST \/v1\/agents$/, 'create_research_agent'],
  [/^(GET|PUT|DELETE) \/v1\/agents\/\{id\}$/, 'get_agent_report, update_agent, delete_agent'],
  [/^GET \/v1\/agents(\/list)?$/, 'list_my_research'],
  [/^GET \/v1\/agents\/\{id\}\//, 'get_agent_data'],
  [/satellite\/creator/, 'lookup_creator'],
  [/satellite\/video/, 'analyze_video'],
  [/satellite\/(sounds|sound)/, 'lookup_sound'],
  [/satellite\/(hashtags|hashtag)/, 'lookup_hashtag'],
  [/satellite\/place/, 'lookup_place'],
  [/satellite\/runs/, 'check_job_status (run_id)'],
  [/^POST \/v1\/tracking\/creators$/, 'track_creator'],
  [/^POST \/v1\/tracking\/videos$/, 'track_video'],
  [/^POST \/v1\/tracking\/creators\/\{id\}\/posts\/collect$/, 'collect_creator_posts'],
  [/^DELETE \/v1\/tracking\/creators/, 'untrack_creator'],
  [/^DELETE \/v1\/tracking\/videos/, 'untrack_video'],
  [/^PATCH \/v1\/tracking/, 'update_tracking_settings'],
  [/^GET \/v1\/tracking/, 'get_tracking_data'],
  [/raw\/\{platform\}\/search/, 'raw_search'],
  [/raw\/\{platform\}\/hashtag/, 'raw_hashtag'],
  [/raw\/\{platform\}\/video\/comments/, 'raw_comments'],
  [/raw\/\{platform\}\/video\/transcript/, 'raw_transcript'],
  [/raw\/\{platform\}\/video$/, 'raw_video'],
  [/raw\/\{platform\}\/creator\/\{handle\}\/videos/, 'raw_creator_videos'],
  [/raw\/\{platform\}\/creator\/\{handle\}$/, 'raw_creator'],
  [/raw\/meta\/ads\/search/, 'raw_ad_search'],
  [/raw\/meta\/ads\/\{ad_id\}/, 'raw_ad'],
  [/raw\/meta\/advertisers\/search/, 'raw_advertiser_search'],
  [/raw\/meta\/advertisers/, 'raw_advertiser_ads'],
  [/account\/balance/, 'get_credit_balance'],
  [/account\/top-up/, 'top_up_credits'],
  [/account\/auto-top-up/, 'set_auto_top_up'],
]

// Grouped by what a researcher wants, in this order. Anything left over goes last.
const GROUPS = [
  ['Search the analysed library', ['Search', 'Videos', 'TikTok', 'YouTube', 'Instagram']],
  ['Hooks', ['Hooks']],
  ['Content Trends (formats creators copy)', ['Content Trends']],
  ['Topic Trends (what people talk about)', ['Topic Trends']],
  ['Sounds', ['Sounds']],
  ['Hashtags', ['Hashtags']],
  ['Places (beta)', ['Places']],
  ['Live platform data (raw)', ['Raw']],
  ['Meta Ad Library (raw)', ['Raw Meta Ads']],
  ['Lookups: creator, video, sound, hashtag, place (async)', ['Satellite']],
  ['Research agents (async, can recur)', ['Content Research Agents']],
  ['Tracking (recurring)', ['Tracking', 'Audience']],
  ['Account and balance', ['Account']],
]
// Never routed to by a skill.
const SKIP_TAGS = new Set(['Health', 'Webhooks'])

async function loadSpec() {
  if (process.env.SPEC_FILE) return JSON.parse(readFileSync(process.env.SPEC_FILE, 'utf8'))
  const res = await fetch(SPEC_URL, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`GET ${SPEC_URL} -> ${res.status}`)
  return res.json()
}

// Describe a score by what it means, never its formula.
const NO_SCORING_MATH = [
  // A description that opens with a ratio ("a / b. …"): drop that sentence.
  [/^\(?[a-z0-9_]+(?: [+×x*] [a-z0-9_]+)*\)? \/ \(?[a-z0-9_ ]+\)?\.\s*/i, ''],
  // " = <expression with an operator>" up to the end of the clause.
  [/\s+=\s+\(?[a-z]+_[a-z0-9_]*[^.;]*?[\/×*+][^.;]*?(?=[.;]|$)/gi, ''],
]
// Where cutting the formula leaves a field with no meaning, say what it means instead.
const FIELD_MEANING = {
  outlier_ratio: "How far the video's views outran its author's follower count. The raw outlier signal.",
  // Live replies send [] as well as null here (seen Nov 2026).
  segments: 'Timed segments, or null or an empty list when the transcript has no timings.',
}
// Fields whose description lists keys a skill reads, so it is never cut short.
const FULL_DESCRIPTION = new Set(['platform_data'])
const scrub = (t) => NO_SCORING_MATH.reduce((out, [re, to]) => out.replace(re, to), t)
const short = (text, n) => {
  const t = scrub(String(text ?? '').replace(/\s+/g, ' ').trim())
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t
}
const firstSentence = (text) => {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim()
  const m = t.match(/^(.+?[.!?])(\s|$)/)
  return m ? m[1] : t
}

export function liveOperations(spec) {
  const resolve = makeResolver(spec)
  const ops = []
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const [method, op] of Object.entries(item)) {
      if (method === 'parameters' || typeof op !== 'object') continue
      const tags = op.tags ?? []
      ops.push({
        key: `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase(),
        path,
        op,
        tags,
        deprecated: !!op.deprecated,
        skipped: tags.some((t) => SKIP_TAGS.has(t)) || path === '/',
        params: [...(item.parameters ?? []), ...(op.parameters ?? [])].map(resolve),
      })
    }
  }
  return ops
}

function makeResolver(spec) {
  const resolve = (x, depth = 0) => {
    if (!x || depth > 12) return x
    if (x.$ref) return resolve(x.$ref.split('/').slice(1).reduce((o, k) => o?.[k], spec), depth + 1)
    return x
  }
  return resolve
}

function costOf(o) {
  if (COSTS[o.key]) return COSTS[o.key]
  if (o.tags.includes('Raw') || o.tags.includes('Raw Meta Ads')) return RAW_COST
  return FREE
}
const mcpOf = (o) => MCP.find(([re]) => re.test(o.key))?.[1] ?? '—'

function paramLine(p) {
  const enumVals = p.schema?.enum ?? p.schema?.items?.enum
  const e = enumVals ? ` (${enumVals.slice(0, 14).join('|')}${enumVals.length > 14 ? '|…' : ''})` : ''
  return `\`${p.name}\`${p.required ? '*' : ''}${e}`
}

function bodyLine(o, resolve) {
  const schema = resolve(o.op.requestBody?.content?.['application/json']?.schema)
  const props = Object.keys(schema?.properties ?? {})
  if (!props.length) return ''
  const req = new Set(schema.required ?? [])
  return props
    .map((k) => {
      const p = resolve(schema.properties[k])
      const enumVals = p?.enum ?? resolve(p?.items)?.enum
      const e = enumVals ? ` (${enumVals.slice(0, 14).join('|')}${enumVals.length > 14 ? '|…' : ''})` : ''
      // Some inputs are required only in their description ("Required unless you pass `cursor`.").
      const unless = String(p?.description ?? '').match(/\bRequired unless (?:you pass )?`([a-z_]+)`/)
      const star = req.has(k) || /^Required\b|\bRequired\.$/.test(String(p?.description ?? '')) ? '*' : unless ? `* (unless \`${unless[1]}\`)` : ''
      const list = p?.type === 'array' ? '[]' : ''
      return `\`${k}${list}\`${star}${e}`
    })
    .join(', ')
}

function renderEndpoints(spec) {
  const resolve = makeResolver(spec)
  const ops = liveOperations(spec).filter((o) => !o.deprecated && !o.skipped)
  const used = new Set()
  const lines = [
    '# Virlo API endpoints',
    '',
    '<!-- GENERATED by scripts/gen-reference.mjs from https://api.virlo.ai/openapi.json. Do not edit by hand. -->',
    '',
    'Base URL `https://api.virlo.ai`. Every call sends `Authorization: Bearer $VIRLO_API_KEY`.',
    'Each entry: what it does, what it costs, the matching MCP tool, then its inputs (`*` = required, `[]` = a list, such as `["a", "b"]`).',
    'Before calling an endpoint for the first time in a session, read its full input list in the live spec',
    '(`https://api.virlo.ai/openapi.json`, path → method) when an input you need is not listed here.',
    '',
  ]
  const section = (title, list) => {
    if (!list.length) return
    lines.push(`## ${title}`, '')
    for (const o of list) {
      used.add(o.key)
      lines.push(`### \`${o.method} ${o.path}\``)
      lines.push(`${short(o.op.summary || firstSentence(o.op.description), 160)}`)
      lines.push(`- Cost: ${costOf(o)}. MCP: \`${mcpOf(o)}\``)
      const q = o.params.filter((p) => p?.in === 'query').map(paramLine)
      const pathParams = o.params.filter((p) => p?.in === 'path').map(paramLine)
      if (pathParams.length) lines.push(`- Path: ${pathParams.join(', ')}`)
      if (q.length) lines.push(`- Query: ${q.join(', ')}`)
      const b = bodyLine(o, resolve)
      if (b) lines.push(`- Body (JSON): ${b}`)
      lines.push('')
    }
  }
  // Hashtag routes also carry a platform tag: they belong under Hashtags, not Search.
  const groupOf = (o) =>
    /\/hashtags/.test(o.path) && !o.path.startsWith('/v1/satellite') ? 'Hashtags' : GROUPS.find(([, tags]) => o.tags.some((t) => tags.includes(t)))?.[0]
  for (const [title] of GROUPS) section(title, ops.filter((o) => !used.has(o.key) && groupOf(o) === title))
  section('Other', ops.filter((o) => !used.has(o.key)))
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}

// The response fields a skill reads to explain "why it worked".
const FIELD_ENDPOINTS = [
  'POST /v1/search/videos',
  'POST /v1/search/creators',
  'GET /v1/raw/{platform}/creator/{handle}',
  'GET /v1/raw/{platform}/creator/{handle}/videos',
  'GET /v1/raw/{platform}/video',
  'GET /v1/raw/{platform}/video/comments',
  'GET /v1/raw/{platform}/video/transcript',
  'GET /v1/hooks/types',
  'GET /v1/hooks/search',
  'GET /v1/sounds/breakout',
  'GET /v1/sounds/search',
  'GET /v1/sounds/{sound_id}/usage-history',
  'GET /v1/sounds/{sound_id}/videos',
  'GET /v1/content-trends',
  'GET /v1/topic-trends/today',
  'GET /v1/places',
  'GET /v1/places/{id}/videos',
  'GET /v1/raw/meta/ads/search',
  'GET /v1/raw/meta/advertisers/ads',
  'GET /v1/satellite/creator/status/{job_id}',
  'GET /v1/agents/{id}/summary',
  'GET /v1/satellite/video-outlier/status/{job_id}',
]

function renderFields(spec) {
  const resolve = makeResolver(spec)
  const ops = new Map(liveOperations(spec).map((o) => [o.key, o]))
  const lines = [
    '# Response fields',
    '',
    '<!-- GENERATED by scripts/gen-reference.mjs from https://api.virlo.ai/openapi.json. Do not edit by hand. -->',
    '',
    'The fields the research skills read, per endpoint. Nested fields use dots; `[]` is a list.',
    '',
  ]
  for (const key of FIELD_ENDPOINTS) {
    const o = ops.get(key)
    if (!o) {
      lines.push(`## \`${key}\``, '', '_Not in the live spec any more: fix the skill that uses it._', '')
      continue
    }
    const res = resolve(o.op.responses?.['200'] ?? o.op.responses?.['201'])
    const schema = resolve(res?.content?.['application/json']?.schema)
    const rows = []
    const walk = (s, prefix, depth) => {
      s = resolve(s)
      if (!s || depth > 7 || rows.length > 200) return
      for (const k of ['allOf', 'oneOf', 'anyOf']) (s[k] ?? []).forEach((x) => walk(x, prefix, depth + 1))
      if (s.type === 'array' || s.items) return walk(s.items, `${prefix}[]`, depth + 1)
      for (const [name, v] of Object.entries(s.properties ?? {})) {
        const field = resolve(v)
        const path = prefix ? `${prefix}.${name}` : name
        const desc = short(FIELD_MEANING[name] ?? field?.description ?? '', FULL_DESCRIPTION.has(name) ? 600 : 150)
        rows.push(`- \`${path}\`${desc ? `: ${desc}` : ''}`)
        walk(field, path, depth + 1)
      }
    }
    walk(schema, '', 0)
    lines.push(`## \`${key}\``, '', ...(rows.length ? rows : ['_No schema published._']), '')
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}

async function main() {
  const spec = await loadSpec()
  const files = { 'endpoints.md': renderEndpoints(spec), 'fields.md': renderFields(spec) }
  const check = process.argv.includes('--check')
  let stale = false
  for (const [name, text] of Object.entries(files)) {
    const file = join(OUT, name)
    const current = existsSync(file) ? readFileSync(file, 'utf8') : ''
    if (current === text) continue
    if (check) {
      console.error(`${name} is out of date with the live API spec. Run: node scripts/gen-reference.mjs`)
      stale = true
    } else {
      writeFileSync(file, text)
      console.log(`wrote ${file}`)
    }
  }
  if (stale) process.exit(1)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e.message)
    process.exit(1)
  })
}
