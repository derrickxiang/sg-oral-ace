import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: boolean | string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection on boot as required by firebase-integration-rpc skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export type SubscriptionPlanTier = 'trial' | 'monthly_pro' | 'annual_pro' | 'school_pass';

export interface CloudUserProfile {
  uid: string;
  displayName: string;
  planTier: SubscriptionPlanTier;
  trialSessionsRemaining: number;
  weeklyStreak: number;
  totalSessionsCompleted: number;
  email?: string;
  activePlanName?: string;
  schoolName?: string;
  gradeLevel?: string;
  authMethod?: 'google' | 'email' | 'school_code';
}

// Sanitize strings to match firebase-blueprint.json maxLength constraints
function sanitizeString(val: string | undefined | null, maxLen: number, fallback = 'Student'): string {
  const trimmed = (val || '').trim();
  const safe = trimmed.length > 0 ? trimmed : fallback;
  return safe.slice(0, maxLen);
}

export async function ensureUserProfileInFirestore(
  user: User,
  extraMeta?: { displayName?: string; schoolName?: string; gradeLevel?: string; authMethod?: 'google' | 'email' | 'school_code' }
): Promise<CloudUserProfile> {
  const userPath = `users/${user.uid}`;
  const privatePath = `users/${user.uid}/private/info`;
  const userRef = doc(db, 'users', user.uid);
  const privateRef = doc(db, 'users', user.uid, 'private', 'info');

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      let email = user.email || '';
      let activePlanName = 'Student Free Trial';
      try {
        const privSnap = await getDoc(privateRef);
        if (privSnap.exists()) {
          email = privSnap.data().email || email;
          activePlanName = privSnap.data().activePlanName || activePlanName;
        }
      } catch {
        // Ignore private info read error if not yet created
      }
      return {
        uid: data.uid,
        displayName: extraMeta?.displayName || data.displayName,
        planTier: data.planTier as SubscriptionPlanTier,
        trialSessionsRemaining: Number(data.trialSessionsRemaining ?? 3),
        weeklyStreak: Number(data.weeklyStreak ?? 3),
        totalSessionsCompleted: Number(data.totalSessionsCompleted ?? 0),
        email,
        activePlanName,
        schoolName: extraMeta?.schoolName,
        gradeLevel: extraMeta?.gradeLevel,
        authMethod: extraMeta?.authMethod || 'google',
      };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  // Create initial profile
  const displayName = sanitizeString(
    extraMeta?.displayName || user.displayName || user.email?.split('@')[0],
    100,
    'O-Level Student'
  );
  const initialProfile = {
    uid: user.uid,
    displayName,
    planTier: 'trial' as SubscriptionPlanTier,
    trialSessionsRemaining: 3,
    weeklyStreak: 3,
    totalSessionsCompleted: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, initialProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, userPath);
  }

  const email = sanitizeString(user.email || 'student@oralace.sg', 254, 'student@oralace.sg');
  try {
    await setDoc(privateRef, {
      uid: user.uid,
      email,
      activePlanName: 'Student Free Trial (3 Sessions)',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, privatePath);
  }

  return {
    uid: user.uid,
    displayName,
    planTier: 'trial',
    trialSessionsRemaining: 3,
    weeklyStreak: 3,
    totalSessionsCompleted: 0,
    email,
    activePlanName: 'Student Free Trial (3 Sessions)',
    schoolName: extraMeta?.schoolName,
    gradeLevel: extraMeta?.gradeLevel,
    authMethod: extraMeta?.authMethod || 'google',
  };
}

export async function updateSubscriptionTierInFirestore(
  uid: string,
  planTier: SubscriptionPlanTier,
  activePlanName: string,
  trialSessionsRemaining: number
): Promise<void> {
  if (!auth.currentUser) {
    // Local/School Code session fallback
    return;
  }
  const userPath = `users/${uid}`;
  const privatePath = `users/${uid}/private/info`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      planTier,
      trialSessionsRemaining: Math.max(0, Math.min(100, Math.floor(trialSessionsRemaining))),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }

  if (auth.currentUser?.email) {
    try {
      await updateDoc(doc(db, 'users', uid, 'private', 'info'), {
        activePlanName: sanitizeString(activePlanName, 100, 'Pro Pass'),
        email: sanitizeString(auth.currentUser.email, 254, 'student@oralace.sg'),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, privatePath);
    }
  }
}

export async function savePracticeRecordToFirestore(
  uid: string,
  practiceId: string,
  payload: {
    topicId: string;
    topicTitle: string;
    totalScore: number;
    band: string;
    initialTranscript: string;
    followUpQuestion: string;
    followUpTranscript: string;
  },
  updatedQuota: {
    trialSessionsRemaining: number;
    weeklyStreak: number;
    totalSessionsCompleted: number;
  }
): Promise<void> {
  if (!auth.currentUser) return;
  const safePracticeId = practiceId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  const practicePath = `users/${uid}/practices/${safePracticeId}`;
  const userPath = `users/${uid}`;

  try {
    await setDoc(doc(db, 'users', uid, 'practices', safePracticeId), {
      userId: uid,
      topicId: payload.topicId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100),
      topicTitle: sanitizeString(payload.topicTitle, 200, 'Oral Topic'),
      totalScore: Math.max(0, Math.min(50, Math.round(payload.totalScore))),
      band: sanitizeString(payload.band, 64, 'Band 2'),
      initialTranscript: sanitizeString(payload.initialTranscript, 5000, 'Recorded response'),
      followUpQuestion: (payload.followUpQuestion || '').slice(0, 2000),
      followUpTranscript: (payload.followUpTranscript || '').slice(0, 5000),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, practicePath);
  }

  try {
    await updateDoc(doc(db, 'users', uid), {
      trialSessionsRemaining: Math.max(0, Math.min(100, Math.floor(updatedQuota.trialSessionsRemaining))),
      weeklyStreak: Math.max(0, Math.min(10000, Math.floor(updatedQuota.weeklyStreak))),
      totalSessionsCompleted: Math.max(0, Math.min(100000, Math.floor(updatedQuota.totalSessionsCompleted))),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export async function fetchUserPracticesFromFirestore(uid: string) {
  if (!auth.currentUser) return [];
  const listPath = `users/${uid}/practices`;
  try {
    const q = query(collection(db, 'users', uid, 'practices'), where('userId', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, listPath);
  }
}

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
};
export type { User };
