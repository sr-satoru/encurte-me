import { useState, useMemo } from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import AppLayout from '@/components/AppLayout'
import './GraphsPage.css'

interface UrlItem {
    id: string
    name: string
    url: string
    shortUrl: string
    clicks: number
    createdAt: Date
}

// Em um cenário real, esses dados viriam da API. 
// Como o usuário quer "sem dados fictícios", iniciamos com o que temos no estado.
export default function GraphsPage() {
    // Por enquanto, como não temos persistência global de links (vêm da HomePage), 
    // manteremos um estado local vazio para demonstrar a estrutura.
    const [urls] = useState<UrlItem[]>([])
    const [selectedUrlId, setSelectedUrlId] = useState<string | 'all'>('all')

    const chartData = useMemo(() => {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
        // Se não houver URLs, os cliques são zero.
        return days.map(day => ({
            name: day,
            cliques: 0,
        }))
    }, [])

    const barData = useMemo(() => {
        return urls.map(url => ({
            name: url.name.length > 10 ? url.name.substring(0, 10) + '...' : url.name,
            cliques: url.clicks,
            fullId: url.id
        }))
    }, [urls])

    const selectedUrl = urls.find(u => u.id === selectedUrlId)

    return (
        <AppLayout>
            <div className="graphs-page">
                <main className="graphs-main">
                    <div className="graphs-container">
                        <div className="page-header">
                            <div>
                                <h1 className="page-title">Análise de Performance</h1>
                                <p className="page-subtitle">Acompanhe as estatísticas detalhadas dos seus links</p>
                            </div>
                        </div>

                        <div className="graphs-grid">
                            <div className="chart-card main-chart">
                                <div className="chart-header">
                                    <h3>{selectedUrlId === 'all' ? 'Cliques Totais (7 dias)' : `Cliques: ${selectedUrl?.name}`}</h3>
                                    <select
                                        className="chart-select"
                                        value={selectedUrlId}
                                        onChange={(e) => setSelectedUrlId(e.target.value)}
                                        disabled={urls.length === 0}
                                    >
                                        <option value="all">Todos os Links</option>
                                        {urls.map(url => (
                                            <option key={url.id} value={url.id}>{url.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="chart-body">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorCliques" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="cliques" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCliques)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="chart-card side-chart">
                                <div className="chart-header">
                                    <h3>Performance Comparativa</h3>
                                </div>
                                <div className="chart-body">
                                    {urls.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={barData} layout="vertical">
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 11 }} />
                                                <Tooltip cursor={{ fill: 'transparent' }} />
                                                <Bar dataKey="cliques" radius={[0, 4, 4, 0]}>
                                                    {barData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fullId === selectedUrlId ? '#4f46e5' : '#818cf8'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="empty-chart-msg">Sem links para comparar</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AppLayout>
    )
}
