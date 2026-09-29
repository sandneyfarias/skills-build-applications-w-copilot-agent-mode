import CollectionStatus from './CollectionStatus.jsx'
import useCollection from './useCollection.js'

export default function Workouts() {
  const { items, loading, error } = useCollection('workouts')

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR NEXT SESSION</p>
          <h1>Workouts</h1>
          <p className="page-description">A few good ways to keep your momentum.</p>
        </div>
        <span className="record-count">{items.length} sessions</span>
      </div>
      <CollectionStatus loading={loading} error={error} empty={!items.length} collectionName="Workouts" />
      {!loading && !error && items.length > 0 && (
        <div className="workout-list">
          {items.map((workout, index) => (
            <article className="workout-row" key={workout._id || workout.id || workout.title || index}>
              <div className="workout-time">{workout.durationMinutes ?? '—'}<span>MIN</span></div>
              <div className="workout-copy">
                <p className="eyebrow">{workout.activityType || 'TRAINING'} <span>·</span> {workout.fitnessLevel || 'ALL LEVELS'}</p>
                <h2>{workout.title || 'Untitled workout'}</h2>
                <p>{workout.description || 'A focused session for your next training day.'}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}