'use client';

import { AddReminderModal } from 'components/persons/AddReminderModal';
import { PlusIcon } from 'components/persons/PersonIcons';
import { formatRelativeTime } from 'lib/gift-vault-utils';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useLoading } from 'lib/LoadingContext';
import {
    formatReminderDateTime,
    formatReminderDueText,
    getDaysUntilReminder,
    sortCompletedReminders,
    sortRemindersByDueDate
} from 'lib/reminder-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Image from 'next/image';
import Link from 'next/link';
import RemindersEmptyImage from 'public/images/assets/notif-ill.png';
import { useState } from 'react';

const REMINDER_VIEW_TABS = [
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' }
];

function ReminderViewTabs({ activeView, onChange }) {
    return (
        <div
            role="tablist"
            aria-label="Reminder status"
            className="flex rounded-2xl bg-white p-1 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
        >
            {REMINDER_VIEW_TABS.map((tab) => {
                const isActive = activeView === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(tab.id)}
                        className={`flex flex-1 items-center justify-center rounded-xl py-2.5 text-xs font-semibold transition ${
                            isActive
                                ? 'bg-[#D4625A] text-white shadow-[0_4px_14px_rgba(212,98,90,0.24)]'
                                : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

function ReminderCard({ reminder, onEdit, onComplete, onReactivate, isCompleting, isReactivating, isCompleted = false }) {
    const daysUntil = getDaysUntilReminder(reminder);
    const dueText = daysUntil === null ? '' : formatReminderDueText(daysUntil);
    const isOverdue = daysUntil !== null && daysUntil < 0;
    const completedLabel = formatRelativeTime(reminder.completedAt) || 'Done';

    return (
        <li
            className={`rounded-2xl bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${
                isCompleted ? 'opacity-80' : ''
            }`}
        >
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FDEBEA] text-xl">
                    ⏰
                </div>
                <button
                    type="button"
                    onClick={() => onEdit(reminder)}
                    className="min-w-0 flex-1 cursor-pointer text-left transition hover:opacity-80"
                >
                    <p className={`text-sm font-semibold text-neutral-800 ${isCompleted ? 'line-through' : ''}`}>
                        {reminder.title}
                    </p>
                    {reminder.notes ? <p className="mt-0.5 line-clamp-2 text-2xs text-neutral-500">{reminder.notes}</p> : null}
                    <p className="mt-1 text-2xs text-neutral-500">{formatReminderDateTime(reminder)}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {isCompleted ? (
                            <span className="rounded-full bg-[#F0F0F0] px-2.5 py-1 text-3xs font-semibold text-neutral-600">
                                Done · {completedLabel}
                            </span>
                        ) : dueText ? (
                            <span
                                className={`rounded-full px-2.5 py-1 text-3xs font-semibold ${
                                    isOverdue ? 'bg-[#FFF1F0] text-[#C4564F]' : 'bg-[#FDEBEA] text-[#D4625A]'
                                }`}
                            >
                                {dueText}
                            </span>
                        ) : null}
                    </div>
                </button>
                {!isCompleted ? (
                    <button
                        type="button"
                        onClick={() => onComplete(reminder)}
                        disabled={isCompleting}
                        aria-label="Mark reminder as done"
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F0E8E5] text-[#D4625A] transition hover:bg-[#FDEBEA] disabled:opacity-50"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path
                                d="M6 12.5l3.2 3.2L18 7.5"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => onReactivate(reminder)}
                        disabled={isReactivating}
                        aria-label="Reactivate reminder"
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F0E8E5] text-neutral-500 transition hover:bg-[#FAF8F7] hover:text-[#D4625A] disabled:opacity-50"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                            <path
                                d="M4 12a8 8 0 0113.9-5.6M20 7v4h-4"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M20 12a8 8 0 01-13.9 5.6M4 17v-4h4"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </li>
    );
}

export function PersonRemindersTab({ personId, person, isProfileIncomplete = false }) {
    const { data: reminders, isLoading, refetch } = useFirebaseCollection('reminders', { personId });
    const { request } = useApiClient();
    const { runWithLoading } = useLoading();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [completingId, setCompletingId] = useState('');
    const [reactivatingId, setReactivatingId] = useState('');
    const [activeView, setActiveView] = useState('active');

    function openAddModal() {
        setEditingReminder(null);
        setIsModalOpen(true);
    }

    function openEditModal(reminder) {
        setEditingReminder(reminder);
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingReminder(null);
    }

    async function handleComplete(reminder) {
        setCompletingId(reminder.id);

        try {
            await runWithLoading(
                async () => {
                    await request(`/api/reminders/${reminder.id}`, {
                        method: 'PATCH',
                        body: { isDone: true }
                    });
                    refetch();
                },
                { message: 'Completing reminder…' }
            );
        } catch (error) {
            console.error('[PersonRemindersTab] Failed to complete reminder:', error);
        } finally {
            setCompletingId('');
        }
    }

    async function handleReactivate(reminder) {
        setReactivatingId(reminder.id);

        try {
            await runWithLoading(
                async () => {
                    await request(`/api/reminders/${reminder.id}`, {
                        method: 'PATCH',
                        body: { isDone: false }
                    });
                    refetch();
                    setActiveView('active');
                },
                { message: 'Reactivating reminder…' }
            );
        } catch (error) {
            console.error('[PersonRemindersTab] Failed to reactivate reminder:', error);
        } finally {
            setReactivatingId('');
        }
    }

    const activeReminders = sortRemindersByDueDate(reminders);
    const completedReminders = sortCompletedReminders(reminders);
    const hasAnyReminders = reminders.length > 0;
    const visibleReminders = activeView === 'active' ? activeReminders : completedReminders;

    return (
        <>
            <div className="flex flex-col gap-3">
                {isLoading ? (
                    <div className="rounded-3xl bg-white px-6 py-14 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <div className="mx-auto h-4 w-32 animate-pulse rounded-full bg-neutral-100" />
                    </div>
                ) : hasAnyReminders ? (
                    <>
                        <ReminderViewTabs activeView={activeView} onChange={setActiveView} />

                        {visibleReminders.length ? (
                            <ul className="flex flex-col gap-2">
                                {visibleReminders.map((reminder) => (
                                    <ReminderCard
                                        key={reminder.id}
                                        reminder={reminder}
                                        onEdit={openEditModal}
                                        onComplete={handleComplete}
                                        onReactivate={handleReactivate}
                                        isCompleting={completingId === reminder.id}
                                        isReactivating={reactivatingId === reminder.id}
                                        isCompleted={activeView === 'completed'}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                                <p className="text-sm font-semibold text-neutral-800">
                                    {activeView === 'active' ? 'No active reminders.' : 'No completed reminders yet.'}
                                </p>
                                <p className="mt-1 text-xs text-neutral-400">
                                    {activeView === 'active'
                                        ? 'Add a reminder or check the Completed tab.'
                                        : 'Completed reminders will show up here after you tap the checkmark.'}
                                </p>
                            </div>
                        )}
                    </>
                ) : isProfileIncomplete ? (
                    <div className="flex flex-col items-center gap-5 rounded-3xl bg-white px-8 py-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <Image src={RemindersEmptyImage} alt="" className="h-32 w-auto object-contain" aria-hidden="true" />
                        <div className="flex flex-col gap-2.5">
                            <p className="text-lg font-bold text-neutral-900">No information yet.</p>
                            <p className="mx-auto max-w-68 text-sm leading-relaxed text-neutral-400">
                                Complete the profile first to start saving reminders and other details.
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
                        <Image src={RemindersEmptyImage} alt="" className="h-32 w-auto object-contain" aria-hidden="true" />
                        <p className="text-lg font-bold text-neutral-900">No reminders yet.</p>
                        <p className="mx-auto max-w-68 text-sm leading-relaxed text-neutral-400">
                            Set reminders for errands, appointments, and things you need to remember for {person.name}.
                        </p>
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-1 w-full rounded-full bg-[#E37377] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d9686d]"
                        >
                            Add Reminder
                        </button>
                    </div>
                )}
            </div>

            {!isProfileIncomplete && activeView === 'active' && hasAnyReminders ? (
                <button
                    type="button"
                    onClick={openAddModal}
                    aria-label="Add reminder"
                    className="fixed right-6 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#9C3D45] text-white shadow-[0_8px_24px_rgba(156,61,69,0.35)] transition hover:bg-[#8B353D]"
                >
                    <PlusIcon size={22} />
                </button>
            ) : null}

            {isModalOpen && person ? (
                <AddReminderModal
                    key={editingReminder?.id ?? 'new'}
                    person={person}
                    reminder={editingReminder}
                    onClose={closeModal}
                    onSaved={() => refetch()}
                    onDeleted={() => refetch()}
                />
            ) : null}
        </>
    );
}
