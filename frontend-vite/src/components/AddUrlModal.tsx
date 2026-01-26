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
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800))

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
                    <h2 className="modal-title">Adicionar Novo Link</h2>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        type="button"
                    >
                        ✕
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
                            URL Completa
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
                            O link completo que você deseja encurtar
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
