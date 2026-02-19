import { apiFetch } from './auth'

// --- Tipos ---

export interface UrlItem {
    id: number
    short_code: string
    original_url: string
    name: string | null
    clicks: number
    daily_clicks?: Record<string, number>
    hourly_clicks?: Record<string, number>
    created_at: string
}

export interface DashboardData {
    total_urls: number
    total_clicks: number
    all_hourly: Record<string, number>
    urls: UrlItem[]
}

// --- API de URLs ---

export const urlsApi = {
    /** Lista todas as URLs do usuário autenticado */
    list: async (): Promise<UrlItem[]> => {
        const data = await apiFetch('/urls')
        return data.urls
    },

    /** Cria uma nova URL encurtada */
    create: async (url: string, name?: string): Promise<UrlItem> => {
        return apiFetch('/urls', {
            method: 'POST',
            body: JSON.stringify({ url, name }),
        })
    },

    /** Atualiza uma URL (PATCH parcial — nome e/ou destino) */
    update: async (shortCode: string, data: { url?: string; name?: string }): Promise<UrlItem> => {
        return apiFetch(`/urls/${shortCode}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    },

    /** Deleta uma URL encurtada */
    delete: async (shortCode: string): Promise<void> => {
        await apiFetch(`/urls/${shortCode}`, {
            method: 'DELETE',
        })
    },

    /** Retorna métricas detalhadas de uma URL */
    stats: async (shortCode: string): Promise<UrlItem> => {
        return apiFetch(`/urls/${shortCode}/stats`)
    },

    /** Retorna métricas agregadas do dashboard (com sync Redis→DB) */
    dashboard: async (): Promise<DashboardData> => {
        return apiFetch('/urls/dashboard')
    },
}
