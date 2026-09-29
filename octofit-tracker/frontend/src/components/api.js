const codespaceName = import.meta.env.VITE_CODESPACE_NAME?.trim()
const validCodespaceName = codespaceName && /^[a-z0-9-]+$/i.test(codespaceName)
const apiOrigin = validCodespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000'

export function getApiEndpoint(component) {
  return `${apiOrigin}/api/${component}/`
}

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

export async function fetchCollection(component, signal) {
  const response = await fetch(getApiEndpoint(component), { signal })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error || `Could not load ${component}.`)
  }

  return collectionFrom(payload)
}