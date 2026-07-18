'use client';

import { ProductCard } from 'components/ProductCard';
import { getToneForRelationship } from 'lib/gift-vault-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Link from 'next/link';
import { useMemo } from 'react';

function formatPersonName(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) {
        return 'Unnamed';
    }
    return trimmed.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function SavedPeopleSection() {
    const { data: persons, isLoading } = useFirebaseCollection('persons');

    const visiblePeople = useMemo(
        () =>
            persons
                .slice()
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                .slice(0, 7),
        [persons]
    );

    return (
        <section className="w-full">
            <header className="mb-3 flex items-end justify-between gap-3">
                <div>
                    <h4 className="leading-tight font-semibold text-neutral-800">Saved People</h4>
                    <p className="mt-0.5 text-2xs text-neutral-400">
                        {isLoading ? 'Loading…' : `${persons.length} in your circle`}
                    </p>
                </div>
                <Link
                    href="/persons"
                    className="text-xs font-semibold text-[#D4625A] no-underline transition hover:text-[#c4564f]"
                >
                    See all
                </Link>
            </header>

            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="flex w-[76px] shrink-0 flex-col items-center gap-1.5">
                              <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200" />
                              <div className="h-3 w-10 animate-pulse rounded-full bg-neutral-200" />
                          </div>
                      ))
                    : (
                          <>
                              {visiblePeople.map((person) => (
                                  <ProductCard
                                      key={person.id}
                                      href={`/persons/${person.id}`}
                                      label={formatPersonName(person.name)}
                                      initial={person.name?.charAt(0)?.toUpperCase() || '?'}
                                      avatarSrc={person.avatarURL || undefined}
                                      tone={getToneForRelationship(person.relationship)}
                                      className="animate-fade-in shrink-0"
                                  />
                              ))}
                              <ProductCard label="Add" isAdd href="/persons/new" className="shrink-0" />
                          </>
                      )}
            </div>
        </section>
    );
}
