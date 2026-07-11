import { formatShortDate, getNextBirthdayCountdown, toDate } from 'lib/gift-vault-utils';

export function toIsoDateString(value) {
    const date = toDate(value);
    if (!date) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function todayIsoDate() {
    return toIsoDateString(new Date());
}

export function formatReminderTime(time) {
    const trimmed = (time || '').trim();
    if (!trimmed) {
        return '';
    }

    const [hours, minutes] = trimmed.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return trimmed;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatReminderDateTime(reminder) {
    const date = toDate(reminder?.dueDate);
    if (!date) {
        return '';
    }

    const parts = [formatShortDate(date)];
    const timeLabel = formatReminderTime(reminder?.dueTime);
    if (timeLabel) {
        parts.push(timeLabel);
    }

    return parts.join(' · ');
}

export function getDaysUntilReminder(reminder) {
    if (!reminder || reminder.isDone) {
        return null;
    }

    const dueDate = toDate(reminder.dueDate);
    if (!dueDate) {
        return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatReminderDueText(daysUntil) {
    if (daysUntil === 0) {
        return 'Today';
    }

    if (daysUntil === 1) {
        return 'Tomorrow';
    }

    if (daysUntil < 0) {
        const overdueDays = Math.abs(daysUntil);
        return `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`;
    }

    return `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
}

export function sortRemindersByDueDate(reminders) {
    return reminders
        .slice()
        .filter((reminder) => !reminder.isDone)
        .map((reminder) => ({
            reminder,
            daysUntil: getDaysUntilReminder(reminder)
        }))
        .filter((entry) => entry.daysUntil !== null)
        .sort((a, b) => a.daysUntil - b.daysUntil || a.reminder.title.localeCompare(b.reminder.title))
        .map((entry) => entry.reminder);
}

export function buildUpcomingItems({ persons = [], reminders = [] }) {
    const birthdays = persons
        .map((person) => {
            const countdown = getNextBirthdayCountdown(person.birthday);
            if (!countdown) {
                return null;
            }

            return {
                type: 'birthday',
                id: `birthday-${person.id}`,
                personId: person.id,
                label: person.name,
                dateText: formatShortDate(countdown.nextBirthdayDate),
                dueText:
                    countdown.daysUntil === 0
                        ? 'Today'
                        : `in ${countdown.daysUntil} day${countdown.daysUntil > 1 ? 's' : ''}`,
                daysUntil: countdown.daysUntil,
                icon: '🎂'
            };
        })
        .filter(Boolean);

    const reminderItems = reminders
        .filter((reminder) => !reminder.isDone)
        .map((reminder) => {
            const daysUntil = getDaysUntilReminder(reminder);
            if (daysUntil === null) {
                return null;
            }

            return {
                type: 'reminder',
                id: reminder.id,
                personId: reminder.personId,
                label: reminder.title,
                dateText: formatReminderDateTime(reminder),
                dueText: formatReminderDueText(daysUntil),
                daysUntil,
                icon: '⏰'
            };
        })
        .filter(Boolean);

    return [...birthdays, ...reminderItems].sort((a, b) => a.daysUntil - b.daysUntil || a.label.localeCompare(b.label));
}
