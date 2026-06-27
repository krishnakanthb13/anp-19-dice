I'll thoroughly review your code and document what each part does, including parameters, logic, and functionality.

## Complete Code Documentation

---

### 1. BASIC DICE ROLLER

**Purpose:** Standard dice rolling with various modifiers and optional note lookup.

#### **Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `numDice` | Number | 1 | Number of dice to roll |
| `faces` | Number | 6 | Number of faces per die |
| `min` | Number/null | null | Minimum value limit for each die |
| `max` | Number/null | null | Maximum value limit for each die |
| `keepHighest` | Boolean | false | Keep highest rolls and drop others |
| `keepCount` | Number | 0 | Number of highest rolls to keep |
| `dropHighest` | Boolean | false | Drop highest rolls and keep others |
| `dropCount` | Number | 0 | Number of highest rolls to drop |
| `explode` | Boolean | false | Explode dice on certain values |
| `explodeTarget` | Number | 6 | Value that triggers explosion |
| `sortOption` | Select | 1 (None) | Sort output: 1=None, 2=Ascending, 3=Descending |
| `unique` | Boolean | false | Ensure all dice values are unique |
| `navigateToNote` | Boolean | false | Navigate to looked-up note |
| `lookUp` | Select | 5 (None) | Note sorting method for lookup |

#### **Logic Flow:**

1. **Load Previous Settings** - Retrieves saved values from `Previous_Roll` setting
2. **Display Prompt** - Shows dialog with pre-filled or default values
3. **Roll Dice** - Executes `rollDice()` function with the following steps:
   - Generate random numbers for each die
   - Apply min/max limits
   - Handle explosions (reroll when target is hit)
   - Remove duplicates if `unique` is true
   - Sort results if requested
   - Apply keep/drop operations
4. **Note Lookup** - If `lookUp` is not "None":
   - Fetch all notes
   - Sort by selected method (Name, Created, Modified, UUID, Tags, Random)
   - Select note based on `pickNote` (dice total modulo note count)
5. **Audit Logging** - Save results to audit note
6. **Navigation** - Navigate based on `navigateToNote` flag

---

### 2. ADVANCED DICE PARSER

**Purpose:** Parse and evaluate complex dice expressions with mathematical operations.

#### **Supported Syntax:**
- Basic: `1d6`, `3d4`
- Addition: `1d6 + 3`
- Subtraction: `3d4 - 2`
- Multiplication: `1d12 * 2`
- Division: `3d4 / 2`
- Exponents: `2^3`
- Parentheses: `(1d6 + 3) * 2`
- Combined: `3d4 + 1d10 + 5`

#### **Parser Logic:**

| Method | Purpose |
|--------|---------|
| `rollDie(sides)` | Roll a single die with given sides |
| `rollDice(count, sides)` | Roll multiple dice and sum results |
| `parseNumber()` | Parse a number or dice notation (e.g., `3d4`) |
| `parseParentheses()` | Handle expressions in parentheses |
| `parseExponent()` | Handle `^` operator |
| `parseMultiplyDivide()` | Handle `*` and `/` operators |
| `parseExpression()` | Handle `+` and `-` operators |
| `parse(input)` | Main entry point |

#### **Evaluation Order:**
1. Parentheses (highest priority)
2. Exponents (`^`)
3. Multiplication/Division (`*`, `/`)
4. Addition/Subtraction (`+`, `-`) (lowest priority)

---

### 3. SPECIALIZED DICE

**Purpose:** Specialized dice systems with unique configurations.

#### **Dice Types:**

| Type | Description | Faces |
|------|-------------|-------|
| **Sicherman** | Non-standard dice with same distribution as 2d6 | Die1: [1,3,4,5,6,8], Die2: [1,2,2,3,3,4] |
| **Intransitive** | Dice that beat each other in cycles | A: [2,2,4,4,9,9], B: [1,1,6,6,8,8], C: [3,3,5,5,7,7] |
| **Poker Dice** | Dice with card values for poker hands | Standard: [A,K,Q,J,10,9], Numeric: [1-6], Crown: [Crown,Queen,Jack,Ten,Nine,Eight] |

#### **Features:**

**Sicherman Dice:**
- Rolls pair of Sicherman dice
- Calculates sum probabilities
- Shows each die result and total

**Intransitive Dice:**
- Rolls all three intransitive dice
- Calculates win probabilities (A vs B, B vs C, C vs A)
- Each pair has ~55.56% win rate

**Poker Dice:**
- Rolls 5 poker dice
- Analyzes hand type (Five of a kind, Full house, etc.)
- Shows theoretical probabilities
- Supports three variations

