/**
 * Automatically generates a comprehensive list of searchable synonyms,
 * abbreviations, and common typo variations for any footballer.
 */
export function generateSynonyms(fullName: string): string[] {
  const norm = fullName.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const syns = new Set<string>();

  // 1. Full name
  syns.add(norm);

  // 2. Split by space
  const parts = norm.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];

    // Last name alone (if > 3 characters)
    if (lastName.length > 3) {
      syns.add(lastName);
    }

    // Initial + last name (e.g., "t. sheringham", "r. van nistelrooy")
    syns.add(`${firstName[0]}. ${lastName}`);
    syns.add(`${firstName[0]} ${lastName}`);

    // If Dutch / particle names like "van nistelrooy", "de bruyne", "mac allister"
    if (parts.length >= 3 && (parts[0] === 'van' || parts[0] === 'de' || parts[0] === 'mac' || parts[0] === 'el')) {
      syns.add(parts.slice(0, 2).join(' '));
    }
    if (parts.length >= 3 && (parts[parts.length - 2] === 'van' || parts[parts.length - 2] === 'de' || parts[parts.length - 2] === 'mac')) {
      syns.add(parts.slice(parts.length - 2).join(' '));
    }
  }

  // 3. Common typo/spelling variations
  // Double 'r' variation (e.g., sheringham -> sherringham)
  if (norm.includes('sheringham')) {
    syns.add('sherringham');
    syns.add('teddy sherringham');
    syns.add('t. sherringham');
  }

  // Common nicknames
  if (norm.includes('ronaldo') && norm.includes('nazario')) {
    syns.add('r9');
    syns.add('ronaldo r9');
  }
  if (norm === 'cristiano ronaldo' || norm.includes('cristiano')) {
    syns.add('cr7');
    syns.add('cristiano');
  }
  if (norm.includes('hernandez') && norm.includes('javier')) {
    syns.add('chicharito');
  }
  if (norm.includes('sergio aguero') || norm.includes('kun')) {
    syns.add('kun aguero');
    syns.add('aguero');
  }
  if (norm.includes('son heung-min') || norm.includes('heung-min son')) {
    syns.add('sonny');
    syns.add('heung-min son');
    syns.add('son');
  }

  return Array.from(syns);
}
