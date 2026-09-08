# obZen visual restyle — Claude Code prompt

Paste everything below the line into Claude Code, in the repo root.

---

You are a senior design engineer restyling **obZen**, an existing dark-mode training app.

## Scope

Visual styling and micro-interactions only. Do **not** change layout structure, component hierarchy, routing, data models, or business logic. Do not add features, screens, or dependencies. Do not rename files.

If a change I describe would require restructuring a component, stop and tell me instead of doing it.

## Direction

Near-black ground, one violet accent family, soft gradient card surfaces, restrained glow on live values only. Restrained rather than neon — depth comes from gradient and layering, not from shadows or blur.

Per-exercise colour is a system, not decoration: each lift owns one hue and keeps it everywhere it appears — bar, line, ring, legend chip.

## Tokens

Define these once, in a single place (`:root` in the global stylesheet, or the theme file if one already exists), and reference them everywhere. No hardcoded hex outside that block.

```css
:root {
  /* ground */
  --bg:            #06050A;   /* page behind the app */
  --surface:       #0A0810;   /* screen */
  --card:          linear-gradient(155deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018));
  --card-accent:   linear-gradient(160deg, rgba(139,92,246,0.13) 0%, rgba(76,29,149,0.16) 38%, rgba(255,255,255,0.02) 72%, rgba(255,255,255,0.015) 100%);
  --hairline:      rgba(255,255,255,0.07);
  --hairline-soft: rgba(255,255,255,0.045);

  /* accent — one hue, six steps */
  --violet-100: #C4B5FD;   /* glow, live values, selected ring */
  --violet-200: #A78BFA;   /* chart lines, primary gradient start */
  --violet-400: #8B5CF6;   /* accent base */
  --violet-600: #6D28D9;
  --violet-700: #5B21B6;   /* primary gradient end */
  --violet-900: #4C1D95;   /* deep end of card + tab gradients */

  /* ink */
  --ink:       #F2F0F7;
  --ink-2:     #CFC9DE;
  --ink-dim:   #A29DB4;
  --ink-faint: #837D96;
  --ink-off:   #6E6980;
  --ink-ghost: #4B4757;   /* future / untracked only, never body copy */

  /* per-lift hues — fixed assignment */
  --lift-squat:    #A78BFA;
  --lift-deadlift: #6366F1;
  --lift-bench:    #C084FC;
  --lift-row:      #22D3EE;
  --lift-core:     #F472B6;

  /* semantic */
  --ok: #86EFAC;

  /* geometry */
  --r-card: 22px;
  --r-inset: 14px;
  --r-control: 12px;
  --r-bar: 6px;
  --r-pill: 999px;

  /* motion */
  --t-fast: 160ms;
  --t-base: 200ms;
  --t-sheet: 300ms;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
```

**Contrast floor:** body copy uses `--ink-dim` or lighter on card surfaces. `--ink-off` is for 10–11px labels only. `--ink-ghost` is never text a user needs to read — it marks future or untracked slots.

## Type

Satoshi, via Fontshare. Tabular numerals on every figure so values don't jitter when a range switches.

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet">
```

| Role | Size / weight | Notes |
|---|---|---|
| Screen title | 26 / 700, `letter-spacing:-0.025em` | one per screen |
| Hero figure | 36–40 / 700, `line-height:0.9`, `-0.03em` | tabular |
| Card figure | 20–22 / 700 | tabular |
| Card title | 18–19 / 700, `-0.02em` | |
| Body | 15 / 400, `line-height:1.5–1.65` | `text-wrap: pretty` |
| Secondary | 13 / 400 | |
| Section label | 11 / 500, `uppercase`, `letter-spacing:0.12em` | `--ink-dim` |
| Axis / meta | 10 / 500, `uppercase`, `0.06–0.08em` | `--ink-faint` |

Apply `font-variant-numeric: tabular-nums` to every numeric span.

## Component recipes

### Card

Two variants only. Accent is for the one card that leads the screen.

```jsx
<div style={{
  border: `1px solid var(--hairline)`,
  borderRadius: 'var(--r-card)',
  background: 'var(--card)',          // or var(--card-accent)
  padding: '16px 18px',
  display: 'flex', flexDirection: 'column', gap: 13,
}}>
  <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
                 letterSpacing: '0.12em', color: 'var(--ink-dim)' }}>
    Load balance
  </span>
  {children}
</div>
```

### Section label + figure pair

The label always sits above or beside the figure at 11px; the figure carries the hierarchy.

```jsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
  <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
                 letterSpacing: '0.12em', color: 'var(--ink-dim)' }}>Sessions logged</span>
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
    <span style={{ fontSize: 36, fontWeight: 700, lineHeight: 0.9,
                   letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
                   color: 'var(--ink)' }}>4</span>
    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-faint)' }}>of 5 planned</span>
  </div>