---

### 4. 8-BALL

**Purpose:** Classic Magic 8-Ball fortune telling.

#### **Logic:**
1. User asks a yes/no question
2. Randomly selects one of 20 predetermined answers
3. Logs question and answer to audit note
4. Navigates to audit note

#### **Answer Categories:**
- **Positive:** "It is certain.", "Yes - definitely."
- **Neutral:** "Reply hazy, try again."
- **Negative:** "Don't count on it.", "Very doubtful."

---

### 5. ASK SAI BABA

**Purpose:** Spiritual guidance system with 720 pre-written answers.

#### **Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `question` | Text | User's question (optional) |
| `number` | String (1-720) | User's chosen number |
| `random` | Boolean | Generate random number if true |

#### **Logic:**
1. If `random` is true → Select random answer
2. If `number` is provided → Return answer at that index
3. If `number` is invalid → Show error
4. Logs question and answer to audit note

---

### 6. FUDGE/FATE

**Purpose:** Roll Fudge/Fate dice system.

#### **Dice Symbols:**
| Roll Result | Symbol | Value |
|-------------|--------|-------|
| 1-2 | `-` | -1 |
| 3-4 | ` ` | 0 |
| 5-6 | `+` | +1 |

#### **Logic:**
1. Rolls specified number of dice (default 4)
2. Maps each roll to symbol and value
3. Calculates total
4. Logs results to audit note

---

### 7. FANTASY AGE STUNT

**Purpose:** Fantasy AGE RPG stunt system.

#### **Single Roll Mode:**
- Rolls 3d6
- Checks for doubles (stunt trigger)
- Stunt points = value on stunt die
- Shows result via popup

#### **Roll All At Once Mode:**
- Rolls for multiple players and characters
- Each character gets their own roll
- Logs all results to audit note

#### **Stunt Logic:**
```javascript
hasStunt = new Set(dice).size < 3  // Any doubles?
stuntPoints = hasStunt ? dice[0] : 0  // Stunt die value
```

---

### 8. TABLE RANDOMIZER

**Purpose:** Randomly select values from Markdown tables.

#### **Table Format:**
```markdown
| | | |
|-|-|-|
|Header|One|Two|
|1|2|3|
|4|5|6|
|7|8|9|
```

#### **Parameters:**
| Parameter | Description |
|-----------|-------------|
| `nthTable` | Which table to randomize (or All) |
| `numberCombo` | Number of random combinations to generate |
| `hasHeader` | Whether table has header row to skip |

#### **Logic:**
1. **Parse Tables** - Identifies all tables in the note
2. **Process Tables** - Removes empty rows/columns
3. **Column-Based Selection**:
   - For each column, collects all values
   - Randomly selects one value from each column
   - Creates combination of values
4. **Multiple Combinations** - Generates specified number of combinations
5. **Format Output** - Presents results as Markdown tables

#### **Header Handling:**
- `hasHeader = true`: Skips 3 rows (empty header, separator, actual header)
- `hasHeader = false`: Skips 2 rows (empty header, separator)

---

## Shared Features

### Audit System
- **Note Name:** "Dice Results Audit"
- **Tags:** ["-reports/-dice"]
- **UUID:** Stored in `Dice_Audit_UUID [Do not Edit!]`
- **Format:** Markdown with timestamps

### Timestamp Format
```javascript
YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "")  // e.g., 260627
HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "")   // e.g., 143052
```

### Common Utilities
- `app.settings[]` - Persistent storage
- `app.prompt()` - User input dialog
- `app.createNote()` - Create new notes
- `app.insertNoteContent()` - Append to notes
- `app.navigate()` - Navigate to URLs

---

## Summary Table

| Module | Inputs | Outputs | Special Features |
|--------|--------|---------|------------------|
| Basic | 14 parameters | Dice rolls + Optional note | Note lookup, Audit, Navigation toggle |
| Advanced | 1-2 formulas | Evaluated expressions | Full math parser, Dice notation |
| Specialized | Dice type, Variation | Specialized rolls | Sicherman, Intransitive, Poker |
| 8 Ball | Question | Random answer | 20 answers, Random selection |
| Sai Baba | Question/Number | Guidance answer | 720 answers, Spiritual guidance |
| Fudge/Fate | Number of dice | Symbol results | -1/0/+1 values |
| AGE Stunt | Player/Character counts | Stunt results | Doubles detection, Stunt points |
| Table Randomizer | Table selection | Random combinations | Multiple tables, Column-based |