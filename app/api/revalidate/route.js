import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/*
Dev convenience endpoint to bust the 30-minute Firestore cache (see lib/firebase-admin.js)
without restarting the dev server, e.g. after re-seeding data.
Usage: POST /api/revalidate?tag=firestore:persons
*/
export async function POST(request) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    if (!tag) {
        return NextResponse.json({ error: 'Missing "tag" query param' }, { status: 400 });
    }

    revalidateTag(tag);

    return NextResponse.json({ revalidated: tag });
}