</div>
```

### Range tabs

Segmented pill. Active tab is a violet gradient with white text and a soft cast shadow; inactive is bare.

```jsx
<div style={{ display: 'flex', gap: 2, padding: 2,
              borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,0.05)' }}>
  {['Week', 'Month', 'Year'].map(r => {
    const on = r === range;
    return (
      <button key={r} onClick={() => setRange(r)} style={{
        padding: '6px 12px', border: 'none', cursor: 'pointer',
        borderRadius: 'var(--r-pill)',
        fontSize: 11, fontWeight: 500, letterSpacing: '0.03em',
        background: on ? 'linear-gradient(140deg, var(--violet-400), var(--violet-900))' : 'transparent',
        color: on ? '#FFFFFF' : 'var(--ink-faint)',
        boxShadow: on ? '0 2px 14px rgba(76,29,149,0.6)' : 'none',
      }}>{r}</button>
    );
  })}
</div>
```

### Primary action

```jsx
<button style={{
  padding: '15px 0', width: '100%', border: 'none', cursor: 'pointer',
  borderRadius: 16,
  background: 'linear-gradient(145deg, var(--violet-200), var(--violet-700))',
  boxShadow: '0 8px 26px rgba(124,58,237,0.42)',
  fontSize: 14, fontWeight: 700, letterSpacing: '0.02em', color: '#0A0810',
}}>Start session</button>
```

### Bar chart, coloured by lift

Each bar takes the hue of that session's focus lift. Selected or today's bar is full-strength plus glow; the rest are the same hue at low alpha. Empty slots are neutral, never a faint accent.

```jsx
const max = Math.max(...vals, 1);

vals.map((v, i) => {
  const lift = LIFTS[focus[i]];               // undefined on rest days
  const lit  = selected === i || (selected === null && i === today);
  return (
    <div key={i} onClick={() => setSelected(selected === i ? null : i)}
         style={{ flex: 1, display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-end', alignItems: 'center', gap: 8,
                  height: '100%', cursor: 'pointer' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center',
                    height: `${Math.max(3, Math.round(v / max * 100))}%`, minHeight: 3 }}>
        <div style={{
          width: '100%', borderRadius: 'var(--r-bar)',
          background: !v || !lift
            ? 'rgba(255,255,255,0.06)'
            : lit ? `linear-gradient(180deg, ${lift.color}, ${lift.deep})`
                  : `linear-gradient(180deg, ${lift.color}55, ${lift.deep}66)`,
          boxShadow: lit && lift ? `0 0 16px ${lift.color}70` : 'none',
          transition: `background var(--t-fast) ease`,
        }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.06em',
                     textTransform: 'uppercase',
                     color: lit ? 'var(--ink)' : 'var(--ink-faint)' }}>{labels[i]}</span>
    </div>
  );
})
```

### Selected-bar readout — fixed slot, never anchored to the bar

Put the readout in one absolutely positioned slot at the top-left of the chart box. Do **not** anchor it to the bar with `bottom: calc(100% + Npx)`: the bar wrapper's height scales with the value, so a tall bar pushes the pill out of the card and over the header. I hit exactly this bug.

```jsx
<div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end',
              gap: 7, height: 96 }}>
  <div style={{
    position: 'absolute', top: 0, left: 0, zIndex: 2, pointerEvents: 'none',
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '4px 9px', borderRadius: 'var(--r-pill)',
    background: 'rgba(10,8,16,0.92)', border: '1px solid rgba(255,255,255,0.12)',
    opacity: sel === null ? 0 : 1, transition: `opacity var(--t-fast) ease`,
  }}>
    <div style={{ width: 6, height: 6, borderRadius: 2, background: pill.color }} />
    <span style={{ fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                   color: 'var(--ink)', whiteSpace: 'nowrap' }}>{pill.text}</span>
  </div>
  {bars}
</div>
```

Readout text is `label · value · lift` — "May · 102k · Core".

### Multi-lift chart — stacked lanes, not shared axis

Five lifts on one shared axis compress the heavy ones into overlapping flat lines at the top, which hides the per-lift progress the colours exist to show. Give each lift its own horizontal lane, normalised to its own min/max, so every trajectory is legible.

```js
function lanes(series, w, h) {
  const lane = h / series.length, inset = 2.5;
  return series.map((vals, i) => {
    const min = Math.min(...vals);
    const span = (Math.max(...vals) - min) || 1;
    const top = i * lane;
    const pts = vals.map((v, j) => [
      j * (w / (vals.length - 1)),
      top + lane - inset - ((v - min) / span) * (lane - inset * 2),
    ]);
    return { d: catmullRom(pts), color: LIFTS[i].color, divider: top + lane };
  });
}
```

Draw a `rgba(255,255,255,0.04)` divider at each lane boundary, a 1.9px line per lift, and a 2.8px end dot. Legend below as a five-column row: swatch, lift name at 9px, delta at 10px/700 in the lift's own colour.

Smoothing (Catmull–Rom to cubic) — reuse this rather than straight segments:

```js
function catmullRom(pts) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}`
       + ` ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)}`
       + ` ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
