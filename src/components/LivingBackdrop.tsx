/**
 * Landing-page backdrop: a drifting warm gradient mesh over a panning ledger
 * grid. All motion is CSS keyframes on transform only, and every keyframe is
 * switched off by the `prefers-reduced-motion` block in `index.css`.
 */
export function LivingBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950" aria-hidden="true">
      <div
        className="ekhata-blob ekhata-blob-a absolute -left-[18%] -top-[22%] h-[70vmax] w-[70vmax] rounded-full opacity-70 blur-[70px]"
        style={{ background: 'radial-gradient(circle at 40% 40%, rgba(11,106,99,0.30), rgba(11,106,99,0) 68%)' }}
      />
      <div
        className="ekhata-blob ekhata-blob-b absolute -right-[22%] top-[6%] h-[62vmax] w-[62vmax] rounded-full opacity-70 blur-[70px]"
        style={{ background: 'radial-gradient(circle at 55% 45%, rgba(168,86,60,0.24), rgba(168,86,60,0) 66%)' }}
      />
      <div
        className="ekhata-blob ekhata-blob-c absolute -bottom-[26%] left-[12%] h-[66vmax] w-[66vmax] rounded-full opacity-75 blur-[70px]"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(122,95,36,0.26), rgba(122,95,36,0) 66%)' }}
      />

      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="ekhata-living-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="rgba(28,28,25,0.055)" strokeWidth="1" />
          </pattern>
        </defs>
        <g className="ekhata-grid-pan">
          <rect x="-48" y="-48" width="calc(100% + 96px)" height="calc(100% + 96px)" fill="url(#ekhata-living-grid)" />
        </g>
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, rgba(243,241,234,0) 0%, rgba(243,241,234,0.55) 55%, rgba(243,241,234,0.85) 100%)',
        }}
      />
    </div>
  )
}
