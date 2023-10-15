import { db, messaging } from './firebase'
import { doc, setDoc } from 'firebase/firestore'
import { getToken, onMessage, getMessaging } from 'firebase/messaging'
import { main } from 'fwk-q-main'

export const FCM_TOKEN_COLLECTION = 'fcmTokens'
export const FCM_TOKEN_KEY = 'fcmToken' // key for storing FCM token in Firestore
const VAPID_KEY = 'BP6nPflTuZhSgdqiyDaPMLxYy3o2gvcMM_oUl1NFP-CkMIgnAiXfOKeOhrNbjhCUOKVNEosPR4U9j2t_NSLhjy4'

async function requestNotificationsPermissions (uid) {
    console.log('Requesting notifications permission...')
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
        console.log('Notification permission granted.')
        await saveMessagingDeviceToken(uid)
    } else {
        console.log('Unable to get permission to notify.')
    }
}

export async function saveMessagingDeviceToken (uid) {
    if (main.state.isMobile) {
        console.log('save msg mobile token')
        try {
            const fcmToken = await getToken(getMessaging(), { vapidKey: VAPID_KEY })
            if (fcmToken) {
                console.log('Got FCM mobile token:', fcmToken)
                const tokenRef = doc(db, FCM_TOKEN_COLLECTION, uid)
                await setDoc(tokenRef, { fcmToken })

                onMessage(getMessaging(), (message) => {
                    console.log('New foreground notification from Firebase Messaging!', message.notification)
                    const c = new Notification(message.notification.title, { body: message.notification.body })
                })
            } else {
                requestNotificationsPermissions(uid)
            }
        } catch (error) {
            console.error('Unable to get messaging token.', error)
        }
    } else {
        console.log('save msg web token')
        try {
            const msg = await messaging()
            const fcmToken = await getToken(msg, { vapidKey: VAPID_KEY })
            if (fcmToken) {
                console.log('Got FCM device token:', fcmToken)
                const tokenRef = doc(db, FCM_TOKEN_COLLECTION, uid)
                await setDoc(tokenRef, { fcmToken })

                onMessage(msg, (message) => {
                    console.log('New foreground notification from Firebase Messaging!', message.notification)
                    const c = new Notification(message.notification.title, { body: message.notification.body })
                })
            } else {
                requestNotificationsPermissions(uid)
            }
        } catch (error) {
            console.error('Unable to get messaging token.', error)
        }
    }
}
