// firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your Firebase web config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyA1uIhQCj9Au5Qw4C97xZAmlDs3KYW7EpM",
  authDomain: "mqtt-broker-47490.firebaseapp.com",
  projectId: "mqtt-broker-47490",
  storageBucket: "mqtt-broker-47490.firebasestorage.app",
  messagingSenderId: "393620645789",
  appId: "1:393620645789:web:278ccea62e15204edbb174",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { getToken, messaging, onMessage };
