import { ApiResponse } from './types';

interface JsonResponseBody {
    success?: boolean;
    data?: unknown;
    message?: string;
    errors?: Record<string, string[]>;
    pagination?: ApiResponse<unknown>['pagination'];
}

export class BaseService {
    protected baseURL: string;

    constructor() {
        this.baseURL = '';
    }

    protected async request<T>(
        url: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        };

        // Pull CSRF token from Laravel's meta tag
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');
        if (csrfToken) {
            defaultHeaders['X-CSRF-TOKEN'] = csrfToken;
        }

        // For FormData let the browser set Content-Type (with boundary)
        let finalHeaders: Record<string, string>;
        if (options.body instanceof FormData) {
            const { 'Content-Type': _ct, ...rest } = defaultHeaders;
            finalHeaders = { ...rest, ...(options.headers as Record<string, string> | undefined) };
        } else {
            finalHeaders = {
                ...defaultHeaders,
                ...(options.headers as Record<string, string> | undefined),
            };
        }

        const config: RequestInit = {
            ...options,
            headers: finalHeaders,
            credentials: 'same-origin',
        };

        try {
            const response = await fetch(url, config);
            const contentType = response.headers.get('content-type');

            // Non-JSON response (e.g. 204 No Content)
            if (!contentType?.includes('application/json')) {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return { success: true, data: undefined, message: 'OK' };
            }

            const body = (await response.json()) as JsonResponseBody;

            if (!response.ok) {
                return {
                    success: false,
                    message: body.message ?? `HTTP ${response.status}`,
                    errors: body.errors ?? {},
                };
            }

            return {
                success: body.success !== undefined ? body.success : true,
                data: (body.data ?? body) as T,
                message: body.message ?? 'Success',
                pagination: body.pagination,
            };
        } catch (error) {
            console.error('[BaseService] Request failed:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unexpected error occurred',
                errors: {},
            };
        }
    }

    protected buildQueryString(params: Record<string, unknown>): string {
        const sp = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== '') {
                sp.append(key, String(value));
            }
        }
        return sp.toString();
    }
}
