import { getUserFromRequest } from 'lib/auth/verify-request';
import { buildReminderCreatePayload } from 'lib/reminder-api-utils';
import { getDb, invalidateCollectionCache } from 'lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const user = await getUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { payload, error } = buildReminderCreatePayload(body);

    if (error) {
        return NextResponse.json({ error }, { status: 400 });
    }

    try {
        const db = getDb();
        const docRef = await db.collection('reminders').add({
            ...payload,
            userID: user.uid,
            createdAt: new Date().toISOString()
        });

        invalidateCollectionCache();
        return NextResponse.json({ id: docRef.id }, { status: 201 });
    } catch (error) {
        console.error('[api/reminders] Failed to create reminder:', error);
        return NextResponse.json({ error: 'Failed to create reminder', message: error.message }, { status: 500 });
    }
}
