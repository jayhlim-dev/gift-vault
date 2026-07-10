'use client';

export function LoadingOverlay({ message = 'Loading…' }) {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="fixed inset-0 z-100 flex items-center justify-center bg-white/55 px-6 backdrop-blur-[3px]"
        >
            <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl bg-white px-8 py-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
                <div className="relative flex h-14 w-14 items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-4 border-[#FDEBEA]" />
                    <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#D4625A]" />
                </div>
                <p className="text-sm font-semibold text-neutral-800">{message}</p>
            </div>
        </div>
    );
}
