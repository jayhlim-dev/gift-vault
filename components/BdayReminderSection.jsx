'use client';

import { UpcomingCard } from 'components/UpcomingCard';
import { buildUpcomingItems } from 'lib/reminder-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Link from 'next/link';

export function BdayReminderSection() {
    const { data: persons, isLoading: personsLoading } = useFirebaseCollection('persons');
    const { data: reminders, isLoading: remindersLoading } = useFirebaseCollection('reminders');
    const isLoading = personsLoading || remindersLoading;

    if (isLoading) {
        return (
            <section className="w-full">
                <header className="mb-4 flex items-start justify-between gap-3">
                    <h4 className="leading-tight font-semibold text-gray-800">Upcoming</h4>
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

    const upcomingItems = buildUpcomingItems({ persons, reminders });
    const primaryItem = upcomingItems[0];

    if (!primaryItem) {
        return null;
    }

    const href =
        primaryItem.type === 'birthday'
            ? `/persons/${primaryItem.personId}`
            : `/persons/${primaryItem.personId}?tab=reminders`;

    return (
        <section className="w-full">
            <header className="mb-4 flex items-start justify-between gap-3">
                <h4 className="leading-tight font-semibold text-gray-800">Upcoming</h4>
                {upcomingItems.length > 1 ? (
                    <Link
                        href="/reminders"
                        className="pt-0.5 text-right text-xs leading-tight font-semibold text-rose-400 no-underline transition hover:text-rose-500"
                    >
                        See all
                    </Link>
                ) : null}
            </header>

            <UpcomingCard
                icon={primaryItem.icon}
                label={primaryItem.label}
                dateText={primaryItem.dateText}
                dueText={primaryItem.dueText}
                href={href}
                className="animate-fade-in"
            />
        </section>
    );
}
