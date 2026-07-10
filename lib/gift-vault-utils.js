/*
Pure, client-safe helpers for mapping raw Firestore fields to UI-friendly values.
Kept separate from `lib/firestore.js` (which imports firebase-admin) so these can be
imported from Client Components without pulling in server-only code.
*/

const RELATIONSHIP_TONES = {
    partner: 'pink',
    spouse: 'pink',
    boyfriend: 'pink',
    girlfriend: 'pink',
    friend: 'amber',
    colleague: 'amber',
    coworker: 'amber',
    family: 'blue',
    parent: 'blue',
    mother: 'blue',
    father: 'blue',
    sibling: 'blue'
};

export function getToneForRelationship(relationship) {
    if (!relationship) {
        return 'pink';
    }
    return RELATIONSHIP_TONES[relationship.toLowerCase()] || 'pink';
}

/*
Firestore Admin SDK returns Timestamp instances (with a `.toDate()` method) for date fields,
but values typed manually into the console are often plain strings. This handles both.
*/
export function toDate(value) {
    if (!value) {
        return null;
    }

    if (typeof value?.toDate === 'function') {
        return value.toDate();
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatShortDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatRelativeTime(value) {
    const date = toDate(value);
    if (!date) {
        return '';
    }

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths > 0) {
        return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
    if (diffWeeks > 0) {
        return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    }
    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
}

/*
Given a birthday (any month/year), returns the number of days until the next
occurrence of that birthday (today counts as 0) plus the resolved next date.
*/
export function getNextBirthdayCountdown(birthday) {
    const birthDate = toDate(birthday);
    if (!birthDate) {
        return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    nextBirthday.setHours(0, 0, 0, 0);

    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const daysUntil = Math.round((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return { nextBirthdayDate: nextBirthday, daysUntil };
}
