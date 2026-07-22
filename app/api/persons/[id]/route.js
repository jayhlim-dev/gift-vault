import { getUserFromRequest } from 'lib/auth/verify-request';
import { getDb, invalidateCollectionCache } from 'lib/firebase-admin';
import { NextResponse } from 'next/server';

const EDITABLE_FIELDS = ['name', 'birthday', 'relationship', 'avatarURL', 'bio', 'isFavorite'];

async function getOwnedPersonRef(db, id, uid) {
    const ref = db.collection('persons').doc(id);
    const snap = await ref.get();

    if (!snap.exists || snap.data().userID !== uid) {
        return null;
    }

    return ref;
}

export async function PATCH(request, { params }) {
    const { id } = await params;
    const user = await getUserFromRequest(request);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = getDb();
        const ref = await getOwnedPersonRef(db, id, user.uid);

        if (!ref) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const body = await request.json().catch(() => ({}));
        const updates = {};

        for (const field of EDITABLE_FIELDS) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (updates.name !== undefined && !updates.name.trim()) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        await ref.update(updates);

        invalidateCollectionCache();
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(`[api/persons/${id}] Failed to update person:`, error);
        return NextResponse.json({ error: 'Failed to update person', message: error.message }, { status: 500 });
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
        const ref = await getOwnedPersonRef(db, id, user.uid);

        if (!ref) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Cascade delete this person's notes & wishlist items so they don't become orphans.
        const batch = db.batch();

        const notesSnap = await db.collection('notes').where('personId', '==', id).where('userID', '==', user.uid).get();
        notesSnap.forEach((doc) => batch.delete(doc.ref));

        const wishlistsSnap = await db
            .collection('wishlists')
            .where('personId', '==', id)
            .where('userID', '==', user.uid)
            .get();
        wishlistsSnap.forEach((doc) => batch.delete(doc.ref));

        const remindersSnap = await db
            .collection('reminders')
            .where('personId', '==', id)
            .where('userID', '==', user.uid)
            .get();
        remindersSnap.forEach((doc) => batch.delete(doc.ref));

        const connectionsFromSnap = await db
            .collection('connections')
            .where('personId', '==', id)
            .where('userID', '==', user.uid)
            .get();
        connectionsFromSnap.forEach((doc) => batch.delete(doc.ref));

        const connectionsToSnap = await db
            .collection('connections')
            .where('linkedPersonId', '==', id)
            .where('userID', '==', user.uid)
            .get();
        connectionsToSnap.forEach((doc) => batch.delete(doc.ref));

        batch.delete(ref);
        await batch.commit();

        invalidateCollectionCache();
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(`[api/persons/${id}] Failed to delete person:`, error);
        return NextResponse.json({ error: 'Failed to delete person', message: error.message }, { status: 500 });
    }
}
