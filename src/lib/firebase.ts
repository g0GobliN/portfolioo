import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const blogConfig = {
  apiKey: import.meta.env.VITE_BLOG_API_KEY,
  authDomain: import.meta.env.VITE_BLOG_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_BLOG_PROJECT_ID,
  storageBucket: import.meta.env.VITE_BLOG_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_BLOG_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_BLOG_APP_ID,
};

const doodleConfig = {
  apiKey: import.meta.env.VITE_DOODLE_API_KEY,
  authDomain: import.meta.env.VITE_DOODLE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_DOODLE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_DOODLE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_DOODLE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_DOODLE_APP_ID,
};

const blogApp = getApps().find((a) => a.name === "blog") ?? initializeApp(blogConfig, "blog");
const doodleApp = getApps().find((a) => a.name === "doodle") ?? initializeApp(doodleConfig, "doodle");

export const blogDb = getFirestore(blogApp);
export const doodleDb = getFirestore(doodleApp);
export const doodleStorage = getStorage(doodleApp);
export const blogAuth = getAuth(blogApp);
