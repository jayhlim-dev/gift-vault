import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from 'lib/auth/verify-request';
import { getDb } from 'lib/firebase-admin';

/*
Called right after a successful Google sign-in on the client. Upserts the user's
profile (from their verified ID token) into the `users` collection, keyed by uid.
*/
export async function POST(request) {
    const user = await getUserFromRequest(request);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = getDb();
        await db
            .collection('users')
            .doc(user.uid)
            .set(
                {
                    name: user.name || '',
                    email: user.email || '',
                    photoURL: user.picture || '',
                    updatedAt: new Date().toISOString()
                },
                { merge: true }
            );

        revalidateTag('firestore:users');

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[api/auth/sync-user] Failed to sync user:', error);
        return NextResponse.json({ error: 'Failed to sync user profile', message: error.message }, { status: 500 });
    }
}
