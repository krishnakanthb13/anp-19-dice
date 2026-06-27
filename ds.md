Looking at the Amplenote API documentation and the code, when a note UUID starts with "local-", it means the note is a local note that hasn't been synced to the cloud yet. To handle this, you need to check if the note exists locally and then either create a new online note or retrieve the online UUID.

Here's how to modify the code to handle this scenario:

## Solution

Add a helper function to handle the UUID resolution:

```javascript
// Add this helper function at the top of your code
async function getNoteUUID(app, noteName, tagNames) {
  // First check if we have a stored UUID
  const existingUUID = await app.settings["Dice_Audit_UUID [Do not Edit!]"];
  
  if (existingUUID) {
    // If it starts with "local-", try to find the online version
    if (existingUUID.startsWith("local-")) {
      try {
        // Try to find the note by name
        const notes = await app.filterNotes({ 
          name: noteName,
          tags: tagNames
        });
        
        // If we found an online version, use that UUID
        if (notes && notes.length > 0) {
          // Find the first note that doesn't have a local prefix
          const onlineNote = notes.find(note => !note.uuid.startsWith("local-"));
          if (onlineNote && onlineNote.uuid) {
            // Update the stored setting with the online UUID
            await app.setSetting("Dice_Audit_UUID [Do not Edit!]", onlineNote.uuid);
            return onlineNote.uuid;
          }
        }
        
        // If no online note found with the same name, try to get the local note
        const localNote = await app.getNote({ uuid: existingUUID });
        if (localNote) {
          // The note exists locally but might not be synced
          // Try to force a sync or just use the local UUID
          return existingUUID;
        }
      } catch (error) {
        console.error("Error resolving UUID:", error);
        // If we can't resolve, we'll create a new note
      }
    } else {
      // It's a valid online UUID, return it
      return existingUUID;
    }
  }
  
  // If we get here, we need to create a new note
  try {
    const newUUID = await app.createNote(noteName, tagNames);
    await app.setSetting("Dice_Audit_UUID [Do not Edit!]", newUUID);
    return newUUID;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
}
```

## Modified Usage

Replace the existing UUID retrieval code blocks with this helper function. For example, in the `basic_default` function:

```javascript
// Replace this block:
const auditnoteUUID = await (async () => {
  const existingUUID = await app.settings["Dice_Audit_UUID [Do not Edit!]"];
  if (existingUUID) return existingUUID;
  const newUUID = await app.createNote(auditNoteName, auditTagName);
  await app.setSetting("Dice_Audit_UUID [Do not Edit!]", newUUID);
  return newUUID;
})();

// With this:
const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);
```

## Additional Notes

1. **Sync Considerations**: When a local note is synced to the cloud, Amplenote should automatically update the UUID. However, if the sync hasn't completed, the local UUID might still be used.

2. **Duplicate Detection**: The code above tries to find an existing online note with the same name and tags to avoid creating duplicates.

3. **Error Handling**: Always wrap UUID operations in try-catch blocks to handle potential errors gracefully.

4. **Performance**: Consider caching the UUID resolution result if it's called frequently, though in this case it's only called once per dice roll.

This approach ensures that:
- Local UUIDs are resolved to their online counterparts when possible
- New notes are created when no valid UUID exists
- The stored setting is always updated with the latest valid UUID
- The application continues to work even when offline (using local UUIDs)