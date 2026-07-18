'use client';

import { BackButton } from 'components/BackButton';
import { PersonForm } from 'components/persons/PersonForm';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const FORM_ID = 'new-person-form';

export default function NewPersonPage() {
    const router = useRouter();
    const { request } = useApiClient();
    const [isBusy, setIsBusy] = useState(false);

    async function handleSubmit(values) {
        const result = await request('/api/persons', { method: 'POST', body: values });
        router.replace(`/persons/${result.id}`);
    }

    return (
        <div className="mx-auto flex min-h-full w-full max-w-sm flex-col  pt-4 pb-10">
            <header className="relative mb-6 flex items-center justify-center py-1">
                <BackButton fallbackHref="/" className="absolute left-0 -ml-2" />
                <h1 className="text-base font-semibold text-neutral-800">Add New Person</h1>
                <button
                    type="submit"
                    form={FORM_ID}
                    disabled={isBusy}
                    className="absolute right-0 text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f] disabled:opacity-50"
                >
                    {isBusy ? 'Saving…' : 'Save'}
                </button>
            </header>

            <PersonForm
                formId={FORM_ID}
                initialValues={{ relationship: 'friend' }}
                onSubmit={handleSubmit}
                submitLabel="Save"
                onBusyChange={setIsBusy}
            />
        </div>
    );
}
