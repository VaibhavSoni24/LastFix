import { useState } from 'react'
import {
  Wrench, CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp,
  Trash2, Sparkles, Filter, Laptop, Monitor, Printer, Terminal
} from 'lucide-react'
import { playClickSound, playAlertSound, playSuccessSound } from '../utils/audio'

export default function HistorySection({
  incidents,
  onDeleteIncident,
  onLoadSeedData,
  isLoadingSeed
}) {
  const [selectedSubsystem, setSelectedSubsystem] = useState('All')
  const [expandedId, setExpandedId] = useState(null)

  const subsystems = ['All', 'Wi-Fi', 'Display / HDMI', 'Printer', 'Developer Tools']

  const filtered = incidents.filter((inc) => {
    if (selectedSubsystem === 'All') return true
    return inc.subsystem?.toLowerCase().includes(selectedSubsystem.toLowerCase().split(' ')[0])
  })

  const toggleExpand = (id) => {
    playClickSound()
    setExpandedId(expandedId === id ? null : id)
  }

  const handleDelete = (e, id, title) => {
    e.stopPropagation()
    playAlertSound()
    if (window.confirm(`Delete memory: "${title}"?`)) {
      onDeleteIncident(id)
    }
  }

  return (
    <section id="tour-history" className="w-full max-w-6xl mx-auto px-4 py-10 relative z-10">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Fix Memories</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#8E8EA0] border border-white/[0.08]">
              {incidents.length}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8E8EA0] mt-1">
            Empirical log of your hardware and software troubleshooting attempts.
          </p>
        </div>

        {/* Filter Tabs */}
        {incidents.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/[0.08]">
            {subsystems.map((sub) => (
              <button
                key={sub}
                onClick={() => { playClickSound(); setSelectedSubsystem(sub) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedSubsystem === sub
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-[#8E8EA0] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty State Banner (DISAPPEARS ONCE MEMORIES EXIST) */}
      {incidents.length === 0 && (
        <div className="mt-8 p-8 sm:p-12 rounded-3xl bg-[#0E0E14]/80 border border-white/[0.08] text-center max-w-xl mx-auto backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-400">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No memories logged yet</h3>
          <p className="text-xs sm:text-sm text-[#8E8EA0] leading-relaxed mb-6">
            LastFix is a blank canvas ready to record what worked for your devices. Want to explore how it works right now?
          </p>
          <button
            onClick={() => { playSuccessSound(); onLoadSeedData() }}
            disabled={isLoadingSeed}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            {isLoadingSeed ? (
              <span>Loading Demo Memories...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Load Demo Memories (Tilak & Saumya)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Incidents List (Direct Page Placement) */}
      {filtered.length > 0 && (
        <div className="mt-6 space-y-3">
          {filtered.map((inc) => {
            const isExpanded = expandedId === inc.id
            const confirmedFix = inc.confirmed_fix || inc.attempts?.find((a) => a.outcome === 'worked')?.action
            const failedCount = inc.attempts?.filter((a) => a.outcome === 'failed').length || 0

            return (
              <div
                key={inc.id}
                onClick={() => toggleExpand(inc.id)}
                className={`p-5 rounded-2xl bg-[#0E0E14] border transition-all duration-200 cursor-pointer ${
                  isExpanded ? 'border-blue-500/40 shadow-xl' : 'border-white/[0.08] hover:border-white/[0.16]'
                }`}
              >
                {/* Top Row: Title, Context, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-base tracking-tight flex items-center gap-2">
                      <span>{inc.title}</span>
                    </h3>
                    
                    {/* Inferred Context Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      {inc.device && (
                        <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[#8E8EA0] border border-white/[0.06]">
                          {inc.device}
                        </span>
                      )}
                      {inc.os && (
                        <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[#8E8EA0] border border-white/[0.06]">
                          {inc.os}
                        </span>
                      )}
                      {inc.subsystem && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                          {inc.subsystem}
                        </span>
                      )}
                      {inc.situation && (
                        <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[#525263]">
                          {inc.situation}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Meta */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-[#525263]">
                      {inc.attempts?.length || 0} step{inc.attempts?.length === 1 ? '' : 's'}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, inc.id, inc.title)}
                      className="p-1.5 rounded-lg text-[#525263] hover:text-red-400 hover:bg-white/[0.04] transition-colors"
                      title="Delete Incident"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-[#8E8EA0]">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Confirmed Fix Highlight Summary */}
                {confirmedFix && (
                  <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-[#8E8EA0]">Fix:</span>
                      <span className="font-semibold text-emerald-300">{confirmedFix}</span>
                    </div>

                    {failedCount > 0 && (
                      <span className="text-[10px] font-mono text-red-400/80 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                        {failedCount} failed attempt{failedCount === 1 ? '' : 's'} recorded
                      </span>
                    )}
                  </div>
                )}

                {/* Expandable Attempts Timeline */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-3 animate-fadeIn text-xs">
                    <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#8E8EA0] mb-2">
                      Timeline of Attempts
                    </div>

                    <div className="space-y-2.5 pl-2 border-l-2 border-white/[0.08] ml-2">
                      {inc.attempts?.map((att, idx) => {
                        const isWorked = att.outcome === 'worked'
                        const isFailed = att.outcome === 'failed'

                        return (
                          <div key={idx} className="relative pl-5">
                            <span
                              className={`absolute -left-[11px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                isWorked ? 'bg-emerald-400 text-black' : (isFailed ? 'bg-red-400 text-white' : 'bg-white/20 text-white')
                              }`}
                            >
                              {idx + 1}
                            </span>

                            <div className="flex items-baseline justify-between gap-2">
                              <span className={`font-medium ${isWorked ? 'text-emerald-300 font-semibold' : 'text-white'}`}>
                                {att.action}
                              </span>
                              <span
                                className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded ${
                                  isWorked ? 'bg-emerald-500/10 text-emerald-400' : (isFailed ? 'bg-red-500/10 text-red-400' : 'bg-white/10 text-[#8E8EA0]')
                                }`}
                              >
                                {att.outcome}
                              </span>
                            </div>

                            {att.notes && (
                              <p className="text-[11px] text-[#8E8EA0] mt-0.5 leading-relaxed">
                                {att.notes}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

    </section>
  )
}
