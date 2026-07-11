'use client';

export function ConfirmDialog({
    open,
    message = 'Are you sure you want to delete this data?',
    confirmLabel = 'Yes',
    cancelLabel = 'No',
    onConfirm,
    onCancel,
    isLoading = false
}) {
    if (!open) {
        return null;
    }

    return (
        <>
            <button
                type="button"
                aria-label="Close dialog"
                onClick={isLoading ? undefined : onCancel}
                className="fixed inset-0 z-[70] bg-black/40"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-message"
                className="pointer-events-none fixed inset-x-0 bottom-28 z-[71] flex justify-center px-5"
            >
                <div className="pointer-events-auto w-full max-w-sm rounded-3xl bg-white px-5 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.14)]">
                    <p id="confirm-dialog-message" className="text-center text-sm leading-relaxed text-neutral-700">
                        {message}
                    </p>
                    <div className="mt-5 flex gap-3">
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 rounded-full bg-[#E37377] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d9686d] disabled:opacity-60"
                        >
                            {isLoading ? 'Deleting…' : confirmLabel}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 rounded-full border border-[#F0E8E5] bg-white px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-[#FAF8F7] disabled:opacity-60"
                        >
                            {cancelLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
