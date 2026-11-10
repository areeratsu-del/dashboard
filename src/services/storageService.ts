import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, set, Database } from 'firebase/database';
import { SurveySubmission, FirebaseConfig } from '../types';
import { INITIAL_SAMPLE_SUBMISSIONS } from '../constants';

const STORAGE_KEY_SUBMISSIONS = 'training_survey_submissions_v1';
const STORAGE_KEY_CONFIG = 'training_survey_firebase_config_v1';
const STORAGE_KEY_DEVICE_SUBMITTED = 'training_survey_has_submitted_v1';

// BroadcastChannel for instant inter-tab realtime communication
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('training_survey_channel');
  }
} catch {
  // Ignore in environments without BroadcastChannel
}

let firebaseAppInstance: FirebaseApp | null = null;
let firebaseDbInstance: Database | null = null;

export function getSavedFirebaseConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.databaseURL && parsed.projectId) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse Firebase config', e);
  }
  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig | null): void {
  try {
    if (config && config.databaseURL) {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } else {
      localStorage.removeItem(STORAGE_KEY_CONFIG);
    }
    // Reset instance so it re-initializes
    firebaseAppInstance = null;
    firebaseDbInstance = null;
  } catch (e) {
    console.error('Failed to save Firebase config', e);
  }
}

function initFirebase(config: FirebaseConfig): Database | null {
  try {
    if (!firebaseAppInstance) {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        firebaseAppInstance = getApp();
      } else {
        firebaseAppInstance = initializeApp(config);
      }
    }
    if (!firebaseDbInstance && firebaseAppInstance) {
      firebaseDbInstance = getDatabase(firebaseAppInstance);
    }
    return firebaseDbInstance;
  } catch (e) {
    console.warn('Firebase init warning:', e);
    return null;
  }
}

export function getLocalSubmissions(): SurveySubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (!raw) {
      // Seed with initial sample submissions so dashboard looks informative
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(INITIAL_SAMPLE_SUBMISSIONS));
      return INITIAL_SAMPLE_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAMPLE_SUBMISSIONS;
  }
}

export function saveLocalSubmissions(submissions: SurveySubmission[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SUBMISSIONS_UPDATED', payload: submissions });
    }
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export function subscribeToSubmissions(
  callback: (submissions: SurveySubmission[]) => void,
  onSourceChange?: (source: 'firebase' | 'local') => void
): () => void {
  const config = getSavedFirebaseConfig();

  if (config && config.databaseURL) {
    try {
      const db = initFirebase(config);
      if (db) {
        if (onSourceChange) onSourceChange('firebase');
        const submissionsRef = ref(db, 'submissions');
        const unsubscribeFirebase = onValue(
          submissionsRef,
          (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const list: SurveySubmission[] = Object.keys(data).map((key) => ({
                id: key,
                ...data[key],
              }));
              // Sort descending by timestamp
              list.sort((a, b) => b.timestamp - a.timestamp);
              callback(list);
            } else {
              callback([]);
            }
          },
          (error) => {
            console.error('Firebase Realtime DB read error:', error);
            // Fallback to local
            if (onSourceChange) onSourceChange('local');
            callback(getLocalSubmissions());
          }
        );

        return () => {
          unsubscribeFirebase();
        };
      }
    } catch (e) {
      console.error('Error connecting to Firebase:', e);
    }
  }

  // Local & BroadcastChannel fallback
  if (onSourceChange) onSourceChange('local');
  callback(getLocalSubmissions());

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'SUBMISSIONS_UPDATED' && Array.isArray(event.data.payload)) {
      callback(event.data.payload);
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY_SUBMISSIONS && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        callback(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

export async function submitSurveyResponse(
  scores: { [questionId: string]: number },
  comment?: string
): Promise<SurveySubmission> {
  const newSubmission: SurveySubmission = {
    id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    scores,
    comment: comment?.trim() || undefined,
  };

  const config = getSavedFirebaseConfig();
  if (config && config.databaseURL) {
    try {
      const db = initFirebase(config);
      if (db) {
        const submissionsRef = ref(db, 'submissions');
        await push(submissionsRef, {
          timestamp: newSubmission.timestamp,
          scores: newSubmission.scores,
          comment: newSubmission.comment || '',
        });
        markDeviceAsSubmitted(newSubmission.id);
        return newSubmission;
      }
    } catch (e) {
      console.warn('Firebase submit failed, falling back to local storage:', e);
    }
  }

  // Fallback to local storage
  const current = getLocalSubmissions();
  const updated = [newSubmission, ...current];
  saveLocalSubmissions(updated);
  markDeviceAsSubmitted(newSubmission.id);
  return newSubmission;
}

export function isDeviceAlreadySubmitted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_DEVICE_SUBMITTED) !== null;
  } catch {
    return false;
  }
}

export function markDeviceAsSubmitted(submissionId: string): void {
  try {
    localStorage.setItem(
      STORAGE_KEY_DEVICE_SUBMITTED,
      JSON.stringify({
        submittedAt: Date.now(),
        submissionId,
      })
    );
  } catch (e) {
    console.error('Failed to mark device as submitted', e);
  }
}

export function resetDeviceSubmissionStatus(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_DEVICE_SUBMITTED);
  } catch (e) {
    console.error('Failed to reset device submission status', e);
  }
}

export async function clearAllSubmissions(): Promise<void> {
  const config = getSavedFirebaseConfig();
  if (config && config.databaseURL) {
    try {
      const db = initFirebase(config);
      if (db) {
        const submissionsRef = ref(db, 'submissions');
        await set(submissionsRef, null);
      }
    } catch (e) {
      console.error('Failed to clear Firebase submissions:', e);
    }
  }
  saveLocalSubmissions([]);
}

export function seedDemoData(): void {
  saveLocalSubmissions(INITIAL_SAMPLE_SUBMISSIONS);
}
