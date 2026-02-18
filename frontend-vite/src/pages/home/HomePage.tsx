import { useState } from 'react'
import './HomePage.css'
import AddUrlModal from '@/components/AddUrlModal'
import AppLayout from '@/components/AppLayout'

interface UrlItem {
    id: string
    name: string
    url: string
    shortUrl: string
    clicks: number
    createdAt: Date
}

export default function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [urls, setUrls] = useState<UrlItem[]>([])

    const handleAddUrl = (name: string, url: string) => {
        const newUrl: UrlItem = {
            id: Date.now().toString(),
            name,
            url,
            shortUrl: '', // Será preenchido pelo backend
            clicks: 0,
            createdAt: new Date()
        }
        setUrls([newUrl, ...urls])
        setIsModalOpen(false)
    }

    const handleDeleteUrl = (id: string) => {
        setUrls(urls.filter(url => url.id !== id))
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('Link copiado!')
    }

    return (
        <AppLayout>
            <div className="home-page">
                <main className="home-main">
                    <div className="home-container">
                        {/* Header */}
                        <div className="page-header">
                            <h1 className="page-title">Links</h1>
                            <button className="btn-add" onClick={() => setIsModalOpen(true)}>
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

                            {urls.length === 0 ? (
                                <div className="empty-state">
                                    <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <h4>Nenhum link criado</h4>
                                    <p>Comece criando seu primeiro link encurtado</p>
                                    <button className="btn-add" onClick={() => setIsModalOpen(true)}>
                                        <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Criar Link
                                    </button>
                                </div>
                            ) : (
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
                                            <div key={urlItem.id} className="table-row">
                                                <div className="table-cell">
                                                    <div className="url-name">{urlItem.name}</div>
                                                    <div className="url-date">
                                                        {urlItem.createdAt.toLocaleDateString('pt-BR')}
                                                    </div>
                                                </div>
                                                <div className="table-cell">
                                                    <a
                                                        href={urlItem.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="url-link"
                                                        title={urlItem.url}
                                                    >
                                                        {urlItem.url}
                                                    </a>
                                                </div>
                                                <div className="table-cell">
                                                    <div className="short-url-container">
                                                        <span className="short-url">{urlItem.shortUrl}</span>
                                                        <button
                                                            className="btn-copy"
                                                            onClick={() => copyToClipboard(urlItem.shortUrl)}
                                                            title="Copiar link"
                                                        >
                                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="table-cell url-clicks">{urlItem.clicks}</div>
                                                <div className="table-cell">
                                                    <div className="table-actions">
                                                        <button
                                                            className="btn-delete"
                                                            onClick={() => handleDeleteUrl(urlItem.id)}
                                                            title="Deletar link"
                                                        >
                                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Modal */}
                {isModalOpen && (
                    <AddUrlModal
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={handleAddUrl}
                    />
                )}
            </div>
        </AppLayout>
    )
}
