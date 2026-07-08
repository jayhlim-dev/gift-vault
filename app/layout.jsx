import '../styles/globals.css';
import { AppShell } from '../components/AppShell';

export const metadata = {
    title: {
        template: '%s | Netlify',
        default: 'Netlify Starter'
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
            </head>
            <body className="antialiased text-white">
                {/* <div className="flex flex-col min-h-screen px-6 bg-noise sm:px-12"> */}
                <div className="flex flex-col min-h-screen px-6 bg-[#FDF8F7] sm:px-12">
                    <AppShell>{children}</AppShell>
                </div>
            </body>
        </html>
    );
}
