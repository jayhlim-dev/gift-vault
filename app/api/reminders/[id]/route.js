import { getUserFromRequest } from 'lib/auth/verify-request';
import { buildReminderUpdatePayload } from 'lib/reminder-api-utils';
import { getDb } from 'lib/firebase-admin';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
    const { id } = await params;
    const user = await getUserFromRequest(request);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = getDb();
        const ref = db.collection('reminders').doc(id);
        const snap = await ref.get();

        if (!snap.exists || snap.data().userID !== user.uid) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const body = await request.json().catch(() => ({}));
        const { updates, error } = buildReminderUpdatePayload(body, snap.data());

        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        await ref.update(updates);
        revalidateTag('firestore:reminders');

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(`[api/reminders/${id}] Failed to update reminder:`, error);
        return NextResponse.json({ error: 'Failed to update reminder', message: error.message }, { status: 500 });
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
        const ref = db.collection('reminders').doc(id);
        const snap = await ref.get();

        if (!snap.exists || snap.data().userID !== user.uid) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await ref.delete();
        revalidateTag('firestore:reminders');

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(`[api/reminders/${id}] Failed to delete reminder:`, error);
        return NextResponse.json({ error: 'Failed to delete reminder', message: error.message }, { status: 500 });
    }
}
