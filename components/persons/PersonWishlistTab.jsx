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

function GiftIcon() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="text-rose-300">
            <rect x="4" y="9" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M4 9h16M12 9v11" stroke="currentColor" strokeWidth="1.6" />
            <path
                d="M12 9S9.5 4.5 7 5.5 6 9 12 9zM12 9s2.5-4.5 5-3.5S17 9 12 9z"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinejoin="round"
            />
        </svg>
    );
}

const emptyFormState = { title: '', price: '', url: '' };

export function PersonWishlistTab({ personId }) {
    const { data: wishlists, isLoading, refetch } = useFirebaseCollection('wishlists', { personId });
    const { request } = useApiClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState(emptyFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const sortedWishlists = wishlists
        .slice()
        .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));

    async function handleAddItem(event) {
        event.preventDefault();
        if (!form.title.trim()) {
            setError('Title cannot be empty');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            await request('/api/wishlists', {
                method: 'POST',
                body: { title: form.title.trim(), price: form.price.trim(), url: form.url.trim(), personId }
            });
            setForm(emptyFormState);
            setIsFormOpen(false);
            refetch();
        } catch (err) {
            setError(err.message || 'Failed to add wishlist item');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteItem(itemId) {
        try {
            await request(`/api/wishlists/${itemId}`, { method: 'DELETE' });
            refetch();
        } catch (err) {
            console.error('[PersonWishlistTab] Failed to delete wishlist item:', err);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-0.5">
                <h2 className="text-base font-bold text-neutral-900">Wishlist</h2>
                <button
                    type="button"
                    onClick={() => setIsFormOpen((open) => !open)}
                    className="text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f]"
                >
                    {isFormOpen ? 'Cancel' : '+ Add item'}
                </button>
            </div>

            {isFormOpen ? (
                <form onSubmit={handleAddItem} className="flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <input
                        type="text"
                        value={form.title}
                        onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                        placeholder="e.g. iPhone 15 Pro"
                        className="rounded-2xl border border-[#F0E8E5] bg-[#FAF8F7] px-4 py-3 text-sm text-neutral-900 focus:border-rose-300 focus:bg-white focus:outline-none"
                    />
                    <input
                        type="text"
                        value={form.price}
                        onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                        placeholder="Price (optional)"
                        className="rounded-2xl border border-[#F0E8E5] bg-[#FAF8F7] px-4 py-3 text-sm text-neutral-900 focus:border-rose-300 focus:bg-white focus:outline-none"
                    />
                    <input
                        type="url"
                        value={form.url}
                        onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
                        placeholder="Link (optional)"
                        className="rounded-2xl border border-[#F0E8E5] bg-[#FAF8F7] px-4 py-3 text-sm text-neutral-900 focus:border-rose-300 focus:bg-white focus:outline-none"
                    />
                    {error ? <p className="text-xs font-medium text-[#D4625A]">{error}</p> : null}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="self-end rounded-full bg-[#D4625A] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#c4564f] disabled:opacity-60"
                    >
                        {isSubmitting ? 'Saving…' : 'Save item'}
                    </button>
                </form>
            ) : null}

            {isLoading ? (
                <div className="rounded-3xl bg-white px-6 py-14 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <div className="mx-auto h-4 w-36 animate-pulse rounded-full bg-neutral-100" />
                </div>
            ) : sortedWishlists.length ? (
                <ul className="flex flex-col gap-2">
                    {sortedWishlists.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                        >
                            {item.imageURL ? (
                                <img src={item.imageURL} alt={item.title} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                            ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FDEBEA]">
                                    <GiftIcon />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-neutral-800">{item.title}</p>
                                {item.price ? <p className="text-2xs text-neutral-500">{item.price}</p> : null}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <span className="text-2xs whitespace-nowrap text-neutral-400">{formatRelativeTime(item.createdAt)}</span>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteItem(item.id)}
                                    aria-label="Delete wishlist item"
                                    className="text-neutral-300 transition hover:text-[#D4625A]"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="rounded-3xl bg-white px-6 py-14 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <p className="text-sm text-neutral-400">No wishlist items yet.</p>
                </div>
            )}
        </div>
    );
}
