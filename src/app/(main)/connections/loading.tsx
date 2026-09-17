export default function Loading() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 80px' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -640px 0; }
          100% { background-position: 640px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #f0e8ea 25%, #fdf5f6 50%, #f0e8ea 75%);
          background-size: 640px 100%;
          animation: shimmer 1.2s infinite linear;
          border-radius: 8px;
        }
      `}</style>

      {/* Skeleton de 3 cards */}
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: 'white', border: '0.5px solid #E0D4D7', borderRadius: 14, padding: '16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 12, width: '25%' }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 13, width: '90%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 13, width: '70%' }} />
        </div>
      ))}
    </div>
  )
}
