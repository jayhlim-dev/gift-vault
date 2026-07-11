import { validateHttpsUrl } from 'lib/gift-vault-utils';

export const RESTAURANT_NOTE_TAG = 'restaurant';

export const RESTAURANT_NOTE_FIELDS = ['restaurantName', 'location', 'menuUrl', 'instagramUrl'];

export function isStructuredRestaurantNote(note) {
    return Boolean(note?.restaurantName?.trim());
}

export function isRestaurantNote(note) {
    return (note?.category || '') === RESTAURANT_NOTE_TAG;
}

export function isLegacyRestaurantNote(note) {
    return isRestaurantNote(note) && !isStructuredRestaurantNote(note);
}

export function getRestaurantNoteTitle(note) {
    if (isStructuredRestaurantNote(note)) {
        return note.restaurantName.trim();
    }

    return note?.text?.trim() || '';
}

export function getRestaurantNotePreview(note) {
    if (!isStructuredRestaurantNote(note)) {
        return '';
    }

    return note?.text?.trim() || note?.location?.trim() || '';
}

export function getNoteDisplayTitle(note) {
    if (isRestaurantNote(note)) {
        return getRestaurantNoteTitle(note);
    }

    return note?.text?.trim() || '';
}

export function getNoteDisplayBody(note) {
    if (isStructuredRestaurantNote(note)) {
        return getRestaurantNotePreview(note);
    }

    return '';
}

export function noteHasRestaurantLinks(note) {
    return Boolean(note?.location?.trim() || note?.menuUrl?.trim() || note?.instagramUrl?.trim());
}

export function formatUrlForDisplay(url) {
    const trimmed = (url || '').trim();
    if (!trimmed) {
        return '';
    }

    try {
        const parsed = new URL(trimmed);
        const host = parsed.hostname.replace(/^www\./, '');
        const path = `${parsed.pathname}${parsed.search}`;

        if (!path || path === '/') {
            return host;
        }

        const compactPath = path.length > 28 ? `${path.slice(0, 28)}...` : path;
        return `${host}${compactPath}`;
    } catch {
        return trimmed.length > 42 ? `${trimmed.slice(0, 42)}...` : trimmed;
    }
}

export function initRestaurantFieldsFromNote(note) {
    if (!note) {
        return {
            restaurantName: '',
            location: '',
            menuUrl: '',
            instagramUrl: ''
        };
    }

    if (isStructuredRestaurantNote(note)) {
        return {
            restaurantName: note.restaurantName || '',
            location: note.location || '',
            menuUrl: note.menuUrl || '',
            instagramUrl: note.instagramUrl || ''
        };
    }

    return {
        restaurantName: '',
        location: '',
        menuUrl: '',
        instagramUrl: ''
    };
}

export function normalizeOptionalHttpsUrl(value, fieldLabel) {
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

export function buildRestaurantFieldsForApi({ restaurantName, location, menuUrl, instagramUrl }) {
    return {
        restaurantName: (restaurantName || '').trim(),
        location: (location || '').trim(),
        menuUrl: normalizeOptionalHttpsUrl(menuUrl, 'Menu link'),
        instagramUrl: normalizeOptionalHttpsUrl(instagramUrl, 'Instagram link')
    };
}

export function buildEmptyRestaurantFields() {
    return {
        restaurantName: '',
        location: '',
        menuUrl: '',
        instagramUrl: ''
    };
}

export function validateRestaurantNoteInput({ restaurantName, text, menuUrl, instagramUrl, isLegacy = false }) {
    const name = (restaurantName || '').trim();
    const notes = (text || '').trim();

    if (isLegacy) {
        if (!notes) {
            return 'Note content is required';
        }

        return '';
    }

    if (!name) {
        return 'Restaurant name is required';
    }

    try {
        normalizeOptionalHttpsUrl(menuUrl, 'Menu link');
        normalizeOptionalHttpsUrl(instagramUrl, 'Instagram link');
    } catch (error) {
        return error.message;
    }

    return '';
}
