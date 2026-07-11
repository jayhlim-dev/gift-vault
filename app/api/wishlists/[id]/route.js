import { getUserFromRequest } from 'lib/auth/verify-request';
import { validateHttpsUrl } from 'lib/gift-vault-utils';
import { getDb } from 'lib/firebase-admin';
import { NextResponse } from 'next/server';

const EDITABLE_FIELDS = ['title', 'price', 'url', 'category', 'iconId', 'imageURL', 'description'];

export async function PATCH(request, { params }) {
    const { id } = await params;
    const user = await getUserFromRequest(request);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = getDb();
        const ref = db.collection('wishlists').doc(id);
        const snap = await ref.get();

        if (!snap.exists || snap.data().userID !== user.uid) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const body = await request.json().catch(() => ({}));
        const updates = {};

        for (const field of EDITABLE_FIELDS) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (updates.title !== undefined) {
            updates.title = (updates.title || '').trim();
            if (!updates.title) {
                return NextResponse.json({ error: 'Title is required' }, { status: 400 });
            }
        }

        if (updates.url !== undefined) {
            const { url, error: urlError } = validateHttpsUrl(updates.url);
            if (urlError) {
                return NextResponse.json({ error: urlError }, { status: 400 });
            }
            updates.url = url;
        }

        if (!Object.keys(updates).length) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        await ref.update(updates);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(`[api/wishlists/${id}] Failed to update wishlist item:`, error);
        return NextResponse.json({ error: 'Failed to update wishlist item', message: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    const user = await getUserFromRequest(request);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = getDb();
        const ref = db.collection('wishlists').doc(id);
        const snap = await ref.get();

        if (!snap.exists || snap.data().userID !== user.uid) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await ref.delete();

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(`[api/wishlists/${id}] Failed to delete wishlist item:`, error);
        return NextResponse.json({ error: 'Failed to delete wishlist item', message: error.message }, { status: 500 });
    }
}
