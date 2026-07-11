'use client';

import { AddWishlistModal } from 'components/persons/AddWishlistModal';
import { PlusIcon } from 'components/persons/PersonIcons';
import { WishlistCard } from 'components/persons/WishlistCard';
import { toDate } from 'lib/gift-vault-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Image from 'next/image';
import Link from 'next/link';
import WishlistEmptyImage from 'public/images/assets/gift-ill.png';
import { useState } from 'react';

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

    const hasItems = sortedWishlists.length > 0;

    return (
        <>
            <div className="flex flex-col gap-3">
                {isLoading ? (
                    <div className="rounded-3xl bg-white px-6 py-14 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <div className="mx-auto h-4 w-36 animate-pulse rounded-full bg-neutral-100" />
                    </div>
                ) : hasItems ? (
                    <ul className="flex flex-col gap-3">
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

            {!isProfileIncomplete && hasItems ? (
                <button
                    type="button"
                    onClick={openAddModal}
                    aria-label="Add wishlist item"
                    className="fixed right-6 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#9C3D45] text-white shadow-[0_8px_24px_rgba(156,61,69,0.35)] transition hover:bg-[#8B353D]"
                >
                    <PlusIcon size={22} />
                </button>
            ) : null}

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
