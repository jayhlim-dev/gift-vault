'use client';

import { SearchBar } from 'components/SearchBar';

export function HomeSearchSection() {
    function handleSearch(query) {
        console.log('Search query:', query);
    }

    return (
        <section className="w-full max-w-xl">
            <SearchBar
                placeholder="Search name or note..."
                onSearch={handleSearch}
                className="w-full"
            />
        </section>
    );
}
