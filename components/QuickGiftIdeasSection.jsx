'use client';

import { QuickGiftIdeaCard } from 'components/QuickGiftIdeaCard';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';

export function QuickGiftIdeasSection() {
    const { data: persons, isLoading: personsLoading } = useFirebaseCollection('persons');
    const { data: notes, isLoading: notesLoading } = useFirebaseCollection('notes');
    const { data: wishlists, isLoading: wishlistsLoading } = useFirebaseCollection('wishlists');
    const isLoading = personsLoading || notesLoading || wishlistsLoading;

    const quickGiftIdeas = [
        { label: 'People', icon: 'people', count: persons.length, tone: 'blue' },
        // No dedicated "items" collection yet, keep as a placeholder until one exists.
        { label: 'Items', icon: 'bag', count: 25, tone: 'pink' },
        { label: 'Notes', icon: 'note', count: notes.length, tone: 'amber' },
        { label: 'Wishlist', icon: 'heart', count: wishlists.length, tone: 'rose' }
    ];

    return (
        <section className="w-full">
            <div className="rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] bg-white px-2 py-3">
                <div className="grid grid-cols-4 gap-1">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, index) => (
                              <div key={index} className="flex w-full flex-col items-center justify-center gap-1.5 justify-self-center">
                                  <div className="h-12 w-12 animate-pulse rounded-xl bg-neutral-200" />
                                  <div className="h-3 w-6 animate-pulse rounded-full bg-neutral-200" />
                                  <div className="h-2.5 w-10 animate-pulse rounded-full bg-neutral-200" />
                              </div>
                          ))
                        : quickGiftIdeas.map((idea) => (
                              <QuickGiftIdeaCard
                                  key={idea.label}
                                  label={idea.label}
                                  icon={idea.icon}
                                  count={idea.count}
                                  tone={idea.tone}
                                  className="animate-fade-in justify-self-center"
                              />
                          ))}
                </div>
            </div>
        </section>
    );
}
