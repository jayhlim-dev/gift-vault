import { getUserFromRequest } from 'lib/auth/verify-request';
import { buildConnectionCreatePayload } from 'lib/connection-api-utils';
import { getDb, invalidateCollectionCache } from 'lib/firebase-admin';
import { NextResponse } from 'next/server';

async function assertOwnedPerson(db, personId, uid) {
    const snap = await db.collection('persons').doc(personId).get();
    return snap.exists && snap.data().userID === uid;
}

async function findExistingConnection(db, personId, linkedPersonId, uid) {
    const [forwardSnap, reverseSnap] = await Promise.all([
        db
            .collection('connections')
            .where('personId', '==', personId)
            .where('linkedPersonId', '==', linkedPersonId)
            .where('userID', '==', uid)
            .limit(1)
            .get(),
        db
            .collection('connections')
            .where('personId', '==', linkedPersonId)
            .where('linkedPersonId', '==', personId)
            .where('userID', '==', uid)
            .limit(1)
            .get()
    ]);

    return !forwardSnap.empty || !reverseSnap.empty;
}

export async function POST(request) {
    const user = await getUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { payload, reverseLabel, error } = buildConnectionCreatePayload(body);

    if (error) {
        return NextResponse.json({ error }, { status: 400 });
    }

    try {
        const db = getDb();
        const [ownsPerson, ownsLinkedPerson, alreadyLinked] = await Promise.all([
            assertOwnedPerson(db, payload.personId, user.uid),
            assertOwnedPerson(db, payload.linkedPersonId, user.uid),
            findExistingConnection(db, payload.personId, payload.linkedPersonId, user.uid)
        ]);

        if (!ownsPerson || !ownsLinkedPerson) {
            return NextResponse.json({ error: 'Person not found' }, { status: 404 });
        }

        if (alreadyLinked) {
            return NextResponse.json({ error: 'These people are already connected' }, { status: 409 });
        }

        const createdAt = new Date().toISOString();
        const batch = db.batch();
        const forwardRef = db.collection('connections').doc();
        const reverseRef = db.collection('connections').doc();

        batch.set(forwardRef, {
            ...payload,
            userID: user.uid,
            createdAt
        });

        batch.set(reverseRef, {
            personId: payload.linkedPersonId,
            linkedPersonId: payload.personId,
            label: reverseLabel,
            userID: user.uid,
            createdAt
        });

        await batch.commit();

        invalidateCollectionCache();
        return NextResponse.json({ id: forwardRef.id }, { status: 201 });
    } catch (error) {
        console.error('[api/connections] Failed to create connection:', error);
        return NextResponse.json({ error: 'Failed to create connection', message: error.message }, { status: 500 });
    }
}
