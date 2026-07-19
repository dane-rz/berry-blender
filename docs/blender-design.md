# How the Blender is built

A teardown of the play-screen machine, segment by segment. Everything lives in
[`src/pages/play/components/Blender/Blender.tsx`](../src/pages/play/components/Blender/Blender.tsx)
and its `Blender.module.css`.

## The mental model: one light source, from above

There's no real 3D or filter trickery here. The depth is one convention applied
consistently everywhere:

- **Top edges catch light** → `inset 0 <positive>px … rgba(255,255,255,α)`
- **Bottom edges fall into shadow** → `inset 0 -<n>px … rgba(0,0,0,α)`
- **The whole object floats** → a plain outer `0 20px 40px rgba(0,0,0,…)` drop shadow
- **Rounded fills get their highlight offset to the top-left** →
  `radial-gradient(circle at 40% 35%, <lighter>, <base>)`

Because every element obeys the same imagined light, they read as one physical
object. That's the whole illusion.

## The DOM, outside-in

```
button.blender            ← the metal cabinet (also the press target)
├─ span.handle            ← top bar
├─ span.bolt ×4           ← corner rivets
├─ div.chamber            ← the round bowl (positioning context for the round bits)
│  ├─ div.band + div.bandMask        ← the timing zone
│  ├─ div.seatRing ×N → span.seatArrow  ← inward arrows
│  ├─ div.markerRing → div.marker    ← the cream tab
│  ├─ div.pointer → span.blade + span.bladeCap  ← the rotor (GSAP spins this)
│  ├─ div.hub → countdown / hubDot   ← center dome
│  └─ span.judge          ← floating "Perfect!" text
└─ div.lcd → digits + "rpm"          ← the readout
```

Key structural decision: `.chamber` is `position: relative`, so **every round
element positions against the circle**, not the square cabinet. The cabinet is
just a frame.

## 1. The cabinet (`.blender`)

A rounded square (`border-radius: var(--radius-lg)`, `aspect-ratio: 0.92` so it's
slightly tall for the handle + LCD). The "brushed metal" is two stacked backgrounds:

```css
background:
  linear-gradient(180deg, <lighter plum> 0%, --plum-800 22%, --plum-900 78%, --plum-950 100%),
  repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 2px, rgba(0,0,0,.03) 2px 4px);
```

The vertical gradient is the light-top/dark-bottom sheen; the repeating one is
faint 2px vertical "brushing" streaks. Then the light model again in the shadow
stack: a bright `inset 0 2px 0 rgba(255,255,255,.10)` glint on the top lip,
`inset 0 -3px 8px rgba(0,0,0,.45)` shade at the bottom, an `inset 0 0 0 1px
--plum-700` edge line, and the outer drop. `padding: 44px 26px 58px` is what
carves out room for the handle above and the LCD below the chamber.

## 2. Handle & bolts (the chrome)

- **`.handle`** — a pill (`border-radius: 999px`) pinned top-center. Same lighting:
  highlight on top, shadow under, tiny drop below. Reads as a raised grab-bar.
- **`.bolt`** — 12px circles, one class + four position modifiers
  (`.boltTL/TR/BL/BR`) placed 12px into each corner. The dome look is a
  `radial-gradient(circle at 38% 35%, …)` (light hitting top-left) plus
  `inset 0 1px 1px rgba(255,255,255,.25)` and a drop. That's the "rivet" cue.

## 3. The chamber (`.chamber`)

The old bowl, now nested. Two things give it depth:

```css
background: radial-gradient(circle at 50% 38%, --plum-700, --plum-800 62%, --plum-950);
box-shadow:
  inset 0 6px 20px rgba(0,0,0,.55),          /* deep top-inner shadow = recessed */
  inset 0 -4px 10px rgba(255,255,255,.04),   /* faint bottom-inner bounce light */
  0 0 0 6px --plum-900,                        /* bezel ring 1 (dark) */
  0 0 0 8px color-mix(... white 12%),          /* bezel ring 2 (bright lip) */
  0 6px 14px rgba(0,0,0,.45);
```

The radial gradient lit from `50% 38%` makes the bowl look concave. The two
`0 0 0 Npx` spread shadows are the clever bit — a **6px dark ring then an 8px
lighter ring** stacked outside the circle read as a machined bezel wrapping the
glass. That's a lot of the "it's a real part" feeling.

## 4. The timing zone (`.band` + `.bandMask`)

The part with real angle math. Coordinate system: **degrees clockwise from 12
o'clock**. Seat targets are `SEAT_ANGLES = [225, 135, 45, 315]` (bl, br, tr, tl).

The band is a full conic gradient built in `targetBand(target)`:

```
conic-gradient(from ${target}deg,
  perfect 0–10°, good 10–26°, off 26–334°, good 334–350°, perfect 350–360°)
```

Two ideas make this work:

