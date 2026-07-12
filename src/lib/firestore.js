import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Generic: get a single document
export async function getDocument(collectionName, docId) {
  const snapshot = await getDoc(doc(db, collectionName, docId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// Generic: set a document (create or overwrite)
export async function setDocument(collectionName, docId, data) {
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: Timestamp.now(),
    createdAt: data.createdAt || Timestamp.now(),
  });
}

// Generic: update a document
export async function updateDocument(collectionName, docId, data) {
  const ref = doc(db, collectionName, docId);
  await updateDoc(ref, { ...data, updatedAt: Timestamp.now() });
}

// Generic: delete a document
export async function deleteDocument(collectionName, docId) {
  await deleteDoc(doc(db, collectionName, docId));
}

// Generic: get all docs in a collection with optional filter
export async function getCollection(collectionName, conditions = []) {
  let q = collection(db, collectionName);
  if (conditions.length > 0) {
    q = query(q, ...conditions.map((c) => where(c.field, c.op, c.value)));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Real-time listener for a collection
export function subscribeToCollection(collectionName, callback, conditions = []) {
  let q = collection(db, collectionName);
  if (conditions.length > 0) {
    q = query(q, ...conditions.map((c) => where(c.field, c.op, c.value)));
  }
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
}

// Save user profile to Firestore
export async function saveUserProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const existing = await getDoc(userRef);
  if (!existing.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      role: "Operations Lead",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
}

// Get user profile from Firestore
export async function getUserProfile(uid) {
  return getDocument("users", uid);
}

// Update user profile in Firestore
export async function updateUserProfileData(uid, data) {
  return updateDocument("users", uid, data);
}
