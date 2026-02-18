import { useState, FormEvent, useEffect } from 'react'
import { toast } from 'sonner'
import { urlsApi, UrlItem } from '@/api/urls'
import './AddUrlModal.css'

interface EditUrlModalProps {
    urlItem: UrlItem
    onClose: () => void
    onUpdated: (updated: UrlItem) => void
}

export default function EditUrlModal({ urlItem, onClose, onUpdated }: EditUrlModalProps) {
    const [name, setName] = useState(urlItem.name || '')
    const [url, setUrl] = useState(urlItem.original_url)
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

        try {
            const updateData: { url?: string; name?: string } = {}

            // Apenas enviar campos que mudaram
            if (url !== urlItem.original_url) {
                updateData.url = url
            }
            if (name !== (urlItem.name || '')) {
                updateData.name = name
            }

            if (Object.keys(updateData).length === 0) {
                toast.info('Nenhuma alteração detectada')
                setIsLoading(false)
                return
            }

            const updated = await urlsApi.update(urlItem.short_code, updateData)
            onUpdated(updated)
            toast.success('Link atualizado com sucesso!')
            onClose()
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar link')
        } finally {
            setIsLoading(false)
        }
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
                    <h2 className="modal-title">Editar Link</h2>
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
                    {/* Short Code (somente leitura) */}
                    <div className="form-group">
                        <label className="form-label">
                            Link Curto
                        </label>
                        <div className="short-code-display">
                            <span className="short-code-badge">{urlItem.short_code}</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-name" className="form-label">
                            Nome do Link
                        </label>
                        <input
                            id="edit-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            placeholder="Nome descritivo para o link"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-url" className="form-label">
                            URL de Destino
                        </label>
                        <input
                            id="edit-url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="form-input"
                            placeholder="https://"
                            required
                        />
                        <span className="form-hint">
                            Ao alterar a URL, o cache Redis será atualizado automaticamente
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
                                    Salvando...
                                </span>
                            ) : (
                                'Salvar Alterações'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
