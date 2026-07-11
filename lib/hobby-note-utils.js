import { validateHttpsUrl } from 'lib/gift-vault-utils';

export const HOBBY_NOTE_TAG = 'hobbies';

export const HOBBY_NOTE_FIELDS = ['hobbyName', 'destination', 'instagramUrl'];

export function isStructuredHobbyNote(note) {
    return Boolean(note?.hobbyName?.trim());
}

export function isHobbyNote(note) {
    return (note?.category || '') === HOBBY_NOTE_TAG;
}

export function isLegacyHobbyNote(note) {
    return isHobbyNote(note) && !isStructuredHobbyNote(note);
}

export function getHobbyNoteTitle(note) {
    if (isStructuredHobbyNote(note)) {
        return note.hobbyName.trim();
    }

    return note?.text?.trim() || '';
}

export function getHobbyNotePreview(note) {
    if (!isStructuredHobbyNote(note)) {
        return '';
    }

    return note?.destination?.trim() || note?.text?.trim() || '';
}

export function initHobbyFieldsFromNote(note) {
    if (!note) {
        return {
            hobbyName: '',
            destination: '',
            instagramUrl: ''
        };
    }

    if (isStructuredHobbyNote(note)) {
        return {
            hobbyName: note.hobbyName || '',
            destination: note.destination || '',
            instagramUrl: note.instagramUrl || ''
        };
    }

    return {
        hobbyName: '',
        destination: '',
        instagramUrl: ''
    };
}

function normalizeOptionalHttpsUrl(value, fieldLabel) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
        return '';
    }

    const { url, error } = validateHttpsUrl(trimmed);
    if (error) {
        throw new Error(`${fieldLabel}: ${error}`);
    }

    return url || trimmed;
}

export function noteHasHobbyLinks(note) {
    return Boolean(note?.destination?.trim() || note?.instagramUrl?.trim());
}

export function buildHobbyFieldsForApi({ hobbyName, destination, instagramUrl }) {
    return {
        hobbyName: (hobbyName || '').trim(),
        destination: (destination || '').trim(),
        instagramUrl: normalizeOptionalHttpsUrl(instagramUrl, 'Instagram link')
    };
}

export function buildEmptyHobbyFields() {
    return {
        hobbyName: '',
        destination: '',
        instagramUrl: ''
    };
}

export function validateHobbyNoteInput({ hobbyName, instagramUrl, isLegacy = false, text }) {
    const name = (hobbyName || '').trim();
    const notes = (text || '').trim();

    if (isLegacy) {
        if (!notes) {
            return 'Note content is required';
        }

        return '';
    }

    if (!name) {
        return 'Hobby name is required';
    }

    try {
        normalizeOptionalHttpsUrl(instagramUrl, 'Instagram link');
    } catch (error) {
        return error.message;
    }

    return '';
}
