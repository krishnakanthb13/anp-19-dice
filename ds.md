Absolutely possible! Here are some exciting additions you could integrate into this plugin:

## **New Dice/Randomizer Options**

### **1. Dice Systems**
- **Savage Worlds (Exploding + Wild Die)** - `d6 + d6` with exploding on max, plus a Wild Die
- **Shadowrun/World of Darkness** - Dice pool where you count hits (dice ≥ target number)
- **Cortex System** - Roll different sized dice, keep highest 2-3
- **Genesys/Star Wars Narrative Dice** - Custom symbols (Success, Advantage, Triumph, etc.)
- **Percentile/D100 System** - Two d10s for 1-100 rolls with flip-to-succeed mechanic
- **Dice with Custom Faces** - Let users define their own dice faces
- **Fudge/Fate with Ladder** - Map totals to adjectives (Terrible → Legendary)

### **2. Random Generators**
- **Name Generator** - Pull from configured tables to create character/business names
- **Tarot Card Draw** - 78-card deck with Major/Minor Arcana meanings
- **I-Ching** - Coin toss method with hexagram lookup
- **Random Encounter Builder** - Combine table rolls for RPG encounters
- **Loot Generator** - Random treasure/reward tables
- **Random Map Generator** - Simple room/corridor layouts
- **Passphrase Generator** - Diceware-style word combinations

### **3. Decision Tools**
- **Decision Matrix** - Weighted criteria scoring with:
  - Custom criteria columns
  - Weight assignments
  - Options ranking
- **Pros/Cons Randomizer** - Weight random selection based on pros vs cons count
- **Priority Matrix** - Eisenhower-style (Urgent/Important) with randomization
- **Coin Flip with Bias** - Adjustable probability coin
- **Weighted Random Selector** - Custom items with assigned weights
- **Random Scheduler** - Pick random tasks from tagged notes
- **Group Randomizer** - Random team/group assignments

### **4. Enhanced Table Features**
- **Nested Tables** - Randomize from multiple related tables with cascading results
- **Conditional Tables** - If/Then logic (if roll X, use table Y)
- **Table Macros** - Save/load custom table configurations
- **Weighted Table Selection** - Rows with probability weights
- **Table History** - Track previous selections, avoid repeats
- **Linked Table Results** - Combine multiple table outputs into one narrative

### **5. RPG-Specific**
- **D&D Ability Score Generator** - 4d6 drop lowest, point buy, standard array
- **D&D 5E Random Encounter** - By CR/level/environment
- **Random Character Traits** - Personality, background, flaws
- **Wild Magic Surge** - Random effect tables
- **Critical Hit/Fumble Tables** - Detailed combat outcomes
- **Dungeon Room Generator** - Purpose, contents, features

### **6. Utility Options**
- **Quick Roll Presets** - Save favorite dice configurations
- **Dice Calculator** - Evaluate complex dice math with statistics
- **Probability Calculator** - Show odds for any dice combination
- **Roll Comparison** - Compare two dice systems side-by-side
- **Batch Results Export** - Export roll history as CSV
- **Dice Animation/Theme** - Visual dice with sound effects

## **Implementation Priority Suggestions:**

**Quick Wins (1-2 hours each):**
- Weighted Random Selector
- Coin Flip with Bias
- Quick Roll Presets
- D&D Ability Score Generator
- Priority Matrix

**Medium Effort (3-6 hours):**
- Shadowrun-style Dice Pool
- Decision Matrix
- Name Generator
- Nested/Weighted Tables
- Percentile System

**Complex (1+ days):**
- Narrative Dice System
- Conditional Tables
- Random Scheduler
- Group Randomizer
- Probability Calculator

Would you like me to provide implementation code for any of these specific features? I can show you how to integrate them into your existing plugin structure.

---

Here's a comprehensive implementation guide with code for the most valuable additions. I'll provide several modules you can add to your plugin:

## **1. WEIGHTED RANDOM SELECTOR**
Create a new file: `anp-19-dice/lib/weighted_random.js`

