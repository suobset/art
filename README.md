# art + algorithms

`art + algorithms` is an open-source gallery for the claim that programming can become an art form when structure, behavior, constraint, timing, and meaning are chosen with expressive intent.

## Thesis

A program can be useful, correct, expressive, playful, personal, beautiful, strange, political, precise, fragile, and alive.

This version is curated by Kush S. and intended for `https://art.skushagra.com/`, with related writing on Declarative at `https://skushagra.com`.

This site does not argue that all code is art. It argues that code can become a medium.

## Screenshots

Screenshots placeholder:
- `docs/screenshot-hero.png`
- `docs/screenshot-gallery.png`
- `docs/screenshot-demos.png`

## Features

- A homepage built as a navigation threshold, with each demo on its own route
- Ten interactive computational artworks
- A shared demo registry for easy extension
- A behind-the-scenes panel for every piece
- Keyboard-accessible controls and pause points
- Reduced-motion support and a manual motion toggle
- Static deployment with Vite, React, TypeScript, and Tailwind CSS

## Demos

- `gesture` — flow field painting
- `grid` — 32 by 18 pixel constraint editor
- `choreography` — sorting as movement
- `weather` — cellular automata playground
- `poem` — local generative poetry engine
- `garden` — recursive tree generator
- `light` — shader-like arithmetic painting without WebGL
- `type` — kinetic typography stage
- `maze` — pathfinding personality playground
- `source` — safe source remix editor

## Local setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run lint
```

## Project structure

```txt
.
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── index.html
├── package.json
├── src
│   ├── App.tsx
│   ├── components
│   ├── content
│   ├── demos
│   ├── hooks
│   ├── lib
│   ├── main.tsx
│   ├── styles.css
│   └── index.css
└── vite.config.ts
```

## How to add a demo

1. Create a component in `src/demos`.
2. Give it direct interaction, controls, reset, remix, and a pause-friendly path.
3. Add accessible labels and a reduced-motion behavior.
4. Register it in `src/demos/index.ts` with metadata and behind-the-scenes copy.
5. Make sure the panel explains what the code is doing, where the artistic choice enters, and what to try next.

## Accessibility notes

- Controls use semantic form elements and buttons.
- Every demo includes a textual description.
- Motion can be reduced through system preference or the site toggle.
- Demos expose keyboard alternatives for core interactions.
- The site avoids flashing and strobing patterns.

## Contribution notes

See `CONTRIBUTING.md` for demo expectations, accessibility checks, performance checks, and commit style.

## License

Code is released under the MIT License in `LICENSE`.

Written copy and demo concepts are also covered by the repository license for simplicity in this first version.
