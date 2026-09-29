function collectionFrom(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  for (const key of ['results', 'data', 'items']) {
    const value = payload[key]
    if (Array.isArray(value)) return value
    if (value && typeof value === 'object') return collectionFrom(value)
  }

  return []
}

export async function fetchCollection(endpoint, signal) {
  const response = await fetch(endpoint, { signal })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error || 'Could not load this collection.')
  }

  return collectionFrom(payload)
}