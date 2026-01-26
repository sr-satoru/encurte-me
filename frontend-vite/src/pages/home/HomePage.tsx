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
    const [urls, setUrls] = useState<UrlItem[]>([
        {
            id: '1',
            name: 'Meu Portfolio',
            url: 'https://meuportfolio.com.br',
            shortUrl: 'redir.io/abc123',
            clicks: 142,
            createdAt: new Date('2024-01-15')
        },
        {
            id: '2',
            name: 'GitHub Profile',
            url: 'https://github.com/usuario',
            shortUrl: 'redir.io/gh-user',
            clicks: 89,
            createdAt: new Date('2024-01-20')
        },
        {
            id: '3',
            name: 'LinkedIn',
            url: 'https://linkedin.com/in/usuario',
            shortUrl: 'redir.io/linkedin',
            clicks: 234,
            createdAt: new Date('2024-01-10')
        }
    ])

    const handleAddUrl = (name: string, url: string) => {
        const newUrl: UrlItem = {
            id: Date.now().toString(),
            name,
            url,
            shortUrl: `redir.io/${Math.random().toString(36).substring(7)}`,
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

    const totalClicks = urls.reduce((acc, url) => acc + url.clicks, 0)
    const avgClicks = urls.length > 0 ? Math.round(totalClicks / urls.length) : 0

    return (
        <AppLayout>
            <div className="home-page">
                <main className="home-main">
                    <div className="home-container">
                        {/* Header */}
                        <div className="page-header">
                            <h1 className="page-title">Dashboard</h1>
                            <button className="btn-add" onClick={() => setIsModalOpen(true)}>
                                <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Novo Link
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-header">
                                    <div className="stat-icon">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </div>
                                    <div className="stat-label">Total de Links</div>
                                </div>
                                <div className="stat-value">{urls.length}</div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-header">
                                    <div className="stat-icon">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                        </svg>
                                    </div>
                                    <div className="stat-label">Total de Cliques</div>
                                </div>
                                <div className="stat-value">{totalClicks}</div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-header">
                                    <div className="stat-icon">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div className="stat-label">Média de Cliques</div>
                                </div>
                                <div className="stat-value">{avgClicks}</div>
                            </div>
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
