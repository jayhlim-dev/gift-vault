import { getUserFromRequest } from 'lib/auth/verify-request';
import { buildNoteUpdatePayload } from 'lib/note-api-utils';
import { getDb } from 'lib/firebase-admin';
import { NextResponse } from 'next/server';

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
        const { updates, error } = buildNoteUpdatePayload(body, snap.data());

        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        await ref.update(updates);

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

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(`[api/notes/${id}] Failed to delete note:`, error);
        return NextResponse.json({ error: 'Failed to delete note', message: error.message }, { status: 500 });
    }
}
