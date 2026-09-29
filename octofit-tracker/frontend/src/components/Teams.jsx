import CollectionStatus from './CollectionStatus.jsx'
import useCollection from './useCollection.js'

export default function Teams() {
  const { items, loading, error } = useCollection('teams')

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">BETTER TOGETHER</p>
          <h1>Teams</h1>
          <p className="page-description">Find your training crew and keep each other moving.</p>
        </div>
        <span className="record-count">{items.length} teams</span>
      </div>
      <CollectionStatus loading={loading} error={error} empty={!items.length} collectionName="Teams" />
      {!loading && !error && items.length > 0 && (
        <div className="team-list">
          {items.map((team, index) => (
            <article className="team-row" key={team._id || team.id || team.name || index}>
              <span className="team-index">{String(index + 1).padStart(2, '0')}</span>
              <div className="team-copy">
                <h2>{team.name || 'Untitled team'}</h2>
                <p>{team.description || 'A crew that keeps showing up.'}</p>
              </div>
              <span className="member-count">{team.members?.length || 0} members</span>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}