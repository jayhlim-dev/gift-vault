'use client';

import { QuickGiftIdeaCard } from 'components/QuickGiftIdeaCard';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import { buildUpcomingItems } from 'lib/reminder-utils';

export function QuickGiftIdeasSection() {
    const { data: persons, isLoading: personsLoading } = useFirebaseCollection('persons');
    const { data: notes, isLoading: notesLoading } = useFirebaseCollection('notes');
    const { data: wishlists, isLoading: wishlistsLoading } = useFirebaseCollection('wishlists');
    const { data: reminders, isLoading: remindersLoading } = useFirebaseCollection('reminders');
    const isLoading = personsLoading || notesLoading || wishlistsLoading || remindersLoading;

    const upcomingCount = buildUpcomingItems({ persons, reminders }).length;

    const quickGiftIdeas = [
        { label: 'People', icon: 'people', count: persons.length, tone: 'blue', href: '/persons' },
        { label: 'Upcoming', icon: 'calendar', count: upcomingCount, tone: 'pink', href: '/reminders' },
        { label: 'Notes', icon: 'note', count: notes.length, tone: 'amber', href: '/notes' },
        { label: 'Wishlist', icon: 'heart', count: wishlists.length, tone: 'rose', href: '/wishlists' }
    ];

    return (
        <section className="w-full">
            <div className="rounded-3xl border border-[#F0E8E5] bg-white px-2 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <div className="grid grid-cols-4 gap-0.5">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, index) => (
                              <div
                                  key={index}
                                  className="flex w-full flex-col items-center justify-center gap-2 justify-self-center py-2"
                              >
                                  <div className="h-11 w-11 animate-pulse rounded-2xl bg-neutral-200" />
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
                                  href={idea.href}
                                  className="animate-fade-in justify-self-center"
                              />
                          ))}
                </div>
            </div>
        </section>
    );
}