- The perfect core straddles gradient-angle 0 (painted at both `0–10°` *and*
  `350–360°`), so it's centered on wherever "0" points.
- `conic-gradient` starts at the top and sweeps clockwise, and **`from
  ${target}deg` rotates the whole wheel by the target**, so the perfect core lands
  at the seat's screen angle. For "You" (225°) that's the lower-left.

Then it's turned from a filled disc into a **thin ring** with a mask:

```css
mask: radial-gradient(circle, transparent 58%, #000 59%);
```

Transparent out to 58% of the radius, opaque past 59% → only the outer annulus
survives. `.bandMask` is a separate ring on top adding a subtle
`inset 0 0 0 2px rgba(255,255,255,.06)` inner-rim highlight.

## 5. The seat arrows (`.seatRing` → `.seatArrow`)

The most reused trick in the file — the **"rotate a full-size ring" pattern**:

```css
.seatRing  { position: absolute; inset: 0; }               /* spans the chamber, centered */
.seatArrow { position: absolute; top: 4%; left: 50%; transform: translateX(-50%); }
```

The wrapper fills the chamber, so its center *is* the chamber center. The arrow is
pinned at the top (12 o'clock). Each ring then gets `transform:
rotate(${angle}deg)` in the JSX — rotating the wrapper about its center swings that
top-pinned arrow around to the seat's angle. One arrow, four rotations, four
markers.

The arrow itself is a pure-CSS triangle: zero width/height, transparent left/right
borders, and a solid `border-top: 14px solid var(--razz)` → a downward
(inward-pointing) triangle. Default `opacity: .35` = dim; the active seat lights up
via an attribute selector:

```css
.seatRing[data-active='true'] .seatArrow {
  border-top-color: var(--gold); opacity: 1; filter: drop-shadow(0 0 6px …gold);
}
```

`data-active={angle === target}` in the JSX is what turns your seat's arrow gold
while the others stay dim.

## 6. The marker tab (`.markerRing` → `.marker`)

Same ring-rotate trick, rotated to `target`. `.marker` is a cream tab hanging off
the top rim (`top: -2px`, `border-radius: 0 0 10px 10px`). Redundant with the gold
arrow, but a nice "this is mine" anchor.

## 7. The rotor blade (`.pointer` → `.blade` + `.bladeCap`)

`.pointer` is the ring-rotate pattern **again** (`inset: 0`), except GSAP owns its
`rotation` and spins it forever. The judged angle depends only on `.pointer`'s
rotation *number*, so the visuals just have to agree with "0 = pointing up."

`.blade` is the chunky arrow:

```css
top: 8%; height: 42%;            /* 8 + 42 = 50% → base sits at chamber center */
transform-origin: bottom center;
background: linear-gradient(180deg, var(--gold), var(--razz) 70%);
clip-path: polygon(50% 0%, 100% 34%, 72% 34%, 72% 100%, 28% 100%, 28% 34%, 0% 34%);
```

The `clip-path` is the arrow silhouette: apex at `50% 0%` (top center), shoulders
out to full width at 34% height, then a narrow shaft to the base. Because the apex
is on the vertical centerline and the base lands at chamber center, when `.pointer`
rotates the tip traces the rim and always points where the rotation says. The
gold→razz gradient gives the hot glowing-tip look. `.bladeCap` is a small domed
circle at the base so the blade reads as mounted on a pivot (mostly tucked under
the hub).

## 8. The hub (`.hub`)

The yellow dome. `width: 34%`, centered with `translate(-50%,-50%)`, tinted by the
**selected berry** via an inline `--hub` custom property, then the standard dome
recipe: `radial-gradient(circle at 40% 35%, lighter, base)` + bottom inset shadow +
outer drop. During countdown it shows `3/2/1/GO`; otherwise a small `.hubDot`. At
`z-index: 5` it sits above the blade, hiding the blade's messy root.

## 9. The LCD (`.lcd`)

A recessed panel: a near-black `linear-gradient(180deg,#0c0410,#140820)` (still in
the plum family) with a deep `inset 0 2px 6px rgba(0,0,0,.8)` to sink it into the
metal. The digits reuse Fredoka, but the LED glow is all `text-shadow`:
`0 0 6px` + `0 0 14px` in `--zest`. `padStart(3,'0')` gives the `000` look.

## 10. Stacking order (inside the chamber)

```
band (auto) < seatRing (2) < pointer/blade (3) < markerRing (4) < hub (5) < judge (6)
```

Deliberate: arrows under the spinning blade, marker tab over the blade, hub over
everything central to hide the blade's root, judgement text on top of all of it.

---

## Two things worth remembering

1. **Depth = consistent top-light / bottom-shadow inset shadows + a top-left radial
   highlight.** Never filters.
2. **Anything placed at an angle on the ring** — zone, arrows, marker, blade — is
   just an element pinned at 12 o'clock inside a full-size wrapper that you
   `rotate()`. Same pattern, four different jobs.
