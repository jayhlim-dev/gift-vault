'use client';

import { formatShortDate, getNextBirthdayCountdown } from 'lib/gift-vault-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import { BdayCard } from './BdayCard';

export function BdayReminderSection() {
    const { data: persons, isLoading } = useFirebaseCollection('persons');

    if (isLoading) {
        return (
            <section className="w-full">
                <header className="mb-4 flex items-start justify-between gap-3">
                    <h4 className="leading-tight text-gray-800 font-semibold">Upcoming</h4>
                </header>
                <div className="flex h-20 w-full items-center justify-between rounded-2xl bg-white px-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 animate-pulse rounded-xl bg-neutral-200" />
                        <div className="flex flex-col gap-2">
                            <div className="h-3 w-20 animate-pulse rounded-full bg-neutral-200" />
                            <div className="h-2.5 w-14 animate-pulse rounded-full bg-neutral-200" />
                        </div>
                    </div>
                    <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-200" />
                </div>
            </section>
        );
    }

    const upcomingBirthdays = persons
        .map((person) => {
            const countdown = getNextBirthdayCountdown(person.birthday);
            return countdown ? { ...person, ...countdown } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.daysUntil - b.daysUntil);

    const primaryPerson = upcomingBirthdays[0];

    if (!primaryPerson) {
        return null;
    }

    const dueText = primaryPerson.daysUntil === 0 ? 'Today' : `in ${primaryPerson.daysUntil} day${primaryPerson.daysUntil > 1 ? 's' : ''}`;

    return (
        <section className="w-full">
            <header className="mb-4 flex items-start justify-between gap-3">
                <h4 className="leading-tight text-gray-800 font-semibold">Upcoming</h4>
                <button
                    type="button"
                    className="pt-0.5 text-right text-xs leading-tight font-semibold text-rose-400 no-underline transition hover:text-rose-400 "
                >
                    See all
                </button>
            </header>

            <BdayCard
                label={primaryPerson.name}
                dateText={formatShortDate(primaryPerson.nextBirthdayDate)}
                dueText={dueText}
                stackCount={upcomingBirthdays.length}
                className="animate-fade-in"
            />
        </section>
    );
}
