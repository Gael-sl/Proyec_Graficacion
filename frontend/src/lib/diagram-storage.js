export function getLocalDiagrams(storageKey) {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error(`Error parsing local diagrams for ${storageKey}:`, error);
    return [];
  }
}

export function saveLocalDiagrams(storageKey, diagrams) {
  localStorage.setItem(storageKey, JSON.stringify(diagrams));
}

export function mergeById(preferred = [], fallback = []) {
  const merged = [...preferred];
  const existingIds = new Set(preferred.map((item) => item.id));
  fallback.forEach((item) => {
    if (!existingIds.has(item.id)) {
      merged.push(item);
    }
  });
  return merged;
}
