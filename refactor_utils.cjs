const fs = require('fs');

const content = fs.readFileSync('dice.js', 'utf8');

const libDir = './lib';
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir);
}

const utilsContent = `
export function rollDice({
  numDice = null,
  faces = null,
  min = null,
  max = null,
  keep = null,
  drop = null,
  explode = null,
  sort = null,
  unique = false,
} = {}) {
  const rollSingleDie = () => Math.floor(Math.random() * faces) + 1;
  let rolls = Array.from({ length: numDice }, rollSingleDie);
  if (min !== null) rolls = rolls.map((roll) => Math.max(roll, min));
  if (max !== null) rolls = rolls.map((roll) => Math.min(roll, max));
  if (explode) {
    const { target, reroll } = explode;
    const newRolls = [];
    rolls.forEach((roll) => {
      newRolls.push(roll);
      let explodeCount = 0;
      let currentRoll = roll;
      while (currentRoll === target && explodeCount < 100) {
        const extraRoll = rollSingleDie();
        newRolls.push(extraRoll);
        currentRoll = extraRoll;
        explodeCount++;
        if (!reroll) break;
      }
    });
    rolls = newRolls;
  }
  if (unique) rolls = [...new Set(rolls)];
  if (sort === "asc") rolls.sort((a, b) => a - b);
  if (sort === "desc") rolls.sort((a, b) => b - a);
  if (keep) {
    const { highest, count } = keep;
    rolls = highest ? rolls.slice(-count) : rolls.slice(0, count);
  }
  if (drop) {
    const { highest, count } = drop;
    rolls = highest ? rolls.slice(0, rolls.length - count) : rolls.slice(count);
  }
  return {
    rolls,
    total: rolls.reduce((sum, roll) => sum + roll, 0),
  };
}

export async function sortNotesByLookUp(app, lookUp, pickNote) {
  let notesByGroup = await app.filterNotes({});
  switch (lookUp) {
    case 1: notesByGroup.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 2: notesByGroup.sort((a, b) => new Date(a.created) - new Date(b.created)); break;
    case 3: notesByGroup.sort((a, b) => new Date(a.updated) - new Date(b.updated)); break;
    case 4: notesByGroup = shuffleArray(notesByGroup); break;
    case 6: notesByGroup.sort((a, b) => a.uuid.localeCompare(b.uuid)); break;
    case 7:
        notesByGroup.sort((a, b) => {
          const aTag = a.tags?.[0]?.toLowerCase() || "";
          const bTag = b.tags?.[0]?.toLowerCase() || "";
          if (aTag !== bTag) return aTag.localeCompare(bTag);
          return a.name.localeCompare(b.name);
        });
      break;
    case 5: return;
    default: notesByGroup.sort((a, b) => a.name.localeCompare(b.name));
  }
  const totalNotes = notesByGroup.length;
  if (totalNotes === 0) throw new Error("No notes available to pick.");
  const adjustedPickNote = pickNote % totalNotes;
  const selectedNote = notesByGroup[adjustedPickNote];
  return selectedNote?.uuid;

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

export async function createAuditReport(app, type, content) {
    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, '');
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, '');
    
    const auditNoteName = \`Dice Results Audit\`;
    const auditTagName = ['-reports/-dice'];
    
    const auditnoteUUID = await (async () => {
        const existingUUID = await app.settings["Dice_Audit_UUID [Do not Edit!]"];
        if (existingUUID) return existingUUID;
        const newUUID = await app.createNote(auditNoteName, auditTagName);
        await app.setSetting("Dice_Audit_UUID [Do not Edit!]", newUUID);
        return newUUID;
    })();
    
    const auditReport = \`- <mark>\${type}:</mark> ***When:** \${YYMMDD}_\${HHMMSS}*; \${content}\`;
    await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
    await app.navigate(\`https://www.amplenote.com/notes/\${auditnoteUUID}\`);
}
`;

fs.writeFileSync(libDir + '/utils.js', utilsContent.trim());
console.log("utils.js generated.");
