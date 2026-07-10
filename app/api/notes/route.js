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
    const text = (body.text || '').trim();

    if (!text) {
        return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
    }

    try {
        const db = getDb();
        const docRef = await db.collection('notes').add({
            text,
            category: body.category || '',
            personId: body.personId || '',
            userID: user.uid,
            createdAt: new Date().toISOString()
        });

        revalidateTag('firestore:notes');

        return NextResponse.json({ id: docRef.id }, { status: 201 });
    } catch (error) {
        console.error('[api/notes] Failed to create note:', error);
        return NextResponse.json({ error: 'Failed to create note', message: error.message }, { status: 500 });
    }
}
