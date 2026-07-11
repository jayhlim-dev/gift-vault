'use client';

import { BackButton } from 'components/BackButton';
import { ConfirmDialog } from 'components/ConfirmDialog';
import { PersonForm } from 'components/persons/PersonForm';
import { useApiClient } from 'lib/hooks/useApiClient';
import { invalidateFirebaseCollectionCache, invalidateFirebaseCollectionCaches, useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import { useLoading } from 'lib/LoadingContext';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const FORM_ID = 'edit-person-form';

export default function EditPersonPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: persons, isLoading } = useFirebaseCollection('persons');
    const { request } = useApiClient();
    const { runWithLoading } = useLoading();
    const [isBusy, setIsBusy] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const person = persons.find((item) => item.id === id);

    async function handleSubmit(values) {
        await request(`/api/persons/${id}`, { method: 'PATCH', body: values });
        invalidateFirebaseCollectionCache('persons');
        router.push(`/persons/${id}`);
    }

    async function handleConfirmDelete() {
        setIsDeleting(true);
        setDeleteError('');

        try {
            await runWithLoading(
                async () => {
                    await request(`/api/persons/${id}`, { method: 'DELETE' });
                    invalidateFirebaseCollectionCaches(['persons', 'notes', 'wishlists']);
                    setShowDeleteConfirm(false);
                    router.push('/');
                },
                { message: 'Removing person…' }
            );
        } catch (err) {
            setDeleteError(err.message || 'Failed to remove person');
            setShowDeleteConfirm(false);
        } finally {
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="mx-auto flex w-full max-w-sm flex-col gap-6 pt-6">
                <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-100" />
                <div className="h-24 w-24 animate-pulse self-center rounded-full bg-neutral-100" />
            </div>
        );
    }

    if (!person) {
        return (
            <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 pt-16 text-center">
                <p className="text-sm text-neutral-500">This person couldn&apos;t be found.</p>
                <Link href="/" className="text-sm font-semibold text-rose-400">
                    Back to home
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6 pt-6 pb-10">
            <header className="flex items-center justify-between">
                <BackButton fallbackHref={`/persons/${id}`} className="-ml-2" />
                <span className="text-sm font-semibold text-neutral-500">Edit Person</span>
                <button
                    type="submit"
                    form={FORM_ID}
                    disabled={isBusy || isDeleting}
                    className="text-sm font-semibold text-rose-400 transition hover:text-rose-500 disabled:opacity-50"
                >
                    {isBusy ? 'Saving…' : 'Save'}
                </button>
            </header>

            <PersonForm
                formId={FORM_ID}
                initialValues={person}
                onSubmit={handleSubmit}
                submitLabel="Save Changes"
                onBusyChange={setIsBusy}
                showSubmitButton={false}
            />

            <div className="flex flex-col items-center gap-3">
                <button
                    type="submit"
                    form={FORM_ID}
                    disabled={isBusy || isDeleting}
                    className="w-full rounded-full bg-[#D4625A] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition hover:bg-[#c4564f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isBusy ? 'Saving…' : 'Save Changes'}
                </button>

                <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isBusy || isDeleting}
                    className="text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f] disabled:opacity-50"
                >
                    Remove Person
                </button>

                {deleteError ? <p className="text-xs font-medium text-[#D4625A]">{deleteError}</p> : null}
            </div>

            <ConfirmDialog
                open={showDeleteConfirm}
                message={`Remove ${person.name}? Their notes and wishlist items will also be deleted.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={isDeleting}
            />
        </div>
    );
}
