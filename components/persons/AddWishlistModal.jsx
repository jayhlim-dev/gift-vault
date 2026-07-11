'use client';

import { BackButton } from 'components/BackButton';
import { ConfirmDialog } from 'components/ConfirmDialog';
import {
    WISHLIST_ICON_OPTIONS,
    WishlistHeartIcon,
    WishlistIcon,
    WishlistLinkIcon
} from 'components/persons/WishlistIcons';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useLoading } from 'lib/LoadingContext';
import { validateHttpsUrl, formatIdr, parseIdrInput } from 'lib/gift-vault-utils';
import { useEffect, useState } from 'react';

const CATEGORIES = [
    { id: 'want', label: 'Want' },
    { id: 'need', label: 'Need' },
    { id: 'hobby', label: 'Hobby' },
    { id: 'gift', label: 'Gift' }
];

const fieldClassName =
    'w-full rounded-full border border-[#F0E8E5] bg-white px-5 py-3.5 text-sm font-normal text-neutral-900 placeholder:text-neutral-400 focus:border-rose-300 focus:outline-none disabled:opacity-60';

export function AddWishlistModal({ person, item = null, onClose, onSaved, onDeleted }) {
    const isEditing = Boolean(item);
    const { request } = useApiClient();
    const { runWithLoading } = useLoading();
    const [title, setTitle] = useState(item?.title || '');
    const [price, setPrice] = useState(item?.price ? parseIdrInput(item.price) : '');
    const [url, setUrl] = useState(item?.url || '');
    const [category, setCategory] = useState(item?.category || 'want');
    const [iconId, setIconId] = useState(item?.iconId || 'gift');
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
            setError('Item name is required');
            return;
        }

        const { url: safeUrl, error: urlError } = validateHttpsUrl(url);
        if (urlError) {
            setError(urlError);
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await runWithLoading(
                async () => {
                    const body = {
                        title: title.trim(),
                        price: price ? formatIdr(price) : '',
                        url: safeUrl,
                        category,
                        iconId
                    };

                    if (isEditing) {
                        await request(`/api/wishlists/${item.id}`, { method: 'PATCH', body });
                    } else {
                        await request('/api/wishlists', {
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
                { message: isEditing ? 'Updating wishlist…' : 'Saving wishlist…' }
            );
        } catch (err) {
            setError(err.message || 'Failed to save wishlist item');
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
                    await request(`/api/wishlists/${item.id}`, { method: 'DELETE' });
                    setShowDeleteConfirm(false);
                    onDeleted?.();
                    onClose();
                },
                { message: 'Deleting item…' }
            );
        } catch (err) {
            setError(err.message || 'Failed to delete wishlist item');
            setShowDeleteConfirm(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white">
            <div className="mx-auto flex h-full w-full max-w-sm flex-col px-5 pt-4 pb-6">
                <header className="relative mb-6 flex items-center justify-center py-1">
                    <BackButton onClick={onClose} className="absolute left-0 -ml-2" />
                    <h1 className="text-base font-semibold text-neutral-800">
                        {isEditing ? 'Edit Wishlist' : 'Add Wishlist'}
                    </h1>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="absolute right-0 text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving…' : 'Save'}
                    </button>
                </header>

                <form
                    id="add-wishlist-form"
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4"
                >
                    <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                        Item Name
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder={
                                person?.name ? `What is ${person.name} dreaming of?` : 'What are they dreaming of?'
                            }
                            disabled={isSubmitting}
                            className={fieldClassName}
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                        Price / Budget Estimation
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-sm text-neutral-400">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={price ? Number(price).toLocaleString('id-ID') : ''}
                                onChange={(event) => setPrice(event.target.value.replace(/\D/g, ''))}
                                placeholder="0"
                                disabled={isSubmitting}
                                className={`${fieldClassName} pl-12`}
                            />
                        </div>
                    </label>

                    <div className="flex flex-col gap-2.5">
                        <span className="text-sm font-semibold text-neutral-800">Category</span>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((item) => {
                                const isActive = category === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setCategory(item.id)}
                                        disabled={isSubmitting}
                                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                                            isActive
                                                ? 'border-[#D4625A] bg-[#FDF5F4] text-[#D4625A]'
                                                : 'border-[#F0E8E5] bg-white text-neutral-500'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                        <p className='flex items-center gap-1'>
                            Link / URL <span className="font-normal text-neutral-400">(optional)</span>
                        </p>
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-neutral-400">
                                <WishlistLinkIcon />
                            </span>
                            <input
                                type="url"
                                value={url}
                                onChange={(event) => setUrl(event.target.value)}
                                placeholder="https://..."
                                disabled={isSubmitting}
                                className={`${fieldClassName} pl-11`}
                            />
                        </div>
                    </label>

                    <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-neutral-800">Choose Visual Icon</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2.5">
                            {WISHLIST_ICON_OPTIONS.map((option) => {
                                const isActive = iconId === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setIconId(option.id)}
                                        disabled={isSubmitting}
                                        aria-label={option.label}
                                        className={`flex aspect-square items-center justify-center rounded-2xl border transition disabled:opacity-60 ${
                                            isActive
                                                ? 'border-[#D4625A] bg-[#FDF5F4] text-[#D4625A]'
                                                : 'border-[#F0E8E5] bg-white text-neutral-500'
                                        }`}
                                    >
                                        <WishlistIcon id={option.id} size={22} />
                                    </button>
                                );
                            })}
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
                            Delete Item
                        </button>
                    ) : null}
                </form>

                <button
                    type="submit"
                    form="add-wishlist-form"
                    disabled={isSubmitting}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D4625A] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition hover:bg-[#c4564f] disabled:cursor-not-allowed disabled:opacity-60 ${
                        isEditing ? 'mt-3' : 'mt-auto'
                    }`}
                >
                    {isSubmitting ? 'Saving…' : isEditing ? 'Update Item' : 'Save to Vault'}
                    <WishlistHeartIcon size={16} />
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
