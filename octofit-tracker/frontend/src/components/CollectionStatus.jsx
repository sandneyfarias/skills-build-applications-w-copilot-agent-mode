export default function CollectionStatus({ loading, error, empty, collectionName }) {
  if (loading) {
    return (
      <div className="collection-message" role="status">
        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
        <span>Loading {collectionName.toLowerCase()}...</span>
      </div>
    )
  }

  if (error) {
    return <div className="alert alert-warning collection-alert" role="alert">{error}</div>
  }

  if (empty) {
    return <p className="collection-message">No {collectionName.toLowerCase()} to show yet.</p>
  }

  return null
}