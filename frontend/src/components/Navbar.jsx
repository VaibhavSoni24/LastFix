import { useState } from 'react'
import { Volume2, VolumeX, Settings, Plus, Sparkles, HelpCircle, Terminal } from 'lucide-react'
import { isAudioMuted, setAudioMuted, playClickSound, playToggleSound } from '../utils/audio'

export default function Navbar({
  engineStatus,
  onOpenSettings,
  onOpenLogModal,
  onStartTour
}) {
  const [muted, setMuted] = useState(isAudioMuted())
  const [showOllamaHelp, setShowOllamaHelp] = useState(false)

  const handleToggleMute = () => {
    const nextState = !muted
    setMuted(nextState)
    setAudioMuted(nextState)
    if (!nextState) playToggleSound()
  }

  const isOllamaConnected = engineStatus?.ollama_connected
  const activeModel = engineStatus?.ollama_model || 'gemma3:4b'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#08080C]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Link */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.svg"
              alt="LastFix Logo"
              className="w-8 h-8 rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              LastFix
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v1.0
              </span>
            </span>
          </a>

          {/* AI Engine Status Pill */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowOllamaHelp(!showOllamaHelp)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#8E8EA0] hover:text-[#EDEDF2] transition-colors"
              title="Click for AI Engine connection status"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOllamaConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400/80'
                }`}
              />
              <span>
                {isOllamaConnected ? `Gemma 3 4B — Connected` : `Gemma Offline`}
              </span>
            </button>

            {/* Offline Helper Popover */}
            {showOllamaHelp && !isOllamaConnected && (
              <div className="absolute top-10 left-0 w-72 p-3.5 rounded-xl bg-[#0E0E14] border border-white/[0.12] shadow-2xl z-50 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-white mb-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  Local Gemma 3 4B Setup
                </div>
                <p className="text-[#8E8EA0] mb-2 leading-relaxed">
                  Start Ollama locally to run 100% private on-device inference:
                </p>
                <div className="p-2 rounded bg-black/60 border border-white/[0.08] font-mono text-[11px] text-emerald-400 mb-2 select-all">
                  ollama run gemma3:4b
                </div>
                <p className="text-[#525263] text-[11px]">
                  (LastFix is currently using the zero-dependency local deterministic engine and cloud keys).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Audio Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-lg text-[#8E8EA0] hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            title={muted ? 'Unmute UI Sound Effects' : 'Mute UI Sound Effects'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400/80" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
          </button>

          {/* Product Tour Trigger */}
          <button
            onClick={() => { playClickSound(); onStartTour() }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#8E8EA0] hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            title="Interactive Product Walkthrough"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Tour</span>
          </button>

          {/* AI Settings Trigger */}
          <button
            id="tour-settings"
            onClick={() => { playClickSound(); onOpenSettings() }}
            className="p-2 rounded-lg text-[#8E8EA0] hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            title="Configure Cloud AI Keys (Gemini, Groq, Mercury, OpenAI, Claude)"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Log Fix Primary Action Button */}
          <button
            id="tour-log-fix"
            onClick={() => { playClickSound(); onOpenLogModal() }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log a Fix</span>
          </button>

          {/* GitHub Source Link */}
          <a
            href="https://github.com/VaibhavSoni24/LastFix"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#8E8EA0] hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  )
}
