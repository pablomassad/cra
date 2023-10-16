import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'
import { getStorage } from 'firebase/storage'

export const firebaseConfig = {
    apiKey: 'AIzaSyAFDptydb7gENL28UOfRCd2Uygbb3bYzRc',
    authDomain: 'pp-cra.firebaseapp.com',
    projectId: 'pp-cra',
    storageBucket: 'pp-cra.appspot.com',
    messagingSenderId: '497129562754',
    appId: '1:497129562754:web:425442b84841d9ef1aca9b',
    measurementId: 'G-XRK7SG9T0C'
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const messaging = async () => await isSupported() && getMessaging(app)
export const storage = getStorage(app)
