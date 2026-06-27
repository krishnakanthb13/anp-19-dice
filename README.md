# Dice Roller and Randomizer Plugin

Run general dice rolls, advanced dice formulas, RPG-specific dice systems, divination-style randomizers, and table-based random selections from inside Amplenote.

Suggested icon: `casino`

## Installation

1. Create a new note in Amplenote named `Dice Roller and Randomizer Plugin`.
2. At the very top of the note, create this metadata table:

| Field | Value |
| :--- | :--- |
| `name` | Dice Roller and Randomizer |
| `description` | Roll dice, evaluate dice formulas, randomize note tables, and save results to an audit note. |
| `icon` | casino |
| `settings` | |
| `Previous_Roll` | |
| `Previous_Roll_Spc` | |
| `Previous_Roll_FF` | |
| `Previous_Roll_AGE` | |
| `Previous_Roll_Ran` | |
| `Dice_Audit_UUID [Do not Edit!]` | |

3. Below the table, create a single JavaScript code block:

```markdown
```javascript
Paste the compiled plugin code here.
```
```

4. Copy the contents of `build/dice.compiled.js` and paste it inside that JavaScript code block.
5. Go to **Account Settings** -> **Plugins**, then select the plugin note you created.

## Settings Table

The plugin stores recent prompt choices and the audit note UUID in Amplenote settings. Leave these blank during first installation unless you are intentionally migrating an existing setup.

| Setting | Purpose |
| :--- | :--- |
| `Previous_Roll` | Remembers the last Basic dice-roll prompt values. |
| `Previous_Roll_Spc` | Remembers the last Specialized dice prompt values. |
| `Previous_Roll_FF` | Remembers the last Fudge/Fate dice count. |
| `Previous_Roll_AGE` | Remembers the last Fantasy AGE multi-roll player and character counts. |
| `Previous_Roll_Ran` | Remembers the last Table Randomizer count. |
| `Dice_Audit_UUID [Do not Edit!]` | Stores the UUID of the generated `Dice Results Audit` note. |

## Usage

After activation, the plugin adds app-level commands and one note-level command.

| Command | Location | What it does |
| :--- | :--- | :--- |
| `Basic` | App option | Rolls a configurable number of dice with custom faces, min/max limits, keep/drop highest, exploding dice, sorting, uniqueness, and optional note lookup. |
| `Advanced` | App option | Evaluates one or more dice expressions such as `3d4 + 3` or `1d12 + 1d10 + 5`. |
| `Specialized` | App option | Simulates Sicherman dice, intransitive dice, or poker dice, with optional probability output. |
| `8 Ball` | App option | Answers a yes/no-style question with a classic Magic 8-Ball response. |
| `Ask Sai Baba` | App option | Returns one of 720 guidance responses by chosen number or random selection. |
| `Fudge/Fate` | App option | Rolls Fudge/Fate dice using `+`, blank, and `-` faces and totals the result. |
| `Fantasy AGE Stunt - Single Roll` | App option | Rolls one Fantasy AGE stunt check and reports doubles and stunt points. |
| `Fantasy AGE Stunt - Roll All At Once` | App option | Rolls Fantasy AGE stunt checks for multiple players and characters in one run. |
| `View Roll History` | App option | Navigates directly to the `Dice Results Audit` note. |
| `Clear Audit History` | App option | Clears the content of the `Dice Results Audit` note after confirmation. |
| `Table - Randomizer` | Note option | Reads markdown tables from the current note and generates random row/column combinations. |

Most commands write a detailed line into the `Dice Results Audit` note. If that note does not exist yet, the plugin creates it and stores the UUID in `Dice_Audit_UUID [Do not Edit!]`.

## Basic Dice Notes

The `Basic` command supports common tabletop modifiers:

| Option | Meaning |
| :--- | :--- |
| Number of Dice | How many dice to roll. |
| Number of Faces | How many sides each die has. |
| Minimum / Maximum | Clamp each die result to a lower or upper value. |
| Keep Highest | Keep only the highest N rolls. |
| Drop Highest | Drop the highest N rolls. |
| Explode | Roll an additional die whenever the target value appears. |
| Sort | Leave rolls unsorted, sort ascending, or sort descending. |
| Unique | Remove duplicate rolled values. |
| Look Up in your Notes | Use the roll total as an index into sorted notes and optionally navigate there. |

## Table Randomizer Notes

Run `Table - Randomizer` from a note that contains one or more markdown tables. The command detects tables, asks whether to randomize one table or all tables, and chooses random values column-by-column. It can skip table headers when the selected table has headers.

## Technical Details

The source entry point is `dice.js`, which registers the app and note commands. Individual command implementations live in `lib/`:

| File | Responsibility |
| :--- | :--- |
| `lib/basic.js` | Basic dice roller, note lookup sorting, and audit logging. |
| `lib/advanced.js` | Dice-expression parser and advanced formula runner. |
| `lib/specialized.js` | Sicherman, intransitive, and poker dice simulations. |
| `lib/8_ball.js` | Magic 8-Ball prompt and answer selection. |
| `lib/ask_sai_baba.js` | Sai Baba answer lookup and audit logging. |
| `lib/fudge_fate.js` | Fudge/Fate dice rolling. |
| `lib/fantasy_age_stunt_single_roll.js` | Single Fantasy AGE stunt roll. |
| `lib/fantasy_age_stunt_roll_all_at_once.js` | Batch Fantasy AGE stunt rolls. |
| `lib/table_randomizer.js` | Markdown table extraction and random combination generation. |
| `lib/history.js` | Navigation and clearing actions for roll history logs. |
| `lib/utils.js` | Shared dice, note lookup, and audit helpers. |


The distributable artifact is `build/dice.compiled.js`. Rebuild it with the repository's esbuild workflow after changing source files, then paste the compiled artifact into the Amplenote plugin note.
