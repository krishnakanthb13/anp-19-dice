# Amplenote Dice Roller & Randomizer

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Production-green.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)

> **Note:** This is the production-ready, security-audited version of the Dice Roller plugin for Amplenote. It has been enhanced with user feedback, additional features, and comprehensive security testing.

---

## 🚀 Overview

This Amplenote plugin provides a comprehensive suite of dice rolling and randomization tools for:
- 🎉 **General Gaming:** Roll any combination of standard dice with advanced modifiers
- 🧙 **Tabletop RPGs:** Support for Fudge/Fate and Fantasy AGE systems
- 🔮 **Divination:** 8-Ball and Sai Baba fortune-telling utilities
- 🎲 **Specialized Dice:** Sicherman, Intransitive, and Poker Dice implementations
- 📝 **Data Management:** Random table selection and note-taking capabilities

All operations include detailed audit logging and optional navigation to selected notes.

---

## ✨ Features

### 🎛️ Dice Rolling Features
- **Standard Dice:** Roll any number of dice with custom faces (d4, d6, d8, d10, d12, d20, d100)
- **Advanced Modifiers:**
  - Keep highest/lowest N dice
  - Drop highest/lowest N dice
  - Exploding dice with custom explode targets
  - Min/max value constraints
  - Unique values (no duplicates)
- **Custom Formulas:** Parse and evaluate complex expressions with `+`, `-`, `*`, `/`, `^`, and parentheses

### 🎲 Specialized Dice Systems
- **Sicherman Dice:** Non-standard dice with the same distribution as 2d6
- **Intransitive Dice:** Acyclic dice that beat each other in cycles (A>B, B>C, C>A)
- **Poker Dice:** Custom dice for playing poker with card-based results

### 🔮 Divination Tools
- **Magic 8-Ball:** Classic fortune-telling with 20 predetermined answers
- **Ask Sai Baba:** Spiritual guidance system with 720 pre-written answers

### 🎭 RPG Support
- **Fudge/Fate:** Roll Fudge dice with `+`, `-`, and blank results
- **Fantasy AGE Stunt:** Stunt dice system with automatic doubles detection

### 📝 Table Randomizer
- **Multi-Table Support:** Randomly select values from any number of tables in a note
- **Column-Based Selection:** Picks one random value from each column per selection
- **Header Support:** Automatic skipping of header rows
- **Multiple Selections:** Generate multiple random combinations at once

### 💾 Audit & Notes
- **Automatic Audit Logging:** All results are saved to a central audit note
- **Note Lookup:** Find notes by name, tags, or UUID
- **Navigation:** Option to navigate to looked-up notes or stay on audit note
- **Persistent Storage:** All settings and preferences are saved for future use

---

## ⚙️ Installation & Setup

### Prerequisites
- Amplenote account with plugin support
- Sufficient permissions to create and modify notes

### Installation
1. Download the plugin ZIP file from the [Releases](link-to-releases) section
2. In Amplenote, go to **Settings → Plugins**
3. Click **Upload plugin** and select the ZIP file
4. Enable the plugin and configure settings if needed

### Initial Configuration
On first use, the plugin will automatically:
1. Create the **Dice Results Audit** note for logging
2. Create the **Dice Settings** note for preferences
3. Create the **Ask Sai Baba** note with all 720 answers
4. Create **Intransitive Dice** and **Sicherman Dice** notes

---

## 📋 Parameters & Usage

### Common Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `numDice` | Number | 1 | Number of dice to roll |
| `faces` | Number | 6 | Number of faces per die |
| `min` | Number/null | null | Minimum value limit |
| `max` | Number/null | null | Maximum value limit |
| `sortOption` | Select | 1 (None) | Sort output: None, Ascending, Descending |
| `unique` | Boolean | false | Ensure unique values only |
| `navigateToNote` | Boolean | false | Navigate after roll |

### Dice Rolling Quick Guide

**Roll 3d6:**
```javascript
constdiceRoll = [
  { command: "dice-roller", parameters: { numDice: 3, faces: 6 } }
];
```

**Roll 4d10 with exploding 10s:**
```javascript
constdiceRoll = [
  { command: "dice-roller", parameters: { numDice: 4, faces: 10, explode: true, explodeTarget: 10 } }
];
```

**Roll 5d20 and keep highest 3:**
```javascript
constdiceRoll = [
  { command: "dice-roller", parameters: { numDice: 5, faces: 20, keepHighest: true, keepCount: 3 } }
];
```

### Advanced Formula Examples

**Sum 2d6 then add 5:**
```javascript
constdiceRoll = [
  { command: "dice-roller", parameters: { customFormula: "2d6 + 5" } }
];
```

**Double the result of 3d4:**
```javascript
constdiceRoll = [
  { command: "dice-roller", parameters: { customFormula: "(3d4) * 2" } }
];
```

### Table Randomizer Usage

**Randomize from all tables:**
```javascript
constdiceRoll = [
  { command: "table-randomizer", parameters: { "nthTable": "All" } }
];
```

**Randomize 3 combinations from the 2nd table:**
```javascript
constdiceRoll = [
  { command: "table-randomizer", parameters: { "nthTable": "2", "numberCombo": 3, "hasHeader": true } }
];
```

### Special Dice Examples

**Sicherman Dice:**
```javascript
constdiceRoll = [
  { command: "dice-roller", parameters: { "numDice": 2, "faces": 0 } }  // faces=0 triggers Sicherman
];
```

**Poker Dice:**
```javascript
constdiceRoll = [
  { command: "dice-roller", parameters: { "numDice": 5, "faces": 101 } }  // faces=101 triggers Poker
];
```

---

## 🔐 Security Audit

This plugin has undergone a comprehensive security audit with the following results:

### ✅ Hardcoded Secrets
- **Status:** Passed
- **Findings:** No API keys, tokens, or other hardcoded secrets were detected in the source code

### ✅ Dangerous Patterns
- **Status:** Passed
- **Findings:** The code was scanned for unsafe JavaScript patterns (`eval`, `innerHTML`, `document.write`) and none were found. All string interpolation is handled safely.

### ✅ Input Sanitization
- **Status:** Passed
- **Findings:** The plugin acts solely on static dice roll settings and mathematical random number generation. User input is properly sanitized.

### ✅ Dependency Audit
- **Status:** Production Ready
- **Findings:** Development dependencies have known vulnerabilities but do not affect the final bundled code that runs in the Amplenote runtime.

---

## 🐛 Troubleshooting

### Common Issues

**"Failed to parse dice expression"**
- Check your formula syntax for typos
- Ensure parentheses are balanced
- Make sure dice notation is correct (e.g., `3d6`, not `3d 6`)

**"Note not found"**
- Verify the note exists in Amplenote
- Check that the note name is spelled correctly
- Ensure the audit note hasn't been moved or deleted

**Table randomizer not working**
- Check your table formatting in the note
- Ensure
