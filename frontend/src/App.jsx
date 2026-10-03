import { useState, useEffect } from 'react'
import Lenis from 'lenis'
import SmokeShaderBackground from './components/canvas/SmokeShaderBackground'
import LiquidLogo from './components/canvas/LiquidLogo'
import Navbar from './components/Navbar'
import SearchSection from './components/SearchSection'
import HistorySection from './components/HistorySection'
import LogFixModal from './components/LogFixModal'
import SettingsModal from './components/SettingsModal'
import { startTour } from './components/Tour'
import { playSuccessSound } from './utils/audio'

export default function App() {
  const [engineStatus, setEngineStatus] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [searchResult, setSearchResult] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoadingSeed, setIsLoadingSeed] = useState(false)

  // Initialize Lenis Smooth Momentum Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Fetch Health & Incidents on boot
  useEffect(() => {
    fetchHealth()
    fetchIncidents()
  }, [])

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health')
      if (res.ok) {
        const data = await res.json()
        setEngineStatus(data)
      }
    } catch (e) {
      console.warn('Health check fetch failed:', e)
    }
  }

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents')
      if (res.ok) {
        const data = await res.json()
        setIncidents(data)
      }
    } catch (e) {
      console.warn('Incidents fetch failed:', e)
    }
  }

  const handleSearch = async (queryText) => {
    setIsSearching(true)
    setSearchResult(null)

    try {
      const provider = localStorage.getItem('lastfix_provider') || 'auto'
      const apiKey = localStorage.getItem('lastfix_api_key') || ''
      const model = localStorage.getItem('lastfix_model') || ''

      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          provider,
          api_key: apiKey || null,
          model: model || null
        })
      })

      if (res.ok) {
        const data = await res.json()
        setSearchResult(data)
        if (data.found) playSuccessSound()
      }
    } catch (e) {
      console.error('Search error:', e)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDeleteIncident = async (id) => {
    try {
      const res = await fetch(`/api/incidents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setIncidents((prev) => prev.filter((i) => i.id !== id))
        if (searchResult && searchResult.incidents?.some((i) => i.id === id)) {
          setSearchResult(null)
        }
      }
    } catch (e) {
      console.error('Delete error:', e)
    }
  }

  const handleLoadSeedData = async () => {
    setIsLoadingSeed(true)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      if (res.ok) {
        await fetchIncidents()
        await fetchHealth()
      }
    } catch (e) {
      console.error('Seed load error:', e)
    } finally {
      setIsLoadingSeed(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08080C] text-[#EDEDF2] relative flex flex-col font-sans selection:bg-blue-500/30 selection:text-white">
      
      {/* WebGL Smoke Shader Background */}
      <SmokeShaderBackground />

      {/* Navigation Header */}
      <Navbar
        engineStatus={engineStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onStartTour={startTour}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10 flex flex-col items-center pt-8 sm:pt-14 pb-16">
        
        {/* Human Story Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs text-[#8E8EA0] mb-6 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>Built for Tilak & Saumya</span>
          <span className="text-[#525263]">•</span>
          <span className="text-white font-medium">Hacktoberfest 2026</span>
        </div>

        {/* Liquid Metal Logo Hero */}
        <LiquidLogo />

        {/* Search & Evidence-Based Diagnostic Section */}
        <SearchSection
          onSearch={handleSearch}
          isSearching={isSearching}
          searchResult={searchResult}
        />

        {/* Fix Memories & Attempt Timeline Section */}
        <HistorySection
          incidents={incidents}
          onDeleteIncident={handleDeleteIncident}
          onLoadSeedData={handleLoadSeedData}
          isLoadingSeed={isLoadingSeed}
        />

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.08] bg-[#0E0E14]/80 backdrop-blur-xl relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8EA0]">
          
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="LastFix Icon" className="w-4 h-4 rounded" />
            <span className="text-white font-medium">LastFix</span>
            <span className="text-[#525263]">—</span>
            <span>You fixed it before. You just forgot how.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Local & Private Memory</span>
            <span className="text-[#525263]">•</span>
            <a
              href="https://github.com/VaibhavSoni24"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EDEDF2] hover:text-blue-400 transition-colors"
            >
              Created by Vaibhav Soni
            </a>
            <span className="text-[#525263]">•</span>
            <span className="font-mono text-[#525263]">MIT License</span>
          </div>

        </div>
      </footer>

      {/* Modals */}
      <LogFixModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onIncidentSaved={() => {
          fetchIncidents()
          fetchHealth()
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={() => {
          fetchHealth()
        }}
      />

    </div>
  )
}
