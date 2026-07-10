import { randomUUID } from 'node:crypto';
import { getUserFromRequest } from 'lib/auth/verify-request';
import { getWritableStorageBucket, usesCustomGcsBucket } from 'lib/firebase-admin';
import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/*
Accepts a multipart/form-data upload (field name "file"), stores it in Google Cloud Storage
via the Admin SDK, and returns a public URL. Auth is verified server-side before writing.
Set GCS_BUCKET_NAME in .env to use your own GCS bucket (no Firebase Storage setup required).
*/
export async function POST(request) {
    const user = await getUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.has(file.type)) {
            return NextResponse.json({ error: 'Please upload a JPG, PNG, WEBP or GIF image' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'Image must be smaller than 5MB' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const extension = file.type.split('/')[1] || 'jpg';
        const filePath = `avatars/${user.uid}/${Date.now()}-${randomUUID()}.${extension}`;

        const bucket = await getWritableStorageBucket();
        const storageFile = bucket.file(filePath);
        const isGcs = usesCustomGcsBucket();

        if (isGcs) {
            await storageFile.save(buffer, {
                contentType: file.type
            });

            // Signed URL works even when the bucket is private ("Not public").
            const [url] = await storageFile.getSignedUrl({
                action: 'read',
                expires: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000
            });

            return NextResponse.json({ url }, { status: 201 });
        }

        const downloadToken = randomUUID();

        await storageFile.save(buffer, {
            contentType: file.type,
            metadata: {
                metadata: { firebaseStorageDownloadTokens: downloadToken }
            }
        });

        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;

        return NextResponse.json({ url }, { status: 201 });
    } catch (error) {
        console.error('[api/upload/avatar] Failed to upload image:', error);

        const message = error.message || 'Unknown error';
        const isPermissionDenied = message.includes('Permission') || message.includes('denied') || error.code === 403;
        const isMissingBucket =
            message.includes('not found') ||
            message.includes('does not exist') ||
            message.includes('No storage bucket');

        return NextResponse.json(
            {
                error: isPermissionDenied
                    ? 'Service account cannot access the storage bucket'
                    : isMissingBucket
                      ? 'Storage bucket is not set up yet'
                      : 'Failed to upload image',
                message: isPermissionDenied
                    ? `Grant Storage Object Admin on bucket "${process.env.GCS_BUCKET_NAME}" to ${process.env.FIREBASE_CLIENT_EMAIL}`
                    : message
            },
            { status: isPermissionDenied ? 403 : isMissingBucket ? 503 : 500 }
        );
    }
}
