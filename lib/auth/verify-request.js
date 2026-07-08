import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '../firebase-admin';

/*
Verifies the Firebase ID token sent by the client in the `Authorization: Bearer <token>`
header. Returns the decoded token (uid, email, name, picture) or null if missing/invalid.
*/
export async function getUserFromRequest(request) {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const idToken = authHeader.slice('Bearer '.length).trim();
    if (!idToken) {
        return null;
    }

    try {
        const decoded = await getAuth(getFirebaseAdminApp()).verifyIdToken(idToken);
        return {
            uid: decoded.uid,
            email: decoded.email || null,
            name: decoded.name || null,
            picture: decoded.picture || null
        };
    } catch (error) {
        console.error('[auth] Failed to verify ID token:', error.message);
        return null;
    }
}
