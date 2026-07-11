import { getUserFromRequest } from 'lib/auth/verify-request';
import { getDb } from 'lib/firebase-admin';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

const EDITABLE_FIELDS = ['text', 'category', 'noteDate', 'isPinned'];

export async function PATCH(request, { params }) {
    const { id } = await params;
    const user = await getUserFromRequest(request);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = getDb();
        const ref = db.collection('notes').doc(id);
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

        if (updates.text !== undefined) {
            updates.text = (updates.text || '').trim();
            if (!updates.text) {
                return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
            }
        }

        if (updates.isPinned !== undefined) {
            updates.isPinned = Boolean(updates.isPinned);
        }

        if (!Object.keys(updates).length) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        await ref.update(updates);
        revalidateTag('firestore:notes');

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(`[api/notes/${id}] Failed to update note:`, error);
        return NextResponse.json({ error: 'Failed to update note', message: error.message }, { status: 500 });
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
        const ref = db.collection('notes').doc(id);
        const snap = await ref.get();

        if (!snap.exists || snap.data().userID !== user.uid) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await ref.delete();
        revalidateTag('firestore:notes');

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(`[api/notes/${id}] Failed to delete note:`, error);
        return NextResponse.json({ error: 'Failed to delete note', message: error.message }, { status: 500 });
    }
}
