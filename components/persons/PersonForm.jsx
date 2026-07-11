'use client';

import {
    BriefcaseIcon,
    CameraIcon,
    DotsIcon,
    FriendsIcon,
    HeartIcon,
    HomeIcon,
    PlusIcon
} from 'components/persons/PersonIcons';
import { BirthdayPicker } from 'components/persons/BirthdayPicker';
import { useImageUpload } from 'lib/hooks/useImageUpload';
import { useEffect, useRef, useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const RELATIONSHIP_OPTIONS = [
    { id: 'friend', label: 'Friend', Icon: FriendsIcon },
    { id: 'partner', label: 'Partner', Icon: HeartIcon },
    { id: 'family', label: 'Family', Icon: HomeIcon },
    { id: 'colleague', label: 'Work', Icon: BriefcaseIcon },
    { id: 'other', label: 'Other', Icon: DotsIcon }
];

const BIO_MAX_LENGTH = 120;

const inputClassName =
    'w-full rounded-full border border-[#F0E8E5] bg-white px-5 py-3.5 text-sm font-normal text-neutral-900 placeholder:text-neutral-400 focus:border-rose-300 focus:outline-none disabled:opacity-60';

export function PersonForm({
    initialValues = {},
    onSubmit,
    submitLabel = 'Save',
    formId = 'person-form',
    showSubmitButton = true,
    onBusyChange
}) {
    const [name, setName] = useState(initialValues.name || '');
    const [birthday, setBirthday] = useState(initialValues.birthday || '');
    const [relationship, setRelationship] = useState(initialValues.relationship || '');
    const [avatarURL, setAvatarURL] = useState(initialValues.avatarURL || '');
    const [pendingFile, setPendingFile] = useState(null);
    const [previewURL, setPreviewURL] = useState('');
    const [bio, setBio] = useState(initialValues.bio || '');
    const [isFavorite, setIsFavorite] = useState(Boolean(initialValues.isFavorite));
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const { uploadImage } = useImageUpload();

    const displayImage = previewURL || avatarURL;
    const isBusy = isSubmitting;

    useEffect(() => {
        onBusyChange?.(isBusy);
    }, [isBusy, onBusyChange]);

    useEffect(() => {
        return () => {
            if (previewURL) {
                URL.revokeObjectURL(previewURL);
            }
        };
    }, [previewURL]);

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
        setAvatarURL('');
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setIsSubmitting(true);
        try {
            let finalAvatarURL = avatarURL.trim();

            if (pendingFile) {
                finalAvatarURL = await uploadImage(pendingFile);
            }

            await onSubmit({
                name: name.trim(),
                birthday,
                relationship,
                avatarURL: finalAvatarURL,
                bio: bio.trim(),
                isFavorite
            });
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form id={formId} onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
            <div className="flex flex-col items-center gap-2.5">
                <div className="relative">
                    {displayImage ? (
                        <img src={displayImage} alt="Avatar preview" className="h-30 w-30 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-30 w-30 items-center justify-center rounded-full bg-[#F3F0EF] text-neutral-400">
                            <CameraIcon size={34} />
                        </div>
                    )}
                    {isSubmitting ? (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
                            <span className="h-6 w-6 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                        </div>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting}
                        aria-label="Choose photo from device"
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
                    disabled={isSubmitting}
                    className="text-sm font-medium text-neutral-500 transition hover:text-[#D4625A] disabled:opacity-60"
                >
                    Add Photo
                </button>

                {displayImage && !isSubmitting ? (
                    <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-2xs font-medium text-neutral-400 underline transition hover:text-[#D4625A]"
                    >
                        Remove photo
                    </button>
                ) : null}
            </div>

            <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                Name
                <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter name"
                    disabled={isSubmitting}
                    className={inputClassName}
                />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                Birthday
                <BirthdayPicker value={birthday} onChange={setBirthday} disabled={isSubmitting} />
            </label>

            <div className="flex flex-col gap-2.5">
                <span className="text-sm font-semibold text-neutral-800">
                    Category <span className="font-normal text-neutral-400">(optional)</span>
                </span>
                <div className="grid grid-cols-4 gap-2.5">
                    {RELATIONSHIP_OPTIONS.map(({ id, label, Icon }) => {
                        const isActive = id === relationship;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setRelationship(isActive ? '' : id)}
                                disabled={isSubmitting}
                                className={`flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border text-2xs font-medium transition disabled:opacity-60 ${
                                    isActive
                                        ? 'border-[#D4625A] bg-[#FDF5F4] text-[#D4625A]'
                                        : 'border-[#F0E8E5] bg-white text-neutral-500'
                                }`}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm font-semibold text-neutral-800">
                    <span>
                        Short Note <span className="font-normal text-neutral-400">(optional)</span>
                    </span>
                    <span className="text-xs font-normal text-neutral-400">
                        {bio.length}/{BIO_MAX_LENGTH}
                    </span>
                </div>
                <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value.slice(0, BIO_MAX_LENGTH))}
                    maxLength={BIO_MAX_LENGTH}
                    rows={4}
                    disabled={isSubmitting}
                    placeholder="Write a short note about them..."
                    className="resize-none rounded-3xl border border-[#F0E8E5] bg-white px-5 py-4 text-sm font-normal text-neutral-900 placeholder:text-neutral-400 focus:border-rose-300 focus:outline-none disabled:opacity-60"
                />
            </div>

            <div className="flex items-center justify-between rounded-3xl border border-[#F0E8E5] bg-white px-5 py-4">
                <div>
                    <p className="text-sm font-semibold text-neutral-800">Favorite</p>
                    <p className="text-xs text-neutral-400">Mark as favorite</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsFavorite((value) => !value)}
                    disabled={isSubmitting}
                    aria-pressed={isFavorite}
                    aria-label="Toggle favorite"
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${isFavorite ? 'bg-[#D4625A]' : 'bg-neutral-200'}`}
                >
                    <span
                        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all ${
                            isFavorite ? 'left-5.5' : 'left-0.5'
                        }`}
                    />
                </button>
            </div>

            {error ? <p className="text-xs font-medium text-[#D4625A]">{error}</p> : null}

            {showSubmitButton ? (
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-[#D4625A] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition hover:bg-[#c4564f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Saving…' : submitLabel}
                </button>
            ) : null}
        </form>
    );
}
