import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '@/api/auth'

export default function RedirectPage() {
    const { shortCode } = useParams<{ shortCode: string }>()
    const navigate = useNavigate()
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!shortCode) return

        const resolve = async () => {
            try {
                const data = await apiFetch(`/api/urls/resolve/${shortCode}`)
                // Redirecionar para a URL original
                window.location.replace(data.original_url)
            } catch {
                setError(true)
            }
        }

        resolve()
    }, [shortCode])

    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                gap: '1rem',
            }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 700 }}>404</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Link não encontrado</p>
                <button
                    onClick={() => navigate('/launches')}
                    style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                    }}
                >
                    Voltar ao Início
                </button>
            </div>
        )
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--color-background)',
            color: 'var(--color-text-muted)',
            gap: '0.75rem',
        }}>
            <div className="spinner" style={{
                width: 24,
                height: 24,
                border: '3px solid var(--color-border)',
                borderTopColor: 'var(--color-primary)',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
            }}></div>
            Redirecionando...
        </div>
    )
}
