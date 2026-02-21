import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import AppLayout from '@/components/AppLayout'
import { urlsApi, DashboardData } from '@/api/urls'

// Cores distintas para cada link
const LINE_COLORS = [
    '#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#06b6d4',
    '#f43f5e', '#8b5cf6', '#14b8a6', '#f97316', '#6366f1',
]

export default function GraphsPage() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedShortCode, setSelectedShortCode] = useState<string>('')
    const [showAll, setShowAll] = useState(false)

    const loadDashboard = useCallback(async () => {
        try {
            const data = await urlsApi.dashboard()
            setDashboard(data)
            if (data.urls.length > 0 && !selectedShortCode) {
                setSelectedShortCode(data.urls[0].short_code)
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro ao carregar métricas')
        } finally {
            setIsLoading(false)
        }
    }, [selectedShortCode])

    useEffect(() => {
        loadDashboard()
    }, [loadDashboard])

    const urls = dashboard?.urls || []
    const selectedUrl = urls.find(u => u.short_code === selectedShortCode)

    // Coletar todos os dias únicos (últimos 7 dias)
    const last7Days = useMemo(() => {
        const days: string[] = []
        const now = new Date()
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            days.push(d.toISOString().split('T')[0])
        }
        return days
    }, [])

    // Dados do gráfico de linhas: eixo X = dias, linhas = links
    const lineChartData = useMemo(() => {
        const visibleUrls = showAll ? urls : (selectedUrl ? [selectedUrl] : [])

        return last7Days.map(day => {
            const point: Record<string, any> = {
                name: new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
                fullDate: day,
            }
            for (const url of visibleUrls) {
                const label = url.name || url.short_code
                point[label] = url.daily_clicks?.[day] || 0
            }
            return point
        })
    }, [last7Days, urls, showAll, selectedUrl])

    // Nomes das linhas (para renderizar dinamicamente)
    const lineNames = useMemo(() => {
        const visibleUrls = showAll ? urls : (selectedUrl ? [selectedUrl] : [])
        return visibleUrls.map(u => u.name || u.short_code)
    }, [urls, showAll, selectedUrl])

    // Dados de horários com mais cliques (distribuição por hora)
    const hourlyData = useMemo(() => {
        const hours: { hora: string; cliques: number }[] = []
        const hourMap = dashboard?.all_hourly || {}

        for (let h = 0; h < 24; h++) {
            const key = String(h)
            hours.push({
                hora: `${h.toString().padStart(2, '0')}h`,
                cliques: hourMap[key] || 0,
            })
        }
        return hours
    }, [dashboard])

    // Hora de pico
    const peakHour = useMemo(() => {
        const max = hourlyData.reduce((best, h) => h.cliques > best.cliques ? h : best, hourlyData[0])
        return max
    }, [hourlyData])

    if (isLoading) {
        return (
            <AppLayout>
                <div className="graphs-page">
                    <main className="graphs-main">
                        <div className="graphs-loading">
                            <div className="spinner" style={{
                                width: 32, height: 32,
                                border: '3px solid var(--color-border)',
                                borderTopColor: 'var(--color-primary)',
                                borderRadius: '50%',
                                animation: 'spin 0.6s linear infinite',
                            }}></div>
                            <p>Carregando métricas...</p>
                        </div>
                    </main>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="graphs-page">
                <main className="graphs-main">
                    <div className="graphs-container">
                        {/* Header */}
                        <div className="page-header">
                            <div>
                                <h1 className="page-title">Análise de Performance</h1>
                                <p className="page-subtitle">Estatísticas em tempo real dos seus links</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="stats-row">
                            <div className="stat-card-mini">
                                <span className="stat-card-label">Total de Links</span>
                                <span className="stat-card-value">{dashboard?.total_urls || 0}</span>
                            </div>
                            <div className="stat-card-mini">
                                <span className="stat-card-label">Total de Cliques</span>
                                <span className="stat-card-value">{dashboard?.total_clicks || 0}</span>
                            </div>
                            <div className="stat-card-mini">
                                <span className="stat-card-label">Horário de Pico</span>
                                <span className="stat-card-value">
                                    {peakHour && peakHour.cliques > 0 ? peakHour.hora : '—'}
                                </span>
                            </div>
                        </div>

                        {urls.length === 0 ? (
                            <div className="empty-chart-msg" style={{ padding: '4rem 2rem' }}>
                                <p>Sem links criados ainda. Crie links na página inicial para ver métricas aqui.</p>
                            </div>
                        ) : (
                            <>
                                {/* Gráfico de Linhas — Cliques por Dia */}
                                <div className="chart-card">
                                    <div className="chart-header">
                                        <h3>Cliques por Dia (7 dias)</h3>
                                        <div className="chart-controls">
                                            <label className="switch-label">
                                                <span className="switch-text">Todos</span>
                                                <div className={`switch-track ${showAll ? 'active' : ''}`} onClick={() => setShowAll(!showAll)}>
                                                    <div className="switch-thumb"></div>
                                                </div>
                                            </label>

                                            {!showAll && (
                                                <select
                                                    className="chart-select"
                                                    value={selectedShortCode}
                                                    onChange={(e) => setSelectedShortCode(e.target.value)}
                                                >
                                                    {urls.map(url => (
                                                        <option key={url.short_code} value={url.short_code}>
                                                            {url.name || url.short_code}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                    <div className="chart-body">
                                        <ResponsiveContainer width="100%" height={350}>
                                            <LineChart data={lineChartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.12)" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    allowDecimals={false}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '12px',
                                                        border: 'none',
                                                        boxShadow: '0 8px 24px rgb(0 0 0 / 0.15)',
                                                        background: 'var(--color-surface)',
                                                        color: 'var(--color-text-primary)',
                                                        padding: '12px 16px',
                                                    }}
                                                />
                                                {lineNames.map((name, i) => (
                                                    <Line
                                                        key={name}
                                                        type="monotone"
                                                        dataKey={name}
                                                        stroke={LINE_COLORS[i % LINE_COLORS.length]}
                                                        strokeWidth={2.5}
                                                        dot={{ fill: LINE_COLORS[i % LINE_COLORS.length], strokeWidth: 0, r: 4 }}
                                                        activeDot={{ r: 6, fill: LINE_COLORS[i % LINE_COLORS.length], stroke: '#fff', strokeWidth: 2 }}
                                                        connectNulls
                                                    />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Gráfico de Barras — Distribuição por Hora */}
                                <div className="chart-card">
                                    <div className="chart-header">
                                        <h3>Horários com Mais Cliques</h3>
                                        <span className="chart-hint">Distribuição de cliques por hora do dia</span>
                                    </div>
                                    <div className="chart-body">
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={hourlyData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.12)" />
                                                <XAxis
                                                    dataKey="hora"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                    interval={1}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                                    allowDecimals={false}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '12px',
                                                        border: 'none',
                                                        boxShadow: '0 8px 24px rgb(0 0 0 / 0.15)',
                                                        background: 'var(--color-surface)',
                                                        color: 'var(--color-text-primary)',
                                                    }}
                                                    formatter={(value: unknown) => [`${value} cliques`, 'Cliques']}
                                                />
                                                <Bar dataKey="cliques" radius={[4, 4, 0, 0]}>
                                                    {hourlyData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.cliques === peakHour?.cliques && entry.cliques > 0
                                                                ? '#4f46e5'
                                                                : 'rgba(79, 70, 229, 0.3)'}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Tabela de detalhes */}
                                <div className="chart-card">
                                    <div className="chart-header">
                                        <h3>Detalhes por Link</h3>
                                    </div>
                                    <div className="details-table">
                                        <div className="details-header">
                                            <span>Nome</span>
                                            <span>Código</span>
                                            <span>Cliques</span>
                                            <span>Criado em</span>
                                        </div>
                                        {urls.map(url => (
                                            <div key={url.short_code} className="details-row">
                                                <span className="details-name" title={url.original_url}>
                                                    {url.name || '—'}
                                                </span>
                                                <span className="details-code">{url.short_code}</span>
                                                <span className="details-clicks">{url.clicks}</span>
                                                <span className="details-date">
                                                    {new Date(url.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </AppLayout>
    )
}
