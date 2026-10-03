import { useState } from 'react'
import { X, Sparkles, Plus, Trash2, CheckCircle2, XCircle, HelpCircle, Save, ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import { playClickSound, playSuccessSound, playToggleSound } from '../utils/audio'

export default function LogFixModal({ isOpen, onClose, onIncidentSaved }) {
  const [rawText, setRawText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const sampleNarratives = [
    {
      label: "Wi-Fi drop (Saumya)",
      text: "My laptop Wi-Fi disappeared after waking from sleep on Windows 11. I restarted twice and it failed, then reset the network adapter in settings and that worked."
    },
    {
      label: "USB-C Display (Tilak)",
      text: "Secondary 4K monitor received no signal when plugged into my MacBook. Unplugged and replugged HDMI cable which failed, then reconnected display adapter and clicked Detect Displays which worked."
    },
    {
      label: "Printer Offline (Saumya)",
      text: "HP LaserJet prints failed with Printer is Offline on Windows 11 desktop. Power cycled printer which failed, then deleted and re-added printer in settings which worked."
    }
  ]

  const handleExtract = async () => {
    if (!rawText.trim() || isExtracting) return
    setIsExtracting(true)
    setErrorMsg(null)
    playClickSound()

    try {
      const provider = localStorage.getItem('lastfix_provider') || 'auto'
      const apiKey = localStorage.getItem('lastfix_api_key') || ''
      const model = localStorage.getItem('lastfix_model') || ''

      const res = await fetch('/api/incidents/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawText,
          provider,
          api_key: apiKey || null,
          model: model || null
        })
      })

      if (!res.ok) throw new Error('Extraction failed')
      const data = await res.json()
      setPreview(data)
      playSuccessSound()
    } catch (e) {
      setErrorMsg('Failed to extract structured incident. Please try again.')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleOutcomeChange = (index, outcome) => {
    playToggleSound()
    const nextAttempts = [...preview.attempts]
    nextAttempts[index].outcome = outcome
    setPreview({ ...preview, attempts: nextAttempts })
  }

  const handleAddAttempt = () => {
    playClickSound()
    const nextAttempts = [
      ...preview.attempts,
      { action: '', outcome: 'unknown', notes: '', step_order: preview.attempts.length + 1 }
    ]
    setPreview({ ...preview, attempts: nextAttempts })
  }

  const handleRemoveAttempt = (index) => {
    playClickSound()
    const nextAttempts = preview.attempts.filter((_, i) => i !== index)
    setPreview({ ...preview, attempts: nextAttempts })
  }

  const handleSave = async () => {
    if (!preview || isSaving) return
    setIsSaving(true)
    setErrorMsg(null)
    playClickSound()

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: preview.title,
          problem: preview.problem,
          context: preview.context,
          device: preview.device,
          os: preview.os,
          situation: preview.situation,
          subsystem: preview.subsystem,
          attempts: preview.attempts
        })
      })

      if (!res.ok) throw new Error('Failed to save incident')
      const saved = await res.json()

      // Celebration confetti
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.65 }
      })

      playSuccessSound()
      onIncidentSaved(saved)
      onClose()
      setRawText('')
      setPreview(null)
    } catch (e) {
      setErrorMsg('Failed to commit incident to database.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 p-6 rounded-2xl bg-[#0E0E14] border border-white/[0.12] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white text-base">Log a Troubleshooting Fix</h3>
          </div>
          <button
            onClick={() => { playClickSound(); onClose() }}
            className="p-1 rounded-lg text-[#8E8EA0] hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Phase */}
        {!preview ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8E8EA0] mb-2">
                Describe the problem and what you tried in natural language:
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Example: My Wi-Fi disappeared after my Windows 11 laptop woke from sleep. I restarted twice and it didn't help. Then I reset the network adapter in Settings and that fixed it."
                rows={4}
                className="w-full p-3.5 rounded-xl bg-black/50 border border-white/[0.12] text-white placeholder-[#525263] text-xs sm:text-sm focus:outline-none focus:border-blue-500 leading-relaxed transition-colors"
              />
            </div>

            {/* Quick Samples */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-[#525263] mr-1">Autofill:</span>
              {sampleNarratives.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { playClickSound(); setRawText(s.text) }}
                  className="px-2.5 py-1 rounded-full text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#8E8EA0] hover:text-white transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={handleExtract}
                disabled={isExtracting || !rawText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
              >
                {isExtracting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Structuring Memory...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Verification Phase */
          <div className="space-y-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                Verify Extracted Memory
              </span>
              <span className="font-mono text-[#8E8EA0] text-[10px]">
                Source: {preview.source}
              </span>
            </div>

            {/* Inferred Title */}
            <div>
              <label className="block text-[#8E8EA0] mb-1 font-medium">Incident Title</label>
              <input
                type="text"
                value={preview.title}
                onChange={(e) => setPreview({ ...preview, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.1] text-white font-semibold text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Inferred Context Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[#525263] text-[10px] mb-1">Device</label>
                <input
                  type="text"
                  value={preview.device || ''}
                  placeholder="e.g. Laptop"
                  onChange={(e) => setPreview({ ...preview, device: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/[0.08] text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[#525263] text-[10px] mb-1">Operating System</label>
                <input
                  type="text"
                  value={preview.os || ''}
                  placeholder="e.g. Windows 11"
                  onChange={(e) => setPreview({ ...preview, os: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/[0.08] text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[#525263] text-[10px] mb-1">Subsystem</label>
                <input
                  type="text"
                  value={preview.subsystem || ''}
                  placeholder="e.g. Wi-Fi"
                  onChange={(e) => setPreview({ ...preview, subsystem: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/[0.08] text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[#525263] text-[10px] mb-1">Situation</label>
                <input
                  type="text"
                  value={preview.situation || ''}
                  placeholder="e.g. After sleep"
                  onChange={(e) => setPreview({ ...preview, situation: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/[0.08] text-white text-xs"
                />
              </div>
            </div>

            {/* Attempts Ordering & Status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[#8E8EA0] font-medium">Attempted Actions & Outcomes</label>
                <button
                  type="button"
                  onClick={handleAddAttempt}
                  className="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Attempt
                </button>
              </div>

              <div className="space-y-2">
                {preview.attempts.map((att, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white/[0.06] text-[#8E8EA0] flex items-center justify-center font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={att.action}
                        placeholder="Action taken..."
                        onChange={(e) => {
                          const next = [...preview.attempts]
                          next[idx].action = e.target.value
                          setPreview({ ...preview, attempts: next })
                        }}
                        className="flex-1 px-2.5 py-1 rounded bg-black/50 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAttempt(idx)}
                        className="p-1 text-[#525263] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Outcome Toggle Selector */}
                    <div className="flex items-center gap-1.5 pl-7">
                      <button
                        type="button"
                        onClick={() => handleOutcomeChange(idx, 'worked')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                          att.outcome === 'worked'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                            : 'bg-white/[0.03] text-[#8E8EA0] hover:text-white border border-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Worked</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOutcomeChange(idx, 'failed')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                          att.outcome === 'failed'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm shadow-red-500/20'
                            : 'bg-white/[0.03] text-[#8E8EA0] hover:text-white border border-transparent'
                        }`}
                      >
                        <XCircle className="w-3 h-3 text-red-400" />
                        <span>Failed</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOutcomeChange(idx, 'unknown')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                          att.outcome === 'unknown'
                            ? 'bg-white/[0.1] text-white border border-white/[0.2]'
                            : 'bg-white/[0.03] text-[#8E8EA0] hover:text-white border border-transparent'
                        }`}
                      >
                        <HelpCircle className="w-3 h-3 text-[#8E8EA0]" />
                        <span>Unknown</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => { playClickSound(); setPreview(null) }}
                className="text-[#8E8EA0] hover:text-white text-xs"
              >
                Back to Edit Prompt
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !preview.title.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                {isSaving ? (
                  <span>Saving to Memory...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Fix Memory</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
