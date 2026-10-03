import { useState } from 'react'
import { Search, Sparkles, CheckCircle2, XCircle, ChevronDown, ChevronUp, Clock, Info, Laptop, AlertTriangle } from 'lucide-react'
import { playClickSound, playSuccessSound, playAlertSound } from '../utils/audio'

export default function SearchSection({ onSearch, isSearching, searchResult }) {
  const [query, setQuery] = useState('')
  const [showEvidence, setShowEvidence] = useState(false)

  const quickSamples = [
    { label: "Wi-Fi vanished after sleep", query: "Wi-Fi disappeared after waking from sleep" },
    { label: "USB-C monitor no signal", query: "External 4K monitor not detected over USB-C" },
    { label: "Printer marked offline", query: "Windows printer offline in print spooler" },
    { label: "Git lockfile merge conflict", query: "Git merge conflict cascade in package-lock.json" }
  ]

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!query.trim() || isSearching) return
    playClickSound()
    onSearch(query.trim())
  }

  const handleSampleClick = (sampleQuery) => {
    setQuery(sampleQuery)
    playClickSound()
    onSearch(sampleQuery)
  }

  return (
    <section id="tour-search" className="w-full max-w-4xl mx-auto px-4 py-8 relative z-10">
      
      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center rounded-2xl bg-[#0E0E14]/90 border border-white/[0.12] shadow-2xl focus-within:border-blue-500/80 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
          <div className="pl-5 text-[#8E8EA0] group-focus-within:text-blue-400 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="My Wi-Fi isn't working again / Monitor won't detect..."
            className="w-full py-4 px-4 bg-transparent text-white placeholder-[#525263] text-sm sm:text-base focus:outline-none"
          />
          <div className="pr-3">
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-all shadow-md shadow-blue-600/25 active:scale-95 cursor-pointer"
            >
              {isSearching ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recall Fix</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Quick Test Sample Prompts */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
        <span className="text-[11px] font-mono text-[#525263] mr-1">Try real cases:</span>
        {quickSamples.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSampleClick(s.query)}
            className="px-2.5 py-1 rounded-full text-xs bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-[#8E8EA0] hover:text-[#EDEDF2] transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search Result Display */}
      {searchResult && (
        <div className="mt-8 space-y-4 animate-fadeIn">
          
          {/* Result Header & Engine Provenance */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                Troubleshooting Memory
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {searchResult.found ? 'Matches Found' : 'No Direct Fix'}
              </span>
            </div>
            {searchResult.provenance && (
              <span className="text-[11px] font-mono text-[#8E8EA0]">
                {searchResult.provenance}
              </span>
            )}
          </div>

          {/* AI Synthesis Summary Card */}
          {searchResult.message && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-[#EDEDF2] leading-relaxed">
              {searchResult.message}
            </div>
          )}

          {/* Primary Confirmed Fix Card */}
          {searchResult.most_recent_fix && (
            <div className="p-5 rounded-2xl bg-[#0E0E14] border border-emerald-500/30 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                    Confirmed Fix
                  </span>
                </div>
                {searchResult.most_recent_fix.date && (
                  <span className="text-xs text-[#8E8EA0] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {searchResult.most_recent_fix.date}
                  </span>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-bold text-white mb-2 pl-7">
                {searchResult.most_recent_fix.action}
              </h4>

              {searchResult.most_recent_fix.notes && (
                <p className="text-xs sm:text-sm text-[#8E8EA0] pl-7 leading-relaxed mb-3">
                  {searchResult.most_recent_fix.notes}
                </p>
              )}

              <div className="pl-7 flex items-center gap-2 text-[11px] text-[#525263] font-mono">
                <span>From Incident: {searchResult.most_recent_fix.incident_title}</span>
              </div>
            </div>
          )}

          {/* Other Confirmed Fixes (Multi-Fix Synthesizer) */}
          {searchResult.other_confirmed_fixes && searchResult.other_confirmed_fixes.length > 0 && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
              <div className="text-xs font-semibold text-[#8E8EA0] uppercase tracking-wider mb-2.5">
                Other Confirmed Fixes in Your History
              </div>
              <ul className="space-y-2">
                {searchResult.other_confirmed_fixes.map((fix, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#EDEDF2]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400/70 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">{fix.action}</span>
                      <span className="text-[#8E8EA0] ml-2">({fix.incident_title})</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previously Tried / Evidence Breakdown (DO NOT REPEAT) */}
          {searchResult.previously_tried && searchResult.previously_tried.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#0E0E14] border border-red-500/25 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-red-400">
                  Previously Tried (Failed in Past Incidents)
                </span>
              </div>

              <div className="space-y-2.5 pl-2">
                {searchResult.previously_tried.map((attempt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-white">{attempt.action}</span>
                      <p className="text-xs text-[#8E8EA0] mt-0.5 italic">
                        {attempt.outcome_note || "Last time, this did not resolve the issue."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Trail Drawer ("Why am I seeing this?") */}
          {searchResult.evidence_trail && searchResult.evidence_trail.length > 0 && (
            <div className="border border-white/[0.08] rounded-xl bg-white/[0.01] overflow-hidden">
              <button
                type="button"
                onClick={() => { playClickSound(); setShowEvidence(!showEvidence) }}
                className="w-full px-4 py-3 flex items-center justify-between text-xs text-[#8E8EA0] hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2 font-medium">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>Why am I seeing this? (Evidence Trail)</span>
                </div>
                {showEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showEvidence && (
                <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] space-y-3 text-xs">
                  {searchResult.evidence_trail.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
                      <div className="flex items-center justify-between font-semibold text-white mb-1.5">
                        <span>Incident #{item.incident_id}: {item.title}</span>
                        {item.date_resolved && <span className="text-[11px] text-[#525263] font-mono">{item.date_resolved}</span>}
                      </div>

                      {item.matched_keywords && item.matched_keywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] uppercase font-mono text-[#525263]">Matched:</span>
                          {item.matched_keywords.map((kw, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[10px] border border-blue-500/20">
                              "{kw}"
                            </span>
                          ))}
                        </div>
                      )}

                      {item.context_tags && (
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[#8E8EA0]">
                          {item.context_tags.device && <span>Device: <strong className="text-white">{item.context_tags.device}</strong></span>}
                          {item.context_tags.os && <span>OS: <strong className="text-white">{item.context_tags.os}</strong></span>}
                          {item.context_tags.situation && <span>Situation: <strong className="text-white">{item.context_tags.situation}</strong></span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </section>
  )
}
