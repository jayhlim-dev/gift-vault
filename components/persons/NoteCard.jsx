'use client';

import { NotePinnedChip, NoteTagChip } from 'components/persons/NoteTagChip';
import {
    GiftIdeasIcon,
    NoteFoodIcon,
    NoteHobbyIcon,
    NoteRestaurantIcon,
    NoteRoutineIcon,
    NoteSkincareIcon,
    NotesTabIcon
} from 'components/persons/PersonIcons';
import { formatRelativeTime } from 'lib/gift-vault-utils';
import { isStructuredHobbyNote, noteHasHobbyLinks } from 'lib/hobby-note-utils';
import { DEFAULT_NOTE_TAG, getNoteTagLabel } from 'lib/note-tags';
import {
    formatUrlForDisplay,
    getNoteDisplayBody,
    getNoteDisplayTitle,
    isStructuredRestaurantNote,
    noteHasRestaurantLinks
} from 'lib/restaurant-note-utils';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const NOTE_CATEGORY_META = {
    'food-drinks': {
        title: 'Food & Drinks',
        icon: NoteFoodIcon,
        iconClass: 'text-[#4A7FA5]'
    },
    restaurant: {
        title: 'Restaurant',
        icon: NoteRestaurantIcon,
        iconClass: 'text-[#4A7FA5]'
    },
    'gift-ideas': {
        title: 'Gift Ideas',
        icon: GiftIdeasIcon,
        iconClass: 'text-[#D4625A]'
    },
    hobbies: {
        title: 'Hobbies',
        icon: NoteHobbyIcon,
        iconClass: 'text-[#D4625A]'
    },
    routine: {
        title: 'Routine',
        icon: NoteRoutineIcon,
        iconClass: 'text-[#4A7FA5]'
    },
    other: {
        title: 'Other',
        icon: NotesTabIcon,
        iconClass: 'text-neutral-500'
    },
    skincare: {
        title: 'Skincare',
        icon: NoteSkincareIcon,
        iconClass: 'text-[#D4625A]'
    },
    allergy: {
        title: 'Allergy & Diet',
        icon: NoteFoodIcon,
        iconClass: 'text-[#4A7FA5]'
    },
    size: {
        title: 'Size',
        icon: NotesTabIcon,
        iconClass: 'text-[#4A7FA5]'
    },
    favorites: {
        title: 'Favorites',
        icon: NotesTabIcon,
        iconClass: 'text-[#D4625A]'
    }
};

const DEFAULT_NOTE_META = {
    title: 'Note',
    icon: NotesTabIcon,
    iconClass: 'text-[#D4625A]'
};

export function getNoteCategory(note) {
    return note.category || DEFAULT_NOTE_TAG;
}

function getNoteMeta(category) {
    if (!category) {
        return DEFAULT_NOTE_META;
    }

    if (NOTE_CATEGORY_META[category]) {
        return NOTE_CATEGORY_META[category];
    }

    const label = getNoteTagLabel(category);

    return {
        title: label,
        icon: NotesTabIcon,
        iconClass: 'text-[#D4625A]'
    };
}

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

function isNotePinned(note) {
    return note?.isPinned === true || note?.isPinned === 'true' || note?.isPinned === 1;
}

function getNoteTimeLabel(note) {
    return formatRelativeTime(note.createdAt) || '';
}

function NoteDetailLine({ label, value, linkable = false, clampLine = false }) {
    const trimmed = value?.trim();
    if (!trimmed) {
        return null;
    }

    const isUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://');
    const displayValue = linkable && isUrl ? formatUrlForDisplay(trimmed) : trimmed;
    const valueClassName = clampLine ? 'min-w-0 truncate' : 'min-w-0 break-all leading-relaxed';

    return (
        <div className="grid grid-cols-[4.75rem_minmax(0,1fr)] items-start gap-x-2 text-2xs">
            <span className="pt-px font-semibold text-neutral-700">{label}</span>
            {linkable && isUrl ? (
                <a
                    href={trimmed}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={trimmed}
                    className={`${valueClassName} block font-medium text-[#D4625A] no-underline`}
                    onClick={(event) => event.stopPropagation()}
                >
                    {displayValue}
                </a>
            ) : (
                <span className={`${valueClassName} text-neutral-600`}>{displayValue}</span>
            )}
        </div>
    );
}

function RestaurantNoteDetails({ note }) {
    if (!isStructuredRestaurantNote(note)) {
        return null;
    }

    const hasNotes = Boolean(note.text?.trim());

    return (
        <div className="mt-3 flex flex-col gap-2 border-t border-[#F0E8E5] pt-3">
            <NoteDetailLine label="Location" value={note.location} linkable clampLine />
            <NoteDetailLine label="Menu" value={note.menuUrl} linkable clampLine />
            <NoteDetailLine label="Instagram" value={note.instagramUrl} linkable clampLine />
            {hasNotes ? (
                <div className="mt-1 border-t border-[#F0E8E5] pt-2">
                    <NoteDetailLine label="Notes" value={note.text} />
                </div>
            ) : null}
        </div>
    );
}

