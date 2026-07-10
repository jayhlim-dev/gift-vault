'use client';

import { formatRelativeTime, toDate } from 'lib/gift-vault-utils';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
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

export function PersonNotesTab({ personId }) {
    const { data: notes, isLoading, refetch } = useFirebaseCollection('notes', { personId });
    const { request } = useApiClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const sortedNotes = notes
        .slice()
        .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));

    async function handleAddNote(event) {
        event.preventDefault();
        if (!text.trim()) {
            setError('Note cannot be empty');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            await request('/api/notes', { method: 'POST', body: { text: text.trim(), personId } });
            setText('');
            setIsFormOpen(false);
            refetch();
        } catch (err) {
            setError(err.message || 'Failed to add note');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteNote(noteId) {
        try {
            await request(`/api/notes/${noteId}`, { method: 'DELETE' });
            refetch();
        } catch (err) {
            console.error('[PersonNotesTab] Failed to delete note:', err);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-neutral-800">Notes</h2>
                <button
                    type="button"
                    onClick={() => setIsFormOpen((open) => !open)}
                    className="text-xs font-semibold text-rose-400 transition hover:text-rose-500"
                >
                    {isFormOpen ? 'Cancel' : '+ Add note'}
                </button>
            </div>

            {isFormOpen ? (
                <form onSubmit={handleAddNote} className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                    <textarea
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="e.g. Loves matcha lattes"
                        rows={2}
                        className="resize-none rounded-lg border border-[#F2E9E6] px-3 py-2 text-sm text-neutral-900 focus:border-rose-300 focus:outline-none"
                    />
                    {error ? <p className="text-xs font-medium text-rose-500">{error}</p> : null}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="self-end rounded-lg bg-rose-400 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
                    >
                        {isSubmitting ? 'Saving…' : 'Save note'}
                    </button>
                </form>
            ) : null}

            {isLoading ? (
                <div className="flex flex-col gap-2">
                    <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-100" />
                    <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-100" />
                </div>
            ) : sortedNotes.length ? (
                <ul className="flex flex-col gap-2">
                    {sortedNotes.map((note) => (
                        <li
                            key={note.id}
                            className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                        >
                            <p className="min-w-0 flex-1 text-sm text-neutral-800">{note.text}</p>
                            <div className="flex shrink-0 items-center gap-2">
                                <span className="text-2xs whitespace-nowrap text-neutral-400">{formatRelativeTime(note.createdAt)}</span>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteNote(note.id)}
                                    aria-label="Delete note"
                                    className="text-neutral-300 transition hover:text-rose-400"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="rounded-xl bg-white px-3 py-6 text-center text-xs text-neutral-400 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                    No notes yet.
                </p>
            )}
        </div>
    );
}
