import { Wrench, ArrowLeft, Search } from 'lucide-react'

export default function NotFound({ onGoHome }) {
  return (
    <div className="min-h-screen bg-[#08080C] text-[#EDEDF2] flex flex-col items-center justify-center p-6 text-center relative z-10">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400 shadow-xl">
        <Wrench className="w-8 h-8" />
      </div>

      <span className="font-mono text-xs uppercase tracking-widest text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
        Troubleshooting Memory Not Found
      </h1>

      <p className="text-sm text-[#8E8EA0] max-w-md mx-auto leading-relaxed mb-8">
        This path doesn't exist in your fix history. You might have navigated to an unrecorded route or cleared incident.
      </p>

      <button
        onClick={onGoHome || (() => window.location.href = '/')}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to LastFix Home</span>
      </button>
    </div>
  )
}
