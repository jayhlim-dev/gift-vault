'use client';

import { AddNoteModal } from 'components/persons/AddNoteModal';
import { getNoteCategory, NoteCard } from 'components/persons/NoteCard';
import { PlusIcon } from 'components/persons/PersonIcons';
import { toDate } from 'lib/gift-vault-utils';
import { NOTE_TAG_ACTIVE_CLASS, getFilterTagsForNotes } from 'lib/note-tags';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Image from 'next/image';
import Link from 'next/link';
import NotesEmptyImage from 'public/images/assets/note-ill.png';
import { useEffect, useState } from 'react';

function isNotePinned(note) {
    return note?.isPinned === true || note?.isPinned === 'true' || note?.isPinned === 1;
}

function NoteTagFilter({ activeTag, onChange, availableTags }) {
    const tags = [
        { id: 'all', label: 'All', className: 'border-[#F0E8E5] bg-[#FAF8F7] text-neutral-600' },
        ...availableTags
    ];

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-neutral-800">Tags</span>
            <div className="flex gap-2 overflow-x-auto px-1 pl-4 py-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-[#D4625A] rounded-2xl">
                {tags.map((tag) => {
                    const isActive = activeTag === tag.id;
                    return (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => onChange(tag.id)}
                            className={`shrink-0 rounded-full border px-4 py-2 text-xs bg-white font-semibold whitespace-nowrap transition ${
                                isActive ? NOTE_TAG_ACTIVE_CLASS : tag.className
                            }`}
                        >
                            {tag.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

const NOTES_PER_PAGE = 8;

function NotePagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-3 pt-1">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-full border border-[#F0E8E5] bg-white px-4 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-[#FAF8F7] disabled:cursor-not-allowed disabled:opacity-40"
            >
                Previous
            </button>
            <span className="text-xs font-medium text-neutral-500">
                {currentPage} / {totalPages}
            </span>
            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-full border border-[#F0E8E5] bg-white px-4 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-[#FAF8F7] disabled:cursor-not-allowed disabled:opacity-40"
            >
                Next
            </button>
        </div>
    );
}

export function PersonNotesTab({ personId, person, isProfileIncomplete = false }) {
    const { data: notes, isLoading, refetch } = useFirebaseCollection('notes', { personId });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [activeTag, setActiveTag] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    function openAddModal() {
        setEditingNote(null);
        setIsModalOpen(true);
    }

    function openEditModal(note) {
        setEditingNote(note);
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingNote(null);
    }

    const sortedNotes = notes.slice().sort((a, b) => {
        const pinnedDiff = Number(isNotePinned(b)) - Number(isNotePinned(a));
        if (pinnedDiff !== 0) {
            return pinnedDiff;
        }

        return (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0);
    });

    const usedTagIds = new Set(sortedNotes.map(getNoteCategory));
    const availableTags = getFilterTagsForNotes(usedTagIds);

    useEffect(() => {
        if (activeTag !== 'all' && !usedTagIds.has(activeTag)) {
            setActiveTag('all');
        }
    }, [activeTag, notes]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTag]);

    const filteredNotes =
        activeTag === 'all' ? sortedNotes : sortedNotes.filter((note) => getNoteCategory(note) === activeTag);

    const totalPages = Math.max(1, Math.ceil(filteredNotes.length / NOTES_PER_PAGE));

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const paginatedNotes = filteredNotes.slice((currentPage - 1) * NOTES_PER_PAGE, currentPage * NOTES_PER_PAGE);

    const hasNotes = sortedNotes.length > 0;
    const showTagFilter = hasNotes && availableTags.length > 1;

    return (
        <>
            <div className="flex flex-col gap-3">
                {isLoading ? (
                    <div className="rounded-3xl bg-white px-6 py-14 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <div className="mx-auto h-4 w-28 animate-pulse rounded-full bg-neutral-100" />
                    </div>
                ) : hasNotes ? (
                    <div className="flex flex-col gap-3">
                        {showTagFilter ? (
                            <NoteTagFilter
                                activeTag={activeTag}
                                onChange={setActiveTag}
                                availableTags={availableTags}
                            />
                        ) : null}

                        {filteredNotes.length ? (
                            <>
                                <ul className="flex flex-col gap-2">
                                    {paginatedNotes.map((note) => (
                                        <NoteCard key={note.id} note={note} onEdit={openEditModal} />
                                    ))}
                                </ul>
                                <NotePagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </>
                        ) : (
                            <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                                <p className="text-sm font-semibold text-neutral-800">No notes in this tag.</p>
                                <p className="mt-1 text-xs text-neutral-400">Try another tag or add a new note.</p>
                            </div>
                        )}
                    </div>
                ) : isProfileIncomplete ? (
                    <div className="flex flex-col items-center gap-5 rounded-3xl bg-white px-8 py-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <Image src={NotesEmptyImage} alt="" className="h-32 w-auto object-contain" aria-hidden="true" />
                        <div className="flex flex-col gap-2.5">
                            <p className="text-lg font-bold text-neutral-900">No information yet.</p>
                            <p className="mx-auto max-w-68 text-sm leading-relaxed text-neutral-400">
                                Complete the profile first to start saving notes, wishlist, and special moments.
                            </p>
                        </div>
                        <Link
                            href={`/persons/${personId}/edit`}
                            className="mt-1 w-full rounded-full bg-[#E37377] px-8 py-3.5 text-sm font-semibold text-white no-underline transition hover:bg-[#d9686d]"
                        >
                            Complete Profile
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-8 py-9 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <Image src={NotesEmptyImage} alt="" className="h-32 w-auto object-contain" aria-hidden="true" />
                        <p className="text-lg font-bold text-neutral-900">No notes yet.</p>
                        <p className="mx-auto max-w-68 text-sm leading-relaxed text-neutral-400">
                            Add gift ideas, restaurants, hobbies, routines, and other details so you always have them on
                            hand.
                        </p>
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-1 w-full rounded-full bg-[#E37377] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d9686d]"
                        >
                            Add Note
                        </button>
                    </div>
                )}
            </div>

            {!isProfileIncomplete && hasNotes ? (
                <button
                    type="button"
                    onClick={openAddModal}
                    aria-label="Add note"
                    className="fixed right-6 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#9C3D45] text-white shadow-[0_8px_24px_rgba(156,61,69,0.35)] transition hover:bg-[#8B353D]"
                >
                    <PlusIcon size={22} />
                </button>
            ) : null}

            {isModalOpen && person ? (
                <AddNoteModal
                    key={editingNote?.id ?? 'new'}
                    person={person}
                    note={editingNote}
                    onClose={closeModal}
                    onSaved={() => refetch()}
                    onDeleted={() => refetch()}
                />
            ) : null}
        </>
    );
}
