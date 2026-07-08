export function Footer() {
    const navItems = [
        { label: 'Home', isActive: true, icon: 'home' },
        { label: 'People', isActive: false, icon: 'people' },
        { label: 'Reminders', isActive: false, icon: 'alarm' },
        { label: 'Wishlist', isActive: false, icon: 'heart' },
        { label: 'Profile', isActive: false, icon: 'profile' }
    ];

    function renderIcon(icon, isActive) {
        const iconClass = `block shrink-0 ${isActive ? 'text-rose-400' : 'text-neutral-400'}`;
        const iconSize = '26';
        if (icon === 'home') {
            return (
                <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} aria-hidden="true" className={iconClass}>
                    <path
                        fill="currentColor"
                        d="M12 3.5L3.75 10.1a1 1 0 00-.37.78V20a1 1 0 001 1h5.5a1 1 0 001-1v-4.5h2.25V20a1 1 0 001 1h5.5a1 1 0 001-1v-9.12a1 1 0 00-.37-.78L12 3.5z"
                    />
                </svg>
            );
        }

        if (icon === 'people') {
            return (
                <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} aria-hidden="true" className={iconClass}>
                    <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
                    <path
                        d="M3.8 18.2a5.3 5.3 0 0110.4 0"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <circle cx="17.2" cy="9.2" r="2.1" stroke="currentColor" strokeWidth="1.6" fill="none" />
                    <path
                        d="M14.9 16.9a3.9 3.9 0 013.9-3.4 3.8 3.8 0 013.1 1.6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>
            );
        }

        if (icon === 'alarm') {
            return (
                <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} aria-hidden="true" className={iconClass}>
                    <circle cx="12" cy="13" r="6.6" stroke="currentColor" strokeWidth="1.8" fill="none" />
                    <path
                        d="M12 10.2v3.1l2.1 1.4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d="M5.7 4.8l-2 2.1M18.3 4.8l2 2.1"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>
            );
        }

        if (icon === 'heart') {
            return (
                <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} aria-hidden="true" className={iconClass}>
                    <path
                        d="M12 20.5c-.3 0-.6-.1-.8-.3l-6-5.7A4.9 4.9 0 014 7.4 5.2 5.2 0 019.1 6c1.2 0 2.3.5 2.9 1.3A4 4 0 0114.9 6 5.2 5.2 0 0120 7.4c1.3 2 1 4.8-1.2 7l-6 5.8c-.2.2-.5.3-.8.3z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        fill="none"
                    />
                </svg>
            );
        }

        return (
            <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} aria-hidden="true" className={iconClass}>
                <circle cx="12" cy="8.2" r="3.3" stroke="currentColor" strokeWidth="1.8" fill="none" />
                <path
                    d="M5 19.5a7 7 0 0114 0"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    return (
        <footer className="pointer-events-none fixed inset-x-0 bottom-5 z-50 px-6">
            <nav
                aria-label="Bottom navigation"
                className="pointer-events-auto w-full rounded-3xl bg-white px-3 py-2 shadow-[0_-3px_16px_rgba(30,30,30,0.08)] border border-[#F1E8E3]/50"
            >
                <ul className="m-0 grid list-none grid-cols-5 p-0 gap-1">
                    {navItems.map((item) => (
                        <li key={item.label} className="w-full items-center justify-center flex">
                            <button
                                type="button"
                                className={`flex w-10 flex-col items-center justify-center gap-1 rounded-xl border py-1.5 ${
                                    item.isActive
                                        ? 'border-[#F6D9D6]/10 bg-[#FDEBEA]'
                                        : 'border-transparent bg-transparent'
                                }`}
                                aria-current={item.isActive ? 'page' : undefined}
                            >
                                {renderIcon(item.icon, item.isActive)}
                                {/* <span className={`text-xs font-semibold ${item.isActive ? 'text-rose-400' : 'text-neutral-500'}`}>
                                    {item.label}
                                </span> */}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </footer>
    );
}
