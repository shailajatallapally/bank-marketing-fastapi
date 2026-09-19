/**
 * Cloud Firestore Service for Bank Marketing ML Platform
 *
 * Implements user-isolated profile and prediction persistence adhering to:
 * - users/{uid}
 * - users/{uid}/predictions/{predictionId}
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { FirestorePredictionDoc, UserProfile } from '../types';

/**
 * Ensures or updates the user profile document in Firestore:
 * users/{uid}
 */
export async function syncUserProfile(
  uid: string,
  profile: {
    displayName?: string | null;
    email: string;
    role?: string;
    organization?: string;
  }
): Promise<void> {
  if (!db) {
    console.warn('Firestore is not initialized. Skipping profile sync.');
    return;
  }

  const userDocRef = doc(db, 'users', uid);
  const path = `users/${uid}`;

  try {
    const existingSnap = await getDoc(userDocRef);

    if (!existingSnap.exists()) {
      await setDoc(userDocRef, {
        uid,
        displayName: profile.displayName || '',
        email: profile.email,
        createdAt: serverTimestamp(),
        role: profile.role || 'Quantitative Analyst',
        organization: profile.organization || 'Bank Marketing Analytics',
      });
    } else {
      const updates: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };
      if (profile.displayName !== undefined) {
        updates.displayName = profile.displayName || '';
      }
      if (profile.role !== undefined) {
        updates.role = profile.role;
      }
      if (profile.organization !== undefined) {
        updates.organization = profile.organization;
      }
      await setDoc(userDocRef, updates, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieves the user profile document from Firestore:
 * users/{uid}
 */
export async function fetchUserProfile(uid: string): Promise<Record<string, any> | null> {
  if (!db) return null;

  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Saves a verified prediction or forecast result to Firestore:
 * users/{uid}/predictions/{predictionId}
 *
 * Saves exact payload and exact API response without fabrication.
 */
export async function savePredictionToFirestore(
  uid: string,
  data: {
    modelId: 'xgboost-term-deposit' | 'var2-campaign-forecast';
    modelName: string;
    input: Record<string, any>;
    output: Record<string, any>;
    status?: 'success' | 'error';
    executionTimeMs?: number;
    endpoint?: string;
  }
): Promise<string> {
  if (!db) {
    console.warn('Firestore is not initialized. Prediction record stored in local state only.');
    return `local_${Date.now()}`;
  }

  const predictionsColRef = collection(db, 'users', uid, 'predictions');
  const newPredictionDocRef = doc(predictionsColRef);
  const path = `users/${uid}/predictions/${newPredictionDocRef.id}`;

  const recordPayload = {
    uid,
    modelId: data.modelId,
    modelName: data.modelName,
    input: data.input,
    output: data.output,
    timestamp: serverTimestamp(),
    status: data.status || 'success',
    executionTimeMs: data.executionTimeMs ?? 0,
    endpoint: data.endpoint ?? '',
  };

  try {
    await setDoc(newPredictionDocRef, recordPayload);
    return newPredictionDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Converts a Firestore timestamp or date string to a JavaScript Date object
 */
export function parseFirestoreTimestamp(ts: any): Date {
  if (!ts) return new Date();
  if (ts instanceof Timestamp) return ts.toDate();
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (typeof ts === 'string' || typeof ts === 'number') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date();
}

/**
 * Formats a timestamp into a user-friendly local date/time string
 */
export function formatFriendlyDateTime(ts: any): string {
  const date = parseFirestoreTimestamp(ts);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Subscribes to real-time updates for the authenticated user's prediction history:
 * users/{uid}/predictions
 */
export function subscribeToUserPredictions(
  uid: string,
  onData: (records: FirestorePredictionDoc[]) => void,
  onError: (error: Error) => void
): () => void {
  if (!db) {
    onData([]);
    return () => {};
  }

  const colRef = collection(db, 'users', uid, 'predictions');
  const path = `users/${uid}/predictions`;
  const q = query(colRef, orderBy('timestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: FirestorePredictionDoc[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        records.push({
          id: docSnap.id,
          uid: d.uid || uid,
          modelId: d.modelId || '',
          modelName: d.modelName || '',
          input: d.input || {},
          output: d.output || {},
          timestamp: d.timestamp,
          status: d.status || 'success',
          executionTimeMs: d.executionTimeMs,
          endpoint: d.endpoint,
        });
      });
      onData(records);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err: any) {
        onError(err);
      }
    }
  );
}

/**
 * Fetches all prediction records for the user one time
 */
export async function fetchUserPredictions(uid: string): Promise<FirestorePredictionDoc[]> {
  if (!db) return [];

  const path = `users/${uid}/predictions`;
  try {
    const colRef = collection(db, 'users', uid, 'predictions');
    const q = query(colRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const records: FirestorePredictionDoc[] = [];
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      records.push({
        id: docSnap.id,
        uid: d.uid || uid,
        modelId: d.modelId || '',
        modelName: d.modelName || '',
        input: d.input || {},
        output: d.output || {},
        timestamp: d.timestamp,
        status: d.status || 'success',
        executionTimeMs: d.executionTimeMs,
        endpoint: d.endpoint,
      });
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Deletes a single prediction record from users/{uid}/predictions/{predictionId}
 */
export async function deleteUserPrediction(uid: string, predictionId: string): Promise<void> {
  if (!db) return;

  const path = `users/${uid}/predictions/${predictionId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'predictions', predictionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Deletes all prediction records for the authenticated user
 */
export async function clearAllUserPredictions(uid: string): Promise<void> {
  if (!db) return;

  const path = `users/${uid}/predictions`;
  try {
    const colRef = collection(db, 'users', uid, 'predictions');
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
