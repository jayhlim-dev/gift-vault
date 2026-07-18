import { getNoteTagLabel } from 'lib/note-tags';
import { getNoteDisplayBody, getNoteDisplayTitle } from 'lib/restaurant-note-utils';

function normalize(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function matchesQuery(haystack, query) {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) {
        return false;
    }

    const normalizedHaystack = normalize(haystack);
    if (!normalizedHaystack) {
        return false;
    }

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return tokens.every((token) => normalizedHaystack.includes(token));
}

function noteSearchBlob(note) {
    return [
        getNoteDisplayTitle(note),
        getNoteDisplayBody(note),
        note?.text,
        note?.restaurantName,
        note?.hobbyName,
        note?.location,
        note?.category,
        getNoteTagLabel(note?.category)
    ]
        .filter(Boolean)
        .join(' ');
}

export function searchPersons(persons, query) {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) {
        return [];
    }

    return persons
        .filter((person) =>
            matchesQuery([person.name, person.bio, person.relationship].filter(Boolean).join(' '), normalizedQuery)
        )
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

export function searchNotes(notes, query) {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) {
        return [];
    }

    return notes
        .filter((note) => matchesQuery(noteSearchBlob(note), normalizedQuery))
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

export function hasSearchQuery(query) {
    return normalize(query).length > 0;
}
