'use client';

import { WishlistIcon, WishlistLinkIcon } from 'components/persons/WishlistIcons';
import { formatIdrDisplay } from 'lib/gift-vault-utils';
import { getWishlistCategoryChipClass, getWishlistCategoryLabel, getWishlistTimeLabel } from 'lib/wishlist-utils';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

function ChevronIcon({ expanded = false, size = 14 }) {
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

function WishlistCategoryChip({ category }) {
    const label = getWishlistCategoryLabel(category);
    if (!label) {
        return null;
    }

    return (
        <span
            className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-2xs font-semibold ${getWishlistCategoryChipClass(category)}`}
        >
            {label}
        </span>
    );
}

function WishlistThumbnail({ item }) {
    if (item.imageURL) {
        return (
            <img
                src={item.imageURL}
                alt={item.title}
                className="h-14 w-14 shrink-0 rounded-xl border border-[#F0E8E5] object-cover"
            />
        );
    }

    return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#F6D9D6]/50 bg-linear-to-br from-[#FFF6F5] to-[#FDEBEA] text-[#D4625A]">
            <WishlistIcon id={item.iconId || 'gift'} size={22} />
        </div>
    );
}

function WishlistLinkButton({ url }) {
    const trimmed = url?.trim();
    if (!trimmed) {
        return null;
    }

    return (
        <a
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open product link"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#F6D9D6] bg-[#FDEBEA] text-[#D4625A] no-underline transition hover:border-[#D4625A]/30 hover:bg-[#F6D9D6]/40"
        >
            <WishlistLinkIcon size={14} />
        </a>
    );
}

function WishlistExpandedDetails({ item }) {
    const description = item.description?.trim();

    if (!description) {
        return null;
    }

    return (
        <div className="mt-3 border-t border-[#F0E8E5] pt-3">
            <p className="mb-1 text-2xs font-semibold text-neutral-700">Why they want it?</p>
            <p className="whitespace-pre-wrap text-2xs leading-relaxed text-neutral-600">{description}</p>
        </div>
    );
}

export function WishlistCard({ item, onEdit, personName, href }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const titleRef = useRef(null);
    const notesRef = useRef(null);
    const priceLabel = item.price ? formatIdrDisplay(item.price) : '';
    const timeLabel = getWishlistTimeLabel(item);
    const description = item.description?.trim();
    const productUrl = item.url?.trim() || '';

    useEffect(() => {
        if (isExpanded) {
            return;
        }

        const titleOverflow = titleRef.current
            ? titleRef.current.scrollHeight > titleRef.current.clientHeight + 1
            : false;
        const notesOverflow = notesRef.current
            ? notesRef.current.scrollHeight > notesRef.current.clientHeight + 1
            : false;

        setCanExpand(
            titleOverflow || item.title.includes('\n') || Boolean(description) || notesOverflow
        );
    }, [description, isExpanded, item.title]);

    function handleToggleExpand(event) {
        event.stopPropagation();
        setIsExpanded((value) => !value);
    }

    const showExpandToggle = canExpand || isExpanded;

    const titleClassName = `text-sm font-semibold leading-snug text-neutral-900 ${
        isExpanded ? 'whitespace-pre-wrap wrap-break-word' : 'line-clamp-1'
    }`;

    const leftColumn = (
        <>
            <p ref={titleRef} className={titleClassName}>
                {item.title}
            </p>
            {priceLabel ? (
                <p className="mt-0.5 text-sm font-bold tracking-tight text-[#D4625A] tabular-nums">{priceLabel}</p>
            ) : null}
            {description && !isExpanded ? (
                <p ref={notesRef} className="mt-0.5 line-clamp-1 text-2xs text-neutral-500">
                    {description}
                </p>
            ) : null}
            {personName ? <p className="mt-1 truncate text-2xs font-medium text-[#D4625A]">{personName}</p> : null}
        </>
    );

    const cardClassName = `rounded-2xl px-3.5 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition ${
        isExpanded ? 'bg-[#FFFCFB]' : 'bg-white'
    } ${href ? 'hover:bg-[#FFFCFB]' : ''}`;

    return (
        <li className={cardClassName}>
            <div className="flex items-center gap-3">
                <WishlistThumbnail item={item} />

                <div className="min-w-0 flex-1">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
                        {href ? (
                            <Link
                                href={href}
                                className="col-start-1 row-start-1 row-span-2 min-w-0 self-center no-underline transition hover:opacity-90"
                            >
                                {leftColumn}
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => onEdit?.(item)}
                                className="col-start-1 row-start-1 row-span-2 min-w-0 self-center cursor-pointer text-left transition active:opacity-80"
                            >
                                {leftColumn}
                            </button>
                        )}

                        {timeLabel ? (
                            <p className="col-start-2 row-start-1 self-center shrink-0 text-right text-2xs whitespace-nowrap text-neutral-400">
                                {timeLabel}
                            </p>
                        ) : null}

                        <div className="col-start-2 row-start-2 flex shrink-0 items-center justify-end gap-1.5 self-center">
                            <WishlistCategoryChip category={item.category} />
                            {productUrl ? <WishlistLinkButton url={productUrl} /> : null}
                            {showExpandToggle ? (
                                <button
                                    type="button"
                                    onClick={handleToggleExpand}
                                    aria-label={isExpanded ? 'Collapse wishlist item' : 'Expand wishlist item'}
                                    aria-expanded={isExpanded}
                                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-[#FDEBEA] hover:text-[#D4625A]"
                                >
                                    <ChevronIcon expanded={isExpanded} />
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {isExpanded ? <WishlistExpandedDetails item={item} /> : null}
                </div>
            </div>
        </li>
    );
}
