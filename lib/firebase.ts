import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js"
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDE8QyvWJRli5BbfH5sRBaYi_mbrKXvPqQ",
  authDomain: "bothoster-34a78.firebaseapp.com",
  projectId: "bothoster-34a78",
  storageBucket: "bothoster-34a78.firebasestorage.app",
  messagingSenderId: "1007247225119",
  appId: "1:1007247225119:web:2c940dbe51ac12fe20002a",
  measurementId: "G-6EHJ7P79WQ",
}

let auth: any = null
let app: any = null

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
  }
  return auth
}

export const signUpWithEmail = async (email: string, password: string) => {
  const auth = initializeFirebase()
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code))
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  const auth = initializeFirebase()
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code))
  }
}

export const logoutUser = async () => {
  const auth = initializeFirebase()
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Logout error:", error)
  }
}

export const getCurrentUser = (callback: (user: User | null) => void) => {
  const auth = initializeFirebase()
  return onAuthStateChanged(auth, (user) => {
    callback(user)
  })
}

const getErrorMessage = (code: string): string => {
  const errorMessages: { [key: string]: string } = {
    "auth/email-already-in-use": "Email already in use. Please try logging in.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "User not found. Please sign up first.",
    "auth/wrong-password": "Invalid password. Please try again.",
    "auth/invalid-email": "Invalid email address.",
  }
  return errorMessages[code] || "An error occurred. Please try again."
}
