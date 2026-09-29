import CollectionStatus from './CollectionStatus.jsx'
import useCollection from './useCollection.js'

const codespaceName = import.meta.env.VITE_CODESPACE_NAME?.trim()
const endpoint = codespaceName && /^[a-z0-9-]+$/i.test(codespaceName)
  ? `https://${codespaceName}-8000.app.github.dev/api/activities/`
  : 'http://localhost:8000/api/activities/'

function displayDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Activities() {
  const { items, loading, error } = useCollection(endpoint)

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">THE DAILY LOG</p>
          <h1>Activities</h1>
          <p className="page-description">A clear view of the work you have put in.</p>
        </div>
        <span className="record-count">{items.length} recorded</span>
      </div>
      <CollectionStatus loading={loading} error={error} empty={!items.length} collectionName="Activities" />
      {!loading && !error && items.length > 0 && (
        <div className="table-responsive data-table-wrap">
          <table className="table data-table align-middle">
            <thead><tr><th scope="col">Activity</th><th scope="col">Athlete</th><th scope="col">Duration</th><th scope="col">Distance</th><th scope="col">Completed</th></tr></thead>
            <tbody>
              {items.map((activity, index) => (
                <tr key={activity._id || activity.id || `${activity.type}-${activity.completedAt}-${index}`}>
                  <td><span className="activity-dot" />{activity.type || 'Activity'}</td>
                  <td>{activity.user?.username || activity.username || 'Member'}</td>
                  <td>{activity.durationMinutes ?? '—'} min</td>
                  <td>{activity.distanceKm == null ? '—' : `${activity.distanceKm} km`}</td>
                  <td>{displayDate(activity.completedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}