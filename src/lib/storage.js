import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

// Upload a file and return the download URL
export async function uploadFile(path, file) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// Upload a profile photo
export async function uploadProfilePhoto(uid, file) {
  const ext = file.name.split(".").pop();
  const path = `profiles/${uid}.${ext}`;
  return uploadFile(path, file);
}

// Upload a vehicle image
export async function uploadVehicleImage(vehicleId, file) {
  const ext = file.name.split(".").pop();
  const path = `vehicles/${vehicleId}.${ext}`;
  return uploadFile(path, file);
}

// Get download URL for an existing file
export async function getFileURL(path) {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

// Delete a file
export async function deleteFile(path) {
  const storageRef = ref(storage, path);
  return deleteObject(storageRef);
}
