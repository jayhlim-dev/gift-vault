import { NextResponse } from 'next/server';
import { getUserFromRequest } from 'lib/auth/verify-request';
import { getCollection } from 'lib/firebase-admin';
import { USER_SCOPED_COLLECTIONS } from 'lib/firebase-collection-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
Fetches multiple user-scoped collections in one request.

Verifies the ID token once, then loads every collection in parallel.
Example: GET /api/firebase/batch?collections=persons,notes,reminders,wishlists
*/
export async function GET(request) {
    const user = await getUserFromRequest(request);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const raw = searchParams.get('collections') || '';
    const collections = [...new Set(raw.split(',').map((name) => name.trim()).filter(Boolean))];

    if (collections.length === 0) {
        return NextResponse.json({ error: 'Missing collections' }, { status: 400 });
    }

    if (collections.length > 8) {
        return NextResponse.json({ error: 'Too many collections' }, { status: 400 });
    }

    for (const collection of collections) {
        if (!USER_SCOPED_COLLECTIONS.has(collection)) {
            return NextResponse.json({ error: `Unsupported collection: ${collection}` }, { status: 400 });
        }
    }

    try {
        const where = [['userID', '==', user.uid]];
        const entries = await Promise.all(
            collections.map(async (collection) => {
                const data = await getCollection(collection, { where });
                return [collection, data];
            })
        );

        const data = Object.fromEntries(entries);

        return NextResponse.json({
            count: collections.length,
            data
        });
    } catch (error) {
        console.error('[api/firebase/batch] Failed to fetch data:', error);

        return NextResponse.json(
            { error: 'Failed to fetch data from Firebase', message: error.message },
            { status: 500 }
        );
    }
}
