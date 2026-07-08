/*
One-off dev utility to seed sample data into Firestore so the app UI has something
real to render. Run with: node scripts/seed-firestore.js --uid=<your-firebase-uid>

Since data is now scoped per signed-in user (filtered by `userID`), pass your real
Firebase Auth uid so the seeded persons/notes/wishlists show up after you log in.
Find your uid in Firestore console under the `users` collection after your first
Google sign-in (the document ID is your uid).

Reads Firebase Admin credentials from .env / .env.local (same variables as the app).
*/
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

function loadEnvFile(filePath) {
    if (!existsSync(filePath)) {
        return;
    }

    const content = readFileSync(filePath, 'utf-8');
    for (const rawLine of content.split('\n')) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) {
            continue;
        }

        const eqIndex = line.indexOf('=');
        if (eqIndex === -1) {
            continue;
        }

        const key = line.slice(0, eqIndex).trim();
        let value = line.slice(eqIndex + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }

        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

loadEnvFile(path.join(rootDir, '.env'));
loadEnvFile(path.join(rootDir, '.env.local'));

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase Admin credentials. Set them in .env or .env.local first.');
    process.exit(1);
}

const uidArg = process.argv.find((arg) => arg.startsWith('--uid='));
const userID = uidArg ? uidArg.slice('--uid='.length) : '';

if (!userID) {
    console.warn(
        'No --uid=<your-firebase-uid> passed. Seeding with an empty userID, which means this data ' +
            'will NOT show up for any logged-in user (data is now filtered by userID). ' +
            'Re-run as: node scripts/seed-firestore.js --uid=<your-uid>'
    );
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore(app);

async function seed() {
    const personsRef = db.collection('persons');

    // Reuses the existing (currently blank) document so we don't leave orphan test data around.
    const jessicaId = '4Vbo80EBLVriQEZlc9V8';
    await personsRef.doc(jessicaId).set({
        name: 'Jessica',
        relationship: 'friend',
        birthday: '1998-07-20',
        avatarURL: 'https://randomuser.me/api/portraits/women/65.jpg',
        notes: '',
        userID,
        createdAt: new Date().toISOString()
    });

    const sabrinaRef = await personsRef.add({
        name: 'Sabrina',
        relationship: 'partner',
        birthday: '1997-07-23',
        avatarURL: 'https://randomuser.me/api/portraits/women/44.jpg',
        notes: '',
        userID,
        createdAt: new Date().toISOString()
    });

    const dimasRef = await personsRef.add({
        name: 'Dimas',
        relationship: 'family',
        birthday: '1995-07-26',
        avatarURL: 'https://randomuser.me/api/portraits/men/32.jpg',
        notes: '',
        userID,
        createdAt: new Date().toISOString()
    });

    console.log('Seeded persons:', jessicaId, sabrinaRef.id, dimasRef.id);

    const notesRef = db.collection('notes');
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();

    await notesRef.doc('gNWXnMENnwBK77JiAut3').set({
        text: 'Once mentioned wanting to visit Japan during spring \uD83C\uDF38',
        category: 'travel',
        createdAt: twoDaysAgo,
        personId: sabrinaRef.id,
        userID
    });

    await notesRef.add({
        text: 'Loves matcha lattes and cozy cafes on weekends',
        category: 'preference',
        createdAt: fiveHoursAgo,
        personId: jessicaId,
        userID
    });

    console.log('Seeded notes');

    const wishlistsRef = db.collection('wishlists');

    await wishlistsRef.doc('fYinuPOjvdtL1ytcLBiw').set({
        title: 'Nintendo Switch OLED',
        description: 'White version, for weekend gaming nights',
        url: 'https://www.nintendo.com',
        price: '349.99',
        imageURL: '',
        status: 'pending',
        userID
    });

    await wishlistsRef.add({
        title: 'Leather Travel Journal',
        description: 'For jotting down notes while traveling',
        url: '',
        price: '25.00',
        imageURL: '',
        status: 'pending',
        userID
    });

    console.log('Seeded wishlists');
}

seed()
    .then(() => {
        console.log('Seed complete.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exit(1);
    });
