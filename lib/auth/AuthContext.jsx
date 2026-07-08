'use client';

import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth, googleAuthProvider } from 'lib/firebase-client';

const AuthContext = createContext(null);

async function syncUserToFirestore(idToken) {
    try {
        await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: { Authorization: `Bearer ${idToken}` }
        });
    } catch (error) {
        console.error('[auth] Failed to sync user profile:', error);
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        const auth = getFirebaseAuth();
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsAuthLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const auth = getFirebaseAuth();
        const result = await signInWithPopup(auth, googleAuthProvider);
        const idToken = await result.user.getIdToken();
        await syncUserToFirestore(idToken);
        return result.user;
    }, []);

    const signOutUser = useCallback(async () => {
        const auth = getFirebaseAuth();
        await firebaseSignOut(auth);
    }, []);

    const getIdToken = useCallback(async () => {
        const auth = getFirebaseAuth();
        if (!auth.currentUser) {
            return null;
        }
        return auth.currentUser.getIdToken();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthLoading, signInWithGoogle, signOutUser, getIdToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
