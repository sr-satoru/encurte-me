/**
 * Hook unificado de Captcha — suporta Google reCAPTCHA v2 e Cloudflare Turnstile.
 *
 * Detecta automaticamente qual provider usar baseado nas env vars:
 * - VITE_TURNSTILE_SITE_KEY → Cloudflare Turnstile
 * - VITE_RECAPTCHA_SITE_KEY → Google reCAPTCHA v2 Invisible
 * - Nenhuma → dev mode (retorna null, backend aceita)
 *
 * Prioridade: Turnstile > reCAPTCHA
 */

import { useRef, useCallback, useEffect } from 'react'

const TURNSTILE_KEY = (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || ''
const RECAPTCHA_KEY = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY || ''

// Detectar provider
const PROVIDER: 'turnstile' | 'recaptcha' | 'none' =
    TURNSTILE_KEY ? 'turnstile' :
        RECAPTCHA_KEY ? 'recaptcha' :
            'none'

// ========== Type declarations ==========

declare global {
    interface Window {
        grecaptcha: {
            ready: (cb: () => void) => void
            execute: (widgetIdOrKey: number | string, options?: { action: string }) => Promise<string> | void
            render: (container: string | HTMLElement, params: any) => number
            reset: (widgetId?: number) => void
            getResponse: (widgetId?: number) => string
        }
        turnstile: {
            ready: (cb: () => void) => void
            render: (container: string | HTMLElement, params: any) => string
            reset: (widgetId?: string) => void
            remove: (widgetId?: string) => void
            getResponse: (widgetId?: string) => string | undefined
        }
        onRecaptchaLoad?: () => void
        onTurnstileLoad?: () => void
    }
}

// ========== Script Loaders ==========

let recaptchaLoaded = false
let turnstileLoaded = false

function loadRecaptchaScript(): Promise<void> {
    if (recaptchaLoaded || !RECAPTCHA_KEY) return Promise.resolve()
    return new Promise((resolve) => {
        if (document.querySelector('script[src*="recaptcha"]')) {
            recaptchaLoaded = true
            resolve()
            return
        }
        window.onRecaptchaLoad = () => { recaptchaLoaded = true; resolve() }
        const s = document.createElement('script')
        s.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`
        s.async = true; s.defer = true
        document.head.appendChild(s)
    })
}

function loadTurnstileScript(): Promise<void> {
    if (turnstileLoaded || !TURNSTILE_KEY) return Promise.resolve()
    return new Promise((resolve) => {
        if (document.querySelector('script[src*="turnstile"]')) {
            turnstileLoaded = true
            resolve()
            return
        }
        window.onTurnstileLoad = () => { turnstileLoaded = true; resolve() }
        const s = document.createElement('script')
        s.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit`
        s.async = true; s.defer = true
        document.head.appendChild(s)
    })
}

// ========== Unified Hook ==========

export function useCaptcha() {
    const recaptchaWidgetId = useRef<number | null>(null)
    const turnstileWidgetId = useRef<string | null>(null)
    const resolveRef = useRef<((token: string) => void) | null>(null)

    useEffect(() => {
        if (PROVIDER === 'recaptcha') loadRecaptchaScript()
        if (PROVIDER === 'turnstile') loadTurnstileScript()
    }, [])

    const renderWidget = useCallback((container: HTMLDivElement) => {
        if (!container) return

        if (PROVIDER === 'recaptcha' && recaptchaWidgetId.current === null) {
            loadRecaptchaScript().then(() => {
                if (!window.grecaptcha || recaptchaWidgetId.current !== null) return
                window.grecaptcha.ready(() => {
                    recaptchaWidgetId.current = window.grecaptcha.render(container, {
                        sitekey: RECAPTCHA_KEY,
                        size: 'invisible',
                        callback: (token: string) => {
                            resolveRef.current?.(token)
                            resolveRef.current = null
                        },
                    })
                })
            })
        }

        if (PROVIDER === 'turnstile' && turnstileWidgetId.current === null) {
            loadTurnstileScript().then(() => {
                if (!window.turnstile || turnstileWidgetId.current !== null) return
                window.turnstile.ready(() => {
                    turnstileWidgetId.current = window.turnstile.render(container, {
                        sitekey: TURNSTILE_KEY,
                        callback: (token: string) => {
                            resolveRef.current?.(token)
                            resolveRef.current = null
                        },
                    })
                })
            })
        }
    }, [])

    const execute = useCallback(async (): Promise<string | null> => {
        if (PROVIDER === 'none') return null

        if (PROVIDER === 'recaptcha') {
            if (recaptchaWidgetId.current === null) return null
            return new Promise((resolve) => {
                resolveRef.current = resolve
                window.grecaptcha.reset(recaptchaWidgetId.current!)
                window.grecaptcha.execute(recaptchaWidgetId.current!)
            })
        }

        if (PROVIDER === 'turnstile') {
            if (turnstileWidgetId.current === null) return null
            // Turnstile auto-executa, pegar o token direto
            const existing = window.turnstile.getResponse(turnstileWidgetId.current!)
            if (existing) return existing
            // Se não tem token ainda, esperar o callback
            return new Promise((resolve) => {
                resolveRef.current = resolve
                window.turnstile.reset(turnstileWidgetId.current!)
            })
        }

        return null
    }, [])

    return { renderWidget, execute, provider: PROVIDER, isEnabled: PROVIDER !== 'none' }
}
