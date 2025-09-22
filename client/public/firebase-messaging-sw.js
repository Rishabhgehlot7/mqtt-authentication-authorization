// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// "Default" Firebase configuration (prevents errors)
const firebaseConfig = {
    apiKey: "AIzaSyA1uIhQCj9Au5Qw4C97xZAmlDs3KYW7EpM",
    authDomain: "mqtt-broker-47490.firebaseapp.com",
    projectId: "mqtt-broker-47490",
    storageBucket: "mqtt-broker-47490.firebasestorage.app",
    messagingSenderId: "393620645789",
    appId: "1:393620645789:web:278ccea62e15204edbb174",
};


firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});