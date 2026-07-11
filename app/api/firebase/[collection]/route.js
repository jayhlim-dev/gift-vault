import { NextResponse } from 'next/server';
import { getUserFromRequest } from 'lib/auth/verify-request';
import { getCollection } from 'lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
Collections that belong to a specific user. Requests for these require a valid
Firebase ID token, and results are filtered to that user's own documents (by `userID`).
*/
const USER_SCOPED_COLLECTIONS = new Set(['persons', 'notes', 'wishlists', 'reminders']);
const PERSON_FILTERABLE_COLLECTIONS = new Set(['notes', 'wishlists', 'reminders']);

/*
Generic Firestore read endpoint.

Example: GET /api/firebase/people
Example with limit: GET /api/firebase/people?limit=20

Data is read directly from Firestore on each request.
*/
export async function GET(request, { params }) {
    const { collection } = await params;
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Number(limitParam) : undefined;
    const personIdParam = searchParams.get('personId');

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

        if (personIdParam && PERSON_FILTERABLE_COLLECTIONS.has(collection)) {
            where.push(['personId', '==', personIdParam]);
        }
    }

    try {
        const data = await getCollection(collection, { limit, where });

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
