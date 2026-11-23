#!/usr/bin/env node
// Consistency checks over every skills/*/samples/*.md (no network, no dependencies).
//  - every sample starts with a provenance comment (date, prompt) and ends with Method + Spend
//  - a link shown as [@handle](tiktok.com/@other/...) must name the same account as its URL
//  - one video id never appears under two different handles across samples
//  - no emails, phone numbers or Virlo keys
//  - relative links resolve
// Usage: node evals/check-samples.mjs
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const skillsDir = path.join(root, 'skills')
const errors = []
const videoOwners = new Map() // tiktok video id -> { handle, file }
let files = 0
let links = 0

for (const skill of fs.readdirSync(skillsDir)) {
  const dir = path.join(skillsDir, skill, 'samples')
  if (!fs.existsSync(dir)) continue
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const file = path.join(dir, name)
    const rel = path.relative(root, file)
    const text = fs.readFileSync(file, 'utf8')
    files++

    if (!/^<!-- Sample (report )?from a real (run|session) on [A-Z][a-z]{2} \d{1,2} 20\d\d/.test(text))
      errors.push(`${rel}: missing the provenance comment ("Sample report from a real run on <date> …")`)
    if (!/\*\*Method:\*\*/.test(text)) errors.push(`${rel}: missing a **Method:** line`)
    if (!/\*\*Spend:\*\*/.test(text)) errors.push(`${rel}: missing a **Spend:** line`)

    if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|net|org|co|io)\b/.test(text.replace(/https?:\/\/\S+/g, '')))
      errors.push(`${rel}: contains what looks like an email address`)
    if (/virlo_tkn_[A-Za-z0-9]{8,}/.test(text)) errors.push(`${rel}: contains a Virlo key`)
    // Phone-shaped numbers only: digit groups split by spaces, dots, dashes or brackets, with an optional
    // +country code. Ignored: URLs, `code spans`, cache timestamps (20261123-124124), dates, counts with
    // thousands commas, ranges and unbroken ids (TikTok video ids).
    const phoneText = text
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/`[^`\n]*`/g, ' ')
      .replace(/\b\d{8}-\d{6}\b/g, ' ')
      .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ')
      .replace(/\b\d{1,3}(,\d{3})+\b/g, ' ')
    const PHONE = [
      /\+\d{1,3}[\s.-]?\(?\d{1,4}\)?(?:[\s.-]?\d{2,4}){2,4}\b/, // +44 20 7946 0958, +1 (415) 555-0132
      /(?:^|[^\d-])\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/, //       (415) 555-0132, 415.555.0132
      /(?:^|[^\d-])0\d{2,4}[\s-]\d{3,4}[\s-]?\d{3,4}\b/, //       020 7946 0958, 0412 345 678
    ]
    if (PHONE.some((re) => re.test(phoneText))) errors.push(`${rel}: may contain a phone number`)

    for (const m of text.matchAll(/\[([^\]]*)\]\(([^)\s]+)\)/g)) {
      const [, label, url] = m
      links++
      if (!/^https?:\/\//.test(url)) {
        if (url.startsWith('#')) continue
        const target = path.resolve(path.dirname(file), url.split('#')[0])
        if (!fs.existsSync(target)) errors.push(`${rel}: broken relative link ${url}`)
        continue
      }
      try { new URL(url) } catch { errors.push(`${rel}: malformed URL ${url}`); continue }
      const tt = url.match(/tiktok\.com\/@([^/?#]+)\/video\/(\d+)/)
      if (tt) {
        const [, handle, id] = tt
        const shown = label.match(/^@([A-Za-z0-9._]+)/)
        if (shown && shown[1].toLowerCase() !== handle.toLowerCase())
          errors.push(`${rel}: link text @${shown[1]} points at @${handle}'s video ${id}`)
        const prev = videoOwners.get(id)
        if (prev && prev.handle.toLowerCase() !== handle.toLowerCase())
          errors.push(`${rel}: video ${id} is @${handle} here but @${prev.handle} in ${prev.file}`)
        else videoOwners.set(id, { handle, file: rel })
      }
      const prof = url.match(/tiktok\.com\/@([^/?#]+)\/?$/)
      const shownProf = label.match(/^@([A-Za-z0-9._]+)$/)
      if (prof && shownProf && shownProf[1].toLowerCase() !== prof[1].toLowerCase())
        errors.push(`${rel}: link text @${shownProf[1]} points at profile @${prof[1]}`)
    }
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in ${files} samples:\n` + errors.map((e) => '  - ' + e).join('\n'))
  process.exit(1)
}
console.log(`✓ ${files} samples consistent (${links} links, ${videoOwners.size} TikTok videos checked)`)
