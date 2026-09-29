import { useEffect, useState } from 'react'
import { fetchCollection } from './api.js'

export default function useCollection(endpoint) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadCollection() {
      setLoading(true)
      try {
        setItems(await fetchCollection(endpoint, controller.signal))
        setError('')
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setItems([])
          setError(requestError.message || 'Unable to load this collection.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadCollection()
    return () => controller.abort()
  }, [endpoint])

  return { items, loading, error }
}