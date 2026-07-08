import { QuickGiftIdeaCard } from 'components/QuickGiftIdeaCard';

const quickGiftIdeas = [
    { label: 'People', icon: 'people', count: 4, tone: 'blue' },
    { label: 'Items', icon: 'bag', count: 25, tone: 'pink' },
    // { label: 'Experiences', icon: 'plane', count: 14, tone: 'blue' },
    { label: 'Notes', icon: 'note', count: 36, tone: 'amber' },
    { label: 'Wishlist', icon: 'heart', count: 18, tone: 'rose' }
];

export function QuickGiftIdeasSection() {
    return (
        <section className="w-full">
            {/* <header className="mb-3">
                <h4 className="leading-tight text-gray-800 font-semibold">Quick Gift Ideas</h4>
            </header> */}

            <div className="rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] bg-white px-2 py-3">
                <div className="grid grid-cols-4 gap-1">
                    {quickGiftIdeas.map((idea) => (
                        <QuickGiftIdeaCard
                            key={idea.label}
                            label={idea.label}
                            icon={idea.icon}
                            count={idea.count}
                            tone={idea.tone}
                            className="justify-self-center"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
