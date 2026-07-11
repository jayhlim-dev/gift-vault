import { DEFAULT_NOTE_TAG } from 'lib/note-tags';
import {
    HOBBY_NOTE_TAG,
    buildEmptyHobbyFields,
    buildHobbyFieldsForApi
} from 'lib/hobby-note-utils';
import {
    RESTAURANT_NOTE_TAG,
    buildEmptyRestaurantFields,
    buildRestaurantFieldsForApi
} from 'lib/restaurant-note-utils';

function hasStructuredRestaurantInput(body) {
    return Boolean((body.restaurantName || '').trim());
}

function hasStructuredHobbyInput(body) {
    return Boolean((body.hobbyName || '').trim());
}

function applyStructuredFieldsForCategory(category, body) {
    if (category === RESTAURANT_NOTE_TAG && hasStructuredRestaurantInput(body)) {
        const restaurantFields = buildRestaurantFieldsForApi(body);
        if (!restaurantFields.restaurantName) {
            return { error: 'Restaurant name is required' };
        }

        return {
            payload: {
                ...buildEmptyHobbyFields(),
                ...restaurantFields
            }
        };
    }

    if (category === HOBBY_NOTE_TAG && hasStructuredHobbyInput(body)) {
        const hobbyFields = buildHobbyFieldsForApi(body);
        if (!hobbyFields.hobbyName) {
            return { error: 'Hobby name is required' };
        }

        return {
            payload: {
                ...buildEmptyRestaurantFields(),
                ...hobbyFields
            }
        };
    }

    return {
        payload: {
            ...buildEmptyRestaurantFields(),
            ...buildEmptyHobbyFields()
        }
    };
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
            const result = applyStructuredFieldsForCategory(category, body);
            if (result.error) {
                return { error: result.error };
            }

            return {
                payload: {
                    ...payload,
                    text,
                    ...result.payload
                }
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    if (category === HOBBY_NOTE_TAG && hasStructuredHobbyInput(body)) {
        try {
            const result = applyStructuredFieldsForCategory(category, body);
            if (result.error) {
                return { error: result.error };
            }

            return {
                payload: {
                    ...payload,
                    text,
                    ...result.payload
                }
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    if (!text) {
        return { error: 'Note text is required' };
    }

    return {
        payload: {
            ...payload,
            ...buildEmptyRestaurantFields(),
            ...buildEmptyHobbyFields()
        }
    };
}

export function buildNoteUpdatePayload(body, existingNote = {}) {
    const updates = {};
    const editableFields = [
        'text',
        'category',
        'noteDate',
        'isPinned',
        'restaurantName',
        'location',
        'menuUrl',
        'instagramUrl',
        'hobbyName',
        'destination'
    ];

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
    const merged = { ...existingNote, ...updates };

    try {
        if (nextCategory === RESTAURANT_NOTE_TAG && hasStructuredRestaurantInput(merged)) {
            const restaurantFields = buildRestaurantFieldsForApi(merged);
            if (!restaurantFields.restaurantName) {
                return { error: 'Restaurant name is required' };
            }

            Object.assign(updates, buildEmptyHobbyFields(), restaurantFields);
        } else if (nextCategory === HOBBY_NOTE_TAG && hasStructuredHobbyInput(merged)) {
            const hobbyFields = buildHobbyFieldsForApi(merged);
            if (!hobbyFields.hobbyName) {
                return { error: 'Hobby name is required' };
            }

            Object.assign(updates, buildEmptyRestaurantFields(), hobbyFields);
        } else if (nextCategory !== RESTAURANT_NOTE_TAG) {
            Object.assign(updates, buildEmptyRestaurantFields());
        }

        if (nextCategory !== HOBBY_NOTE_TAG) {
            Object.assign(updates, buildEmptyHobbyFields());
        }
    } catch (error) {
        return { error: error.message };
    }

    const finalText = (updates.text ?? existingNote.text ?? '').trim();
    const restaurantName = (updates.restaurantName ?? existingNote.restaurantName ?? '').trim();
    const hobbyName = (updates.hobbyName ?? existingNote.hobbyName ?? '').trim();
    const isStructuredRestaurant = nextCategory === RESTAURANT_NOTE_TAG && Boolean(restaurantName);
    const isStructuredHobby = nextCategory === HOBBY_NOTE_TAG && Boolean(hobbyName);

    if (!isStructuredRestaurant && !isStructuredHobby && !finalText) {
        return { error: 'Note text is required' };
    }

    if (!Object.keys(updates).length) {
        return { error: 'No valid fields to update' };
    }

    return { updates };
}
