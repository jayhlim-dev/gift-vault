import Link from 'next/link';

const toneStyles = {
    pink: {
        avatar: 'from-rose-200 to-pink-100 text-rose-700',
        badge: 'text-rose-400',
        icon: '❤'
    },
    amber: {
        avatar: 'from-amber-200 to-yellow-100 text-amber-700',
        badge: 'text-amber-400',
        icon: '★'
    },
    blue: {
        avatar: 'from-sky-200 to-blue-100 text-blue-700',
        badge: 'text-blue-400',
        icon: '●'
    }
};

export function ProductCard({ label, initial, avatarSrc, tone = 'pink', isAdd = false, href, className = '' }) {
    const Wrapper = href ? Link : 'article';
    const wrapperProps = href
        ? { href, className: `flex w-full max-w-[76px] flex-col items-center gap-1.5 no-underline ${className}` }
        : { className: `flex w-full max-w-[76px] flex-col items-center gap-1.5 ${className}` };

    if (isAdd) {
        return (
            <Wrapper {...wrapperProps}>
                {href ? (
                    <span
                        className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FDEBEA] text-3xl leading-none text-rose-300 transition-colors hover:bg-rose-100"
                        aria-label={label}
                    >
                        +
                    </span>
                ) : (
                    <button
                        type="button"
                        className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FDEBEA] text-3xl leading-none text-rose-300 transition-colors hover:bg-rose-100"
                        aria-label={label}
                    >
                        +
                    </button>
                )}
                <p className="text-sm font-semibold text-neutral-700">{label}</p>
            </Wrapper>
        );
    }

    const toneStyle = toneStyles[tone] || toneStyles.pink;

    return (
        <Wrapper {...wrapperProps}>
            <div className="relative">
                {avatarSrc ? (
                    <img src={avatarSrc} alt={`${label} avatar`} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                    <div
                        className={`flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br text-3xl font-bold ${toneStyle.avatar}`}
                        aria-label={`${label} avatar`}
                    >
                        {initial}
                    </div>
                )}
                <span aria-hidden="true" className={`absolute -bottom-0.5 -right-0.5 text-base leading-none ${toneStyle.badge}`}>
                    {toneStyle.icon}
                </span>
            </div>
            <p className="text-sm font-semibold text-neutral-800">{label}</p>
        </Wrapper>
    );
}
