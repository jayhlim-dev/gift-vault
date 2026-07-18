'use client';

import { UpcomingCard } from 'components/UpcomingCard';
import { buildUpcomingItems, getUpcomingItemDisplay } from 'lib/reminder-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Link from 'next/link';

export function BdayReminderSection() {
    const { data: persons, isLoading: personsLoading } = useFirebaseCollection('persons');
    const { data: reminders, isLoading: remindersLoading } = useFirebaseCollection('reminders');
    const isLoading = personsLoading || remindersLoading;

    if (isLoading) {
        return (
            <section className="w-full">
                <header className="mb-3 flex items-end justify-between gap-3">
                    <div>
                        <h4 className="leading-tight font-semibold text-neutral-800">Upcoming</h4>
                        <p className="mt-0.5 text-2xs text-neutral-400">Loading…</p>
                    </div>
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

    const personById = new Map(persons.map((person) => [person.id, person]));
    const upcomingItems = buildUpcomingItems({ persons, reminders });
    const previewItems = upcomingItems.slice(0, 2);

    if (!previewItems.length) {
        return null;
    }

    return (
        <section className="w-full">
            <header className="mb-3 flex items-end justify-between gap-3">
                <div>
                    <h4 className="leading-tight font-semibold text-neutral-800">Upcoming</h4>
                    <p className="mt-0.5 text-2xs text-neutral-400">
                        {upcomingItems.length} coming up
                        {upcomingItems.some((item) => item.daysUntil === 0) ? ' · something today' : ''}
                    </p>
                </div>
                {upcomingItems.length > 1 ? (
                    <Link
                        href="/reminders"
                        className="text-xs font-semibold text-[#D4625A] no-underline transition hover:text-[#c4564f]"
                    >
                        See all
                    </Link>
                ) : null}
            </header>

            <ul className="flex flex-col gap-2">
                {previewItems.map((item) => {
                    const person = personById.get(item.personId);
                    const { title, subtitle } = getUpcomingItemDisplay(item, person);
                    const href =
                        item.type === 'birthday'
                            ? `/persons/${item.personId}`
                            : `/persons/${item.personId}?tab=reminders`;
                    const isToday = item.daysUntil === 0;

                    return (
                        <li key={item.id}>
                            <UpcomingCard
                                icon={item.icon}
                                label={title}
                                dateText={subtitle}
                                dueText={item.dueText}
                                href={href}
                                emphasized={isToday}
                                className="animate-fade-in"
                            />
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
