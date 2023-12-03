/* eslint-disable no-undef */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js')

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    databaseURL: 'https:/f/pp-cra-35f70.web.app',
    apiKey: 'AIzaSyDfY-1dbX9wnrHwdqM8Yhrk4rr_OhLnBn4',
    authDomain: 'pp-cra-35f70.firebaseapp.com',
    projectId: 'pp-cra-35f70',
    storageBucket: 'pp-cra-35f70.appspot.com',
    messagingSenderId: '727597273699',
    appId: '1:727597273699:web:07c6cf711fa5eac8bd9e56',
    measurementId: 'G-HBRB9J07JW'
})

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload)
    // Customize  notification here
    const notificationTitle = payload.notification.title
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/images/cra.png'
    }
    self.registration.showNotification(notificationTitle, notificationOptions)
})
