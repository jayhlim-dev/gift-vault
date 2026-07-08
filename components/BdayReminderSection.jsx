import { BdayCard } from './BdayCard';

const savedPeople = [
    { label: 'Jessica', dateText: 'Feb 26', dueText: 'in 12 days' },
    { label: 'Sabrine', dateText: 'Mar 1', dueText: 'in 15 days' },
    { label: 'Dimas', dateText: 'Mar 4', dueText: 'in 18 days' }
];

export function BdayReminderSection() {
    const primaryPerson = savedPeople[0];

    if (!primaryPerson) {
        return null;
    }

    return (
        <section className="w-full">
            <header className="mb-4 flex items-start justify-between gap-3">
                <h4 className="leading-tight text-gray-800 font-semibold">Upcoming</h4>
                <button
                    type="button"
                    className="pt-0.5 text-right text-xs leading-tight font-semibold text-rose-400 no-underline transition hover:text-rose-400 "
                >
                    See all
                </button>
            </header>

            <BdayCard
                label={primaryPerson.label}
                dateText={primaryPerson.dateText}
                dueText={primaryPerson.dueText}
                stackCount={savedPeople.length}
            />
        </section>
    );
}
