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
  // Fetch notes with better error handling
  let notesByGroup;
  try {
    notesByGroup = await app.filterNotes({});
    // Ensure we have an array
    if (!notesByGroup || !Array.isArray(notesByGroup)) {
      notesByGroup = [];
    }
  } catch (error) {
    console.error("Error fetching notes:", error);
    notesByGroup = [];
    return null;
  }

  // Filter out any null or invalid entries
  notesByGroup = notesByGroup.filter(note => note !== null && note !== undefined);

  // Sorting logic based on lookUp value
  switch (lookUp) {
    case 1: // Sort by Name
      notesByGroup.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      break;
    case 2: // Sort by Created
      notesByGroup.sort((a, b) => new Date(a.created || 0) - new Date(b.created || 0));
      break;
    case 3: // Sort by Modified
      notesByGroup.sort((a, b) => new Date(a.updated || 0) - new Date(b.updated || 0));
      break;
    case 4: // Random
      notesByGroup = shuffleArray(notesByGroup);
      break;
    case 6: // UUID
      notesByGroup.sort((a, b) => (a.uuid || '').localeCompare(b.uuid || ''));
      break;
    case 7: // Tags + Name
      notesByGroup.sort((a, b) => {
        // Compare tags (default to empty string if no tags)
        const aTag = (a.tags && a.tags.length > 0) ? a.tags[0].toLowerCase() : "";
        const bTag = (b.tags && b.tags.length > 0) ? b.tags[0].toLowerCase() : "";
        if (aTag !== bTag) {
          return aTag.localeCompare(bTag); // Sort by tags
        }
        return (a.name || '').localeCompare(b.name || ''); // Sort by name if tags are equal
      });
      break;
    case 5: // Escape / Return
      return null;
    default: // Default to Name sort
      notesByGroup.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  // Adjust pickNote to be within the bounds of notesByGroup
  const totalNotes = notesByGroup.length;
  if (totalNotes === 0) {
    console.log("No valid notes available to pick.");
    return null;
  }

  // Ensure pickNote is a number and handle negative values
  const pickNumber = typeof pickNote === 'number' ? pickNote : 0;
  const adjustedPickNote = ((pickNumber % totalNotes) + totalNotes) % totalNotes; // Handle negative pickNote properly

  // Select the note based on adjustedPickNote
  const selectedNote = notesByGroup[adjustedPickNote];

  // Return the UUID of the selected note or null if not found
  return selectedNote && selectedNote.uuid ? selectedNote.uuid : null;

  // Helper function to shuffle an array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }
}

export async function createAuditReport(app, type, content) {
    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, '');
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, '');
    
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ['-reports/-dice'];
    
    const auditnoteUUID = await (async () => {
        const existingUUID = await app.settings["Dice_Audit_UUID [Do not Edit!]"];
        if (existingUUID) return existingUUID;
        const newUUID = await app.createNote(auditNoteName, auditTagName);
        await app.setSetting("Dice_Audit_UUID [Do not Edit!]", newUUID);
        return newUUID;
    })();
    
    const auditReport = `- <mark>${type}:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; ${content}`;
    await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
    await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
}