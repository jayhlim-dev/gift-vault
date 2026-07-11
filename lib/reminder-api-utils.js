import { toIsoDateString } from 'lib/reminder-utils';

function normalizeTime(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
        return '';
    }

    if (!/^\d{2}:\d{2}$/.test(trimmed)) {
        throw new Error('Time must use HH:MM format');
    }

    const [hours, minutes] = trimmed.split(':').map(Number);
    if (hours > 23 || minutes > 59) {
        throw new Error('Time is invalid');
    }

    return trimmed;
}

function normalizeDueDate(value) {
    const isoDate = toIsoDateString(value);
    if (!isoDate) {
        return '';
    }

    return isoDate;
}

export function buildReminderCreatePayload(body) {
    const title = (body.title || '').trim();
    const notes = (body.notes || '').trim();
    const dueDate = normalizeDueDate(body.dueDate);

    if (!title) {
        return { error: 'Reminder title is required' };
    }

    if (!dueDate) {
        return { error: 'Due date is required' };
    }

    try {
        const dueTime = normalizeTime(body.dueTime);
        return {
            payload: {
                title,
                notes,
                dueDate,
                dueTime,
                isDone: false,
                personId: body.personId || ''
            }
        };
    } catch (error) {
        return { error: error.message };
    }
}

export function buildReminderUpdatePayload(body, existingReminder = {}) {
    const updates = {};
    const editableFields = ['title', 'notes', 'dueDate', 'dueTime', 'isDone'];

    for (const field of editableFields) {
        if (body[field] !== undefined) {
            updates[field] = body[field];
        }
    }

    if (updates.title !== undefined) {
        updates.title = (updates.title || '').trim();
        if (!updates.title) {
            return { error: 'Reminder title is required' };
        }
    }

    if (updates.notes !== undefined) {
        updates.notes = (updates.notes || '').trim();
    }

    if (updates.dueDate !== undefined) {
        const dueDate = normalizeDueDate(updates.dueDate);
        if (!dueDate) {
            return { error: 'Due date is required' };
        }
        updates.dueDate = dueDate;
    }

    if (updates.isDone !== undefined) {
        updates.isDone = Boolean(updates.isDone);
        if (updates.isDone) {
            updates.completedAt = new Date().toISOString();
        } else {
            updates.completedAt = '';
        }
    }

    try {
        if (updates.dueTime !== undefined) {
            updates.dueTime = normalizeTime(updates.dueTime);
        }
    } catch (error) {
        return { error: error.message };
    }

    const finalDueDate = updates.dueDate ?? existingReminder.dueDate;
    if (!normalizeDueDate(finalDueDate)) {
        return { error: 'Due date is required' };
    }

    if (!Object.keys(updates).length) {
        return { error: 'No valid fields to update' };
    }

    return { updates };
}
