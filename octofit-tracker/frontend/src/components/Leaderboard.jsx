import CollectionStatus from './CollectionStatus.jsx'
import useCollection from './useCollection.js'

export default function Leaderboard() {
  const { items, loading, error } = useCollection('leaderboard')

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">A LITTLE FRIENDLY COMPETITION</p>
          <h1>Leaderboard</h1>
          <p className="page-description">Consistency adds up. See where everyone stands.</p>
        </div>
        <span className="record-count">{items.length} athletes</span>
      </div>
      <CollectionStatus loading={loading} error={error} empty={!items.length} collectionName="Standings" />
      {!loading && !error && items.length > 0 && (
        <div className="table-responsive data-table-wrap">
          <table className="table data-table align-middle">
            <thead><tr><th scope="col">Rank</th><th scope="col">Athlete</th><th scope="col">Activities</th><th scope="col">Points</th></tr></thead>
            <tbody>
              {items.map((entry, index) => (
                <tr key={entry.userId || entry._id || entry.username || index}>
                  <td><span className={`rank-number${index < 3 ? ' top-rank' : ''}`}>{String(index + 1).padStart(2, '0')}</span></td>
                  <td className="person-name">{entry.username || 'Member'}</td>
                  <td>{entry.activities ?? 0}</td>
                  <td><strong>{Number(entry.points || 0).toLocaleString()}</strong> pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}