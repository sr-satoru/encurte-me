import { useState, FormEvent, useEffect } from 'react'
import './AddUrlModal.css'

interface AddUrlModalProps {
    onClose: () => void
    onSubmit: (name: string, url: string) => void
}

export default function AddUrlModal({ onClose, onSubmit }: AddUrlModalProps) {
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        await new Promise(resolve => setTimeout(resolve, 500))

        onSubmit(name, url)
        setIsLoading(false)
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Criar Novo Link</h2>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        type="button"
                    >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="url-name" className="form-label">
                            Nome do Link
                        </label>
                        <input
                            id="url-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            placeholder="Ex: Meu Portfolio"
                            required
                            autoFocus
                        />
                        <span className="form-hint">
                            Um nome descritivo para identificar seu link
                        </span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="url-link" className="form-label">
                            URL de Destino
                        </label>
                        <input
                            id="url-link"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="form-input"
                            placeholder="https://exemplo.com"
                            required
                        />
                        <span className="form-hint">
                            O endereço completo para onde o link irá redirecionar
                        </span>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="btn-loading">
                                    <span className="spinner"></span>
                                    Criando...
                                </span>
                            ) : (
                                'Criar Link'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
