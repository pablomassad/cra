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
    apiKey: 'AIzaSyAFDptydb7gENL28UOfRCd2Uygbb3bYzRc',
    authDomain: 'pp-cra.firebaseapp.com',
    projectId: 'pp-cra',
    databaseURL: 'https://pp-cra.web.app',
    storageBucket: 'pp-cra.appspot.com',
    messagingSenderId: '497129562754',
    appId: '1:497129562754:web:425442b84841d9ef1aca9b',
    measurementId: 'G-XRK7SG9T0C'
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