```javascript
// anp-19-dice/lib/weighted_random.js
async function weighted_random_default(app) {
  const existingSetting = await app.settings["Previous_Weighted"];
  
  let result;
  if (existingSetting) {
    const [items, weights] = existingSetting.split("||");
    result = await app.prompt("Weighted Random Selector", {
      inputs: [
        { 
          label: "Items (comma-separated)", 
          type: "text", 
          value: items,
          placeholder: "e.g., Sword, Shield, Potion, Gold, Magic Ring"
        },
        { 
          label: "Weights (comma-separated, corresponding to items)", 
          type: "text", 
          value: weights,
          placeholder: "e.g., 10, 20, 30, 25, 15"
        }
      ]
    });
  } else {
    result = await app.prompt("Weighted Random Selector", {
      inputs: [
        { 
          label: "Items (comma-separated)", 
          type: "text",
          placeholder: "e.g., Sword, Shield, Potion, Gold, Magic Ring"
        },
        { 
          label: "Weights (comma-separated, corresponding to items)", 
          type: "text",
          placeholder: "e.g., 10, 20, 30, 25, 15"
        }
      ]
    });
  }
  
  if (result) {
    const [itemsStr, weightsStr] = result;
    const items = itemsStr.split(",").map(i => i.trim()).filter(i => i);
    const weights = weightsStr.split(",").map(w => parseFloat(w.trim())).filter(w => !isNaN(w) && w > 0);
    
    if (items.length === 0 || weights.length === 0) {
      app.alert("Please provide both items and weights.");
      return;
    }
    
    if (items.length !== weights.length) {
      app.alert("Number of items must match number of weights.");
      return;
    }
    
    // Save settings
    await app.setSetting("Previous_Weighted", `${itemsStr}||${weightsStr}`);
    
    function weightedRandom(items, weights) {
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      let random = Math.random() * totalWeight;
      
      for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          return items[i];
        }
      }
      return items[items.length - 1]; // Fallback
    }
    
    const selected = weightedRandom(items, weights);
    
    // Calculate probabilities for reporting
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const probabilities = items.map((item, i) => ({
      item,
      weight: weights[i],
      probability: ((weights[i] / totalWeight) * 100).toFixed(1)
    }));
    
    let finalResult = `<mark>**Weighted Random Selection**</mark>\n`;
    finalResult += `**Selected:** ${selected}\n\n`;
    finalResult += `**Probabilities:**\n`;
    probabilities.forEach(p => {
      finalResult += `- ${p.item}: ${p.probability}% (weight: ${p.weight})\n`;
    });
    
    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);
    
    (async () => {
      try {
        const auditReport = `- <mark>Weighted Random:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Selected:** ${selected}</mark> | Items: ${items.join(", ")} | Weights: ${weights.join(", ")}`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
```

## **2. DICE POOL SYSTEM (Shadowrun/World of Darkness Style)**
Create: `anp-19-dice/lib/dice_pool.js`

```javascript
// anp-19-dice/lib/dice_pool.js
async function dice_pool_default(app) {
  const existingSetting = await app.settings["Previous_DicePool"];
  
  let parsedDefaults = { poolSize: 5, targetNumber: 5, explode: false, countType: "hits" };
  if (existingSetting) {
    try {
      const parts = existingSetting.split(",");
      parsedDefaults.poolSize = parseInt(parts[0]) || 5;
      parsedDefaults.targetNumber = parseInt(parts[1]) || 5;
      parsedDefaults.explode = parts[2] === "true";
      parsedDefaults.countType = parts[3] || "hits";
    } catch(e) {}
  }
  
  const result = await app.prompt("Dice Pool Roller", {
    inputs: [
      { 
        label: "Number of Dice in Pool", 
        type: "string", 
        value: parsedDefaults.poolSize.toString() 
      },
      { 
        label: "Target Number (TN) for Success", 
        type: "string", 
        value: parsedDefaults.targetNumber.toString() 
      },
      { 
        label: "Exploding 6s (re-roll on 6)", 
        type: "checkbox", 
        value: parsedDefaults.explode 
      },
      { 
        label: "Count Method", 
        type: "select", 
        options: [
          { label: "Count Hits (dice ≥ TN)", value: "hits" },
          { label: "Sum All Dice", value: "sum" },
          { label: "Count Successes (TN as difficulty)", value: "successes" }
        ], 
        value: parsedDefaults.countType 
      }
    ]
  });
  
  if (result) {
    const [poolSizeStr, targetNumberStr, explode, countType] = result;
    const poolSize = parseInt(poolSizeStr) || 5;
    const targetNumber = parseInt(targetNumberStr) || 5;
    
    await app.setSetting("Previous_DicePool", `${poolSize},${targetNumber},${explode},${countType}`);
    
    function rollPool(size, tn, exploding = false) {
      let rolls = [];
      let successes = 0;
      let ones = 0;
      
      for (let i = 0; i < size; i++) {
        let roll = Math.floor(Math.random() * 6) + 1;
        rolls.push(roll);
        
        if (roll === 1) ones++;
        if (roll >= tn) successes++;
        
        // Handle exploding 6s
        while (exploding && roll === 6) {
          roll = Math.floor(Math.random() * 6) + 1;
          rolls.push(roll);
          if (roll >= tn) successes++;
          if (roll === 1) ones++;
        }
      }
      
      return { rolls, successes, ones };
    }
    
    const result2 = rollPool(poolSize, targetNumber, explode);
    
    let finalResult = `<mark>**Dice Pool Results**</mark>\n`;
    finalResult += `**Pool Size:** ${poolSize}d6\n`;
    finalResult += `**Target Number:** ${targetNumber}+\n`;
    finalResult += `**Dice Rolled:** [${result2.rolls.join(", ")}]\n`;
    finalResult += `**Successes (≥${targetNumber}):** ${result2.successes}\n`;
    finalResult += `**Ones (1s):** ${result2.ones}\n`;
    finalResult += `**Net Successes:** ${result2.successes - result2.ones}\n\n`;
    
    // Display dice with visual indicators
    finalResult += `**Roll Details:**\n`;
    for (let i = 0; i < Math.min(result2.rolls.length, poolSize); i++) {
      const roll = result2.rolls[i];
      let indicator = roll >= targetNumber ? "✓" : (roll === 1 ? "✗" : "-");
      finalResult += `Die ${i+1}: ${roll} ${indicator}\n`;
    }
    
    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);
    
    (async () => {
      try {
        const auditReport = `- <mark>Dice Pool:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; Pool: ${poolSize}d6, TN: ${targetNumber}, Explode: ${explode} | <mark>**Successes:** ${result2.successes}, **Net:** ${result2.successes - result2.ones}</mark> | Rolls: [${result2.rolls.join(", ")}]`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
```