```

### Area chart with glow (single series, hero only)

```jsx
<svg viewBox="0 0 320 104" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
  <defs>
    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#8B5CF6" stopOpacity="0.42" />
      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
    </linearGradient>
    <filter id="lineGlow" x="-25%" y="-60%" width="150%" height="240%">
      <feGaussianBlur stdDeviation="4" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
  <line x1="0" y1="26" x2="320" y2="26" stroke="var(--hairline-soft)" />
  <path d={fill} fill="url(#areaFill)" />
  <path d={line} fill="none" stroke="var(--violet-200)" strokeWidth="2.25"
        strokeLinecap="round" filter="url(#lineGlow)" />
  <circle cx={peakX} cy={peakY} r="4.5" fill="var(--surface)"
          stroke="var(--violet-100)" strokeWidth="2.25" />
</svg>
```

One glowing line per screen at most. Glow is how the eye finds the live value; used twice it stops meaning anything.

### Ring gauge

Radius 30, stroke 6, circumference 188.5, rotated -90°. Selected ring is its full hue; unselected is the same hue at 0.38 alpha. Never a shared grey.

```jsx
<svg viewBox="0 0 74 74" style={{ width: 74, height: 74, transform: 'rotate(-90deg)' }}>
  <circle cx="37" cy="37" r="30" fill="none" stroke="var(--hairline)" strokeWidth="6" />
  <circle cx="37" cy="37" r="30" fill="none" strokeWidth="6" strokeLinecap="round"
          stroke={sel ? ring.color : ring.dim}
          strokeDasharray="188.5" strokeDashoffset={188.5 * (1 - ring.pct / 100)}
          style={{ transition: `stroke-dashoffset 420ms var(--ease-out)` }} />
</svg>
```

The percentage sits centred inside at 18/700; the label sits below at 11px uppercase.

### Bottom sheet

```jsx
<>
  <div onClick={close} style={{ position: 'absolute', inset: 0,
    background: 'rgba(6,5,10,0.68)',
    opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
    transition: `opacity 220ms ease` }} />
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0,
    borderRadius: '26px 26px 0 0',
    borderTop: '1px solid rgba(167,139,250,0.22)',
    background: 'linear-gradient(170deg, #191428 0%, #0D0B14 100%)',
    boxShadow: '0 -20px 60px rgba(0,0,0,0.6)',
    padding: '12px 20px 26px',
    transform: open ? 'translateY(0)' : 'translateY(104%)',
    transition: `transform var(--t-sheet) var(--ease-out)` }}>
    <div style={{ width: 38, height: 4, borderRadius: 2,
                  background: 'rgba(255,255,255,0.18)', margin: '0 auto' }} />
    {children}
  </div>
</>
```

## Depth-on-demand rule

- **Expand in place** for a few extra numbers that belong to the card — the check-in strip opening to per-metric scales.
- **Bottom sheet** for a list or anything with its own actions — the session's exercise list with Start.

Any scrollable region **must** be `overflow-y: auto; min-height: 0`, not `overflow: hidden`. An expand-in-place inside a fixed-height `flex: 1` column with `overflow: hidden` silently clips whatever sits below it, with no scroll affordance — the user loses content and can't tell. I hit this bug too. Zero the scrollbar (`::-webkit-scrollbar { width: 0; height: 0 }`) so it still reads like a phone.

## Interaction states

Every interactive element gets all five: default, hover, active, focus-visible, disabled.

- Hover on a card: `border-color: rgba(167,139,250,0.28)`. Nothing moves.
- Active on a button: `transform: scale(0.98)`.
- Focus-visible: 2px `--violet-400` at 40% opacity, 2px offset. Never remove the outline.
- Animate only `transform`, `opacity`, `background`, `stroke-dashoffset`. `var(--t-fast)` for state, `var(--t-base)` for enter, `var(--t-sheet)` for the sheet.
- Wrap every transition in `@media (prefers-reduced-motion: reduce) { * { transition: none !important } }`.

## Empty and sparse states

Sparse data is where dark chart UIs fall apart. Rules:

- Solid line for real data; `stroke-dasharray: 4 5` at 0.28 alpha for the projected continuation.
- Untracked lifts stay in the legend, greyed, with `—` in place of a delta. Never drop them — absence is information.
- Rings with one session behind them use their hue at low alpha, and the note names the gap: "Core has one session behind it."
- Axis labels for future periods use `--ink-ghost`.

## Acceptance checks

Before you tell me you're done, verify each of these and report the numbers:

1. No hex literal outside the token block. `grep -rn '#[0-9A-Fa-f]\{6\}' src/ | grep -v tokens` returns nothing.
2. Every scrollable column has `overflow-y: auto` and `min-height: 0`. No `overflow: hidden` on a `flex: 1` column that holds cards.
3. For every screen at 390×844: `scrollHeight === clientHeight` on the content column with all cards collapsed, and no card's bottom edge past the column's clip line.
4. Trigger every expand and overlay; confirm nothing below it becomes unreachable.
5. Select the tallest bar in every range; confirm the readout stays inside the card.
6. Every numeric span has `font-variant-numeric: tabular-nums`.
7. Body copy on card surfaces is `--ink-dim` or lighter.
8. All five interaction states exist on every control; reduced-motion honoured.

## Working protocol

- Work screen by screen. Start with the dashboard, show me a diff, wait for my go before the next one.
- After each file: `✅ [path] — [what changed]`.
- Stop and ask before deleting a file, adding a dependency, or changing any component's props.
