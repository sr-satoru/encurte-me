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

    return (
        <AppLayout>
            <div className="home-page">
                {/* Main Content */}
                <main className="home-main">
                    <div className="home-container">
                        {/* Hero Section */}
                        <div className="hero-section">
                            <h2 className="hero-title">Seus Links</h2>
                            <p className="hero-subtitle">Gerencie e monitore todos os seus links encurtados</p>
                            <button
                                className="btn btn-primary btn-add"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <span className="btn-icon-text">
                                    <span className="icon">+</span>
                                    Adicionar Novo Link
                                </span>
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">🔗</div>
                                <div className="stat-content">
                                    <div className="stat-value">{urls.length}</div>
                                    <div className="stat-label">Links Ativos</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">👆</div>
                                <div className="stat-content">
                                    <div className="stat-value">
                                        {urls.reduce((acc, url) => acc + url.clicks, 0)}
                                    </div>
                                    <div className="stat-label">Total de Cliques</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📊</div>
                                <div className="stat-content">
                                    <div className="stat-value">
                                        {urls.length > 0
                                            ? Math.round(urls.reduce((acc, url) => acc + url.clicks, 0) / urls.length)
                                            : 0
                                        }
                                    </div>
                                    <div className="stat-label">Média por Link</div>
                                </div>
                            </div>
                        </div>

                        {/* URLs List */}
                        <div className="urls-section">
                            <h3 className="section-title">Todos os Links</h3>

                            {urls.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🔗</div>
                                    <h4>Nenhum link ainda</h4>
                                    <p>Comece adicionando seu primeiro link encurtado</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        Adicionar Link
                                    </button>
                                </div>
                            ) : (
                                <div className="urls-grid">
                                    {urls.map((urlItem) => (
                                        <div key={urlItem.id} className="url-card">
                                            <div className="url-card-header">
                                                <h4 className="url-name">{urlItem.name}</h4>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteUrl(urlItem.id)}
                                                    title="Deletar"
                                                >
                                                    🗑️
                                                </button>
                                            </div>

                                            <div className="url-details">
                                                <div className="url-detail-item">
                                                    <span className="url-label">Link Original:</span>
                                                    <a
                                                        href={urlItem.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="url-link"
                                                    >
                                                        {urlItem.url}
                                                    </a>
                                                </div>

                                                <div className="url-detail-item">
                                                    <span className="url-label">Link Curto:</span>
                                                    <div className="short-url-container">
                                                        <span className="short-url">{urlItem.shortUrl}</span>
                                                        <button
                                                            className="btn-copy"
                                                            onClick={() => copyToClipboard(urlItem.shortUrl)}
                                                            title="Copiar"
                                                        >
                                                            📋
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="url-card-footer">
                                                <div className="url-stat">
                                                    <span className="stat-icon-small">👆</span>
                                                    <span>{urlItem.clicks} cliques</span>
                                                </div>
                                                <div className="url-date">
                                                    {urlItem.createdAt.toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
