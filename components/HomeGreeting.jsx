'use client';

import { useAuth } from 'lib/auth/AuthContext';
import { buildUpcomingItems, getUpcomingItemDisplay } from 'lib/reminder-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import { useMemo } from 'react';

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
        return 'Good morning';
    }
    if (hour < 17) {
        return 'Good afternoon';
    }
    return 'Good evening';
}

function getFirstName(user) {
    const full = (user?.displayName || '').trim();
    if (!full) {
        return '';
    }
    return full.split(/\s+/)[0];
}

function formatShortDate() {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    }).format(new Date());
}

export function HomeGreeting() {
    const { user } = useAuth();
    const { data: persons } = useFirebaseCollection('persons');
    const { data: reminders } = useFirebaseCollection('reminders');

    const firstName = getFirstName(user);
    const greeting = getGreeting();

    const highlight = useMemo(() => {
        const personById = new Map(persons.map((person) => [person.id, person]));
        const upcoming = buildUpcomingItems({ persons, reminders });
        const today = upcoming.find((item) => item.daysUntil === 0);
        if (!today) {
            return null;
        }

        const person = personById.get(today.personId);
        const { title } = getUpcomingItemDisplay(today, person);
        return title;
    }, [persons, reminders]);

    return (
        <section className="animate-fade-in">
            <p className="text-2xs font-semibold tracking-[0.14em] text-[#D4625A] uppercase">{formatShortDate()}</p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-neutral-900">
                {greeting}
                {firstName ? `, ${firstName}` : ''}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
                {highlight ? (
                    <>
                        Today: <span className="font-semibold text-neutral-700">{highlight}</span>
                    </>
                ) : (
                    'Your notes, gifts, and reminders — all in one place.'
                )}
            </p>
        </section>
    );
}
