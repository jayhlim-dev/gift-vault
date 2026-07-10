'use client';

import { BackButton } from 'components/BackButton';
import { BirthdayPicker } from 'components/persons/BirthdayPicker';
import { PersonIcon, PlusIcon } from 'components/persons/PersonIcons';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useEffect, useState } from 'react';

const QUICK_TAGS = [
    { id: 'gift-ideas', label: 'Gift Ideas', className: 'border-[#D6E8F7] bg-[#EDF5FC] text-[#4A7FA5]' },
    { id: 'favorites', label: 'Favorites', className: 'border-[#F0E8E5] bg-[#FAF8F7] text-neutral-600' },
    { id: 'size', label: 'Size', className: 'border-[#F0E8E5] bg-[#FAF8F7] text-neutral-600' },
    { id: 'allergy', label: 'Allergy', className: 'border-[#F0E8E5] bg-[#FAF8F7] text-neutral-600' }
];

const noteContentClassName =
    'w-full rounded-3xl border border-[#F0E8E5] bg-white px-5 py-4 text-sm font-normal text-neutral-900 placeholder:text-neutral-400 shadow-[0_4px_24px_rgba(0,0,0,0.06)] focus:border-rose-300 focus:outline-none disabled:opacity-60';

function PinIcon({ size = 18 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path
                d="M14 4l6 6-5 5-3-1-4 4-2-2 4-4-1-3 5-5z"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function todayIsoDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
}

export function AddNoteModal({ person, onClose, onSaved }) {
    const { request } = useApiClient();
    const [text, setText] = useState('');
    const [noteDate, setNoteDate] = useState(todayIsoDate);
    const [isPinned, setIsPinned] = useState(false);
    const [selectedTag, setSelectedTag] = useState('');
    const [customTags, setCustomTags] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    async function handleSubmit(event) {
        event?.preventDefault?.();
        if (!text.trim()) {
            setError('Note content is required');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await request('/api/notes', {
                method: 'POST',
                body: {
                    text: text.trim(),
                    personId: person.id,
                    category: selectedTag,
                    noteDate,
                    isPinned
                }
            });
            onSaved?.();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save note');
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleAddCustomTag() {
        const label = window.prompt('Tag name');
        if (!label?.trim()) {
            return;
        }

        const id = label.trim().toLowerCase().replace(/\s+/g, '-');
        const nextTag = {
            id,
            label: label.trim(),
            className: 'border-[#F0E8E5] bg-[#FAF8F7] text-neutral-600'
        };

        setCustomTags((current) => (current.some((tag) => tag.id === id) ? current : [...current, nextTag]));
        setSelectedTag(id);
    }

    const allTags = [...QUICK_TAGS, ...customTags];

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#FAF8F7]">
            <div className="mx-auto flex h-full w-full max-w-sm flex-col px-5 pt-4 pb-6">
                <header className="relative mb-6 flex items-center justify-center py-1">
                    <BackButton onClick={onClose} className="absolute left-0 -ml-2" />
                    <h1 className="text-base font-semibold text-neutral-800">Add Note</h1>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="absolute right-0 text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving…' : 'Save'}
                    </button>
                </header>

                <form id="add-note-form" onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4">
                    <div className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        {person.avatarURL ? (
                            <img src={person.avatarURL} alt={person.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECE8E6] text-neutral-400">
                                <PersonIcon size={22} />
                            </div>
                        )}
                        <div className="min-w-0 text-left">
                            <p className="text-xs text-neutral-400">Adding note for</p>
                            <p className="truncate text-sm font-bold text-neutral-900">{person.name}</p>
                        </div>
                    </div>

                    <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                        Note Content
                        <textarea
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            placeholder="Write details you want to remember (e.g. new favorite color, gift ideas, or important moments)..."
                            rows={5}
                            disabled={isSubmitting}
                            className={`${noteContentClassName} resize-none`}
                        />
                    </label>

                    {/* <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                        Date
                        <BirthdayPicker
                            value={noteDate}
                            onChange={setNoteDate}
                            disabled={isSubmitting}
                            displayFormat="numeric"
                            placeholder="Select date"
                            dialogTitle="Select Date"
                        />
                    </label> */}

                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-neutral-800">Status</span>
                        <div className="flex items-center justify-between rounded-3xl border border-[#F0E8E5] bg-white px-5 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center gap-3">
                                <span className="text-[#D4625A]">
                                    <PinIcon />
                                </span>
                                <p className="text-sm font-medium text-neutral-800">Pin Note</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPinned((value) => !value)}
                                disabled={isSubmitting}
                                aria-pressed={isPinned}
                                aria-label="Toggle pin note"
                                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${isPinned ? 'bg-[#D4625A]' : 'bg-neutral-200'}`}
                            >
                                <span
                                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all ${
                                        isPinned ? 'left-5.5' : 'left-0.5'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* <div className="flex flex-col gap-2.5">
                        <span className="text-sm font-semibold text-neutral-800">Quick Tags</span>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map((tag) => {
                                const isActive = selectedTag === tag.id;
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => setSelectedTag(isActive ? '' : tag.id)}
                                        disabled={isSubmitting}
                                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                                            isActive
                                                ? 'border-[#D4625A] bg-[#FDF5F4] text-[#D4625A]'
                                                : tag.className
                                        }`}
                                    >
                                        {tag.label}
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                onClick={handleAddCustomTag}
                                disabled={isSubmitting}
                                aria-label="Add custom tag"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F6D9D6] bg-[#FDEBEA] text-[#D4625A] transition hover:bg-[#FDF5F4] disabled:opacity-60"
                            >
                                <PlusIcon size={16} />
                            </button>
                        </div>
                    </div> */}

                    {error ? <p className="text-xs font-medium text-[#D4625A]">{error}</p> : null}
                </form>

                <button
                    type="submit"
                    form="add-note-form"
                    disabled={isSubmitting}
                    className="mt-auto w-full rounded-full bg-[#D4625A] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition hover:bg-[#c4564f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Saving…' : 'Save Note'}
                </button>
            </div>
        </div>
    );
}
