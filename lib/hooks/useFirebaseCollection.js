'use client';

import { useAuth } from 'lib/auth/AuthContext';
import { useCallback, useEffect, useState } from 'react';

// Dedupe in-flight single-collection requests (e.g. personId filters).
const inFlight = new Map();

// Coalesce same-tick collection reads into one /api/firebase/batch call.
const batchQueues = new Map();

function getRequestKey(collection, params, uid) {
    return `${collection}:${JSON.stringify(params)}:${uid ?? 'anon'}`;
}

function getBatchQueue(uid) {
    let queue = batchQueues.get(uid);
    if (!queue) {
        queue = {
            collections: new Map(),
            flushTimer: null,
            idTokenPromise: null
        };
        batchQueues.set(uid, queue);
    }
    return queue;
}

async function fetchSingleCollection(collection, params, idToken) {
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

function enqueueBatchCollection(collection, uid, getIdToken) {
    const queue = getBatchQueue(uid);

    if (!queue.collections.has(collection)) {
        queue.collections.set(collection, []);
    }

    const waiters = queue.collections.get(collection);

    const promise = new Promise((resolve, reject) => {
        waiters.push({ resolve, reject });
    });

    if (!queue.idTokenPromise) {
        queue.idTokenPromise = getIdToken();
    }

    if (!queue.flushTimer) {
        queue.flushTimer = setTimeout(() => {
            flushBatchQueue(uid);
        }, 0);
    }

    return promise;
}

async function flushBatchQueue(uid) {
    const queue = batchQueues.get(uid);
    if (!queue) {
        return;
    }

    batchQueues.delete(uid);

    const collections = [...queue.collections.keys()];
    const waiterMap = queue.collections;

    try {
        const idToken = await queue.idTokenPromise;
        const headers = idToken ? { Authorization: `Bearer ${idToken}` } : undefined;

        if (collections.length === 1) {
            const [collection] = collections;
            const data = await fetchSingleCollection(collection, {}, idToken);
            for (const waiter of waiterMap.get(collection) || []) {
                waiter.resolve(data);
            }
            return;
        }

        const query = new URLSearchParams({ collections: collections.join(',') });
        const response = await fetch(`/api/firebase/batch?${query}`, { headers });

        if (!response.ok) {
            throw new Error(`Failed to batch fetch (${response.status})`);
        }

        const json = await response.json();
        const dataByCollection = json.data || {};

        for (const collection of collections) {
            const data = dataByCollection[collection] || [];
            for (const waiter of waiterMap.get(collection) || []) {
                waiter.resolve(data);
            }
        }
    } catch (error) {
        for (const waiters of waiterMap.values()) {
            for (const waiter of waiters) {
                waiter.reject(error);
            }
        }
    }
}

async function fetchCollection(collection, params, getIdToken, uid) {
    // Filtered / limited reads stay on the single-collection endpoint.
    if (params.personId || params.limit) {
        const idToken = await getIdToken();
        return fetchSingleCollection(collection, params, idToken);
    }

    return enqueueBatchCollection(collection, uid, getIdToken);
}

/*
Client-side fetch of a Firestore collection via `/api/firebase/[collection]`.
Same-tick reads for different collections are merged into one `/api/firebase/batch`
request so auth is verified once and Firestore queries run in parallel on the server.
*/
export function useFirebaseCollection(collection, { limit, personId } = {}) {
    const { user, isAuthLoading, getIdToken } = useAuth();
    const uid = user?.uid;

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshIndex, setRefreshIndex] = useState(0);

    const refetch = useCallback(() => {
        setRefreshIndex((index) => index + 1);
    }, []);

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
        const key = getRequestKey(collection, { limit, personId }, uid);

        setIsLoading(true);

        let promise = inFlight.get(key);
        if (!promise) {
            promise = fetchCollection(collection, { limit, personId }, getIdToken, uid).finally(() => {
                inFlight.delete(key);
            });
            inFlight.set(key, promise);
        }

        promise
            .then((result) => {
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
