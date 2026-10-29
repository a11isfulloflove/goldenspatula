# Golden Spatula

A fan-made Teamfight Tactics companion: tell it which item components and champions the game
gave you at the start, and it ranks the comps that best fit your opening.

## Features

- Pick up to 5 item components and any champions you've been offered
- Champion picks count copies — a stack of one unit signals a reroll start
- Pick up to 3 augments (crests, trait augments) and see comps that want them
- Crafted an emblem? Tap it in the items panel — spatula emblems boost their trait too
- Mark completed items — crafting locks their components into one path and boosts comps that want them
- Comps are ranked by how well your components fill their item needs, with bonuses for
  early champions and meta strength (tier)
- Tier-list view for browsing the whole meta, with inline comp details
- Item recipe tooltips: hover an item to see which components build it
- Official Riot item art, used under Riot's Fan Content Policy

## Getting started

```sh
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run lint     # oxlint
npm run preview  # serve the production build
```

## How it works

The app is split into a scoring **engine** (set-agnostic code) and versioned **content**
(JSON data). The engine never changes between seasons — only the data does.

```
src/
  App.tsx            UI: pickers, results, tier list
  data.ts            loads the active set's JSON via import.meta.glob
  types.ts           data shapes
  componentMeta.ts   component display colors
  engine/recommend.ts  scoring: components + champions -> ranked comps
data/
  items.json         item components, groups, recipes, icon map (mostly set-independent)
  config.json        { "activeSet": "set18" } - which set folder to load
  sets/
    set18/meta.json    set number + patch
    set18/comps.json   all comps for this set
    set18/augments.json comp-defining augments (trait crests, champion augments)
public/items/        item icon PNGs (Riot assets via CommunityDragon)
```

### Scoring

Each comp declares `itemNeeds`, e.g. `{ "rod": 3, "tank": 1 }`. Keys are either component
ids (`sword`, `rod`, `bow`, ...) or groups defined in `items.json` (`tank` = vest/belt/cloak,
`damage`, `mana`). Your selected components greedily fill those slots; matched champions
(`earlyChampions` > `itemHolders` > `roster`) add bonuses, unused components add a small
penalty. Champion picks count **copies**: each copy scales that champion's bonus
(×1.25 at 3 copies — a 2-star — up to ×1.5 at 6+), so a stack of one unit reads as a
reroll signal. Picked **augments** add a bonus to comps sharing their trait
(+0.25 each, capped at +0.5). **Completed items** lock their recipe components —
locked components no longer fill other comps' needs — and comps whose carries want
that exact item get +0.2 (capped at +0.4). See `src/engine/recommend.ts`.

## Updating content

**Patch update:** edit `data/sets/set18/comps.json` — adjust tiers, item needs, carries.
Read a couple of meta sources and write entries in your own words.

**New season (e.g. Set 19):**

1. Create `data/sets/set19/meta.json` and `data/sets/set19/comps.json` in the same shape
2. Flip `data/config.json` to `"set19"`

No code changes needed — the loader picks up the new folder automatically.

**Item icons** live in `public/items/` and are referenced by filename from the
`itemIcons` map in `data/items.json`. Source: CommunityDragon
(`https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/items/hexcore/`,
request `.png` instead of `.tex`).

## Legal

Golden Spatula is fan-made content. It isn't endorsed by Riot Games and doesn't reflect the
views or opinions of Riot Games or anyone officially involved in producing or managing
Teamfight Tactics. Teamfight Tactics ™ © Riot Games, Inc.
