import { LatestNoteCard } from 'components/LatestNoteCard';

const latestNotes = [
    {
        name: 'Sabrina',
        note: 'Once mentioned wanting to visit Japan during spring 🌸',
        timeAgo: '2 days ago',
        avatarSrc: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
        name: 'John Doe Doe as Doe Doe as Doe',
        note: 'Once mentioned wanting to visit Japan during spring 🌸 Once mentioned wanting to visit Japan during spring 🌸',
        timeAgo: '2 days ago',
        avatarSrc: 'https://randomuser.me/api/portraits/women/44.jpg'
    }
];

export function LatestNotesSection() {
    const latestNote = latestNotes?.slice(0, 2);

    if (!latestNote) {
        return null;
    }

    return (
        <section className="w-full pb-2">
            <header className="mb-4 flex items-start justify-between gap-3">
                <h4 className="leading-tight text-gray-800 font-semibold">Latest Notes</h4>

                <button
                    type="button"
                    className="pt-0.5 text-right text-xs leading-tight font-semibold text-rose-400 no-underline transition hover:text-rose-400 "
                >
                    See all
                </button>
            </header>

            <div className="flex flex-col gap-4">
                {latestNote.map((note) => (
                    <LatestNoteCard
                        key={note.name}
                        name={note.name}
                        note={note.note}
                        timeAgo={note.timeAgo}
                        avatarSrc={note.avatarSrc}
                        showAction
                    />
                ))}
            </div>
        </section>
    );
}
