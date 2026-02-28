export default function MessageBubble({ message }) {
  const { role, content, streaming, meta, error } = message

  if (role === 'user') {
    return (
      <div className="msg-enter flex justify-end px-1">
        <div className="max-w-xl bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="msg-enter flex justify-start px-1">
      <div className="max-w-2xl flex flex-col gap-1.5">
        <div
          className={[
            'bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
            streaming ? 'streaming' : '',
            error      ? 'text-red-400' : 'text-slate-200',
          ].join(' ')}
        >
          {content}
        </div>

        {/* Fact-check badge — only shown after streaming finishes */}
        {!streaming && meta && <FactCheckBadge meta={meta} />}
      </div>
    </div>
  )
}

function FactCheckBadge({ meta }) {
  if (meta.corrected) {
    return (
      <span className="px-1 text-xs text-amber-400 flex items-center gap-1">
        ✏ Drift detected &amp; corrected
      </span>
    )
  }
  if (meta.flagged) {
    return (
      <span className="px-1 text-xs text-orange-400 flex items-center gap-1">
        ⚠ Drift flagged
      </span>
    )
  }
  return (
    <span className="px-1 text-xs text-emerald-500 flex items-center gap-1">
      ✓ Grounded
    </span>
  )
}
