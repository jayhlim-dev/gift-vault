'use client';

import { ProductCard } from 'components/ProductCard';
import { getToneForRelationship } from 'lib/gift-vault-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Link from 'next/link';

export default function PersonsPage() {
    const { data: persons, isLoading } = useFirebaseCollection('persons');
    const sortedPeople = persons.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-5 pb-28 text-neutral-900">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-neutral-900">Saved People</h1>
                <p className="text-sm text-neutral-500">Everyone you&apos;re keeping gift ideas and notes for.</p>
            </header>

            {isLoading ? (
                <div className="grid grid-cols-4 gap-3">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div key={index} className="flex w-full max-w-[76px] flex-col items-center gap-1.5 justify-self-center">
                            <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200" />
                            <div className="h-3 w-10 animate-pulse rounded-full bg-neutral-200" />
                        </div>
                    ))}
                </div>
            ) : sortedPeople.length ? (
                <div className="grid grid-cols-4 gap-3">
                    {sortedPeople.map((person) => (
                        <ProductCard
                            key={person.id}
                            href={`/persons/${person.id}`}
                            label={person.name || 'Unnamed'}
                            initial={person.name?.charAt(0)?.toUpperCase() || '?'}
                            avatarSrc={person.avatarURL || undefined}
                            tone={getToneForRelationship(person.relationship)}
                            className="animate-fade-in justify-self-center"
                        />
                    ))}
                    <ProductCard label="Add" isAdd href="/persons/new" className="justify-self-center" />
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-8 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <p className="text-sm font-semibold text-neutral-800">No people saved yet.</p>
                    <p className="text-xs text-neutral-400">Add someone to start tracking notes, wishlists, and reminders.</p>
                    <Link
                        href="/persons/new"
                        className="mt-2 inline-block rounded-xl bg-[#D4625A] px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(212,98,90,0.24)]"
                    >
                        Add person
                    </Link>
                </div>
            )}
        </div>
    );
}
