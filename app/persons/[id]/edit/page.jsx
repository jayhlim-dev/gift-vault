'use client';

import { BackButton } from 'components/BackButton';
import { PersonForm } from 'components/persons/PersonForm';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const FORM_ID = 'edit-person-form';

export default function EditPersonPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: persons, isLoading } = useFirebaseCollection('persons');
    const { request } = useApiClient();
    const [isBusy, setIsBusy] = useState(false);

    const person = persons.find((item) => item.id === id);

    async function handleSubmit(values) {
        await request(`/api/persons/${id}`, { method: 'PATCH', body: values });
        router.push(`/persons/${id}`);
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
                    disabled={isBusy}
                    className="text-sm font-semibold text-rose-400 transition hover:text-rose-500 disabled:opacity-50"
                >
                    {isBusy ? 'Saving…' : 'Save'}
                </button>
            </header>

            <PersonForm formId={FORM_ID} initialValues={person} onSubmit={handleSubmit} submitLabel="Save Changes" onBusyChange={setIsBusy} />
        </div>
    );
}
