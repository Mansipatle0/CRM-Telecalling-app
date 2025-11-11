// Client-side call utilities for WebRTC and audio handling

export interface CallSession {
  id: string
  contactId: number
  startTime: Date
  duration: number
}

export class CallManager {
  private sessions: Map<string, CallSession> = new Map()
  private audioContext: AudioContext | null = null

  async initAudio() {
    if (typeof window === "undefined") return
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  async requestMicrophoneAccess() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      return stream
    } catch (error) {
      console.error("Microphone access denied:", error)
      throw error
    }
  }

  createSession(contactId: number): CallSession {
    const session: CallSession = {
      id: "call_" + Math.random().toString(36).substring(7),
      contactId,
      startTime: new Date(),
      duration: 0,
    }
    this.sessions.set(session.id, session)
    return session
  }

  updateDuration(sessionId: string, duration: number) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.duration = duration
    }
  }

  endSession(sessionId: string): CallSession | undefined {
    return this.sessions.get(sessionId)
  }

  clearSession(sessionId: string) {
    this.sessions.delete(sessionId)
  }
}
