const NOTE_TAG_INACTIVE_CLASS = 'border-[#F0E8E5] bg-[#FAF8F7] text-neutral-600';

export const NOTE_TAGS = [
    { id: 'food-drinks', label: 'Food & Drinks', className: NOTE_TAG_INACTIVE_CLASS },
    { id: 'restaurant', label: 'Restaurant', className: NOTE_TAG_INACTIVE_CLASS },
    { id: 'gift-ideas', label: 'Gift Ideas', className: NOTE_TAG_INACTIVE_CLASS },
    { id: 'hobbies', label: 'Hobbies', className: NOTE_TAG_INACTIVE_CLASS },
    { id: 'routine', label: 'Routine', className: NOTE_TAG_INACTIVE_CLASS },
    { id: 'other', label: 'Other', className: NOTE_TAG_INACTIVE_CLASS }
];

export const LEGACY_NOTE_TAG_LABELS = {
    skincare: 'Skincare',
    allergy: 'Allergy & Diet',
    size: 'Size',
    favorites: 'Favorites'
};

export const DEFAULT_NOTE_TAG = 'other';

export const NOTE_TAG_ACTIVE_CLASS = 'border-[#D4625A] bg-[#FDF5F4] text-[#D4625A]';

export function getNoteTagLabel(category) {
    if (!category) {
        return '';
    }

    const activeTag = NOTE_TAGS.find((tag) => tag.id === category);
    if (activeTag) {
        return activeTag.label;
    }

    if (LEGACY_NOTE_TAG_LABELS[category]) {
        return LEGACY_NOTE_TAG_LABELS[category];
    }

    return category
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function getFilterTagsForNotes(usedTagIds) {
    const activeTags = NOTE_TAGS.filter((tag) => usedTagIds.has(tag.id));
    const legacyTags = Object.entries(LEGACY_NOTE_TAG_LABELS)
        .filter(([id]) => usedTagIds.has(id))
        .map(([id, label]) => ({ id, label, className: NOTE_TAG_INACTIVE_CLASS }));

    return [...activeTags, ...legacyTags];
}
