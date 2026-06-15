# Altira — Concept Builder (MVP)

A card-based whole-property concept tool. The customer starts from a pre-filled
suggested concept and makes small swaps; a Plan and Section update live. See
[`altira-mvp-oneshot-brief.md`](./altira-mvp-oneshot-brief.md) for the full spec
and [`CLAUDE.md`](./CLAUDE.md) for the working rules.

## Stack

React 18 + TypeScript + Vite + Tailwind + Zustand + react-router. Hand-authored
SVG renderers. Vitest + React Testing Library. Client-only, with localStorage
persistence — no backend, auth, or payments.

## Commands

```bash
npm install
npm run dev      # local dev
npm test         # run before every commit
npm run build    # production build
npm run lint     # includes the customer-copy banned-words check
```
