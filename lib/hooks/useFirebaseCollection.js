'use client';

import { useAuth } from 'lib/auth/AuthContext';
import { useCallback, useEffect, useState } from 'react';

// Module-level cache + in-flight dedupe so multiple components requesting the
// same collection (for the same user + filters) on the same page only trigger one request.
const cache = new Map();
const inFlight = new Map();
const CLIENT_CACHE_MS = 60 * 1000;

function getCacheKey(collection, params, uid) {
    return `${collection}:${JSON.stringify(params)}:${uid ?? 'anon'}`;
}

async function fetchCollection(collection, params, idToken) {
    const query = new URLSearchParams();
    if (params.limit) {
        query.set('limit', params.limit);
    }
    if (params.personId) {
        query.set('personId', params.personId);
    }
    const queryString = query.toString();

    const headers = idToken ? { Authorization: `Bearer ${idToken}` } : undefined;
    const response = await fetch(`/api/firebase/${collection}${queryString ? `?${queryString}` : ''}`, { headers });

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
Returns a `refetch()` helper to force a fresh fetch (bypassing the short client cache),
useful right after creating/deleting a document.
*/
export function useFirebaseCollection(collection, { limit, personId } = {}) {
    const { user, isAuthLoading, getIdToken } = useAuth();
    const uid = user?.uid;
    const params = { limit, personId };

    const cacheKey = getCacheKey(collection, params, uid);
    const cached = cache.get(cacheKey);
    const isFresh = Boolean(cached) && Date.now() - cached.timestamp < CLIENT_CACHE_MS;

    const [data, setData] = useState(isFresh ? cached.data : []);
    const [isLoading, setIsLoading] = useState(isAuthLoading || !isFresh);
    const [error, setError] = useState(null);
    const [refreshIndex, setRefreshIndex] = useState(0);

    const refetch = useCallback(() => {
        cache.delete(getCacheKey(collection, { limit, personId }, uid));
        setRefreshIndex((index) => index + 1);
    }, [collection, limit, personId, uid]);

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
        const key = getCacheKey(collection, { limit, personId }, uid);
        const existing = cache.get(key);

        if (refreshIndex === 0 && existing && Date.now() - existing.timestamp < CLIENT_CACHE_MS) {
            setData(existing.data);
            setIsLoading(false);
            return undefined;
        }

        setIsLoading(true);

        let promise = inFlight.get(key);
        if (!promise) {
            promise = getIdToken()
                .then((idToken) => fetchCollection(collection, { limit, personId }, idToken))
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collection, limit, personId, uid, isAuthLoading, user, getIdToken, refreshIndex]);

    return { data, isLoading, error, refetch };
}
