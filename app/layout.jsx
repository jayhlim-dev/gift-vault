import '../styles/globals.css';
import { AppShell } from '../components/AppShell';

const siteDescription =
    'Save gift ideas, notes, wishlists, and reminders for the people you care about — so you never forget what matters.';

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
        template: '%s | Gift Vault',
        default: 'Gift Vault'
    },
    description: siteDescription,
    applicationName: 'Gift Vault',
    openGraph: {
        title: 'Gift Vault',
        description: siteDescription,
        siteName: 'Gift Vault',
        type: 'website',
        images: [
            {
                url: '/gift-vault-secondary-logo.png',
                alt: 'Gift Vault'
            }
        ]
    },
    twitter: {
        card: 'summary',
        title: 'Gift Vault',
        description: siteDescription,
        images: ['/gift-vault-secondary-logo.png']
    },
    icons: {
        icon: '/favicon.svg'
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased text-white">
                {/* <div className="flex flex-col min-h-screen px-6 bg-noise sm:px-12"> */}
                <div className="flex flex-col min-h-screen px-6 bg-[#FDF8F7] sm:px-12">
                    <AppShell>{children}</AppShell>
                </div>
            </body>
        </html>
    );
}
