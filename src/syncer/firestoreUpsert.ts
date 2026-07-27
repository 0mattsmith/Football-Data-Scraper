import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { FootballerProfile } from '../types/footballer';

/**
 * Batch upserts footballer profiles into Firebase Firestore ('footballers' collection).
 * Supports both live credentials and dry-run mode if credentials are not yet configured.
 */
export async function upsertToFirestore(profiles: FootballerProfile[]): Promise<{ count: number; mode: 'live' | 'dry-run' }> {
  let isLive = false;

  try {
    if (!admin.apps.length) {
      // Check for service account key file
      const keyPath = path.resolve(__dirname, '../../serviceAccountKey.json');
      if (fs.existsSync(keyPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        isLive = true;
      } else {
        console.log(`[Firestore] No serviceAccountKey.json found. Running in DRY-RUN mode.`);
      }
    } else {
      isLive = true;
    }
  } catch (err: any) {
    console.warn(`[Firestore] Initialization fallback to dry-run mode: ${err.message}`);
    isLive = false;
  }

  if (!isLive) {
    console.log(`[Firestore Dry-Run] Would upsert ${profiles.length} profiles to the 'footballers' collection.`);
    return { count: profiles.length, mode: 'dry-run' };
  }

  const db = admin.firestore();
  const collectionRef = db.collection('footballers');
  let count = 0;

  // Batch writes in chunks of 500 (Firestore limit per batch)
  const chunkSize = 500;
  for (let i = 0; i < profiles.length; i += chunkSize) {
    const chunk = profiles.slice(i, i + chunkSize);
    const batch = db.batch();

    for (const p of chunk) {
      const docId = p.id || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const docRef = collectionRef.doc(docId);
      batch.set(docRef, {
        ...p,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    await batch.commit();
    count += chunk.length;
    console.log(`[Firestore] Upserted batch of ${chunk.length} players (${count}/${profiles.length})`);
  }

  return { count, mode: 'live' };
}
