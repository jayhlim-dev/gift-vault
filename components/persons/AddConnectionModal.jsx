'use client';

import { BackButton } from 'components/BackButton';
import { PersonIcon } from 'components/persons/PersonIcons';
import {
    CIRCLE_CONNECTION_TYPES,
    CONNECTION_TYPES,
    FAMILY_CONNECTION_TYPES
} from 'lib/connection-utils';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useLoading } from 'lib/LoadingContext';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const fieldClassName =
    'w-full rounded-full border border-[#F0E8E5] bg-white px-5 py-3.5 text-sm font-normal text-neutral-900 focus:border-rose-300 focus:outline-none disabled:opacity-60';

function TypePicker({ types, label, onChange }) {
    return (
        <div className="grid grid-cols-2 gap-2">
            {types.map((type) => {
                const isActive = label === type.id;
                return (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => onChange(type.id)}
                        className={`rounded-2xl border px-3 py-3 text-left text-xs font-semibold transition ${
                            isActive
                                ? 'border-[#D4625A] bg-[#FDEBEA] text-[#D4625A]'
                                : 'border-[#F0E8E5] bg-white text-neutral-600 hover:border-[#E8D9D2]'
                        }`}
                    >
                        {type.label}
                    </button>
                );
            })}
        </div>
    );
}

export function AddConnectionModal({
    person,
    persons,
    excludedPersonIds,
    defaultGroup = 'family',
    onClose,
    onSaved
}) {
    const { request } = useApiClient();
    const { runWithLoading } = useLoading();
    const [linkedPersonId, setLinkedPersonId] = useState('');
    const [activeGroup, setActiveGroup] = useState(defaultGroup === 'circle' ? 'circle' : 'family');
    const [label, setLabel] = useState(defaultGroup === 'circle' ? 'friend' : 'parent');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availablePeople = useMemo(
        () =>
            persons
                .filter((item) => item.id !== person.id && !excludedPersonIds.has(item.id))
                .sort((a, b) => a.name.localeCompare(b.name)),
        [person.id, persons, excludedPersonIds]
    );

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    useEffect(() => {
        if (!linkedPersonId && availablePeople.length) {
            setLinkedPersonId(availablePeople[0].id);
        }
    }, [availablePeople, linkedPersonId]);

    function handleGroupChange(group) {
        setActiveGroup(group);
        setLabel(group === 'circle' ? 'friend' : 'parent');
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!linkedPersonId) {
            setError('Choose someone to connect');
            return;
        }

        if (!CONNECTION_TYPES.some((type) => type.id === label)) {
            setError('Choose a connection type');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await runWithLoading(
                async () => {
                    await request('/api/connections', {
                        method: 'POST',
                        body: {
                            personId: person.id,
                            linkedPersonId,
                            label
                        }
                    });
                    onSaved?.();
                    onClose();
                },
                { message: 'Saving connection…' }
            );
        } catch (err) {
            setError(err.message || 'Failed to save connection');
        } finally {
            setIsSubmitting(false);
        }
    }

    const selectedPerson = availablePeople.find((item) => item.id === linkedPersonId);

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#FAF8F7]">
            <div className="mx-auto flex h-full w-full max-w-sm flex-col px-5 pt-4 pb-8">
                <header className="relative mb-6 flex items-center justify-center py-1">
                    <BackButton onClick={onClose} className="absolute left-0 -ml-2" />
                    <h1 className="text-base font-semibold text-neutral-800">Add connection</h1>
                    <button
                        type="submit"
                        form="add-connection-form"
                        disabled={isSubmitting || !availablePeople.length}
                        className="absolute right-0 text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving…' : 'Save'}
                    </button>
                </header>

                <form
                    id="add-connection-form"
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4"
                >
                    <div className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        {person.avatarURL ? (
                            <img src={person.avatarURL} alt={person.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECE8E6] text-neutral-400">
                                <PersonIcon size={22} />
                            </div>
                        )}
                        <div className="min-w-0 text-left">
                            <p className="text-xs text-neutral-400">Connecting to</p>
                            <p className="truncate text-sm font-bold text-neutral-900">{person.name}</p>
                        </div>
                    </div>

                    {availablePeople.length ? (
                        <>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="linked-person" className="text-sm font-semibold text-neutral-800">
                                    Who are you linking?
                                </label>
                                <select
                                    id="linked-person"
                                    value={linkedPersonId}
                                    onChange={(event) => setLinkedPersonId(event.target.value)}
                                    className={fieldClassName}
                                >
                                    {availablePeople.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedPerson ? (
                                <div className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                                    {selectedPerson.avatarURL ? (
                                        <img
                                            src={selectedPerson.avatarURL}
                                            alt={selectedPerson.name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECE8E6] text-neutral-400">
                                            <PersonIcon size={22} />
                                        </div>
                                    )}
                                    <div className="min-w-0 text-left">
                                        <p className="truncate text-sm font-semibold text-neutral-800">
                                            {selectedPerson.name}
                                        </p>
                                        <p className="text-2xs text-neutral-500">Pick how they relate below</p>
                                    </div>
                                </div>
                            ) : null}

                            <div className="flex flex-col gap-3">
                                <span className="text-sm font-semibold text-neutral-800">
                                    {selectedPerson ? `${selectedPerson.name} is ${person.name}'s…` : 'Relationship'}
                                </span>

                                <div
                                    role="tablist"
                                    aria-label="Connection group"
                                    className="flex rounded-2xl bg-white p-1 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                                >
                                    {[
                                        { id: 'family', label: 'Family' },
                                        { id: 'circle', label: 'Friends & circle' }
                                    ].map((tab) => {
                                        const isActive = activeGroup === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                role="tab"
                                                aria-selected={isActive}
                                                onClick={() => handleGroupChange(tab.id)}
                                                className={`flex flex-1 items-center justify-center rounded-xl py-2.5 text-xs font-semibold transition ${
                                                    isActive
                                                        ? 'bg-[#D4625A] text-white shadow-[0_4px_14px_rgba(212,98,90,0.24)]'
                                                        : 'text-neutral-500 hover:text-neutral-700'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <TypePicker
                                    types={activeGroup === 'circle' ? CIRCLE_CONNECTION_TYPES : FAMILY_CONNECTION_TYPES}
                                    label={label}
                                    onChange={setLabel}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="rounded-3xl bg-white px-6 py-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                            <p className="text-sm font-semibold text-neutral-800">No one else to link yet</p>
                            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                                Everyone already connected, or you only have {person.name} saved. Add another person
                                first.
                            </p>
                            <Link
                                href="/persons/new"
                                className="mt-4 inline-block text-sm font-semibold text-[#D4625A] no-underline"
                            >
                                Add a new person
                            </Link>
                        </div>
                    )}

                    {error ? <p className="text-center text-xs font-medium text-[#D4625A]">{error}</p> : null}
                </form>
            </div>
        </div>
    );
}
