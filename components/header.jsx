import Image from 'next/image';
import Link from 'next/link';
import GFLogo from 'public/gift-vault-secondary-logo.png';
import NotificationIcon from 'public/images/notification.png';

export function Header() {
    return (
        <nav className="flex items-center justify-between gap-3 pb-6 pt-8">
            <Link href="/">
                <Image src={GFLogo} alt="Gift Vault logo" className="h-auto w-28 object-contain " />
            </Link>

            <div className="flex items-center gap-2">
                <Link href="/">
                    <Image src={NotificationIcon} alt="Notifications" className="h-auto w-9 object-contain" />
                </Link>
                <Link
                    href="/"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDEBEA] no-underline text-rose-400 font-bold text-lg pb-0.5"
                >
                    +
                </Link>
            </div>
        </nav>
    );
}
