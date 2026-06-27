/**
 * About Page – extension info and credits.
 */

import React from 'react'
import { Shield, ExternalLink, Heart, Zap, Lock, Eye, Globe } from 'lucide-react'
import { EXTENSION_VERSION, EXTENSION_NAME } from '../constants'

const FEATURES = [
  { icon: <Shield size={16} />, label: 'Universal Ad Blocking', desc: 'YouTube, Spotify, Twitch, Facebook & more' },
  { icon: <Eye size={16} />, label: 'Tracker Blocking', desc: 'Google Analytics, Facebook Pixel, TikTok & 50+ trackers' },
  { icon: <Lock size={16} />, label: 'Anti-Fingerprinting', desc: 'Canvas, WebGL, AudioContext, WebRTC & more' },
  { icon: <Zap size={16} />, label: 'Performance Boost', desc: 'Faster browsing by blocking unnecessary requests' },
  { icon: <Globe size={16} />, label: 'Privacy Protection', desc: 'Cookie, localStorage & storage cleaning' },
]

export function AboutPage() {
  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">About</h1>
        <p className="text-sm text-white/50 mt-0.5">PrivacyShield AI Browser Extension</p>
      </div>

      {/* Hero card */}
      <div className="glass rounded-2xl border border-white/8 p-6 mb-5 text-center">
        <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-brand animate-float">
          <Shield size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-black text-white">{EXTENSION_NAME}</h2>
        <p className="text-sm text-white/50 mt-1">Version {EXTENSION_VERSION}</p>
        <p className="text-sm text-white/60 mt-3 max-w-md mx-auto">
          Next-generation AI-powered privacy protection for Chromium browsers.
          Block ads, trackers, and fingerprinting with a beautiful interface.
        </p>

        <div className="flex justify-center gap-3 mt-4">
          <span className="px-3 py-1 rounded-full bg-brand-500/15 text-brand-300 text-xs font-semibold">Manifest V3</span>
          <span className="px-3 py-1 rounded-full bg-accent-500/15 text-accent-300 text-xs font-semibold">React 18</span>
          <span className="px-3 py-1 rounded-full bg-success-500/15 text-success-400 text-xs font-semibold">TypeScript</span>
        </div>
      </div>

      {/* Features */}
      <div className="glass rounded-2xl border border-white/8 p-5 mb-5">
        <h3 className="text-sm font-semibold text-white mb-4">Features</h3>
        <div className="space-y-3">
          {FEATURES.map(f => (
            <div key={f.label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-brand-400">{f.icon}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white/90">{f.label}</div>
                <div className="text-xs text-white/45">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Browser compatibility */}
      <div className="glass rounded-2xl border border-white/8 p-5 mb-5">
        <h3 className="text-sm font-semibold text-white mb-3">Browser Compatibility</h3>
        <div className="flex flex-wrap gap-2">
          {['Chrome 102+', 'Edge 102+', 'Brave', 'Opera', 'Arc', 'Vivaldi'].map(browser => (
            <span key={browser} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
              {browser}
            </span>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="glass rounded-2xl border border-white/8 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Built With</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/50">
          {[
            'React 18', 'TypeScript', 'Vite 5', 'Tailwind CSS v3',
            'Manifest V3', '@crxjs/vite-plugin', 'Zustand', 'Lucide React',
          ].map(tech => (
            <div key={tech} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              {tech}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/8 flex items-center gap-1.5 text-xs text-white/30">
          <Heart size={11} className="text-danger-400" />
          Built with love for privacy
        </div>
      </div>
    </div>
  )
}
