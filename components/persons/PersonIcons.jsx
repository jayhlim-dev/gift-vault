export function CameraIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path
                d="M4 8.5h2.2l1.2-1.8a1 1 0 01.83-.45h6.94a1 1 0 01.83.45L17.8 8.5H20a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8a2 2 0 012-2z"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="13.5" r="3" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </svg>
    );
}

export function CalendarIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <rect x="4" y="5.5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M8 4v3.5M16 4v3.5M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

export function FriendsIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <circle cx="8.5" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M4.5 17.5c0-2.2 1.8-4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <circle cx="15.5" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M12 17.5c0-2.5 2-4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
    );
}

export function PersonIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M5 19c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
    );
}

export function HeartIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path
                d="M12 19s-7-4.35-7-9.5A4 4 0 0112 6.5a4 4 0 017 3c0 5.15-7 9.5-7 9.5z"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function HomeIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path
                d="M4 11l8-6 8 6M6 10v8a1 1 0 001 1h10a1 1 0 001-1v-8"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function BriefcaseIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <rect x="3.5" y="8" width="17" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M8.5 8V6.5a1.5 1.5 0 011.5-1.5h4a1.5 1.5 0 011.5 1.5V8" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
    );
}

export function DotsIcon({ size = 20 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <circle cx="6" cy="12" r="1.6" fill="currentColor" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
            <circle cx="18" cy="12" r="1.6" fill="currentColor" />
        </svg>
    );
}

export function PlusIcon({ size = 14 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}

export function NotebookIcon({ size = 44 }) {
    return (
        <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
            <rect x="9" y="7" width="27" height="35" rx="3" fill="#FDEBEA" stroke="currentColor" strokeWidth="1.4" className="text-rose-200" />
            <path d="M16 16h13M16 22h13M16 28h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-rose-300" />
            <path
                d="M29 32l6.5-6.5 3 3L32 35l-4 .8.8-4z"
                fill="white"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
                className="text-rose-400"
            />
        </svg>
    );
}
