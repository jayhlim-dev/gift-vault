'use client';

import { BdayReminderSection } from 'components/BdayReminderSection';
import { HomeGreeting } from 'components/HomeGreeting';
import { HomeSearchSection } from 'components/HomeSearchSection';
import { HomeWelcomeEmpty } from 'components/HomeWelcomeEmpty';
import { LatestNotesSection } from 'components/LatestNotesSection';
import { QuickGiftIdeasSection } from 'components/QuickGiftIdeasSection';
import { SavedPeopleSection } from 'components/SavedPeopleSection';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import { hasSearchQuery } from 'lib/search-utils';
import { useState } from 'react';

export default function Page() {
    const [query, setQuery] = useState('');
    const isSearching = hasSearchQuery(query);
    const { data: persons, isLoading } = useFirebaseCollection('persons');
    const isNewUser = !isLoading && persons.length === 0;

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6 pb-4 text-black">
            {!isNewUser && !isSearching ? <HomeGreeting /> : null}

            {!isNewUser ? <HomeSearchSection onQueryChange={setQuery} /> : null}

            {isLoading ? (
                <div className="flex flex-col gap-4">
                    <div className="h-20 animate-pulse rounded-3xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]" />
                    <div className="h-24 animate-pulse rounded-3xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]" />
                    <div className="h-24 animate-pulse rounded-3xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]" />
                </div>
            ) : null}

            {!isLoading && isNewUser ? <HomeWelcomeEmpty /> : null}

            {!isLoading && !isNewUser && !isSearching ? (
                <div className="flex flex-col gap-7">
                    <QuickGiftIdeasSection />
                    <BdayReminderSection />
                    <SavedPeopleSection />
                    <LatestNotesSection />
                </div>
            ) : null}
        </div>
    );
}
