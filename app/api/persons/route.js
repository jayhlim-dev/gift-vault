import { getUserFromRequest } from 'lib/auth/verify-request';
import { getDb } from 'lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const user = await getUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name = (body.name || '').trim();

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    try {
        const db = getDb();
        const docRef = await db.collection('persons').add({
            name,
            birthday: body.birthday || '',
            relationship: body.relationship || '',
            avatarURL: body.avatarURL || '',
            bio: body.bio || '',
            isFavorite: Boolean(body.isFavorite),
            userID: user.uid,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id: docRef.id }, { status: 201 });
    } catch (error) {
        console.error('[api/persons] Failed to create person:', error);
        return NextResponse.json({ error: 'Failed to create person', message: error.message }, { status: 500 });
    }
}
