import { NextResponse } from 'next/server';
import { getUserFromRequest } from 'lib/auth/verify-request';
import { getCollection } from 'lib/firebase-admin';
import { PERSON_FILTERABLE_COLLECTIONS, USER_SCOPED_COLLECTIONS } from 'lib/firebase-collection-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
