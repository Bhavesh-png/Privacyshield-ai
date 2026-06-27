/**
 * Anti-Fingerprinting Content Script
 * Injects noise and overrides APIs to prevent browser fingerprinting.
 * Must run at document_start before any page scripts execute.
 */

import type { ExtensionSettings } from '../types'

// ============================================================
// Canvas Fingerprint Protection
// ============================================================

function protectCanvas(): void {
  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData

  CanvasRenderingContext2D.prototype.getImageData = function (
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    ...args: [ImageDataSettings?]
  ): ImageData {
    const imageData = originalGetImageData.call(this, sx, sy, sw, sh, ...args)
    // Add subtle noise to pixel data – imperceptible to human eye
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (Math.random() < 0.05) {
        imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + (Math.random() > 0.5 ? 1 : -1)))
      }
    }
    return imageData
  }

  // Override toDataURL to inject noise
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL
  HTMLCanvasElement.prototype.toDataURL = function (...args: Parameters<typeof originalToDataURL>): string {
    const ctx = this.getContext('2d')
    if (ctx) {
      try {
        const imageData = ctx.getImageData(0, 0, this.width || 1, this.height || 1)
        const idx = Math.floor(Math.random() * imageData.data.length / 4) * 4
        if (idx < imageData.data.length) {
          imageData.data[idx] = Math.min(255, Math.max(0, imageData.data[idx] + 1))
          ctx.putImageData(imageData, 0, 0)
        }
      } catch {
        // Skip if canvas is tainted or empty
      }
    }
    return originalToDataURL.apply(this, args)
  }
}

// ============================================================
// WebGL Fingerprint Protection
// ============================================================

function protectWebGL(): void {
  const getParamOriginal = WebGLRenderingContext.prototype.getParameter

  WebGLRenderingContext.prototype.getParameter = function (parameter: GLenum): unknown {
    if (parameter === 37445) return 'Intel Open Source Technology Center'
    if (parameter === 37446) return 'Mesa DRI Intel(R) HD Graphics'
    return getParamOriginal.call(this, parameter)
  }

  if (typeof WebGL2RenderingContext !== 'undefined') {
    const getParam2Original = WebGL2RenderingContext.prototype.getParameter
    WebGL2RenderingContext.prototype.getParameter = function (parameter: GLenum): unknown {
      if (parameter === 37445) return 'Intel Open Source Technology Center'
      if (parameter === 37446) return 'Mesa DRI Intel(R) HD Graphics'
      return getParam2Original.call(this, parameter)
    }
  }
}

// ============================================================
// AudioContext Fingerprint Protection
// ============================================================

function protectAudioContext(): void {
  if (typeof AudioContext === 'undefined') return

  const AudioContextClass = AudioContext
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalGetChannelData = AudioBuffer.prototype.getChannelData

  AudioBuffer.prototype.getChannelData = function (channel: number): Float32Array<ArrayBuffer> {
    const data = originalGetChannelData.call(this, channel) as Float32Array<ArrayBuffer>
    const result = new Float32Array(data.length)
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] + (i % 100 === 0 ? Math.random() * 0.0000001 : 0)
    }
    return result
  }

  const originalCreateAnalyser = AudioContextClass.prototype.createAnalyser
  AudioContextClass.prototype.createAnalyser = function () {
    const analyser = originalCreateAnalyser.call(this)
    const originalGetFloat = analyser.getFloatFrequencyData.bind(analyser)
    analyser.getFloatFrequencyData = function (array: Float32Array<ArrayBuffer>) {
      originalGetFloat(array as unknown as Float32Array<ArrayBuffer>)
      for (let i = 0; i < array.length; i++) {
        array[i] += Math.random() * 0.1
      }
    }
    return analyser
  }
}

// ============================================================
// Hardware Concurrency Protection
// ============================================================

function protectHardwareConcurrency(): void {
  try {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => 4,
      configurable: true,
    })
  } catch {
    // Already defined non-configurable
  }
}

// ============================================================
// Device Memory Protection
// ============================================================

function protectDeviceMemory(): void {
  if (!('deviceMemory' in navigator)) return
  try {
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => 8,
      configurable: true,
    })
  } catch {
    // Already defined
  }
}

// ============================================================
// Media Devices Protection
// ============================================================

function protectMediaDevices(): void {
  if (!navigator.mediaDevices?.enumerateDevices) return

  const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices)
  try {
    Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
      value: async () => {
        const devices = await originalEnumerateDevices()
        return devices.map(device => ({
          deviceId: 'default',
          kind: device.kind,
          label: '',
          groupId: 'default',
          toJSON: () => ({}),
        }))
      },
      configurable: true,
    })
  } catch {
    // Already defined
  }
}

// ============================================================
// WebRTC IP Leak Protection
// ============================================================

function protectWebRTC(): void {
  if (typeof RTCPeerConnection === 'undefined') return

  const OriginalRTC = RTCPeerConnection
  // Override constructor to strip STUN/TURN servers
  const patchedRTC = function (config?: RTCConfiguration) {
    const safe: RTCConfiguration = { ...config, iceServers: [] }
    return new OriginalRTC(safe)
  }
  patchedRTC.prototype = OriginalRTC.prototype
  try {
    // @ts-expect-error override global
    window.RTCPeerConnection = patchedRTC
  } catch {
    // Cannot override in this context
  }
}

// ============================================================
// Font Enumeration Protection
// ============================================================

function protectFonts(): void {
  if (!('queryLocalFonts' in window)) return
  try {
    Object.defineProperty(window, 'queryLocalFonts', {
      value: async () => [],
      configurable: true,
    })
  } catch {
    // Already defined
  }
}

// ============================================================
// Battery API Protection
// ============================================================

function protectBattery(): void {
  // Battery API types vary by browser – use optional chaining safely
  const nav = navigator as Navigator & { getBattery?: () => Promise<unknown> }
  if (!nav.getBattery) return

  const original = nav.getBattery.bind(navigator)
  try {
    Object.defineProperty(navigator, 'getBattery', {
      value: () => original().then((battery: unknown) => {
        const b = battery as { level: number; charging: boolean; chargingTime: number; dischargingTime: number }
        return {
          ...b,
          level: Math.round(b.level * 10) / 10,
          chargingTime: Infinity,
          dischargingTime: Infinity,
        }
      }),
      configurable: true,
    })
  } catch {
    // Already defined
  }
}

// ============================================================
// Main initialization
// ============================================================

export function initAntiFingerprint(settings: ExtensionSettings['fingerprint']): void {
  try {
    if (settings.canvas) protectCanvas()
    if (settings.webgl) protectWebGL()
    if (settings.audioContext) protectAudioContext()
    if (settings.battery) protectBattery()
    if (settings.hardwareConcurrency) protectHardwareConcurrency()
    if (settings.deviceMemory) protectDeviceMemory()
    if (settings.mediaDevices) protectMediaDevices()
    if (settings.webRTC) protectWebRTC()
    if (settings.fonts) protectFonts()

    console.debug('[PrivacyShield] Anti-fingerprinting active')
  } catch (err) {
    console.error('[PrivacyShield] Anti-fingerprint error:', err)
  }
}
