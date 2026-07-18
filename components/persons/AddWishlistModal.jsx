'use client';

import { BackButton } from 'components/BackButton';
import { ConfirmDialog } from 'components/ConfirmDialog';
import {
    WISHLIST_ICON_OPTIONS,
    WishlistHeartIcon,
    WishlistIcon,
    WishlistLinkIcon
} from 'components/persons/WishlistIcons';
import { CameraIcon, PlusIcon } from 'components/persons/PersonIcons';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useImageUpload } from 'lib/hooks/useImageUpload';
import { useLoading } from 'lib/LoadingContext';
import { validateHttpsUrl, formatIdr, parseIdrInput } from 'lib/gift-vault-utils';
import { useEffect, useRef, useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CATEGORIES = [
    { id: 'want', label: 'Want' },
    { id: 'need', label: 'Need' },
    { id: 'hobby', label: 'Hobby' },
    { id: 'gift', label: 'Gift' }
];

const fieldClassName =
    'w-full rounded-full border border-[#F0E8E5] bg-white px-5 py-3.5 text-sm font-normal text-neutral-900 placeholder:text-neutral-400 focus:border-rose-300 focus:outline-none disabled:opacity-60';

const textareaClassName =
    'w-full rounded-2xl border border-[#F0E8E5] bg-white px-5 py-3.5 text-sm font-normal text-neutral-900 placeholder:text-neutral-400 focus:border-rose-300 focus:outline-none disabled:opacity-60 resize-none';

export function AddWishlistModal({ person, item = null, onClose, onSaved, onDeleted }) {
    const isEditing = Boolean(item);
    const { request } = useApiClient();
    const { runWithLoading } = useLoading();
    const [title, setTitle] = useState(item?.title || '');
    const [price, setPrice] = useState(item?.price ? parseIdrInput(item.price) : '');
    const [url, setUrl] = useState(item?.url || '');
    const [description, setDescription] = useState(item?.description || '');
    const [category, setCategory] = useState(item?.category || 'want');
    const [iconId, setIconId] = useState(item?.iconId || 'gift');
    const [imageURL, setImageURL] = useState(item?.imageURL || '');
    const [pendingFile, setPendingFile] = useState(null);
    const [previewURL, setPreviewURL] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const fileInputRef = useRef(null);
    const { uploadImage, isUploading } = useImageUpload();

    const displayImage = previewURL || imageURL;
    const isBusy = isSubmitting || isUploading;

    useEffect(() => {
        return () => {
            if (previewURL) {
                URL.revokeObjectURL(previewURL);
            }
        };
    }, [previewURL]);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    function handleFileChange(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please choose an image file');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('Image must be smaller than 5MB');
            return;
        }

        setError('');
        if (previewURL) {
            URL.revokeObjectURL(previewURL);
        }
        setPendingFile(file);
        setPreviewURL(URL.createObjectURL(file));
    }

    function handleRemovePhoto() {
        if (previewURL) {
            URL.revokeObjectURL(previewURL);
        }
        setPendingFile(null);
        setPreviewURL('');
        setImageURL('');
    }

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
                    let finalImageURL = imageURL.trim();

                    if (pendingFile) {
                        finalImageURL = await uploadImage(pendingFile);
                    }

                    const body = {
                        title: title.trim(),
                        price: price ? formatIdr(price) : '',
                        url: safeUrl,
                        description: description.trim(),
                        category,
                        iconId,
                        imageURL: finalImageURL
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
            <div className="mx-auto flex h-full w-full max-w-sm flex-col pt-4 pb-6">
                <header className="relative mb-6 flex items-center justify-center py-1">
                    <BackButton onClick={onClose} className="absolute left-0 -ml-2" />
                    <h1 className="text-base font-semibold text-neutral-800">
                        {isEditing ? 'Edit Wishlist' : 'Add Wishlist'}
                    </h1>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isBusy}
                        className="absolute right-0 text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f] disabled:opacity-50"
                    >
                        {isBusy ? 'Saving…' : 'Save'}
                    </button>
                </header>

                <form
                    id="add-wishlist-form"
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4"
                >
                    <div className="flex flex-col items-center gap-2.5">
                        <span className="self-start text-sm font-semibold text-neutral-800">
                            Product Photo <span className="font-normal text-neutral-400">(optional)</span>
                        </span>
                        <div className="relative">
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt="Product preview"
                                    className="h-24 w-24 rounded-2xl border border-[#F0E8E5] object-cover"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[#F0E8E5] bg-[#FAF8F7] text-neutral-400">
                                    <CameraIcon size={28} />
                                </div>
                            )}
                            {isBusy ? (
                                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
                                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                                </div>
                            ) : null}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isBusy}
                                aria-label="Choose product photo"
                                className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#D4625A] text-white shadow-[0_2px_8px_rgba(212,98,90,0.35)] transition hover:bg-[#c4564f] disabled:opacity-60"
                            >
                                <PlusIcon />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isBusy}
                            className="text-sm font-medium text-neutral-500 transition hover:text-[#D4625A] disabled:opacity-60"
                        >
                            {displayImage ? 'Change Photo' : 'Add Photo'}
                        </button>
                        {displayImage && !isBusy ? (
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="text-xs font-medium text-neutral-400 transition hover:text-[#D4625A]"
                            >
                                Remove Photo
                            </button>
                        ) : null}
                    </div>

                    <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                        Item Name
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder={
                                person?.name ? `What is ${person.name} dreaming of?` : 'What are they dreaming of?'
                            }
                            disabled={isBusy}
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
                                disabled={isBusy}
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
                                        disabled={isBusy}
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
                                disabled={isBusy}
                                className={`${fieldClassName} pl-11`}
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                        <p className="flex items-center gap-1">
                            Why they want it? <span className="font-normal text-neutral-400">(optional)</span>
                        </p>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder={
                                person?.name
                                    ? `Why does ${person.name} want this? e.g. mentioned it twice, perfect for her birthday…`
                                    : 'Why do they want this? e.g. perfect gift for their birthday…'
                            }
                            rows={4}
                            disabled={isBusy}
                            className={textareaClassName}
                        />
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
                                        disabled={isBusy}
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
                            disabled={isBusy}
                            className="text-sm font-semibold text-[#D4625A] transition hover:text-[#c4564f] disabled:opacity-50"
                        >
                            Delete Item
                        </button>
                    ) : null}
                </form>

                <button
                    type="submit"
                    form="add-wishlist-form"
                    disabled={isBusy}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D4625A] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition hover:bg-[#c4564f] disabled:cursor-not-allowed disabled:opacity-60 ${
                        isEditing ? 'mt-3' : 'mt-auto'
                    }`}
                >
                    {isBusy ? 'Saving…' : isEditing ? 'Update Item' : 'Save to Vault'}
                    <WishlistHeartIcon size={16} />
                </button>
            </div>

            <ConfirmDialog
                open={showDeleteConfirm}
                message="Are you sure you want to delete this data?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={isBusy}
            />
        </div>
    );
}
