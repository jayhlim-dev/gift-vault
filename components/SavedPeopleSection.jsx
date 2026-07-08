import { ProductCard } from 'components/ProductCard';

const savedPeople = [
    { label: 'Jessica', initial: 'J', tone: 'pink', avatarSrc: 'https://randomuser.me/api/portraits/women/65.jpg' },
    { label: 'Sabrine', initial: 'S', tone: 'amber', avatarSrc: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { label: 'Dimas', initial: 'D', tone: 'blue', avatarSrc: 'https://randomuser.me/api/portraits/men/32.jpg' }
];

export function SavedPeopleSection() {
    const visiblePeople = savedPeople.slice(0, 3);

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
                {visiblePeople.map((person) => (
                    <ProductCard
                        key={person.label}
                        label={person.label}
                        initial={person.initial}
                        avatarSrc={person.avatarSrc}
                        tone={person.tone}
                        className="justify-self-center"
                    />
                ))}
                <ProductCard label="Add" isAdd className="justify-self-center" />
            </div>
        </section>
    );
}
