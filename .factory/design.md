# Set Receipt — visual thesis

## Direction: the training docket

Set Receipt is a **neo-brutalist utility** inspired by loading-dock labels, paper
lifting logs, and the hard geometry of weight plates. It should feel faster than
opening a notebook: one obvious input, blunt ink rules, and a compact receipt
that looks worth keeping. Decoration explains the product world; it never turns
the logger into a generic fitness dashboard.

## Tokens

Light mode uses `paper #F2EEDB`, `sheet #FFFDF4`, `ink #171814`, `muted #55594F`,
`signal #F04B23` (safety orange), `signal-ink #171814`, `PR #B42318`, `plate #1848C7`,
`success #176B43`, `warning #9A5200`, and `danger #B42318`. Dark mode uses
`floor #171814`, `sheet #23251F`, `ink #F8F4E4`, `muted #BABDAF`,
`signal/PR #FF6842`, `plate #84A1FF`, and `success #59C98D`. The separate PR
token keeps the small personal-record stamp at or above 4.5:1 contrast on its
paper/sheet in either scheme. Heavy 2 px ink rules
and hard 4 px offset shadows create depth without faux glass or gradients.

Type is deliberately local and operational: **Arial Black / Franklin Gothic
Heavy / system sans** for condensed-feeling labels and totals; **ui-monospace /
SFMono-Regular / Consolas** for the set grammar, timestamps, and receipt rows.
No font files or runtime font requests are needed. The scale is 14, 16, 20, 28,
and clamp(34–60) px, with tabular figures for all workout numbers.

Spacing follows a 4/8 px rhythm: 4, 8, 12, 16, 24, 32, 48. Controls are at
least 48 px high, with primary logging controls at 56 px for gloved or shaky
post-set hands. The 390 px view is the reference: utilities stack, the entry bar
stays prominent, and secondary copy disappears before controls shrink.

## Interaction grammar and motion

The entry line is the product: select/type an exercise, enter `225x5`, press
Enter. A successful set lands as a newly printed receipt row and starts the rest
clock. Buttons depress by their 4 px shadow offset; new rows slide down 6 px over
180 ms; dialogs originate near the invoking control. Status is always expressed
with a label or symbol as well as color. Under `prefers-reduced-motion`, all
movement and smooth scrolling become instant opacity/state changes. Nothing
loops or flashes.

## Asset plan and provenance

The hero/support illustration is a square editorial still life: a warm paper
set receipt threading through stacked cobalt weight plates with one safety-orange
collar, surrounded by black geometric shadows. It clarifies “proof of the lift”
and is shown only in the empty/history context so logging remains primary.
App icons are original hand-authored SVG geometry based on an `SR` receipt stamp.

Image prompt (source of truth): “Neo-brutalist editorial still life for a
minimal weightlifting log: a blank warm ivory paper receipt curling through two
stacked cobalt-blue iron weight plates, a single safety-orange barbell collar,
chunky black geometric shadows, tactile screen-print ink and subtle paper grain,
hard frontal studio light, square composition, limited palette ivory cobalt
orange black, no people, no readable text, no numbers, no watermark, no logos,
no gradients, no glossy 3D app icon.”

Generated with the factory `factory-image` deployment on 2026-08-27. The final
PNG source and prompt sidecar live in `assets/src/`; the shipped WebP is an
optimized derivative. Generated imagery is original to this product under the
factory’s output terms. Each candidate is visually reviewed for stray text,
brands, malformed plate geometry, seams, and palette consistency before use.
