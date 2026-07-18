import '../styles/globals.css';
import { AppShell } from '../components/AppShell';

const siteDescription =
    'Save gift ideas, notes, wishlists, and reminders for the people you care about — so you never forget what matters.';

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
        template: '%s | Memnto',
        default: 'Memnto'
    },
    description: siteDescription,
    applicationName: 'Memnto',
    openGraph: {
        title: 'Memnto',
        description: siteDescription,
        siteName: 'Memnto',
        type: 'website',
        images: [
            {
                url: '/memnto-logo.png',
                alt: 'Memnto'
            }
        ]
    },
    twitter: {
        card: 'summary',
        title: 'Memnto',
        description: siteDescription,
        images: ['/memnto-logo.png']
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
