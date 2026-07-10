'use client';

import { ProductCard } from 'components/ProductCard';
import { getToneForRelationship } from 'lib/gift-vault-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';

export function SavedPeopleSection() {
    const { data: persons, isLoading } = useFirebaseCollection('persons');
    const visiblePeople = persons.slice(0, 3);

    return (
        <section className="w-full">
            <header className="mb-4 flex items-start justify-between gap-3">
                <h4 className="leading-tight text-gray-800 font-semibold">Saved People</h4>
                <button
                    type="button"
                    className="pt-0.5 text-right text-xs leading-tight font-semibold text-rose-400 no-underline transition hover:text-rose-400 "
                >
                    See all
                </button>
            </header>

            <div className="grid grid-cols-4 gap-3">
                {isLoading
                    ? Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="flex w-full max-w-[76px] flex-col items-center gap-1.5 justify-self-center">
                              <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200" />
                              <div className="h-3 w-10 animate-pulse rounded-full bg-neutral-200" />
                          </div>
                      ))
                    : visiblePeople.map((person) => (
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
        </section>
    );
}
