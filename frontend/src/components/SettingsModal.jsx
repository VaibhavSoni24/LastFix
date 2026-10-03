import { useState, useEffect } from 'react'
import { X, Key, Cpu, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { playClickSound, playSuccessSound } from '../utils/audio'

export default function SettingsModal({ isOpen, onClose, onSettingsSaved }) {
  const [provider, setProvider] = useState(() => localStorage.getItem('lastfix_provider') || 'auto')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('lastfix_api_key') || '')
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('lastfix_model') || '')
  
  const [models, setModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)

  useEffect(() => {
    if (isOpen && provider !== 'auto' && provider !== 'fallback') {
      fetchDiscoveredModels(provider, apiKey)
    }
  }, [isOpen, provider])

  const fetchDiscoveredModels = async (prov, key) => {
    if (prov === 'auto' || prov === 'fallback') return
    setLoadingModels(true)
    setStatusMsg(null)
    try {
      const q = new URLSearchParams({ provider: prov })
      if (key) q.append('api_key', key)
      const res = await fetch(`/api/models?${q.toString()}`)
      const data = await res.json()
      if (data.models && data.models.length > 0) {
        setModels(data.models)
        if (!selectedModel || !data.models.includes(selectedModel)) {
          setSelectedModel(data.recommended_model || data.models[0])
        }
        setStatusMsg({ type: 'success', text: `Discovered ${data.models.length} model(s) on ${prov.toUpperCase()}` })
      } else {
        setModels([])
        setStatusMsg({ type: 'info', text: data.status === 'api_key_required' ? 'Enter API key to discover models' : data.status })
      }
    } catch (e) {
      setStatusMsg({ type: 'error', text: 'Failed to connect to model catalog' })
    } finally {
      setLoadingModels(false)
    }
  }

  const handleSave = () => {
    localStorage.setItem('lastfix_provider', provider)
    localStorage.setItem('lastfix_api_key', apiKey)
    localStorage.setItem('lastfix_model', selectedModel)
    playSuccessSound()
    if (onSettingsSaved) {
      onSettingsSaved({ provider, apiKey, model: selectedModel })
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#0E0E14] border border-white/[0.12] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white text-base">AI Engine & Cloud Settings</h3>
          </div>
          <button
            onClick={() => { playClickSound(); onClose() }}
            className="p-1 rounded-lg text-[#8E8EA0] hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs">
          
          {/* Provider Selection */}
          <div>
            <label className="block text-[#8E8EA0] font-medium mb-1.5">
              Active AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => {
                const next = e.target.value
                setProvider(next)
                fetchDiscoveredModels(next, apiKey)
              }}
              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/[0.12] text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="auto">Auto (Local Ollama → Cloud Key → Local Fallback)</option>
              <option value="ollama">Local Ollama (Gemma 3 4B)</option>
              <option value="groq">Groq Cloud (Llama 3.3 / Gemma)</option>
              <option value="mercury">Inception Labs Mercury (Diffusion LLM)</option>
              <option value="gemini">Google Gemini (Flash / Pro)</option>
              <option value="openai">OpenAI ChatGPT (GPT-4o / mini)</option>
              <option value="claude">Anthropic Claude (Sonnet / Haiku)</option>
              <option value="fallback">Local Deterministic Engine (Offline Rule Matcher)</option>
            </select>
          </div>

          {/* API Key Input */}
          {provider !== 'ollama' && provider !== 'fallback' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[#8E8EA0] font-medium">
                  {provider.toUpperCase()} API Key
                </label>
                <button
                  type="button"
                  onClick={() => fetchDiscoveredModels(provider, apiKey)}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingModels ? 'animate-spin' : ''}`} />
                  Detect Models
                </button>
              </div>
              <div className="relative">
                <Key className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#525263]" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${provider} API key...`}
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/50 border border-white/[0.12] text-white placeholder-[#525263] focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>
            </div>
          )}

          {/* Dynamic Model Dropdown */}
          {models.length > 0 && (
            <div>
              <label className="block text-[#8E8EA0] font-medium mb-1.5">
                Auto-Discovered Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/[0.12] text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <p className="text-[10px] text-[#525263] mt-1">
                Discovered live from provider API catalog. Zero code updates needed for newly released models.
              </p>
            </div>
          )}

          {/* Status Message */}
          {statusMsg && (
            <div className={`p-2.5 rounded-lg flex items-center gap-2 text-[11px] ${
              statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
              statusMsg.type === 'error' ? 'bg-red-500/10 text-red-300 border border-red-500/20' :
              'bg-blue-500/10 text-blue-300 border border-blue-500/20'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[#8E8EA0] text-[11px] leading-relaxed">
            <strong className="text-white font-medium">Privacy Notice:</strong> Cloud AI can require personal troubleshooting data to leave the user's device. LastFix keeps this memory local by default via Ollama.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-white/[0.08]">
          <button
            onClick={() => { playClickSound(); onClose() }}
            className="px-3.5 py-1.5 rounded-lg text-xs text-[#8E8EA0] hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
          >
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  )
}
