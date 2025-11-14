'use client';

import { doc, setDoc, serverTimestamp, type Firestore, type User } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Creates a user document in Firestore if one doesn't already exist.
 * This is useful for initializing user data upon first sign-in.
 * This is a non-blocking operation.
 * @param firestore The Firestore instance.
 * @param user The Firebase Auth user object.
 */
export const createUserDocument = (firestore: Firestore, user: User) => {
  const userDocRef = doc(firestore, 'users', user.uid);
  const userData = { 
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    createdAt: serverTimestamp(), // Record when the user doc was created
  };
  
  // Use setDoc with { merge: true } to create the document if it doesn't exist,
  // or merge the fields if it does. This prevents overwriting existing data.
  // We don't await this. We chain a .catch for error handling.
  setDoc(userDocRef, userData, { merge: true })
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'write', // Using 'write' as it covers create and update from merge:true
          requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
};
