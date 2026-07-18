export const FAMILY_CONNECTION_TYPES = [
    { id: 'parent', label: 'Parent', group: 'family' },
    { id: 'child', label: 'Child', group: 'family' },
    { id: 'spouse', label: 'Spouse / Partner', group: 'family' },
    { id: 'sibling', label: 'Sibling', group: 'family' },
    { id: 'in_law', label: 'In-law', group: 'family' }
];

export const CIRCLE_CONNECTION_TYPES = [
    { id: 'friend', label: 'Friend', group: 'circle' },
    { id: 'best_friend', label: 'Best friend', group: 'circle' },
    { id: 'colleague', label: 'Colleague', group: 'circle' },
    { id: 'roommate', label: 'Roommate', group: 'circle' },
    { id: 'neighbor', label: 'Neighbor', group: 'circle' },
    { id: 'other', label: 'Other', group: 'circle' }
];

export const CONNECTION_TYPES = [...FAMILY_CONNECTION_TYPES, ...CIRCLE_CONNECTION_TYPES];

export const FAMILY_LABEL_IDS = new Set(FAMILY_CONNECTION_TYPES.map((type) => type.id));
export const CIRCLE_LABEL_IDS = new Set(CIRCLE_CONNECTION_TYPES.map((type) => type.id));

export const REVERSE_CONNECTION_LABEL = {
    parent: 'child',
    child: 'parent',
    spouse: 'spouse',
    sibling: 'sibling',
    in_law: 'in_law',
    friend: 'friend',
    best_friend: 'best_friend',
    colleague: 'colleague',
    roommate: 'roommate',
    neighbor: 'neighbor',
    other: 'other'
};

export const TREE_GROUP_ORDER = ['parent', 'spouse', 'sibling', 'child', 'in_law'];

export function getConnectionLabel(label) {
    return CONNECTION_TYPES.find((type) => type.id === label)?.label || 'Connection';
}

export function isFamilyConnection(connection) {
    return FAMILY_LABEL_IDS.has(connection?.label);
}

export function isCircleConnection(connection) {
    return CIRCLE_LABEL_IDS.has(connection?.label) || !isFamilyConnection(connection);
}

export function splitConnectionsByGroup(connections) {
    const family = [];
    const circle = [];

    for (const connection of connections) {
        if (isFamilyConnection(connection)) {
            family.push(connection);
        } else {
            circle.push(connection);
        }
    }

    return { family, circle };
}

export function groupFamilyConnectionsByLabel(connections) {
    const groups = Object.fromEntries(TREE_GROUP_ORDER.map((label) => [label, []]));

    for (const connection of connections) {
        if (TREE_GROUP_ORDER.includes(connection.label)) {
            groups[connection.label].push(connection);
        }
    }

    return groups;
}
