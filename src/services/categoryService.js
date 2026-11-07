// Pure category helpers. Wire these into Firestore repositories when persistence is enabled.
export function makeCategoryId(name) {
  return `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`
}
export function validateCategory({ name, budget }, categories, salary, editingId = null) {
  const cleanName = String(name || '').trim()
  const amount = Number(budget)
  if (!cleanName) return { valid: false, error: 'Category name is required.' }
  if (!Number.isFinite(amount) || amount < 0) return { valid: false, error: 'Enter a valid non-negative budget.' }
  const total = categories.reduce((sum, item) => sum + (item.id === editingId ? amount : Number(item.budget || 0)), 0)
  if (!editingId) {
    if (total + amount > salary && total + amount > categories.reduce((sum, item) => sum + Number(item.budget || 0), 0)) {
      return { valid: false, error: 'This allocation increases the total beyond monthly income.' }
    }
  } else {
    const currentTotal = categories.reduce((sum, item) => sum + Number(item.budget || 0), 0)
    if (total > salary && total > currentTotal) return { valid: false, error: 'This change exceeds monthly income.' }
  }
  return { valid: true, name: cleanName, budget: amount }
}
