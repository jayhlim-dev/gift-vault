'use client';

import { useEffect, useState } from 'react';
import { useAuth } from 'lib/auth/AuthContext';

// Module-level cache + in-flight dedupe so multiple components requesting the
// same collection (for the same user) on the same page only trigger one request.
const cache = new Map();
const inFlight = new Map();
const CLIENT_CACHE_MS = 60 * 1000;

function getCacheKey(collection, limit, uid) {
    return `${collection}:${limit ?? 'all'}:${uid ?? 'anon'}`;
}

async function fetchCollection(collection, limit, idToken) {
    const query = limit ? `?limit=${limit}` : '';
    const headers = idToken ? { Authorization: `Bearer ${idToken}` } : undefined;
    const response = await fetch(`/api/firebase/${collection}${query}`, { headers });

    if (!response.ok) {
        throw new Error(`Failed to fetch "${collection}" (${response.status})`);
    }

    const json = await response.json();
    return json.data || [];
}

/*
Client-side fetch of a Firestore collection via `/api/firebase/[collection]`.
Waits for Firebase Auth to be ready and attaches the current user's ID token so the
API route can verify the request and filter results to that user's own data.
*/
export function useFirebaseCollection(collection, { limit } = {}) {
    const { user, isAuthLoading, getIdToken } = useAuth();
    const uid = user?.uid;

    const cacheKey = getCacheKey(collection, limit, uid);
    const cached = cache.get(cacheKey);
    const isFresh = Boolean(cached) && Date.now() - cached.timestamp < CLIENT_CACHE_MS;

    const [data, setData] = useState(isFresh ? cached.data : []);
    const [isLoading, setIsLoading] = useState(isAuthLoading || !isFresh);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthLoading) {
            return undefined;
        }

        if (!user) {
            setData([]);
            setIsLoading(false);
            return undefined;
        }

        let isCancelled = false;
        const key = getCacheKey(collection, limit, uid);
        const existing = cache.get(key);

        if (existing && Date.now() - existing.timestamp < CLIENT_CACHE_MS) {
            setData(existing.data);
            setIsLoading(false);
            return undefined;
        }

        setIsLoading(true);

        let promise = inFlight.get(key);
        if (!promise) {
            promise = getIdToken()
                .then((idToken) => fetchCollection(collection, limit, idToken))
                .finally(() => inFlight.delete(key));
            inFlight.set(key, promise);
        }

        promise
            .then((result) => {
                cache.set(key, { data: result, timestamp: Date.now() });
                if (!isCancelled) {
                    setData(result);
                    setError(null);
                }
            })
            .catch((err) => {
                if (!isCancelled) {
                    setError(err);
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [collection, limit, uid, isAuthLoading, user, getIdToken]);

    return { data, isLoading, error };
}
