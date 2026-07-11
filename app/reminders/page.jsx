'use client';

import { UpcomingCard } from 'components/UpcomingCard';
import { buildUpcomingItems } from 'lib/reminder-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Image from 'next/image';
import Link from 'next/link';
import RemindersEmptyImage from 'public/images/assets/notif-ill.png';

export default function RemindersPage() {
    const { data: persons, isLoading: personsLoading } = useFirebaseCollection('persons');
    const { data: reminders, isLoading: remindersLoading } = useFirebaseCollection('reminders');
    const isLoading = personsLoading || remindersLoading;

    const personById = new Map(persons.map((person) => [person.id, person]));
    const upcomingItems = buildUpcomingItems({ persons, reminders });

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-5 pb-28 text-neutral-900">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-neutral-900">Reminders</h1>
                <p className="text-sm text-neutral-500">Birthdays and things to remember for the people you care about.</p>
            </header>

            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {[0, 1, 2].map((key) => (
                        <div key={key} className="h-20 animate-pulse rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]" />
                    ))}
                </div>
            ) : upcomingItems.length ? (
                <ul className="flex flex-col gap-3">
                    {upcomingItems.map((item) => {
                        const person = personById.get(item.personId);
                        const subtitle =
                            item.type === 'reminder' && person
                                ? `${person.name} · ${item.dateText}`
                                : item.dateText;
                        const href =
                            item.type === 'birthday'
                                ? `/persons/${item.personId}`
                                : `/persons/${item.personId}?tab=reminders`;

                        return (
                            <li key={item.id}>
                                <UpcomingCard
                                    icon={item.icon}
                                    label={item.type === 'reminder' && person ? `${person.name}: ${item.label}` : item.label}
                                    dateText={subtitle}
                                    dueText={item.dueText}
                                    href={href}
                                />
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-8 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <Image src={RemindersEmptyImage} alt="" className="h-32 w-auto object-contain" aria-hidden="true" />
                    <p className="text-sm font-semibold text-neutral-800">Nothing upcoming yet.</p>
                    <p className="mt-1 text-xs text-neutral-400">
                        Add birthdays to people or create reminders on their profile page.
                    </p>
                    <Link href="/" className="mt-4 inline-block text-sm font-semibold text-[#D4625A] no-underline">
                        Back to home
                    </Link>
                </div>
            )}
        </div>
    );
}
