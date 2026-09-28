/**
 * API client for backend communication
 */
import { showToast } from '../components/Toast';

// API base URL - in production this will be the API Gateway URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Type definitions
export interface User {
  clerk_user_id: string;
  display_name: string;
  years_until_retirement: number;
  target_retirement_income: number;
  asset_class_targets: Record<string, number>;
  region_targets: Record<string, number>;
}

export interface Account {
  id: string;
  clerk_user_id: string;
  name: string;
  account_type: string;
  purpose?: string;
  cash_balance: number;
}

export interface Position {
  id: string;
  account_id: string;
  symbol: string;
  quantity: number;
}

export interface Job {
  id: string;
  clerk_user_id: string;
  job_type: string;
  status: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface ApiError {
  detail: string;
}

/**
 * Make an authenticated API request (for use with token)
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  // Handle JWT expiry (401 Unauthorized)
  if (response.status === 401) {
    showToast('error', 'Session expired. Please sign in again.');
    // Redirect to home page for re-authentication
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    throw new Error('Session expired');
  }

  // Handle rate limiting (429 Too Many Requests)
  if (response.status === 429) {
    showToast('error', 'Too many requests. Please slow down.');
    throw new Error('Rate limited');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * API client factory - creates client with token
 */
export function createApiClient(token: string) {
  return {
    // User endpoints
    user: {
      get: () => apiRequest<User>('/api/user', token),
      update: (data: Partial<User>) => apiRequest<User>('/api/user', token, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    },

    // Account endpoints
    accounts: {
      list: () => apiRequest<Account[]>('/api/accounts', token),
      create: (data: Partial<Account>) => apiRequest<Account>('/api/accounts', token, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      update: (id: string, data: Partial<Account>) => apiRequest<Account>(`/api/accounts/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
      positions: (id: string) => apiRequest<Position[]>(`/api/accounts/${id}/positions`, token),
    },

    // Position endpoints
    positions: {
      create: (data: Partial<Position>) => apiRequest<Position>('/api/positions', token, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      update: (id: string, data: Partial<Position>) => apiRequest<Position>(`/api/positions/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
      delete: (id: string) => apiRequest<void>(`/api/positions/${id}`, token, {
        method: 'DELETE',
      }),
    },

    // Analysis endpoints
    analysis: {
      trigger: (data: Record<string, unknown> = {}) => apiRequest<Job>('/api/analyze', token, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    },

    // Job endpoints
    jobs: {
      get: (id: string) => apiRequest<Job>(`/api/jobs/${id}`, token),
      list: () => apiRequest<Job[]>('/api/jobs', token),
    },
  };
}

/**
 * Hook for making API calls from components
 */
export function useApiClient() {
  // This hook can be used in components with useAuth
  return {
    createClient: (token: string) => createApiClient(token),
  };
}