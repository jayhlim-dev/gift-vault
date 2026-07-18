'use client';

import { BackButton } from 'components/BackButton';
import { ConfirmDialog } from 'components/ConfirmDialog';
import { BirthdayPicker } from 'components/persons/BirthdayPicker';
import { PersonIcon } from 'components/persons/PersonIcons';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useLoading } from 'lib/LoadingContext';
import { todayIsoDate } from 'lib/reminder-utils';
import { useEffect, useState } from 'react';

const fieldClassName =
    'w-full rounded-full border border-[#F0E8E5] bg-white px-5 py-3.5 text-sm font-normal text-neutral-900 placeholder:text-neutral-400 focus:border-rose-300 focus:outline-none disabled:opacity-60';

const noteContentClassName =
    'w-full rounded-3xl border border-[#F0E8E5] bg-white px-5 py-4 text-sm font-normal text-neutral-900 placeholder:text-neutral-400 shadow-[0_4px_24px_rgba(0,0,0,0.06)] focus:border-rose-300 focus:outline-none disabled:opacity-60';

export function AddReminderModal({ person, reminder = null, onClose, onSaved, onDeleted }) {
    const isEditing = Boolean(reminder);
    const { request } = useApiClient();
    const { runWithLoading } = useLoading();
    const [title, setTitle] = useState(reminder?.title || '');
    const [notes, setNotes] = useState(reminder?.notes || '');
    const [dueDate, setDueDate] = useState(reminder?.dueDate || todayIsoDate());
    const [dueTime, setDueTime] = useState(reminder?.dueTime || '');
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

    async function handleSubmit(event) {
        event?.preventDefault?.();

        if (!title.trim()) {
            setError('Reminder title is required');
            return;
        }

        if (!dueDate) {
            setError('Due date is required');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await runWithLoading(
                async () => {
                    const body = {
                        title: title.trim(),
                        notes: notes.trim(),
                        dueDate,
                        dueTime: dueTime.trim()
                    };

                    if (isEditing) {
                        await request(`/api/reminders/${reminder.id}`, { method: 'PATCH', body });
                    } else {
                        await request('/api/reminders', {
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
                { message: isEditing ? 'Updating reminder…' : 'Saving reminder…' }
            );
        } catch (err) {
            setError(err.message || 'Failed to save reminder');
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
                    await request(`/api/reminders/${reminder.id}`, { method: 'DELETE' });
                    setShowDeleteConfirm(false);
                    onDeleted?.();
                    onClose();
                },
                { message: 'Deleting reminder…' }
            );
        } catch (err) {
            setError(err.message || 'Failed to delete reminder');
            setShowDeleteConfirm(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#FAF8F7]">
            <div className="mx-auto flex h-full w-full max-w-sm flex-col pt-4 pb-6">
                <header className="relative mb-6 flex items-center justify-center py-1">
                    <BackButton onClick={onClose} className="absolute left-0 -ml-2" />
                    <h1 className="text-base font-semibold text-neutral-800">{isEditing ? 'Edit Reminder' : 'Add Reminder'}</h1>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="absolute right-0 text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving…' : 'Save'}
                    </button>
                </header>

                <form id="add-reminder-form" onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4">
                    <div className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        {person.avatarURL ? (
                            <img src={person.avatarURL} alt={person.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECE8E6] text-neutral-400">
                                <PersonIcon size={22} />
                            </div>
                        )}
                        <div className="min-w-0 text-left">
                            <p className="text-xs text-neutral-400">{isEditing ? 'Editing reminder for' : 'Adding reminder for'}</p>
                            <p className="truncate text-sm font-bold text-neutral-900">{person.name}</p>
                        </div>
                    </div>

                    <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                        What to remember
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="e.g. Go to market"
                            disabled={isSubmitting}
                            className={fieldClassName}
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                        Due date
                        <BirthdayPicker
                            value={dueDate}
                            onChange={setDueDate}
                            disabled={isSubmitting}
                            displayFormat="numeric"
                            placeholder="Select date"
                            dialogTitle="Select Due Date"
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                        Time <span className="text-xs font-normal text-neutral-400">(optional)</span>
                        <input
                            type="time"
                            value={dueTime}
                            onChange={(event) => setDueTime(event.target.value)}
                            disabled={isSubmitting}
                            className={fieldClassName}
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                        Notes <span className="text-xs font-normal text-neutral-400">(optional)</span>
                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Extra details, location, etc."
                            rows={4}
                            disabled={isSubmitting}
                            className={`${noteContentClassName} resize-none`}
                        />
                    </label>

                    {error ? <p className="text-xs font-medium text-[#D4625A]">{error}</p> : null}

                    {isEditing ? (
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            disabled={isSubmitting}
                            className="text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f] disabled:opacity-50"
                        >
                            Delete Reminder
                        </button>
                    ) : null}
                </form>

                <button
                    type="submit"
                    form="add-reminder-form"
                    disabled={isSubmitting}
                    className={`w-full rounded-full px-4 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isEditing ? 'mt-3 bg-[#D4625A] hover:bg-[#c4564f]' : 'mt-auto bg-[#D4625A] hover:bg-[#c4564f]'
                    }`}
                >
                    {isSubmitting ? 'Saving…' : isEditing ? 'Update Reminder' : 'Save Reminder'}
                </button>
            </div>

            <ConfirmDialog
                open={showDeleteConfirm}
                message="Are you sure you want to delete this reminder?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={isSubmitting}
            />
        </div>
    );
}
