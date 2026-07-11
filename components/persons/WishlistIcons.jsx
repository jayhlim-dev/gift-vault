export const WISHLIST_ICON_OPTIONS = [
    { id: 'gift', label: 'Gift' },
    { id: 'bag', label: 'Bag' },
    { id: 'laptop', label: 'Laptop' },
    { id: 'book', label: 'Book' },
    { id: 'watch', label: 'Watch' },
    { id: 'headphones', label: 'Headphones' },
    { id: 'home', label: 'Home' },
    { id: 'present', label: 'Present' },
    { id: 'dining', label: 'Dining' },
    { id: 'party', label: 'Party' }
];

function GiftBoxIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <rect x="4" y="9" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M4 9h16M12 9v11" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 9S9.5 4.5 7 5.5 6 9 12 9zM12 9s2.5-4.5 5-3.5S17 9 12 9z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
        </svg>
    );
}

function BagIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path d="M7 9V7a5 5 0 0110 0v2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M6 9h12l-1 12H7L6 9z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
        </svg>
    );
}

function LaptopIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <rect x="5" y="6" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

function BookIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path d="M6 5h9a2 2 0 012 2v13H8a2 2 0 00-2 2V5z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
            <path d="M6 5v15" stroke="currentColor" strokeWidth="1.6" />
        </svg>
    );
}

function WatchIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M9 3v4M15 3v4M9 17v4M15 17v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

function HeadphonesIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path d="M5 14v-2a7 7 0 0114 0v2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <rect x="4" y="13" width="3" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <rect x="17" y="13" width="3" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </svg>
    );
}

function HomeItemIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path d="M4 11l8-6 8 6M6 10v8a1 1 0 001 1h10a1 1 0 001-1v-8" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
        </svg>
    );
}

function PresentIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <rect x="5" y="10" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M12 10V20M5 14h14" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 10c-2-2.5-4-2.5-4 0s2 2 4 0 4-2.5 4 0-2-2.5-4 0z" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </svg>
    );
}

function DiningIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path d="M8 4v8M6 4v5M10 4v5M8 12v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M16 4v16M18 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

function PartyIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path d="M6 18l3-10 4 2 5-8" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
        </svg>
    );
}

const ICON_MAP = {
    gift: GiftBoxIcon,
    bag: BagIcon,
    laptop: LaptopIcon,
    book: BookIcon,
    watch: WatchIcon,
    headphones: HeadphonesIcon,
    home: HomeItemIcon,
    present: PresentIcon,
    dining: DiningIcon,
    party: PartyIcon
};

export function WishlistIcon({ id = 'gift', size = 20, className = '' }) {
    const Icon = ICON_MAP[id] || GiftBoxIcon;
    return <Icon size={size} className={className} />;
}

function LinkIcon({ size = 18 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path d="M10 14a3.5 3.5 0 004.95 0l2.12-2.12a3.5 3.5 0 00-4.95-4.95L11 8" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M14 10a3.5 3.5 0 00-4.95 0L6.93 12.12a3.5 3.5 0 004.95 4.95L13 16" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
    );
}

export function WishlistLinkIcon({ size = 18 }) {
    return <LinkIcon size={size} />;
}

export function WishlistHeartIcon({ size = 16 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path
                d="M12 20.5c-.3 0-.6-.1-.8-.3l-6-5.7A4.9 4.9 0 014 7.4 5.2 5.2 0 019.1 6c1.2 0 2.3.5 2.9 1.3A4 4 0 0114.9 6 5.2 5.2 0 0120 7.4c1.3 2 1 4.8-1.2 7l-6 5.8c-.2.2-.5.3-.8.3z"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
            />
        </svg>
    );
}
