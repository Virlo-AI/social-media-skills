#!/usr/bin/env node
// Optional: checks that every video link in a report was copied from a saved Virlo reply.
// A TikTok, Instagram or YouTube video link passes when its video id appears in at least one
// .json file under the cache folder (searched recursively). Profile links aren't checked.
// No network, no dependencies.
//
//   node evals/check-links.mjs <report.md> [more reports…] <cache-dir>
//   node evals/check-links.mjs virlo-research/2026-11-23-niche-breakouts-fitness.md virlo-research/.cache
//
// Exit 0 when every video id was found, 1 when any wasn't, 2 on bad usage.
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
if (args.length < 2) {
  console.error('usage: node evals/check-links.mjs <report.md> [more reports…] <cache-dir>')
  process.exit(2)
}
const cacheDir = args.pop()
if (!fs.existsSync(cacheDir) || !fs.statSync(cacheDir).isDirectory()) {
  console.error(`not a folder: ${cacheDir}`)
  process.exit(2)
}

// Every saved reply, as one string per file.
const jsonFiles = []
const walk = (dir) => {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (name.endsWith('.json')) jsonFiles.push(p)
  }
}
walk(cacheDir)
if (!jsonFiles.length) {
  console.error(`no .json replies under ${cacheDir}`)
  process.exit(2)
}
const replies = jsonFiles.map((f) => fs.readFileSync(f, 'utf8'))

// The video id inside a video link, by platform. Profile links return nothing.
const VIDEO_ID = [
  [/tiktok\.com\/@[^/?#\s]+\/(?:video|photo)\/(\d+)/i, 'tiktok'],
  [/instagram\.com\/(?:[^/?#\s]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i, 'instagram'],
  [/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/i, 'youtube'],
  [/youtube\.com\/watch\?(?:[^#\s]*&)?v=([A-Za-z0-9_-]{6,})/i, 'youtube'],
  [/youtu\.be\/([A-Za-z0-9_-]{6,})/i, 'youtube'],
]

let missing = 0
let checked = 0
for (const report of args) {
  if (!fs.existsSync(report)) {
    console.error(`no such report: ${report}`)
    process.exit(2)
  }
  const text = fs.readFileSync(report, 'utf8')
  const seen = new Map() // id -> first link
  for (const m of text.matchAll(/https?:\/\/[^\s)\]>"'`|]+/g)) {
    for (const [re, platform] of VIDEO_ID) {
      const hit = m[0].match(re)
      if (hit && !seen.has(hit[1])) seen.set(hit[1], { url: m[0], platform })
    }
  }
  const bad = [...seen].filter(([id]) => !replies.some((r) => r.includes(id)))
  // The id is there but the link isn't word for word (a typed handle, say): a warning, not a failure.
  const bare = (u) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '').toLowerCase()
  const differs = [...seen].filter(([id, { url }]) => !bad.some(([b]) => b === id) &&
    !replies.some((r) => r.replaceAll('\\/', '/').toLowerCase().includes(bare(url))))
  checked += seen.size
  missing += bad.length
  const name = path.basename(report)
  if (!bad.length) console.log(`✓ ${name}: ${seen.size} video links, all found in ${jsonFiles.length} saved replies`)
  else {
    console.log(`✗ ${name}: ${bad.length} of ${seen.size} video links are in no saved reply (typed, recalled or rebuilt?):`)
    for (const [id, { url }] of bad) console.log(`  - ${url}`)
  }
  for (const [, { url }] of differs) console.log(`  ! ${name}: the video id is in a reply but this link isn't, word for word: ${url}`)
}
process.exit(missing ? 1 : 0)
