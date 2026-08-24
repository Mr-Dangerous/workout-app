let ctx = null

function getCtx() {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function beep(freq = 440, duration = 0.1, volume = 0.5) {
  try {
    const context = getCtx()
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.frequency.value = freq
    gainNode.gain.setValueAtTime(volume, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration)
    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + duration)
  } catch (e) {
    console.warn('Audio error:', e)
  }
}

export function countdownBeep(secondsLeft) {
  if (secondsLeft === 1) {
    beep(880, 0.3, 0.8)
  } else if (secondsLeft <= 5) {
    beep(440, 0.1, 0.5)
  }
}

export function resumeContext() {
  if (ctx && ctx.state === 'suspended') ctx.resume()
}
