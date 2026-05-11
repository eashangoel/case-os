# CaseOS — Setup

1. `npm install`
2. `cp .env.example .env`
3. Add your Anthropic API key to `.env`
4. `npm run dev`
5. Open http://localhost:5173

## What it is

AI-powered consulting case interview trainer. Practice McKinsey-style cases with a live Claude interviewer, get scored across 4 dimensions, and track your progress over time.

## Screens

- **Case Library** — start the seeded ChaiPoint case or generate a custom one
- **Simulator** — live interview with Claude as the interviewer, drag-and-drop issue tree scratchpad, phase bar, socratic/instructional coach toggle
- **Scorecard** — AI-scored on Structure, Hypothesis, Quantitative, Communication with per-dimension feedback
- **Progress** — trend charts, skill radar, session history, weekly AI coaching insight

## Node version

Requires Node ≥ 16. If you have nvm: `nvm use 16` or `nvm use 20`.
