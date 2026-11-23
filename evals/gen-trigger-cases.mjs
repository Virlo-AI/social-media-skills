#!/usr/bin/env node
// Turns evals/triggers.jsonl into `claude plugin eval` cases under evals/triggers/<nn>-<skill>/.
// Each case: prompt.md (the user's request) + graders/skill-fired.md (the expected skill was invoked).
// "none" cases pass only when no Virlo skill fires.
// Usage: node evals/gen-trigger-cases.mjs, then:
//   claude plugin eval . --tag trigger --runs 1 --ablation none --no-publish --trust-plugin
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, 'evals', 'triggers')
const skills = fs.readdirSync(path.join(root, 'skills')).filter((d) =>
  fs.existsSync(path.join(root, 'skills', d, 'SKILL.md')))
const lines = fs.readFileSync(path.join(root, 'evals', 'triggers.jsonl'), 'utf8').trim().split('\n')

fs.rmSync(out, { recursive: true, force: true })
const counts = {}
lines.forEach((line, i) => {
  const { skill, prompt } = JSON.parse(line)
  if (skill !== 'none' && !skills.includes(skill)) throw new Error(`line ${i + 1}: unknown skill ${skill}`)
  counts[skill] = (counts[skill] || 0) + 1
  const name = `${String(i + 1).padStart(2, '0')}-${skill}`
  const dir = path.join(out, name)
  fs.mkdirSync(path.join(dir, 'graders'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'prompt.md'), [
    '---',
    `name: trigger-${name}`,
    `tags: [trigger, ${skill === 'none' ? 'negative' : 'positive'}]`,
    'runs: 1',
    'max_turns: 2',
    'timeout_seconds: 180',
    'allowed_tools: [Skill, Read, Glob, Grep]',
    '---',
    '',
    prompt,
    '',
  ].join('\n'))
  const pattern = skill === 'none'
    ? `"skill"\\s*:\\s*"(?:[\\w-]+:)?(${skills.join('|')})"`
    : `"skill"\\s*:\\s*"(?:[\\w-]+:)?${skill}"`
  fs.writeFileSync(path.join(dir, 'graders', 'skill-fired.md'), [
    '---',
    'type: tool_used',
    'tool: Skill',
    `input_match: '${pattern}'`,
    skill === 'none' ? 'min: 0\nmax: 0' : 'min: 1',
    '---',
    '',
    skill === 'none'
      ? 'Passes when no Virlo research skill is invoked for an unrelated request.'
      : `Passes when the ${skill} skill is invoked.`,
    '',
  ].join('\n'))
})
console.log(`wrote ${lines.length} cases to evals/triggers/:`, counts)
