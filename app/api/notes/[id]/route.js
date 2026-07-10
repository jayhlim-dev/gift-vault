import { getUserFromRequest } from 'lib/auth/verify-request';
import { getDb } from 'lib/firebase-admin';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

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
