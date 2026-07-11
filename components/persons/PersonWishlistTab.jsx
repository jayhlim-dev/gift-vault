'use client';

import { AddWishlistModal } from 'components/persons/AddWishlistModal';
import { WishlistIcon } from 'components/persons/WishlistIcons';
import { formatRelativeTime, formatIdrDisplay, toDate } from 'lib/gift-vault-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Image from 'next/image';
import Link from 'next/link';
import WishlistEmptyImage from 'public/images/assets/gift-ill.png';
import { useEffect, useRef, useState } from 'react';

const WISHLIST_CATEGORY_LABELS = {
    want: 'Want',
    need: 'Need',
    hobby: 'Hobby',
    gift: 'Gift'
};

function ChevronIcon({ expanded = false, size = 16 }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            aria-hidden="true"
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
            <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function getWishlistSubtitle(item) {
    const parts = [];

    if (item.price) {
        parts.push(formatIdrDisplay(item.price));
    }

    const categoryLabel = WISHLIST_CATEGORY_LABELS[item.category] || item.category;
    if (categoryLabel) {
        parts.push(categoryLabel);
    }

    const time = formatRelativeTime(item.createdAt);
    if (time) {
        parts.push(time);
    }

    return parts.join(' · ');
}

function WishlistCard({ item, onEdit }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const titleRef = useRef(null);

    useEffect(() => {
        const element = titleRef.current;
        if (!element || isExpanded) {
            return;
        }

        setCanExpand(element.scrollWidth > element.clientWidth || item.title.includes('\n') || Boolean(item.url));
    }, [item.title, item.url, isExpanded]);

    function handleToggleExpand(event) {
        event.stopPropagation();
        setIsExpanded((value) => !value);
    }

    const showExpandToggle = canExpand || isExpanded;

    return (
        <li
            className={`rounded-2xl px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition ${
                isExpanded ? 'bg-[#FFFCFB]' : 'bg-white'
            }`}
        >
            <div className="flex items-center gap-3">
                {item.imageURL ? (
                    <img src={item.imageURL} alt={item.title} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FDEBEA] text-[#D4625A]">
                        <WishlistIcon id={item.iconId || 'gift'} size={20} />
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="min-w-0 flex-1 cursor-pointer text-left transition hover:opacity-80"
                >
                    <p
                        ref={titleRef}
                        className={`text-sm font-semibold text-neutral-800 ${
                            isExpanded ? 'whitespace-pre-wrap wrap-break-word leading-relaxed' : 'truncate'
                        }`}
                    >
                        {item.title}
                    </p>
                    <p className="mt-0.5 text-2xs text-neutral-500">{getWishlistSubtitle(item)}</p>
                    {isExpanded && item.url ? (
                        <span className="mt-1.5 block truncate text-2xs font-medium text-[#D4625A]">{item.url}</span>
                    ) : null}
                </button>
                {showExpandToggle ? (
                    <button
                        type="button"
                        onClick={handleToggleExpand}
                        aria-label={isExpanded ? 'Collapse wishlist item' : 'Expand wishlist item'}
                        aria-expanded={isExpanded}
                        className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full text-neutral-400 transition hover:bg-[#FDEBEA] hover:text-[#D4625A]"
                    >
                        <ChevronIcon expanded={isExpanded} size={20} />
                    </button>
                ) : null}
            </div>
        </li>
    );
}

export function PersonWishlistTab({ personId, person, isProfileIncomplete = false }) {
    const { data: wishlists, isLoading, refetch } = useFirebaseCollection('wishlists', { personId });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    function openAddModal() {
        setEditingItem(null);
        setIsModalOpen(true);
    }

    function openEditModal(item) {
        setEditingItem(item);
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingItem(null);
    }

    const sortedWishlists = wishlists
        .slice()
        .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));

    return (
        <>
            <div className="flex flex-col gap-4">
             

                {isLoading ? (
                    <div className="rounded-3xl bg-white px-6 py-14 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <div className="mx-auto h-4 w-36 animate-pulse rounded-full bg-neutral-100" />
                    </div>
                ) : sortedWishlists.length ? (
                    <ul className="flex flex-col gap-2">
                        {sortedWishlists.map((item) => (
                            <WishlistCard key={item.id} item={item} onEdit={openEditModal} />
                        ))}
                    </ul>
                ) : isProfileIncomplete ? (
                    <div className="flex flex-col items-center gap-5 rounded-3xl bg-white px-8 py-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <Image
                            src={WishlistEmptyImage}
                            alt=""
                            className="h-32 w-auto object-contain"
                            aria-hidden="true"
                        />
                        <div className="flex flex-col gap-2.5">
                            <p className="text-lg font-bold text-neutral-900">No information yet.</p>
                            <p className="mx-auto max-w-68 text-sm leading-relaxed text-neutral-400">
                                Complete the profile first to start saving notes, wishlist, and special moments.
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
                        <Image
                            src={WishlistEmptyImage}
                            alt=""
                            className="h-32 w-auto object-contain"
                            aria-hidden="true"
                        />
                        <p className="text-lg font-bold text-neutral-900">No wishlist items yet.</p>
                        <p className="mx-auto max-w-68 text-sm leading-relaxed text-neutral-400">
                            Save products and gift ideas they&apos;d love so you&apos;re ready for the next occasion.
                        </p>
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-1 w-full rounded-full bg-[#E37377] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d9686d]"
                        >
                            Add Item
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && person ? (
                <AddWishlistModal
                    key={editingItem?.id ?? 'new'}
                    person={person}
                    item={editingItem}
                    onClose={closeModal}
                    onSaved={() => refetch()}
                    onDeleted={() => refetch()}
                />
            ) : null}
        </>
    );
}
