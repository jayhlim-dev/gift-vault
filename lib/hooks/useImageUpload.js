'use client';

import { useAuth } from 'lib/auth/AuthContext';
import { useCallback, useState } from 'react';

/*
Uploads a File to /api/upload/avatar (multipart/form-data) with the current user's ID
token attached, and returns the resulting public download URL.
*/
export function useImageUpload() {
    const { getIdToken } = useAuth();
    const [isUploading, setIsUploading] = useState(false);

    const uploadImage = useCallback(
        async (file) => {
            setIsUploading(true);
            try {
                const idToken = await getIdToken();
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload/avatar', {
                    method: 'POST',
                    headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
                    body: formData
                });

                const json = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(json.error || `Upload failed (${response.status})`);
                }

                return json.url;
            } finally {
                setIsUploading(false);
            }
        },
        [getIdToken]
    );

    return { uploadImage, isUploading };
}
