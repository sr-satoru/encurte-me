import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '@/api/auth'

export default function RedirectPage() {
    const { shortCode } = useParams<{ shortCode: string }>()
    const navigate = useNavigate()
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!shortCode) return

        apiFetch(`/api/urls/resolve/${shortCode}`)
            .then((data) => {
                window.location.replace(data.original_url)
            })
            .catch(() => {
                setError(true)
            })
    }, [shortCode])

    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#0a0a0a',
                color: '#fff',
                gap: '1rem',
            }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 700 }}>404</h1>
                <p style={{ color: '#888' }}>Link não encontrado</p>
                <button
                    onClick={() => navigate('/launches')}
                    style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: '#4f46e5',
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

    // Sem spinner, sem animação — tela vazia até o redirect acontecer
    return null
}
