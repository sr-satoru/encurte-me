import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { urlsApi, UrlItem } from '@/api/urls'
import AddUrlModal from '@/components/AddUrlModal'
import EditUrlModal from '@/components/EditUrlModal'
import AppLayout from '@/components/AppLayout'

export default function HomePage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingUrl, setEditingUrl] = useState<UrlItem | null>(null)
    const [urls, setUrls] = useState<UrlItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Carregar URLs do backend
    const loadUrls = useCallback(async () => {
        try {
            const data = await urlsApi.list()
            setUrls(data)
        } catch (error: any) {
            toast.error(error.message || 'Erro ao carregar links')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadUrls()
    }, [loadUrls])

    const handleUrlCreated = (created: UrlItem) => {
        setUrls([created, ...urls])
        setIsAddModalOpen(false)
    }

    const handleUrlUpdated = (updated: UrlItem) => {
        setUrls(urls.map(u => u.short_code === updated.short_code ? updated : u))
        setEditingUrl(null)
    }

    const handleDeleteUrl = async (shortCode: string) => {
        try {
            await urlsApi.delete(shortCode)
            setUrls(urls.filter(u => u.short_code !== shortCode))
            toast.success('Link deletado com sucesso!')
        } catch (error: any) {
            toast.error(error.message || 'Erro ao deletar link')
        }
    }

    const copyToClipboard = (shortCode: string) => {
        const fullUrl = `${window.location.origin}/${shortCode}`
        navigator.clipboard.writeText(fullUrl)
        toast.success('Link copiado com sucesso!')
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR')
    }

    return (
        <AppLayout>
            <div className="home-page">
                <main className="home-main">
                    <div className="home-container">
                        {/* Header */}
                        <div className="page-header">
                            <h1 className="page-title">Links</h1>
                            <button className="btn-add" onClick={() => setIsAddModalOpen(true)}>
                                <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Novo Link
                            </button>
                        </div>

                        {/* URLs Section */}
                        <div className="urls-section">
                            <div className="section-header">
                                <h2 className="section-title">Seus Links</h2>
                            </div>

                            {isLoading ? (
                                <div className="empty-state">
                                    <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto', borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }}></div>
                                    <p style={{ marginTop: '1rem' }}>Carregando links...</p>
                                </div>
                            ) : urls.length === 0 ? (
                                <div className="empty-state">
                                    <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <h4>Nenhum link criado</h4>
                                    <p>Comece criando seu primeiro link encurtado</p>
                                    <button className="btn-add" onClick={() => setIsAddModalOpen(true)}>
                                        <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Criar Link
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop: tabela */}
                                    <div className="urls-table">
                                        <div className="table-header">
                                            <div className="table-row">
                                                <div className="table-cell">Nome</div>
                                                <div className="table-cell">URL Original</div>
                                                <div className="table-cell">Link Curto</div>
                                                <div className="table-cell">Cliques</div>
                                                <div className="table-cell">Ações</div>
                                            </div>
                                        </div>
                                        <div className="table-body">
                                            {urls.map((urlItem) => (
                                                <div key={urlItem.short_code} className="table-row">
                                                    <div className="table-cell">
                                                        <div className="url-name">{urlItem.name || '—'}</div>
                                                        <div className="url-date">{formatDate(urlItem.created_at)}</div>
                                                    </div>
                                                    <div className="table-cell">
                                                        <a href={urlItem.original_url} target="_blank" rel="noopener noreferrer" className="url-link" title={urlItem.original_url}>
                                                            {urlItem.original_url}
                                                        </a>
                                                    </div>
                                                    <div className="table-cell">
                                                        <div className="short-url-container">
                                                            <span className="short-url">{urlItem.short_code}</span>
                                                            <button className="btn-copy" onClick={() => copyToClipboard(urlItem.short_code)} title="Copiar link">
                                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="table-cell url-clicks">{urlItem.clicks}</div>
                                                    <div className="table-cell">
                                                        <div className="table-actions">
                                                            <button className="btn-edit" onClick={() => setEditingUrl(urlItem)} title="Editar link">
                                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </button>
                                                            <button className="btn-delete" onClick={() => handleDeleteUrl(urlItem.short_code)} title="Deletar link">
                                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mobile: cards */}
                                    <div className="url-cards-list">
                                        {urls.map((urlItem) => (
                                            <div key={urlItem.short_code} className="url-card">
                                                <div className="url-card-top">
                                                    <span className="url-card-name">{urlItem.name || urlItem.short_code}</span>
                                                    <div className="url-card-actions">
                                                        <button className="btn-edit" onClick={() => setEditingUrl(urlItem)} title="Editar">
                                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button className="btn-delete" onClick={() => handleDeleteUrl(urlItem.short_code)} title="Deletar">
                                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <a href={urlItem.original_url} target="_blank" rel="noopener noreferrer" className="url-card-destination" title={urlItem.original_url}>
                                                    {urlItem.original_url}
                                                </a>
                                                <div className="url-card-short">
                                                    <span className="short-url">{urlItem.short_code}</span>
                                                    <button className="btn-copy" onClick={() => copyToClipboard(urlItem.short_code)} title="Copiar link">
                                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    </button>
                                                </div>
                                                <div className="url-card-meta">
                                                    <span className="url-card-clicks">
                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
                                                        {urlItem.clicks} cliques
                                                    </span>
                                                    <span className="url-card-date">{formatDate(urlItem.created_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>

                {/* Modal Criar */}
                {isAddModalOpen && (
                    <AddUrlModal
                        onClose={() => setIsAddModalOpen(false)}
                        onCreated={handleUrlCreated}
                    />
                )}

                {/* Modal Editar */}
                {editingUrl && (
                    <EditUrlModal
                        urlItem={editingUrl}
                        onClose={() => setEditingUrl(null)}
                        onUpdated={handleUrlUpdated}
                    />
                )}
            </div>
        </AppLayout>
    )
}
