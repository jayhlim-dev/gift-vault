'use client';

import { useAuth } from 'lib/auth/AuthContext';
import { useCallback } from 'react';

/*
Small helper for authenticated JSON requests (POST/PATCH/DELETE) against our own API
routes. Attaches the current user's Firebase ID token automatically.
*/
export function useApiClient() {
    const { getIdToken } = useAuth();

    const request = useCallback(
        async (path, { method = 'GET', body } = {}) => {
            const idToken = await getIdToken();

            const response = await fetch(path, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
                },
                body: body !== undefined ? JSON.stringify(body) : undefined
            });

            const json = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(json.error || `Request failed (${response.status})`);
            }

            return json;
        },
        [getIdToken]
    );

    return { request };
}
