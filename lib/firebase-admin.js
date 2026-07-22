import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getCachedCollection, invalidateCollectionCache } from './firebase-collection-utils.js';

export { invalidateCollectionCache };

function normalizePrivateKey(key) {
    if (!key) {
        return undefined;
    }

    let normalized = key.trim();

    if (
        (normalized.startsWith('"') && normalized.endsWith('"')) ||
        (normalized.startsWith("'") && normalized.endsWith("'"))
    ) {
        normalized = normalized.slice(1, -1);
    }

    return normalized.replace(/\\n/g, '\n');
}

/*
Reads Firebase Admin credentials from environment variables.
Get these from Firebase Console -> Project settings -> Service accounts -> Generate new private key.
See .env.example for the exact variable names.

Image uploads use Google Cloud Storage. Set GCS_BUCKET_NAME to a bucket you create in
Google Cloud Console (no need to enable Firebase Storage). The Firebase Admin service
account needs Storage Object Admin on that bucket.
*/
export function getStorageBucketCandidates() {
    // Prefer a plain GCS bucket the user created in Google Cloud Console.
    if (process.env.GCS_BUCKET_NAME) {
        return [process.env.GCS_BUCKET_NAME];
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const configured =
        process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '';

    const defaults = projectId ? [`${projectId}.firebasestorage.app`, `${projectId}.appspot.com`] : [];

    return [...new Set([configured, ...defaults].filter(Boolean))];
}

export function getStorageBucket() {
    return getStorageBucketCandidates()[0] || '';
}

export function usesCustomGcsBucket() {
    return Boolean(process.env.GCS_BUCKET_NAME);
}

export async function getWritableStorageBucket() {
    const storage = getStorage(getFirebaseAdminApp());

    // Custom GCS bucket: skip exists() check (needs storage.buckets.get).
    // Upload only needs storage.objects.create on the bucket.
    if (process.env.GCS_BUCKET_NAME) {
        return storage.bucket(process.env.GCS_BUCKET_NAME);
    }

    const candidates = getStorageBucketCandidates();

    for (const bucketName of candidates) {
        const bucket = storage.bucket(bucketName);
        const [exists] = await bucket.exists();
        if (exists) {
            return bucket;
        }
    }

    const tried = candidates.join(', ');
    throw new Error(
        `No storage bucket found (tried: ${tried}). ` +
            'Set GCS_BUCKET_NAME in .env to a bucket you created in Google Cloud Console, ' +
            'or enable Firebase Storage in Firebase Console.'
    );
}

export function getFirebaseAdminApp() {
    const existingApp = getApps()[0];
    if (existingApp) {
        return existingApp;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
    const storageBucket = getStorageBucket();

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in your environment.'
        );
    }

    return initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        ...(storageBucket ? { storageBucket } : {})
    });
}

export function getDb() {
    const app = getFirebaseAdminApp();
    return getFirestore(app);
}

async function fetchCollection(collectionName, { limit, where } = {}) {
    const db = getDb();
    let query = db.collection(collectionName);

    if (where) {
        for (const [field, op, value] of where) {
            query = query.where(field, op, value);
        }
    }

    if (limit) {
        query = query.limit(limit);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
}

export async function getCollection(collectionName, options = {}) {
    return getCachedCollection(collectionName, options, () => fetchCollection(collectionName, options));
}
