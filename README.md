# 🎲 Dice Roller and Randomizer

> **A comprehensive plugin for Amplenote to run general dice rolls, advanced mathematical formulas, RPG-specific systems, divination-style randomizers, and table-based selections.**

---

## ✨ Features

- **Basic & Advanced Rolls**: Standard dice with modifiers (keep, drop, explode, unique) and complex mathematical expressions (`3d4 + 2d6 * 5`).
- **RPG Systems built-in**: First-class support for *Fudge/Fate* dice and *Fantasy AGE* stunt rolls.
- **Table Randomizer**: Pick random row/column combinations directly from your Amplenote markdown tables.
- **Divination & Oracles**: Includes classic *Magic 8-Ball*, *Ask Sai Baba*, and specialized dice (Poker, Sicherman, Intransitive).
- **Persistent History**: Automatically logs every roll into a centralized `Dice Results Audit` note so you never lose track of your campaign results.

---

## 🛠️ Installation

1. Create a new note in Amplenote and title it **`Dice Roller and Randomizer Plugin`**.
2. Add the following Settings table to the note:

| Field | Value |
| :--- | :--- |
|name|Dice - Testing|
|icon|casino|
|description<!-- {"cell":{"colwidth":108}} -->|Simple, Advanced, Specialized Dice Randomizer.<br />Open Random Notes to review or revisit based on different Note Properties (In Basic Option).<br />Randomize any Table in Amplenote.<br />Have some of your favorite games rolled here at Amplenote.|
|instructions<!-- {"cell":{"colwidth":108}} -->|- Run the Dice: Basicfrom App Options by ctrl / cmd + o.<br />- At first, it give you blank boxes to fill up. (Next time it remember your previous inputs).<br />- You can play around with the options listed to get an extensive range of a result.<br />- Using, Look Up in your Notes option, you can select any available dropdowns for the Plugin to take you to the random note.<br />- Audit page has all the Dice rolls and other details depending on your selection.<br />Note: More options are on its way. Comment in the Installation page for any feedback or suggestion.<br />- New features added (All features) - December 29th, 2024<br />     - (note-Option) Table - Randomizer.<br />     - (app-Option) Basic, Advanced, Specialized, 8 Ball, Ask Sai Baba, Fudge/Fate, Fantasy AGE Stunt - (Single Roll, Roll All At Once)..|
|setting|Previous_Roll|
|setting|Previous_Roll_ADV1 (Not in use)|
|setting|Previous_Roll_ADV2 (Not in use)|
|setting|Previous_Roll_Spc|
|setting|Previous_Roll_FF|
|setting|Previous_Roll_AGE|
|setting|Previous_Roll_Ran|
|setting|Dice_Audit_UUID \[Do not Edit!\]|


*(Note: Leave the setting values blank during first installation. The plugin will manage them automatically.)*

3. Below the table, insert a **JavaScript code block** and paste the compiled plugin code from `build/dice.compiled.js` into it.
4. Go to **Account Settings > Plugins** in Amplenote and select your newly created plugin note to activate it.

---

## 🚀 Usage Guide

Once activated, the plugin registers several app-level commands and one note-level command:

### 🎲 General Dice
- **`Basic`**: Rolls standard dice with configurable modifiers (faces, min/max limits, keep/drop, exploding, unique).
- **`Advanced`**: Evaluates mathematical dice expressions (e.g., `3d4 + 3` or `1d12 + 1d10 + 5`).

### ⚔️ Game Systems
- **`Fudge/Fate`**: Rolls standard Fate dice (`+`, ` `, `-`) and calculates the total.
- **`Fantasy AGE Stunt - Single Roll`**: Rolls a stunt check, detecting doubles and stunt points.
- **`Fantasy AGE Stunt - Roll All At Once`**: Run stunt checks for an entire party in one go.

### 🔮 Oracles & Randomizers
- **`Specialized`**: Simulates Sicherman, Intransitive, or Poker dice with optional probability outputs.
- **`8 Ball`**: Answers your yes/no questions with classic Magic 8-Ball responses.
- **`Ask Sai Baba`**: Pulls one of 720 spiritual guidance responses.
- **`Table - Randomizer`** *(Note Action)*: Run this from inside a note to detect tables and randomize selections directly from their rows and columns.

### 📜 History & Management
- **`View Roll History`**: Jump instantly to your `Dice Results Audit` note.
- **`Clear Audit History`**: Erase your roll history (requires confirmation).

---

## 💻 Technical & Development

The source code is modularly structured inside the `lib/` directory and bundled for Amplenote execution using `esbuild`. 

- **Entry Point:** `dice.js`
- **Build Process:** Run the repository's build pipeline to compile source files into `build/dice.compiled.js`.
- For deeper technical context, see [CODE_DOCUMENTATION.md](CODE_DOCUMENTATION.md) and [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md).
