import { getUserFromRequest } from 'lib/auth/verify-request';
import { getDb } from 'lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
    const { id } = await params;
    const user = await getUserFromRequest(request);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = getDb();
        const ref = db.collection('connections').doc(id);
        const snap = await ref.get();

        if (!snap.exists || snap.data().userID !== user.uid) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const connection = snap.data();
        const batch = db.batch();
        batch.delete(ref);

        const reverseSnap = await db
            .collection('connections')
            .where('personId', '==', connection.linkedPersonId)
            .where('linkedPersonId', '==', connection.personId)
            .where('userID', '==', user.uid)
            .limit(1)
            .get();

        reverseSnap.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(`[api/connections/${id}] Failed to delete connection:`, error);
        return NextResponse.json({ error: 'Failed to delete connection', message: error.message }, { status: 500 });
    }
}
