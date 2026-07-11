'use client';

import { BackButton } from 'components/BackButton';
import { ConfirmDialog } from 'components/ConfirmDialog';
import { PersonIcon } from 'components/persons/PersonIcons';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useLoading } from 'lib/LoadingContext';
import { DEFAULT_NOTE_TAG, NOTE_TAG_ACTIVE_CLASS, NOTE_TAGS } from 'lib/note-tags';
import {
    RESTAURANT_NOTE_TAG,
    initRestaurantFieldsFromNote,
    isLegacyRestaurantNote,
    isStructuredRestaurantNote,
    validateRestaurantNoteInput
} from 'lib/restaurant-note-utils';
import { useEffect, useState } from 'react';

const noteContentClassName =
    'w-full rounded-3xl border border-[#F0E8E5] bg-white px-5 py-4 text-sm font-normal text-neutral-900 placeholder:text-neutral-400 shadow-[0_4px_24px_rgba(0,0,0,0.06)] focus:border-rose-300 focus:outline-none disabled:opacity-60';

const fieldClassName =
    'w-full rounded-full border border-[#F0E8E5] bg-white px-5 py-3.5 text-sm font-normal text-neutral-900 placeholder:text-neutral-400 focus:border-rose-300 focus:outline-none disabled:opacity-60';

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

