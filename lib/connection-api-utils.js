import { CONNECTION_TYPES, REVERSE_CONNECTION_LABEL } from 'lib/connection-utils';

const VALID_LABELS = new Set(CONNECTION_TYPES.map((type) => type.id));

export function buildConnectionCreatePayload(body) {
    const personId = (body.personId || '').trim();
    const linkedPersonId = (body.linkedPersonId || '').trim();
    const label = (body.label || '').trim();

    if (!personId) {
        return { error: 'personId is required' };
    }

    if (!linkedPersonId) {
        return { error: 'linkedPersonId is required' };
    }

    if (personId === linkedPersonId) {
        return { error: 'A person cannot be linked to themselves' };
    }

    if (!VALID_LABELS.has(label)) {
        return { error: 'Invalid connection type' };
    }

    return {
        payload: {
            personId,
            linkedPersonId,
            label
        },
        reverseLabel: REVERSE_CONNECTION_LABEL[label]
    };
}
