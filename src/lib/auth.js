import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Email/Password signup
export async function signUpWithEmail(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential.user;
}

// Email/Password login
export async function signInWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// Google sign-in
export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

// GitHub sign-in
export async function signInWithGithub() {
  const credential = await signInWithPopup(auth, githubProvider);
  return credential.user;
}

// Logout
export async function logOut() {
  await signOut(auth);
}

// Update user profile
export async function updateUserProfile(displayName, photoURL) {
  const updates = {};
  if (displayName !== undefined) updates.displayName = displayName;
  if (photoURL !== undefined) updates.photoURL = photoURL;
  await updateProfile(auth.currentUser, updates);
}

// Password reset
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// Auth state listener
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
