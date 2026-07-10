'use client';

import { LoadingOverlay } from 'components/LoadingOverlay';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('Loading…');
    const pendingCountRef = useRef(0);

    const showLoading = useCallback((nextMessage = 'Loading…') => {
        pendingCountRef.current += 1;
        setMessage(nextMessage);
        setIsVisible(true);
    }, []);

    const hideLoading = useCallback(() => {
        pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);

        if (pendingCountRef.current === 0) {
            setIsVisible(false);
        }
    }, []);

    const runWithLoading = useCallback(
        async (action, options = {}) => {
            const { message: actionMessage = 'Loading…' } = options;
            showLoading(actionMessage);

            try {
                return await action();
            } finally {
                hideLoading();
            }
        },
        [hideLoading, showLoading]
    );

    const value = useMemo(
        () => ({
            isLoading: isVisible,
            message,
            showLoading,
            hideLoading,
            runWithLoading
        }),
        [hideLoading, isVisible, message, runWithLoading, showLoading]
    );

    return (
        <LoadingContext.Provider value={value}>
            {children}
            {isVisible ? <LoadingOverlay message={message} /> : null}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);

    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }

    return context;
}
