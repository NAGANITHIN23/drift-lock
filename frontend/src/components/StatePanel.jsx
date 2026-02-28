export default function StatePanel({ state, turnCount }) {
  if (!state) {
    return (
      <aside className="hidden lg:flex w-72 flex-shrink-0 border-l border-slate-800 bg-slate-900 items-center justify-center">
        <p className="text-slate-600 text-xs">State will appear after the first message.</p>
      </aside>
    )
  }

  const {
    original_goal,
    current_thread,
    established_facts   = [],
    active_constraints  = [],
  } = state

  return (
    <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col border-l border-slate-800 bg-slate-900 overflow-hidden">

      <div className="px-4 py-3 border-b border-slate-800">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Session State
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">

        <Section label="Goal">
          <p className="text-slate-300 leading-relaxed">{original_goal}</p>
        </Section>

        <Section label="Current Thread">
          <p className="text-slate-400 italic leading-relaxed">
            {current_thread || '(none yet)'}
          </p>
        </Section>

        <Section label="Established Facts" badge={established_facts.length}>
          {established_facts.length === 0
            ? <p className="text-slate-600 italic">None yet</p>
            : (
              <ul className="space-y-1.5">
                {established_facts.map((f, i) => (
                  <li key={i} className="flex gap-1.5 text-slate-400">
                    <span className="text-slate-600 flex-shrink-0 mt-0.5">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )
          }
        </Section>

        <Section label="Constraints">
          {active_constraints.length === 0
            ? <p className="text-slate-600 italic">None</p>
            : (
              <ul className="space-y-1.5">
                {active_constraints.map((c, i) => (
                  <li key={i} className="flex gap-1.5 text-slate-400">
                    <span className="text-slate-600 flex-shrink-0 mt-0.5">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            )
          }
        </Section>

      </div>

      <div className="flex-shrink-0 px-4 py-3 border-t border-slate-800 flex justify-between text-xs text-slate-600">
        <span>Turn <span className="font-mono text-slate-400">{turnCount}</span></span>
        <span>compresses when context grows large</span>
      </div>

    </aside>
  )
}

function Section({ label, badge, children }) {
  return (
    <div>
      <div className="flex items-center justify-between text-slate-600 uppercase tracking-wider mb-1.5">
        <span>{label}</span>
        {badge !== undefined && (
          <span className="font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-500">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