export function AddNoteModal({ person, note = null, onClose, onSaved, onDeleted }) {
    const isEditing = Boolean(note);
    const { request } = useApiClient();
    const { runWithLoading } = useLoading();
    const [text, setText] = useState(note?.text || '');
    const [noteDate, setNoteDate] = useState(note?.noteDate || todayIsoDate());
    const [isPinned, setIsPinned] = useState(Boolean(note?.isPinned));
    const [selectedTag, setSelectedTag] = useState(note?.category || DEFAULT_NOTE_TAG);
    const initialRestaurantFields = initRestaurantFieldsFromNote(note);
    const [restaurantName, setRestaurantName] = useState(initialRestaurantFields.restaurantName);
    const [location, setLocation] = useState(initialRestaurantFields.location);
    const [menuUrl, setMenuUrl] = useState(initialRestaurantFields.menuUrl);
    const [instagramUrl, setInstagramUrl] = useState(initialRestaurantFields.instagramUrl);
    const [useStructuredRestaurant, setUseStructuredRestaurant] = useState(isStructuredRestaurantNote(note));
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    const isRestaurantTag = selectedTag === RESTAURANT_NOTE_TAG;
    const showStructuredRestaurant =
        isRestaurantTag && (!isEditing || isStructuredRestaurantNote(note) || useStructuredRestaurant);
    const showLegacyRestaurantText =
        isRestaurantTag && isEditing && isLegacyRestaurantNote(note) && !useStructuredRestaurant;
    const showRegularNoteText = !isRestaurantTag || showLegacyRestaurantText;

    async function handleSubmit(event) {
        event?.preventDefault?.();

        if (showStructuredRestaurant) {
            const validationError = validateRestaurantNoteInput({
                restaurantName,
                text,
                menuUrl,
                instagramUrl
            });

            if (validationError) {
                setError(validationError);
                return;
            }
        } else if (!text.trim()) {
            setError('Note content is required');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await runWithLoading(
                async () => {
                    const body = {
                        text: text.trim(),
                        category: selectedTag,
                        noteDate,
                        isPinned
                    };

                    if (showStructuredRestaurant) {
                        Object.assign(body, {
                            restaurantName: restaurantName.trim(),
                            location: location.trim(),
                            menuUrl: menuUrl.trim(),
                            instagramUrl: instagramUrl.trim()
                        });
                    }

                    if (isEditing) {
                        await request(`/api/notes/${note.id}`, { method: 'PATCH', body });
                    } else {
                        await request('/api/notes', {
                            method: 'POST',
                            body: {
                                ...body,
                                personId: person.id
                            }
                        });
                    }

                    onSaved?.();
                    onClose();
                },
                { message: isEditing ? 'Updating note…' : 'Saving note…' }
            );
        } catch (err) {
            setError(err.message || 'Failed to save note');
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleDeleteClick() {
        if (!isEditing) {
            return;
        }

        setShowDeleteConfirm(true);
    }

    async function handleConfirmDelete() {
        setIsSubmitting(true);
        setError('');

        try {
            await runWithLoading(
                async () => {
                    await request(`/api/notes/${note.id}`, { method: 'DELETE' });
                    setShowDeleteConfirm(false);
                    onDeleted?.();
                    onClose();
                },
                { message: 'Deleting note…' }
            );
        } catch (err) {
            setError(err.message || 'Failed to delete note');
            setShowDeleteConfirm(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#FAF8F7]">
            <div className="mx-auto flex h-full w-full max-w-sm flex-col px-5 pt-4 pb-6">
                <header className="relative mb-6 flex items-center justify-center py-1">
                    <BackButton onClick={onClose} className="absolute left-0 -ml-2" />
                    <h1 className="text-base font-semibold text-neutral-800">{isEditing ? 'Edit Note' : 'Add Note'}</h1>
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
                            <p className="text-xs text-neutral-400">{isEditing ? 'Editing note for' : 'Adding note for'}</p>
                            <p className="truncate text-sm font-bold text-neutral-900">{person.name}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <span className="text-sm font-semibold text-neutral-800">Tags</span>
                        <div className="flex flex-wrap gap-2">
                            {NOTE_TAGS.map((tag) => {
                                const isActive = selectedTag === tag.id;
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => {
                                            if (isActive) {
                                                if (tag.id !== DEFAULT_NOTE_TAG) {
                                                    setSelectedTag(DEFAULT_NOTE_TAG);
                                                }
                                                return;
                                            }

                                            setSelectedTag(tag.id);
                                        }}
                                        disabled={isSubmitting}
                                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                                            isActive ? NOTE_TAG_ACTIVE_CLASS : tag.className
                                        }`}
                                    >
                                        {tag.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {showStructuredRestaurant ? (
                        <div className="flex flex-col gap-4">
                            <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                                Restaurant Name
                                <input
                                    type="text"
                                    value={restaurantName}
                                    onChange={(event) => setRestaurantName(event.target.value)}
                                    placeholder="e.g. Yialos Greek Mediterranean Restaurant"
                                    disabled={isSubmitting}
                                    className={fieldClassName}
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                                Location
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                    placeholder="Address or Google Maps link"
                                    disabled={isSubmitting}
                                    className={fieldClassName}
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                                Menu Link
                                <input
                                    type="url"
                                    value={menuUrl}
                                    onChange={(event) => setMenuUrl(event.target.value)}
                                    placeholder="https://..."
                                    disabled={isSubmitting}
                                    className={fieldClassName}
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                                Instagram
                                <input
                                    type="url"
                                    value={instagramUrl}
                                    onChange={(event) => setInstagramUrl(event.target.value)}
                                    placeholder="https://instagram.com/..."
                                    disabled={isSubmitting}
                                    className={fieldClassName}
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                                Personal Notes
                                <textarea
                                    value={text}
                                    onChange={(event) => setText(event.target.value)}
                                    placeholder="What they like to order, preferences, etc."
                                    rows={4}
                                    disabled={isSubmitting}
                                    className={`${noteContentClassName} resize-none`}
                                />
                            </label>
                        </div>
                    ) : null}

                    {showRegularNoteText ? (
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
                    ) : null}

                    {showLegacyRestaurantText ? (
                        <button
                            type="button"
                            onClick={() => setUseStructuredRestaurant(true)}
                            disabled={isSubmitting}
                            className="text-left text-xs font-semibold text-[#D4625A] transition hover:text-[#c4564f] disabled:opacity-50"
                        >
                            Switch to structured restaurant fields
                        </button>
                    ) : null}

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

                    {error ? <p className="text-xs font-medium text-[#D4625A]">{error}</p> : null}

                    {isEditing ? (
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            disabled={isSubmitting}
                            className="text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f] disabled:opacity-50"
                        >
                            Delete Note
                        </button>
                    ) : null}
                </form>

                <button
                    type="submit"
                    form="add-note-form"
                    disabled={isSubmitting}
                    className={`w-full rounded-full px-4 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isEditing ? 'mt-3 bg-[#D4625A] hover:bg-[#c4564f]' : 'mt-auto bg-[#D4625A] hover:bg-[#c4564f]'
                    }`}
                >
                    {isSubmitting ? 'Saving…' : isEditing ? 'Update Note' : 'Save Note'}
                </button>
            </div>

            <ConfirmDialog
                open={showDeleteConfirm}
                message="Are you sure you want to delete this data?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={isSubmitting}
            />
        </div>
    );
}
