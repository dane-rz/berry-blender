# 🫐 Berry Blender

A dumb little press-timing game based on the Game Boy Advance berry-blending
minigame. Drop a berry in, then tap in rhythm as the needle sweeps past your
corner. Nail your timing and the blender spins faster and you walk away with a
fancier Pokéblock. Bring some friends (TBD) — you can add up to 3 AI opponents and
squabble over the same bowl.

Honestly this exists because I wanted to build something for fun instead of yet
another CRUD dashboard, and use it as an excuse to actually learn a couple of
things:

- **GSAP** — I'd never really touched it and wanted to see what proper
  animation tooling feels like.
- **CSS Modules** — deliberately no Tailwind this time. Just plain scoped CSS
  and some design tokens, to remember how to write the stuff by hand.

## Stack

Nothing exotic:

- **React 19 + TypeScript + Vite** — the usual.
- **GSAP** — drives the spinning needle (the whole point of the exercise).
- **TanStack Query** — overkill for a mock berry list, but it's wired up so a
  real API could drop straight in.
- **React Router v7** — home screen + play screen.
- **CSS Modules** — co-located `*.module.css`, global tokens in one file.

## Run it

```bash
npm install
npm run dev        # dev server
npm run build      # type-check + build to dist/
```

Then open the local URL it prints. Click the blender or hit **Space** to blend.

## How it's wired

Organized by file type, game logic kept well away from the rendering so it's
easy to poke at.

```
src/
├── app/                      # providers, router, query client
├── api/                      # mock berry data behind a TanStack Query hook
├── pages/
│   ├── home/                 # landing
│   └── play/                 # the actual game
│       ├── hooks/
│       │   ├── useBlenderRotation.ts # GSAP spin controller
│       │   ├── useBlenderGame.ts     # reducer state machine
│       │   └── useAIPlayer.ts        # drives one AI opponent
│       └── components/       # Blender, BerryPicker, Hud, PlayerSeat, Results
├── lib/constants.ts          # all the "feel" knobs — tune here
├── utils/scoring.ts          # pure judging + Pokéblock math
└── styles/global.css         # tokens + a couple of shared utilities
```

### The gist

GSAP does its thing spinning the needle. When you press, I just check where the
animation is at — if the angle roughly matches your corner, it's a hit. No
per-frame React, just a peek at the tween.

The AIs do the same peek, except I added some rough sloppiness to their timing
so they're actually beatable (lol).

## Tuning

Everything that changes how it feels — timing windows, round length, spin speed,
AI difficulty — is in `src/lib/constants.ts`. Go wild.

---

Berry blending and Pokémon contests were peak. Bring them back plz.