## **3. DECISION MATRIX**
Create: `anp-19-dice/lib/decision_matrix.js`

```javascript
// anp-19-dice/lib/decision_matrix.js
async function decision_matrix_default(app) {
  const result = await app.prompt("Decision Matrix Setup", {
    inputs: [
      { 
        label: "Options (comma-separated)", 
        type: "text",
        placeholder: "e.g., Option A, Option B, Option C"
      },
      { 
        label: "Criteria (comma-separated)", 
        type: "text",
        placeholder: "e.g., Cost, Time, Quality, Risk"
      },
      { 
        label: "Criteria Weights (comma-separated, 1-10)", 
        type: "text",
        placeholder: "e.g., 8, 5, 9, 3"
      }
    ]
  });
  
  if (result) {
    const [optionsStr, criteriaStr, weightsStr] = result;
    const options = optionsStr.split(",").map(o => o.trim()).filter(o => o);
    const criteria = criteriaStr.split(",").map(c => c.trim()).filter(c => c);
    const weights = weightsStr.split(",").map(w => parseFloat(w.trim())).filter(w => !isNaN(w));
    
    if (options.length < 2 || criteria.length < 2) {
      app.alert("Need at least 2 options and 2 criteria.");
      return;
    }
    
    if (criteria.length !== weights.length) {
      app.alert("Number of criteria must match number of weights.");
      return;
    }
    
    // Generate random scores for each option-criteria pair
    const scores = [];
    for (let i = 0; i < options.length; i++) {
      scores[i] = [];
      for (let j = 0; j < criteria.length; j++) {
        // Random score 1-10 with slight bias toward middle values (5-7)
        scores[i][j] = Math.floor(Math.random() * 10) + 1;
      }
    }
    
    // Calculate weighted scores
    const weightedScores = options.map((option, i) => {
      let total = 0;
      criteria.forEach((criterion, j) => {
        total += scores[i][j] * weights[j];
      });
      return { option, total, scores: scores[i] };
    });
    
    // Sort by total score
    weightedScores.sort((a, b) => b.total - a.total);
    
    // Generate report
    let finalResult = `<mark>**Decision Matrix Results**</mark>\n\n`;
    
    // Matrix table
    finalResult += `| Option | ${criteria.join(" | ")} | **Total** |\n`;
    finalResult += `|${"---|".repeat(criteria.length + 2)}\n`;
    
    weightedScores.forEach(item => {
      finalResult += `| ${item.option} | ${item.scores.join(" | ")} | **${item.total}** |\n`;
    });
    
    finalResult += `\n<mark>**Rankings:**</mark>\n`;
    weightedScores.forEach((item, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}.`;
      finalResult += `${medal} **${item.option}** - Score: ${item.total}\n`;
    });
    
    finalResult += `\n**Criteria Weights:** ${criteria.map((c, i) => `${c}: ${weights[i]}`).join(", ")}`;
    
    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);
    
    (async () => {
      try {
        const winner = weightedScores[0];
        const auditReport = `- <mark>Decision Matrix:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Winner:** ${winner.option} (Score: ${winner.total})</mark> | Options: ${options.join(", ")} | Criteria: ${criteria.join(", ")}`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
```

## **4. RANDOM NAME GENERATOR**
Create: `anp-19-dice/lib/name_generator.js`

```javascript
// anp-19-dice/lib/name_generator.js
async function name_generator_default(app) {
  const nameStyles = {
    fantasy: {
      prefixes: ["Al", "An", "Ar", "Bal", "Bel", "Bor", "Bri", "Cor", "Dar", "El", "Eld", "Far", "Gal", "Gil", "Hal", "Is", "Kal", "Kil", "Lan", "Mor", "Nor", "Pal", "Quin", "Ral", "Sam", "Tal", "Thal", "Ul", "Val", "Wil", "Xan", "Yor", "Zan"],
      suffixes: ["dor", "mir", "ion", "gar", "mar", "nar", "rin", "thir", "wen", "wyn", "lor", "din", "dan", "bar", "nor", "lan", "dar", "ran", "reth", "las", "mas", "nir", "ril", "dis", "ric", "mond", "ton", "ley", "burg", "heim"]
    },
    scifi: {
      prefixes: ["Ax", "Cy", "Dex", "Echo", "Flux", "Geo", "Hex", "Ion", "Jax", "Kai", "Lex", "Max", "Nex", "Onyx", "Pax", "Quark", "Rex", "Sol", "Tech", "Ultra", "Vex", "Warp", "Xen", "Yotta", "Zero"],
      suffixes: ["oid", "ite", "ian", "ium", "ax", "ex", "ox", "ux", "on", "ar", "or", "us", "is", "os", "eon", "tron", "wave", "pulse", "beam", "core"]
    },
    norse: {
      prefixes: ["As", "Bjorn", "Egil", "Fen", "Gunn", "Hal", "Ing", "Jar", "Knut", "Leif", "Magn", "Njord", "Odd", "Ragn", "Sig", "Thor", "Ulf", "Val", "Yng", "Odin"],
      suffixes: ["ar", "ir", "ur", "olf", "bjorn", "stein", "vald", "mund", "mar", "rik", "ulf", "vard", "brand", "fast", "grim", "hild", "laug", "leif", "mod", "run"]
    }
  };
  
  const result = await app.prompt("Random Name Generator", {
    inputs: [
      { 
        label: "Name Style", 
        type: "select", 
        options: [
          { label: "Fantasy", value: "fantasy" },
          { label: "Sci-Fi", value: "scifi" },
          { label: "Norse", value: "norse" },
          { label: "Mixed (Random Style)", value: "mixed" }
        ],
        value: "fantasy"
      },
      { 
        label: "Number of Names to Generate", 
        type: "string", 
        value: "5" 
      },
      { 
        label: "Include Titles/Prefixes", 
        type: "checkbox", 
        value: false 
      }
    ]
  });
  
  if (result) {
    const [style, countStr, includeTitles] = result;
    const count = Math.min(parseInt(countStr) || 5, 20); // Limit to 20
    
    const titles = ["Sir", "Lady", "Lord", "Captain", "Commander", "Archmage", "King", "Queen", "Prince", "Princess", "Master", "Doctor", "Professor", "Admiral", "Baron"];
    
    function generateName(styleName) {
      let selectedStyle;
      if (styleName === "mixed") {
        const styles = Object.keys(nameStyles);
        selectedStyle = nameStyles[styles[Math.floor(Math.random() * styles.length)]];
      } else {
        selectedStyle = nameStyles[styleName];
      }
      
      const prefix = selectedStyle.prefixes[Math.floor(Math.random() * selectedStyle.prefixes.length)];
      const suffix = selectedStyle.suffixes[Math.floor(Math.random() * selectedStyle.suffixes.length)];
      const name = prefix + suffix;
      
      if (includeTitles) {
        const title = titles[Math.floor(Math.random() * titles.length)];
        return `${title} ${name}`;
      }
      return name;
    }
    
    let finalResult = `<mark>**Generated Names (${style})**</mark>\n\n`;
    const names = [];
    
    for (let i = 0; i < count; i++) {
      const name = generateName(style);
      names.push(name);
      finalResult += `${i + 1}. ${name}\n`;
    }
    
    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);
    
    (async () => {
      try {
        const auditReport = `- <mark>Name Generator:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; Style: ${style}, Count: ${count} | <mark>**Names:** ${names.join(", ")}</mark>`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
```

## **5. TAROT CARD DRAW**
Create: `anp-19-dice/lib/tarot.js`

```javascript
// anp-19-dice/lib/tarot.js
async function tarot_default(app) {
  const majorArcana = [
    { name: "The Fool", number: 0, meaning: "New beginnings, innocence, spontaneity" },
    { name: "The Magician", number: 1, meaning: "Power, skill, concentration, action" },
    { name: "The High Priestess", number: 2, meaning: "Intuition, mystery, subconscious mind" },
    { name: "The Empress", number: 3, meaning: "Fertility, nature, abundance, sensuality" },
    { name: "The Emperor", number: 4, meaning: "Authority, structure, control, fatherhood" },
    { name: "The Hierophant", number: 5, meaning: "Tradition, conformity, morality, ethics" },
    { name: "The Lovers", number: 6, meaning: "Love, harmony, relationships, values alignment" },
    { name: "The Chariot", number: 7, meaning: "Control, willpower, success, determination" },
    { name: "Strength", number: 8, meaning: "Strength, courage, persuasion, compassion" },
    { name: "The Hermit", number: 9, meaning: "Soul-searching, introspection, being alone" },
    { name: "Wheel of Fortune", number: 10, meaning: "Good luck, karma, life cycles, destiny" },
    { name: "Justice", number: 11, meaning: "Justice, fairness, truth, cause and effect" },
    { name: "The Hanged Man", number: 12, meaning: "Pause, surrender, letting go, new perspectives" },
    { name: "Death", number: 13, meaning: "Endings, change, transformation, transition" },
    { name: "Temperance", number: 14, meaning: "Balance, moderation, patience, purpose" },
    { name: "The Devil", number: 15, meaning: "Shadow self, attachment, addiction, restriction" },
    { name: "The Tower", number: 16, meaning: "Disaster, upheaval, sudden change, revelation" },
    { name: "The Star", number: 17, meaning: "Hope, faith, purpose, renewal, spirituality" },
    { name: "The Moon", number: 18, meaning: "Illusion, fear, anxiety, subconscious, intuition" },
    { name: "The Sun", number: 19, meaning: "Positivity, fun, warmth, success, vitality" },
    { name: "Judgment", number: 20, meaning: "Judgment, rebirth, inner calling, absolution" },
    { name: "The World", number: 21, meaning: "Completion, integration, accomplishment, travel" }
  ];
  
  const result = await app.prompt("Tarot Card Draw", {
    inputs: [
      { 
        label: "Question or Focus (optional)", 
        type: "text",
        placeholder: "What do you seek guidance on?"
      },
      { 
        label: "Spread Type", 
        type: "select", 
        options: [
          { label: "Single Card", value: "single" },
          { label: "Three Card (Past/Present/Future)", value: "three" },
          { label: "Celtic Cross (10 Cards)", value: "celtic" }
        ],
        value: "single"
      },
      { 
        label: "Allow Reversed Cards", 
        type: "checkbox", 
        value: true 
      }
    ]
  });
  
  if (result) {
    const [question, spreadType, allowReversed] = result;
    
    function shuffleDeck() {
      const deck = [...majorArcana];
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      return deck;
    }
    
    function drawCards(count, reversed) {
      const deck = shuffleDeck();
      const drawn = [];
      
      for (let i = 0; i < count; i++) {
        const card = deck[i];
        const isReversed = reversed ? Math.random() < 0.5 : false;
        drawn.push({
          ...card,
          reversed: isReversed,
          fullMeaning: isReversed ? `${card.meaning} (Reversed: opposite or blocked energy)` : card.meaning
        });
      }
      
      return drawn;
    }
    
    const cardCount = spreadType === "single" ? 1 : spreadType === "three" ? 3 : 10;
    const cards = drawCards(cardCount, allowReversed);
    
    let finalResult = `<mark>**Tarot Reading**</mark>\n`;
    if (question) finalResult += `**Question:** ${question}\n\n`;
    
    if (spreadType === "single") {
      const card = cards[0];
      finalResult += `**Card:** ${card.name} ${card.reversed ? "(Reversed)" : ""}\n`;
      finalResult += `**Meaning:** ${card.fullMeaning}\n`;
    } else if (spreadType === "three") {
      const positions = ["Past", "Present", "Future"];
      finalResult += `**Three Card Spread**\n\n`;
      cards.forEach((card, i) => {
        finalResult += `**${positions[i]}:** ${card.name} ${card.reversed ? "(Reversed)" : ""}\n`;
        finalResult += `*${card.fullMeaning}*\n\n`;
      });
    } else {
      const positions = [
        "Present Situation", "Challenge", "Past Foundation", "Recent Past",
        "Possible Outcome", "Near Future", "Your Approach", "External Influences",
        "Hopes/Fears", "Final Outcome"
      ];
      finalResult += `**Celtic Cross Spread**\n\n`;
      cards.forEach((card, i) => {
        finalResult += `**${positions[i]}:** ${card.name} ${card.reversed ? "(Reversed)" : ""}\n`;
        finalResult += `*${card.fullMeaning}*\n\n`;
      });
    }
    
    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);
    
    (async () => {
      try {
        const cardNames = cards.map(c => c.name + (c.reversed ? " (R)" : "")).join(", ");
        const auditReport = `- <mark>Tarot:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; Spread: ${spreadType} | <mark>**Cards:** ${cardNames}</mark> | Q: ${question || "N/A"}`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
```

## **6. PERCENTILE/D100 SYSTEM**
Create: `anp-19-dice/lib/percentile.js`

```javascript
// anp-19-dice/lib/percentile.js
async function percentile_default(app) {
  const result = await app.prompt("Percentile Roll (D100)", {
    inputs: [
      { 
        label: "Target Number (1-100, leave blank for open roll)", 
        type: "string",
        placeholder: "e.g., 65"
      },
      { 
        label: "Roll Type", 
        type: "select", 
        options: [
          { label: "Standard (00-99)", value: "standard" },
          { label: "1-100 (00 = 100)", value: "one_to_hundred" },
          { label: "Flip to Succeed (CoC style)", value: "flip" }
        ],
        value: "one_to_hundred"
      }
    ]
  });
  
  if (result) {
    const [targetStr, rollType] = result;
    const target = parseInt(targetStr);
    
    function rollD100(type) {
      const tens = Math.floor(Math.random() * 10) * 10;
      const ones = Math.floor(Math.random() * 10);
      
      if (type === "standard") {
        return tens + ones; // 0-99
      } else if (type === "one_to_hundred") {
        return (tens === 0 && ones === 0) ? 100 : tens + ones; // 1-100
      } else if (type === "flip") {
        const roll = tens + ones;
        const effectiveRoll = roll === 0 ? 100 : roll;
        return {
          roll: effectiveRoll,
          tensDigit: Math.floor(tens / 10),
          onesDigit: ones,
          flipped: Math.floor(tens / 10) * 1 + ones * 10
        };
      }
    }
    
    let finalResult = `<mark>**Percentile Roll**</mark>\n`;
    
    if (rollType === "flip" && target) {
      const roll = rollD100("flip");
      const normalSuccess = roll.roll <= target;
      const flipSuccess = roll.flipped <= target;
      
      finalResult += `**Tens Die:** ${roll.tensDigit} | **Ones Die:** ${roll.onesDigit}\n`;
      finalResult += `**Roll:** ${roll.roll} (Target: ≤${target})\n`;
      finalResult += `**Flipped Roll:** ${roll.flipped}\n\n`;
      
      if (normalSuccess && flipSuccess) {
        finalResult += `**Result:** Critical Success! (Both rolls succeed)`;
      } else if (normalSuccess || flipSuccess) {
        finalResult += `**Result:** Regular Success (One roll succeeds)`;
      } else {
        finalResult += `**Result:** Failure`;
      }
    } else {
      const roll = rollD100(rollType);
      finalResult += `**Roll:** ${roll}\n`;
      
      if (target) {
        const success = rollType === "standard" ? roll < target : roll <= target;
        finalResult += `**Target:** ≤${target}\n`;
        finalResult += `**Result:** ${success ? "Success! ✓" : "Failure ✗"}\n`;
        
        if (rollType === "one_to_hundred") {
          // Special results
          if (roll === 1) finalResult += `**Critical Success!** 🎯\n`;
          if (roll === 100) finalResult += `**Fumble!** 💥\n`;
          if (roll === target) finalResult += `**Exactly target!** 👌\n`;
        }
      }
    }
    
    finalResult += `\n**Roll Type:** ${rollType}`;
    
    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);
    
    (async () => {
      try {
        const rollValue = typeof roll === 'object' ? roll.roll : roll;
        const success = target ? (rollValue <= target ? "Success" : "Fail") : "Open";
        const auditReport = `- <mark>Percentile:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Roll:** ${rollValue}, **Target:** ${target || "Open"}, **Result:** ${success}</mark> | Type: ${rollType}`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
```

## **7. QUICK ROLL PRESETS**
Create: `anp-19-dice/lib/quick_presets.js`

```javascript
// anp-19-dice/lib/quick_presets.js
async function quick_presets_default(app) {
  // Define common presets
  const presets = {
    "D&D Ability Score": { numDice: 4, faces: 6, keepHighest: true, keepCount: 3 },
    "D20 Check": { numDice: 1, faces: 20 },
    "D&D Fireball (8d6)": { numDice: 8, faces: 6 },
    "D&D Attack (1d8+3)": { numDice: 1, faces: 8, min: 4, max: 11 },
    "Savage Worlds": { numDice: 2, faces: 6, explode: true, explodeTarget: 6 },
    "2d6 (standard)": { numDice: 2, faces: 6 },
    "3d6 (GURPS)": { numDice: 3, faces: 6 },
    "Fudge/Fate (4dF)": { numDice: 4, faces: "fudge", type: "fudge" },
    "Coin Flip": { numDice: 1, faces: 2 },
    "D66 Table": { numDice: 2, faces: 6, sort: "asc", unique: false }
  };
  
  const presetOptions = Object.keys(presets).map(key => ({
    label: key,
    value: key
  }));
  
  const result = await app.prompt("Quick Roll Presets", {
    inputs: [
      { 
        label: "Select Preset", 
        type: "select", 
        options: presetOptions,
        value: "D20 Check"
      },
      { 
        label: "Add Modifier (+/-)", 
        type: "string",
        placeholder: "e.g., +3 or -2"
      }
    ]
  });
  
  if (result) {
    const [presetName, modifierStr] = result;
    const preset = presets[presetName];
    const modifier = parseInt(modifierStr) || 0;
    
    let rolls, total;
    
    if (preset.type === "fudge") {
      // Handle Fudge dice
      const outcomes = ["-", " ", "+"];
      rolls = [];
      total = 0;
      for (let i = 0; i < preset.numDice; i++) {
        const roll = Math.floor(Math.random() * 6);
        const face = outcomes[Math.floor(roll / 2)];
        rolls.push(face);
        total += face === "+" ? 1 : face === "-" ? -1 : 0;
      }
    } else {
      // Standard dice
      const numDice = preset.numDice || 1;
      const faces = preset.faces || 6;
      const min = preset.min;
      const max = preset.max;
      
      rolls = [];
      for (let i = 0; i < numDice; i++) {
        let roll = Math.floor(Math.random() * faces) + 1;
        if (min) roll = Math.max(roll, min);
        if (max) roll = Math.min(roll, max);
        rolls.push(roll);
      }
      
      // Handle keep highest
      if (preset.keepHighest) {
        rolls.sort((a, b) => b - a);
        rolls = rolls.slice(0, preset.keepCount);
      }
      
      // Handle exploding
      if (preset.explode) {
        const newRolls = [...rolls];
        for (let i = 0; i < newRolls.length; i++) {
          while (newRolls[i] === preset.explodeTarget) {
            const extraRoll = Math.floor(Math.random() * faces) + 1;
            newRolls.push(extraRoll);
          }
        }
        rolls = newRolls;
      }
      
      // Handle sort
      if (preset.sort === "asc") rolls.sort((a, b) => a - b);
      
      total = rolls.reduce((sum, r) => sum + r, 0);
    }
    
    const finalTotal = total + modifier;
    
    let finalResult = `<mark>**Quick Roll: ${presetName}**</mark>\n`;
    finalResult += `**Dice:** [${rolls.join(", ")}]\n`;
    finalResult += `**Base Total:** ${total}\n`;
    if (modifier !== 0) finalResult += `**Modifier:** ${modifier > 0 ? '+' : ''}${modifier}\n`;
    finalResult += `**Final Total:** ${finalTotal}\n`;
    
    if (presetName === "Coin Flip") {
      finalResult += `**Result:** ${rolls[0] === 1 ? 'Heads' : 'Tails'}\n`;
    }
    
    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);
    
    (async () => {
      try {
        const auditReport = `- <mark>Quick Roll (${presetName}):</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Rolls:** [${rolls.join(", ")}], **Total:** ${finalTotal}</mark>`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
```

## **INTEGRATION GUIDE**

### Step 1: Add New Files
Create each new `.js` file in the `anp-19-dice/lib/` directory:
- `weighted_random.js`
- `dice_pool.js`
- `decision_matrix.js`
- `name_generator.js`
- `tarot.js`
- `percentile.js`
- `quick_presets.js`

### Step 2: Update Main Plugin File (`dice.js`)

Add imports at the top:
```javascript
// anp-19-dice/dice.js

// Add these import lines with your existing imports
// anp-19-dice/lib/weighted_random.js
async function weighted_random_default(app) { /* ... */ }

// anp-19-dice/lib/dice_pool.js
async function dice_pool_default(app) { /* ... */ }

// anp-19-dice/lib/decision_matrix.js
async function decision_matrix_default(app) { /* ... */ }

// anp-19-dice/lib/name_generator.js
async function name_generator_default(app) { /* ... */ }

// anp-19-dice/lib/tarot.js
async function tarot_default(app) { /* ... */ }

// anp-19-dice/lib/percentile.js
async function percentile_default(app) { /* ... */ }

// anp-19-dice/lib/quick_presets.js
async function quick_presets_default(app) { /* ... */ }
```

### Step 3: Register New Options

Update the `dice_default` object in `dice.js`:

```javascript
var dice_default = {
  appOption: {
    "Basic": basic_default,
    "Advanced": advanced_default,
    "Specialized": specialized_default,
    "8 Ball": ball_default,
    "Ask Sai Baba": ask_sai_baba_default,
    "Fudge/Fate": fudge_fate_default,
    "Fantasy AGE Stunt - Single Roll": fantasy_age_stunt_single_roll_default,
    "Fantasy AGE Stunt - Roll All At Once": fantasy_age_stunt_roll_all_at_once_default,
    
    // NEW ADDITIONS
    "Quick Roll Presets": quick_presets_default,
    "Weighted Random": weighted_random_default,
    "Dice Pool (Shadowrun/WoD)": dice_pool_default,
    "Decision Matrix": decision_matrix_default,
    "Name Generator": name_generator_default,
    "Tarot Cards": tarot_default,
    "Percentile (D100)": percentile_default,
    
    "View Roll History": viewRollHistory,
    "Clear Audit History": clearAuditHistory
  },
  noteOption: {
    "Table - Randomizer": table_randomizer_default
  }
};
```

### Step 4: Ensure `getNoteUUID` is Available

Make sure all new modules have access to the `getNoteUUID` function. Since it's defined in `utils.js`, it should be available throughout the plugin scope. If not, you may need to pass it as a parameter or ensure it's in the global scope.

### Step 5: Testing

After integration, your plugin menu should show all new options:

**App-level plugins (when no note is selected):**
- Basic
- Advanced
- Specialized
- 8 Ball
- Ask Sai Baba
- Fudge/Fate
- Fantasy AGE Stunt - Single Roll
- Fantasy AGE Stunt - Roll All At Once
- **Quick Roll Presets** ⭐ NEW
- **Weighted Random** ⭐ NEW
- **Dice Pool (Shadowrun/WoD)** ⭐ NEW
- **Decision Matrix** ⭐ NEW
- **Name Generator** ⭐ NEW
- **Tarot Cards** ⭐ NEW
- **Percentile (D100)** ⭐ NEW
- View Roll History
- Clear Audit History

**Note-level plugins (when a note is selected):**
- Table - Randomizer

### Optional: Add Custom Dice Faces Support

If you want to add custom dice faces to the Quick Presets, you can extend it with:

```javascript
// Add to presets object in quick_presets.js
"Custom Faces": { 
  numDice: 2, 
  faces: "custom", 
  customFaces: ["⚔️", "🛡️", "❤️", "⭐", "💀", "👑"] 
}
```

Then in the roll function:
```javascript
if (preset.customFaces) {
  rolls = [];
  for (let i = 0; i < numDice; i++) {
    rolls.push(preset.customFaces[Math.floor(Math.random() * preset.customFaces.length)]);
  }
}
```

This comprehensive addition gives your plugin a complete suite of randomization tools, making it incredibly versatile for gaming, decision-making, and creative purposes!


---
