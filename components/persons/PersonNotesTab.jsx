'use client';

import { AddNoteModal } from 'components/persons/AddNoteModal';
import { NotebookIcon } from 'components/persons/PersonIcons';
import { formatRelativeTime, toDate } from 'lib/gift-vault-utils';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import { useLoading } from 'lib/LoadingContext';
import Link from 'next/link';
import { useState } from 'react';

function TrashIcon() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
                d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7h12z"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function PersonNotesTab({ personId, person, isProfileIncomplete = false }) {
    const { data: notes, isLoading, refetch } = useFirebaseCollection('notes', { personId });
    const { request } = useApiClient();
    const { runWithLoading } = useLoading();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sortedNotes = notes
        .slice()
        .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));

    async function handleDeleteNote(noteId) {
        try {
            await runWithLoading(
                async () => {
                    await request(`/api/notes/${noteId}`, { method: 'DELETE' });
                    refetch();
                },
                { message: 'Deleting note…' }
            );
        } catch (err) {
            console.error('[PersonNotesTab] Failed to delete note:', err);
        }
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-0.5">
                    <h2 className="text-base font-bold text-neutral-900">Notes</h2>
                    {!isProfileIncomplete ? (
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f]"
                        >
                            + Add note
                        </button>
                    ) : null}
                </div>

                {isLoading ? (
                    <div className="rounded-3xl bg-white px-6 py-14 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <div className="mx-auto h-4 w-28 animate-pulse rounded-full bg-neutral-100" />
                    </div>
                ) : sortedNotes.length ? (
                    <ul className="flex flex-col gap-2">
                        {sortedNotes.map((note) => (
                            <li
                                key={note.id}
                                className="flex items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                            >
                                <div className="min-w-0 flex-1">
                                    {note.isPinned ? (
                                        <span className="mb-1 inline-block rounded-full bg-[#FDEBEA] px-2 py-0.5 text-2xs font-semibold text-[#D4625A]">
                                            Pinned
                                        </span>
                                    ) : null}
                                    <p className="text-sm text-neutral-800">{note.text}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className="text-2xs whitespace-nowrap text-neutral-400">{formatRelativeTime(note.createdAt)}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteNote(note.id)}
                                        aria-label="Delete note"
                                        className="text-neutral-300 transition hover:text-[#D4625A]"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : isProfileIncomplete ? (
                    <div className="flex flex-col items-center gap-5 rounded-3xl bg-white px-8 py-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <NotebookIcon size={64} />
                        <div className="flex flex-col gap-2.5">
                            <p className="text-lg font-bold text-neutral-900">No information yet.</p>
                            <p className="mx-auto max-w-68 text-sm leading-relaxed text-neutral-400">
                                Complete the profile first to start saving notes, wishlist, and special moments.
                            </p>
                        </div>
                        <Link
                            href={`/persons/${personId}/edit`}
                            className="mt-1 w-full rounded-full bg-[#D4625A] px-5 py-3.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition hover:bg-[#c4564f]"
                        >
                            Complete Profile
                        </Link>
                    </div>
                ) : (
                    <div className="rounded-3xl bg-white px-6 py-14 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <p className="text-sm text-neutral-400">No notes yet.</p>
                    </div>
                )}
            </div>

            {isModalOpen && person ? (
                <AddNoteModal
                    person={person}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={() => refetch()}
                />
            ) : null}
        </>
    );
}
