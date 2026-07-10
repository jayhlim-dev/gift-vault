import { getUserFromRequest } from 'lib/auth/verify-request';
import { getDb } from 'lib/firebase-admin';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const user = await getUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const title = (body.title || '').trim();

    if (!title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    try {
        const db = getDb();
        const docRef = await db.collection('wishlists').add({
            title,
            description: body.description || '',
            url: body.url || '',
            price: body.price || '',
            imageURL: body.imageURL || '',
            status: body.status || 'pending',
            personId: body.personId || '',
            userID: user.uid,
            createdAt: new Date().toISOString()
        });

        revalidateTag('firestore:wishlists');

        return NextResponse.json({ id: docRef.id }, { status: 201 });
    } catch (error) {
        console.error('[api/wishlists] Failed to create wishlist item:', error);
        return NextResponse.json({ error: 'Failed to create wishlist item', message: error.message }, { status: 500 });
    }
}
