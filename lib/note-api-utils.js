import { DEFAULT_NOTE_TAG } from 'lib/note-tags';
import {
    RESTAURANT_NOTE_TAG,
    buildEmptyRestaurantFields,
    buildRestaurantFieldsForApi
} from 'lib/restaurant-note-utils';

function hasStructuredRestaurantInput(body) {
    return Boolean((body.restaurantName || '').trim());
}

export function buildNoteCreatePayload(body) {
    const category = body.category || DEFAULT_NOTE_TAG;
    const text = (body.text || '').trim();
    const payload = {
        text,
        category,
        noteDate: body.noteDate || '',
        isPinned: Boolean(body.isPinned),
        personId: body.personId || ''
    };

    if (category === RESTAURANT_NOTE_TAG && hasStructuredRestaurantInput(body)) {
        try {
            const restaurantFields = buildRestaurantFieldsForApi(body);
            if (!restaurantFields.restaurantName) {
                return { error: 'Restaurant name is required' };
            }

            return {
                payload: {
                    ...payload,
                    text,
                    ...restaurantFields
                }
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    if (!text) {
        return { error: 'Note text is required' };
    }

    return { payload };
}

export function buildNoteUpdatePayload(body, existingNote = {}) {
    const updates = {};
    const editableFields = ['text', 'category', 'noteDate', 'isPinned', 'restaurantName', 'location', 'menuUrl', 'instagramUrl'];

    for (const field of editableFields) {
        if (body[field] !== undefined) {
            updates[field] = body[field];
        }
    }

    if (updates.text !== undefined) {
        updates.text = (updates.text || '').trim();
    }

    if (updates.isPinned !== undefined) {
        updates.isPinned = Boolean(updates.isPinned);
    }

    const nextCategory = updates.category ?? existingNote.category ?? DEFAULT_NOTE_TAG;

    if (nextCategory === RESTAURANT_NOTE_TAG && hasStructuredRestaurantInput({ ...existingNote, ...updates })) {
        try {
            const restaurantFields = buildRestaurantFieldsForApi({ ...existingNote, ...updates });
            if (!restaurantFields.restaurantName) {
                return { error: 'Restaurant name is required' };
            }

            Object.assign(updates, restaurantFields);
        } catch (error) {
            return { error: error.message };
        }
    } else if (nextCategory !== RESTAURANT_NOTE_TAG) {
        Object.assign(updates, buildEmptyRestaurantFields());
    }

    const finalText = (updates.text ?? existingNote.text ?? '').trim();
    const restaurantName = (updates.restaurantName ?? existingNote.restaurantName ?? '').trim();
    const isStructuredRestaurant = nextCategory === RESTAURANT_NOTE_TAG && Boolean(restaurantName);

    if (!isStructuredRestaurant && !finalText) {
        return { error: 'Note text is required' };
    }

    if (!Object.keys(updates).length) {
        return { error: 'No valid fields to update' };
    }

    return { updates };
}
