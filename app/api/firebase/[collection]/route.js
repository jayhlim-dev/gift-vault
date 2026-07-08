import { NextResponse } from 'next/server';
import { getUserFromRequest } from 'lib/auth/verify-request';
import { getCachedCollection } from 'lib/firebase-admin';

/*
Collections that belong to a specific user. Requests for these require a valid
Firebase ID token, and results are filtered to that user's own documents (by `userID`).
*/
const USER_SCOPED_COLLECTIONS = new Set(['persons', 'notes', 'wishlists']);

/*
Generic Firestore read endpoint.

Example: GET /api/firebase/people
Example with limit: GET /api/firebase/people?limit=20

Data is cached for 30 minutes (see lib/firebase-admin.js), so repeated
requests within that window are served from cache instead of hitting Firestore again.
*/
export async function GET(request, { params }) {
    const { collection } = await params;
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Number(limitParam) : undefined;

    if (!collection) {
        return NextResponse.json({ error: 'Missing collection name' }, { status: 400 });
    }

    let where;

    if (USER_SCOPED_COLLECTIONS.has(collection)) {
        const user = await getUserFromRequest(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        where = [['userID', '==', user.uid]];
    }

    try {
        const data = await getCachedCollection(collection, { limit, where });

        return NextResponse.json({
            collection,
            count: data.length,
            data
        });
    } catch (error) {
        console.error(`[api/firebase/${collection}] Failed to fetch data:`, error);

        return NextResponse.json(
            { error: 'Failed to fetch data from Firebase', message: error.message },
            { status: 500 }
        );
    }
}
