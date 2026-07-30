export default function Loading() {
  return (
    <div className="skeleton-page" role="status" aria-label="Cargando página">
      <div className="skeleton-topbar skeleton-shimmer" />
      <div className="skeleton-nav">
        <div className="skeleton-logo skeleton-shimmer" />
        <div className="skeleton-cart skeleton-shimmer" />
      </div>
      <div className="skeleton-categories">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="skeleton-category skeleton-shimmer" key={index} />
        ))}
      </div>
      <div className="skeleton-product-layout">
        <div className="skeleton-product-image skeleton-shimmer" />
        <div className="skeleton-product-info">
          <div className="skeleton-line short skeleton-shimmer" />
          <div className="skeleton-line title skeleton-shimmer" />
          <div className="skeleton-line medium skeleton-shimmer" />
          <div className="skeleton-line price skeleton-shimmer" />
          <div className="skeleton-sizes">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="skeleton-size skeleton-shimmer" key={index} />
            ))}
          </div>
          <div className="skeleton-button skeleton-shimmer" />
        </div>
      </div>
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
