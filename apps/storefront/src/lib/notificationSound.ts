'use client'

/**
 * Notification sound utilities
 * TODO: Implement actual notification sound functionality
 */

let audioContext: AudioContext | null = null

export interface SoundPreferences {
  enabled: boolean
  volume: number
  soundType: 'default' | 'message' | 'alert'
}

class NotificationSoundManager {
  private initialized = false
  private preferences: Record<string, SoundPreferences> = {}

  async initialize() {
    if (this.initialized) return
    
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.warn('Failed to initialize AudioContext:', error)
      }
    }
    
    // Load preferences from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('notificationSoundPreferences')
      if (stored) {
        try {
          this.preferences = JSON.parse(stored)
        } catch (error) {
          console.warn('Failed to parse notification sound preferences:', error)
        }
      }
    }
    
    this.initialized = true
  }

  async playNotificationSound(type: 'default' | 'message' | 'alert' = 'default') {
    if (!this.initialized) {
      await this.initialize()
    }

    const prefs = this.preferences[type] || { enabled: true, volume: 0.5, soundType: type }
    if (!prefs.enabled) return

    console.log(`Playing notification sound: ${type}`)
    
    try {
      if (audioContext && audioContext.state !== 'closed') {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = type === 'alert' ? 800 : 400
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(prefs.volume * 0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      }
    } catch (error) {
      console.warn('Failed to play notification sound:', error)
    }
  }

  updateSoundPreferences(type: 'default' | 'message' | 'alert', preferences: Partial<SoundPreferences>) {
    this.preferences[type] = {
      ...(this.preferences[type] || { enabled: true, volume: 0.5, soundType: type }),
      ...preferences,
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationSoundPreferences', JSON.stringify(this.preferences))
    }
  }

  getAllPreferences(): Record<string, SoundPreferences> {
    return { ...this.preferences }
  }
}

export const notificationSoundManager = new NotificationSoundManager()

export async function showDesktopNotification(
  title: string,
  body?: string,
  soundType?: 'default' | 'message' | 'alert',
  playSound?: boolean,
  onClick?: () => void
) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }

  const options: NotificationOptions = {
    body: body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, options)
    
    // Play sound if requested
    if (playSound !== false && soundType) {
      await notificationSoundManager.playNotificationSound(soundType)
    }
    
    // Add click handler
    if (onClick) {
      notification.onclick = () => {
        onClick()
        notification.close()
      }
    }
    
    return notification
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      const notification = new Notification(title, options)
      
      // Play sound if requested
      if (playSound !== false && soundType) {
        await notificationSoundManager.playNotificationSound(soundType)
      }
      
      // Add click handler
      if (onClick) {
        notification.onclick = () => {
          onClick()
          notification.close()
        }
      }
      
      return notification
    }
  }
}

export function getDesktopNotificationPermissionStatus(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}

export async function requestDesktopNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }
  
  if (Notification.permission === 'default') {
    return await Notification.requestPermission()
  }
  
  return Notification.permission
}

