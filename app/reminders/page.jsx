'use client';

import { UpcomingCard } from 'components/UpcomingCard';
import { CakeIcon, RemindersTabIcon } from 'components/persons/PersonIcons';
import { buildUpcomingItems, getUpcomingItemDisplay } from 'lib/reminder-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Image from 'next/image';
import Link from 'next/link';
import RemindersEmptyImage from 'public/images/assets/notif-ill.png';
import { useEffect, useMemo, useState } from 'react';

function RemindersPersonFilter({ activePersonId, onChange, people }) {
    const options = [{ id: 'all', label: 'All' }, ...people.map((person) => ({ id: person.id, label: person.name }))];

    return (
        <div
            role="tablist"
            aria-label="Filter by person"
            className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-[0_2px_10px_rgba(0,0,0,0.04)] scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
            {options.map((option) => {
                const isActive = activePersonId === option.id;
                return (
                    <button
                        key={option.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(option.id)}
                        className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition ${
                            isActive
                                ? 'bg-[#D4625A] text-white shadow-[0_4px_14px_rgba(212,98,90,0.24)]'
                                : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                    >
                        {formatPersonName(option.label)}
                    </button>
                );
            })}
        </div>
    );
}

function formatPersonName(name) {
    if (name === 'All') {
        return name;
    }

    const trimmed = (name || '').trim();
    if (!trimmed) {
        return 'Unnamed';
    }

    return trimmed.replace(/\b\w/g, (char) => char.toUpperCase());
}

function RemindersPageHero({ upcomingCount, todayCount, isLoading }) {
    return (
        <header className="overflow-hidden rounded-3xl border border-[#F0E8E5] bg-linear-to-br from-white via-[#FFFCFB] to-[#FDEBEA]/70 px-5 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FDEBEA] text-[#D4625A] shadow-[0_4px_14px_rgba(212,98,90,0.12)]">
                    <RemindersTabIcon size={22} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-2xs font-semibold tracking-[0.12em] text-[#D4625A] uppercase">Stay ahead</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">Reminders</h1>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
                        Birthdays and things to remember for the people you care about.
                    </p>
                </div>
            </div>

            {!isLoading ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-2xs font-semibold text-neutral-600 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                        <RemindersTabIcon size={12} />
                        {upcomingCount} upcoming
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-2xs font-semibold text-neutral-600 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                        <CakeIcon size={12} />
                        {todayCount} today
                    </span>
                </div>
            ) : (
                <div className="mt-4 flex gap-2">
                    <div className="h-7 w-24 animate-pulse rounded-full bg-white/80" />
                    <div className="h-7 w-20 animate-pulse rounded-full bg-white/80" />
                </div>
            )}
        </header>
    );
}

function RemindersEmptyState({ hasPeople }) {
    return (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <Image src={RemindersEmptyImage} alt="" className="h-36 w-auto object-contain" aria-hidden="true" />
            <h2 className="mt-5 text-base font-bold text-neutral-900">Nothing upcoming yet</h2>
            <p className="mt-2 max-w-68 text-sm leading-relaxed text-neutral-500">
                {hasPeople
                    ? 'Add birthdays on profiles or create reminders so important dates show up here.'
                    : 'Add someone first, then set their birthday or a reminder to keep track of.'}
            </p>
            <div className="mt-6 flex w-full flex-col gap-2.5">
                <Link
                    href={hasPeople ? '/persons' : '/persons/new'}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#D4625A] px-5 py-3.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition hover:bg-[#c4564f]"
                >
                    {hasPeople ? 'Browse people' : 'Add your first person'}
                </Link>
                {hasPeople ? (
                    <p className="text-2xs text-neutral-400">Tip: open a profile and use the Reminders tab.</p>
                ) : null}
            </div>
        </div>
    );
}

export default function RemindersPage() {
    const { data: persons, isLoading: personsLoading } = useFirebaseCollection('persons');
    const { data: reminders, isLoading: remindersLoading } = useFirebaseCollection('reminders');
    const [activePersonId, setActivePersonId] = useState('all');
    const isLoading = personsLoading || remindersLoading;

    const personById = useMemo(() => new Map(persons.map((person) => [person.id, person])), [persons]);
    const upcomingItems = useMemo(() => buildUpcomingItems({ persons, reminders }), [persons, reminders]);

    const filterPeople = useMemo(() => {
        const usedPersonIds = new Set(upcomingItems.map((item) => item.personId).filter(Boolean));
        return persons.filter((person) => usedPersonIds.has(person.id)).sort((a, b) => a.name.localeCompare(b.name));
    }, [persons, upcomingItems]);

    const filteredItems = useMemo(() => {
        if (activePersonId === 'all') {
            return upcomingItems;
        }

        return upcomingItems.filter((item) => item.personId === activePersonId);
    }, [activePersonId, upcomingItems]);

    const todayCount = useMemo(
        () => upcomingItems.filter((item) => item.daysUntil === 0).length,
        [upcomingItems]
    );

    useEffect(() => {
        if (activePersonId !== 'all' && !filterPeople.some((person) => person.id === activePersonId)) {
            setActivePersonId('all');
        }
    }, [activePersonId, filterPeople]);

    const showPersonFilter = !isLoading && upcomingItems.length > 0 && filterPeople.length > 0;

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-5 pb-28 text-neutral-900">
            <RemindersPageHero
                upcomingCount={upcomingItems.length}
                todayCount={todayCount}
                isLoading={isLoading}
            />

            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {[0, 1, 2].map((key) => (
                        <div
                            key={key}
                            className="h-20 animate-pulse rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                        />
                    ))}
                </div>
            ) : upcomingItems.length ? (
                <div className="flex flex-col gap-3">
                    {showPersonFilter ? (
                        <RemindersPersonFilter
                            activePersonId={activePersonId}
                            onChange={setActivePersonId}
                            people={filterPeople}
                        />
                    ) : null}

                    {filteredItems.length ? (
                        <ul className="flex flex-col gap-3">
                            {filteredItems.map((item) => {
                                const person = personById.get(item.personId);
                                const { title, subtitle } = getUpcomingItemDisplay(item, person);
                                const href =
                                    item.type === 'birthday'
                                        ? `/persons/${item.personId}`
                                        : `/persons/${item.personId}?tab=reminders`;

                                return (
                                    <li key={item.id}>
                                        <UpcomingCard
                                            icon={item.icon}
                                            label={title}
                                            dateText={subtitle}
                                            dueText={item.dueText}
                                            href={href}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                            <p className="text-sm font-semibold text-neutral-800">No reminders for this person.</p>
                            <p className="mt-1 text-xs text-neutral-400">Try another filter or add a new reminder.</p>
                        </div>
                    )}
                </div>
            ) : (
                <RemindersEmptyState hasPeople={persons.length > 0} />
            )}
        </div>
    );
}
