'use client';

import { getApps, initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';

/*
Client-side Firebase config. These values are meant to be public (they identify the
project, not grant access) - see https://firebase.google.com/docs/projects/api-keys.
Actual data access is controlled server-side via the Admin SDK + ID token verification.
*/
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

function getFirebaseClientApp() {
    const existingApp = getApps()[0];
    if (existingApp) {
        return existingApp;
    }
    return initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
    return getAuth(getFirebaseClientApp());
}

export const googleAuthProvider = new GoogleAuthProvider();
