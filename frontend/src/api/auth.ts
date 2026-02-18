const API_URL = 'http://localhost:8303'; // Usando a porta do nosso backend

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_URL}${endpoint}`;

    // Garantir que as credenciais (cookies) sejam enviadas
    options.credentials = 'include';

    if (options.body && !(options.body instanceof FormData)) {
        options.headers = {
            ...options.headers,
            'Content-Type': 'application/json',
        };
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Erro na requisição');
    }

    return response.json();
};