function HobbyNoteDetails({ note }) {
    if (!isStructuredHobbyNote(note)) {
        return null;
    }

    const hasNotes = Boolean(note.text?.trim());

    return (
        <div className="mt-3 flex flex-col gap-2 border-t border-[#F0E8E5] pt-3">
            <NoteDetailLine label="Where" value={note.destination} />
            <NoteDetailLine label="Instagram" value={note.instagramUrl} linkable clampLine />
            {hasNotes ? (
                <div className="mt-1 border-t border-[#F0E8E5] pt-2">
                    <NoteDetailLine label="Notes" value={note.text} />
                </div>
            ) : null}
        </div>
    );
}

export function NoteCard({ note, onEdit, href, personName, className = '' }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const titleRef = useRef(null);
    const previewRef = useRef(null);
    const category = getNoteCategory(note);
    const meta = getNoteMeta(category);
    const Icon = meta.icon;
    const timeLabel = getNoteTimeLabel(note);
    const pinned = isNotePinned(note);
    const displayTitle = getNoteDisplayTitle(note);
    const displayPreview = getNoteDisplayBody(note);
    const isStructuredRestaurant = isStructuredRestaurantNote(note);
    const isStructuredHobby = isStructuredHobbyNote(note);
    const hasStructuredDetails =
        (isStructuredRestaurant && noteHasRestaurantLinks(note)) || (isStructuredHobby && noteHasHobbyLinks(note));

    useEffect(() => {
        if (isExpanded) {
            return;
        }

        const titleOverflow = titleRef.current ? titleRef.current.scrollWidth > titleRef.current.clientWidth : false;
        const previewOverflow = previewRef.current
            ? previewRef.current.scrollWidth > previewRef.current.clientWidth
            : false;
        const hasHiddenStructuredNotes =
            (isStructuredRestaurant || isStructuredHobby) &&
            Boolean(note.text?.trim()) &&
            note.text.trim() !== displayPreview;

        setCanExpand(
            Boolean(displayPreview) ||
                titleOverflow ||
                previewOverflow ||
                hasStructuredDetails ||
                hasHiddenStructuredNotes
        );
    }, [
        displayPreview,
        displayTitle,
        isExpanded,
        isStructuredHobby,
        isStructuredRestaurant,
        hasStructuredDetails,
        note.text
    ]);

    function handleToggleExpand(event) {
        event.stopPropagation();
        setIsExpanded((value) => !value);
    }

    const showExpandToggle = canExpand || isExpanded;

    const body = (
        <>
            <p
                ref={titleRef}
                className={`text-sm font-semibold text-neutral-800 ${
                    isExpanded ? 'whitespace-pre-wrap wrap-break-word leading-relaxed' : 'truncate'
                }`}
            >
                {displayTitle}
            </p>
            {displayPreview ? (
                <p
                    ref={previewRef}
                    className={`mt-0.5 text-2xs text-neutral-500 ${
                        isExpanded ? 'whitespace-pre-wrap wrap-break-word leading-relaxed' : 'truncate'
                    }`}
                >
                    {displayPreview}
                </p>
            ) : null}
            {personName ? <p className="mt-1 truncate text-2xs font-medium text-[#D4625A]">{personName}</p> : null}
            <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
                <NoteTagChip label={meta.title} />
                {pinned ? <NotePinnedChip /> : null}
                {timeLabel ? <span className="text-2xs text-neutral-500">{timeLabel}</span> : null}
            </div>
        </>
    );

    return (
        <li
            className={`rounded-2xl px-4 py-3 text-left shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition ${
                isExpanded ? 'bg-[#FFFCFB]' : 'bg-white'
            } ${href ? 'hover:bg-[#FFFCFB]' : ''} ${className}`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FDEBEA] ${meta.iconClass}`}
                >
                    <Icon size={20} />
                </div>

                {href ? (
                    <Link href={href} className="min-w-0 flex-1 no-underline transition hover:opacity-80">
                        {body}
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={() => onEdit?.(note)}
                        className="min-w-0 flex-1 cursor-pointer text-left transition hover:opacity-80"
                    >
                        {body}
                    </button>
                )}

                {showExpandToggle ? (
                    <button
                        type="button"
                        onClick={handleToggleExpand}
                        aria-label={isExpanded ? 'Collapse note' : 'Expand note'}
                        aria-expanded={isExpanded}
                        className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full text-neutral-400 transition hover:bg-[#FDEBEA] hover:text-[#D4625A]"
                    >
                        <ChevronIcon expanded={isExpanded} size={20} />
                    </button>
                ) : null}
            </div>
            {isExpanded && isStructuredRestaurant ? <RestaurantNoteDetails note={note} /> : null}
            {isExpanded && isStructuredHobby ? <HobbyNoteDetails note={note} /> : null}
        </li>
    );
}
