/**
 * LastFix Tactile UI SFX Utility
 * Synthesized entirely via the Web Audio API.
 * 100% self-contained offline, zero external audio asset downloads.
 * Enabled by default with persistent localStorage mute preference.
 */

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      audioCtx = new AudioContext()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function isAudioMuted() {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem('lastfix_audio_muted')
  // Enabled by default (null means not muted)
  return saved === 'true'
}

export function setAudioMuted(muted) {
  if (typeof window === 'undefined') return
  localStorage.setItem('lastfix_audio_muted', muted ? 'true' : 'false')
}

export function playClickSound() {
  if (isAudioMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(320, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04)

  gain.gain.setValueAtTime(0.08, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + 0.045)
}

export function playSuccessSound() {
  if (isAudioMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const notes = [523.25, 659.25, 783.99] // C5, E5, G5
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06)

    gain.gain.setValueAtTime(0.09, ctx.currentTime + idx * 0.06)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime + idx * 0.06)
    osc.stop(ctx.currentTime + idx * 0.06 + 0.23)
  })
}

export function playAlertSound() {
  if (isAudioMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(220, ctx.currentTime)
  osc.frequency.setValueAtTime(180, ctx.currentTime + 0.06)

  gain.gain.setValueAtTime(0.05, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + 0.15)
}

export function playToggleSound() {
  if (isAudioMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.05)

  gain.gain.setValueAtTime(0.07, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + 0.055)
}
