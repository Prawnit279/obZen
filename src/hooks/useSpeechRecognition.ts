import { useState, useEffect, useCallback, useRef } from 'react'
import { parseIntent } from '@/lib/intent-parser'
import type { SpeechResult } from '@/lib/speech-recognition'

// Web Speech API is not in every TS lib target — define a minimal interface
interface SRResult {
  isFinal: boolean
  [i: number]: { transcript: string; confidence: number }
}

interface SREvent  { results: SRResult[] }
interface SRError  { error: string }

interface ISpeechRecognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart:  (() => void) | null
  onresult: ((e: SREvent) => void) | null
  onerror:  ((e: SRError) => void) | null
  onend:    (() => void) | null
  start():  void
  stop():   void
  abort():  void
}

type SpeechRecognitionCtor = new () => ISpeechRecognition

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useSpeechRecognition() {
  const [isListening, setIsListening]   = useState(false)
  const [transcript, setTranscript]     = useState('')
  const [result, setResult]             = useState<SpeechResult | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [supported, setSupported]       = useState(false)

  const recognizerRef = useRef<ISpeechRecognition | null>(null)

  useEffect(() => {
    setSupported(getSpeechRecognitionCtor() !== null)
    return () => {
      recognizerRef.current?.abort()
    }
  }, [])

  const startListening = useCallback(() => {
    const SR = getSpeechRecognitionCtor()
    if (!SR) { setError('not-supported'); return }

    // Abort any in-progress session
    recognizerRef.current?.abort()

    const r = new SR()
    recognizerRef.current = r
    r.lang            = 'en-US'
    r.continuous      = false
    r.interimResults  = true
    r.maxAlternatives = 1

    r.onstart = () => {
      setIsListening(true)
      setTranscript('')
      setResult(null)
      setError(null)
    }

    r.onresult = (e: SREvent) => {
      const t = e.results[0][0].transcript
      const c = e.results[0][0].confidence
      setTranscript(t)
      if (e.results[0].isFinal) {
        setResult({ transcript: t, confidence: c, intent: parseIntent(t) })
        setIsListening(false)
      }
    }

    r.onerror = (e: SRError) => {
      setError(e.error)
      setIsListening(false)
    }

    r.onend = () => setIsListening(false)

    r.start()
  }, [])

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop()
    setIsListening(false)
  }, [])

  const reset = useCallback(() => {
    recognizerRef.current?.abort()
    setIsListening(false)
    setTranscript('')
    setResult(null)
    setError(null)
  }, [])

  return { isListening, transcript, result, error, supported, startListening, stopListening, reset }
}
