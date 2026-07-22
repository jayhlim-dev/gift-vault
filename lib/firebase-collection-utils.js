export const USER_SCOPED_COLLECTIONS = new Set(['persons', 'notes', 'wishlists', 'reminders', 'connections']);
export const PERSON_FILTERABLE_COLLECTIONS = new Set(['notes', 'wishlists', 'reminders', 'connections']);

const CACHE_TTL_MS = 15_000;
const collectionCache = new Map();

function cacheKey(collectionName, options = {}) {
    return `${collectionName}:${JSON.stringify(options.where || null)}:${options.limit ?? ''}`;
}

export function invalidateCollectionCache() {
    collectionCache.clear();
}

export function getCachedCollection(collectionName, options, loader) {
    const key = cacheKey(collectionName, options);
    const hit = collectionCache.get(key);

    if (hit && hit.expiresAt > Date.now()) {
        return hit.promise;
    }

    const promise = loader().catch((error) => {
        collectionCache.delete(key);
        throw error;
    });

    collectionCache.set(key, {
        promise,
        expiresAt: Date.now() + CACHE_TTL_MS
    });

    return promise;
}
