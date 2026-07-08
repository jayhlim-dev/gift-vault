import { getCachedCollection } from './firebase-admin';
import { getToneForRelationship } from './gift-vault-utils';

export { formatRelativeTime, formatShortDate, getNextBirthdayCountdown, getToneForRelationship, toDate } from './gift-vault-utils';

export async function getPersons({ limit } = {}) {
    try {
        const persons = await getCachedCollection('persons', { limit });

        return persons.map((person) => ({
            id: person.id,
            name: person.name || 'Unnamed',
            initial: person.name?.charAt(0)?.toUpperCase() || '?',
            avatarSrc: person.avatarURL || undefined,
            relationship: person.relationship || null,
            tone: getToneForRelationship(person.relationship),
            birthday: person.birthday || null,
            userId: person.userID || null
        }));
    } catch (error) {
        console.error('[firestore] Failed to load persons:', error.message);
        return [];
    }
}

export async function getNotes({ limit } = {}) {
    try {
        const notes = await getCachedCollection('notes', { limit });

        return notes.map((note) => ({
            id: note.id,
            text: note.text || '',
            category: note.category || null,
            createdAt: note.createdAt || null,
            // Guessing common relation field names since the `notes` schema doesn't show one yet.
            // Update this if your real field name is different (e.g. `contactId`).
            personId: note.personId || note.personID || note.contactId || null
        }));
    } catch (error) {
        console.error('[firestore] Failed to load notes:', error.message);
        return [];
    }
}

export async function getWishlists({ limit } = {}) {
    try {
        return await getCachedCollection('wishlists', { limit });
    } catch (error) {
        console.error('[firestore] Failed to load wishlists:', error.message);
        return [];
    }
}
