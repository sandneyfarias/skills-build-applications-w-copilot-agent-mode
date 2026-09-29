import CollectionStatus from './CollectionStatus.jsx'
import useCollection from './useCollection.js'

const codespaceName = import.meta.env.VITE_CODESPACE_NAME?.trim()
const endpoint = codespaceName && /^[a-z0-9-]+$/i.test(codespaceName)
  ? `https://${codespaceName}-8000.app.github.dev/api/users/`
  : 'http://localhost:8000/api/users/'

export default function Users() {
  const { items, loading, error } = useCollection(endpoint)

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">THE OCTOFIT COMMUNITY</p>
          <h1>Members</h1>
          <p className="page-description">Meet the people putting in the miles.</p>
        </div>
        <span className="record-count">{items.length} members</span>
      </div>
      <CollectionStatus loading={loading} error={error} empty={!items.length} collectionName="Members" />
      {!loading && !error && items.length > 0 && (
        <div className="table-responsive data-table-wrap">
          <table className="table data-table align-middle">
            <thead><tr><th scope="col">Member</th><th scope="col">Email</th><th scope="col">Level</th><th scope="col">Team</th></tr></thead>
            <tbody>
              {items.map((user, index) => (
                <tr key={user._id || user.id || user.email || index}>
                  <td className="person-name">{user.username || 'Member'}</td>
                  <td>{user.email || '—'}</td>
                  <td><span className="level-label">{user.fitnessLevel || 'beginner'}</span></td>
                  <td>{user.team?.name || (typeof user.team === 'string' ? user.team : 'Solo')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}