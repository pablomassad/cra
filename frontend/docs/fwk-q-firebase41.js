import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getFirestore, onSnapshot, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, getDoc, setDoc, query, where, orderBy, writeBatch } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
// import { getMessaging, getToken, onMessage } from 'firebase/messaging'

import { google } from 'googleapis'
import { Plugins } from '@capacitor/core'
const { PushNotifications } = Plugins
// import { PushNotifications } from '@capacitor/push-notifications'

import { ENVIRONMENTS } from 'src/environments'
import { ui } from 'fwk-q-ui'
// import { FCM } from "@capacitor-community/fcm"
// import { Capacitor } from '@capacitor/core'

initializeApp(ENVIRONMENTS.firebase)
const db = getFirestore()
const sto = getStorage()
const auth = getAuth()
// const messaging = getMessaging(firebaseApp)
/// //////////////////////////////////////////////////////////////////////////////////////////////////////

const subscribePushForNotifications = async (topic, cb) => {
    console.log('Check Permissions for Pushing', topic)

    // try {
    //    getMessaging().subscribeToTopic(topic)
    //    //await FCM.subscribeTo({ topic })
    //    console.log(`subscribed to topic “${topic}”`)
    // } catch (error) {
    //    console.log('registration pushing error:', error)
    // }
}

// const subscribePushForNotifications = async (topic, cb) => {
//    console.log('Check Permissions for Pushing', topic)
//    try {
//        //const registration = await PushNotifications.requestPermission()
//        //if (!registration) {
//        //    console.log('No se pudo obtener permiso para recibir notificaciones')
//        //    return
//        //}
//        // Se guarda la clave de registro en el objeto `registration`
//        //this.registration = registration
//        // Se envía la solicitud de registro a FCM
//        const fcmToken = await PushNotifications.getFcmToken()
//        console.log(`Se ha recibido el token FCM: ${fcmToken}`)
//        // Se suscribe al topic deseado
//        await PushNotifications.subscribeToTopic(topic)
//    } catch (error) {
//        console.log('Error al intentar registrarse para recibir notificaciones:', error)
//    }
// }
const unsubscribePushAllTopics = async (topic) => {
    // FCM.unsubscribeFrom({ topic })
    // .then(r => console.log(`unsubscribed from topic “${topic}”`))
    // .catch(err => console.log(err))

    // const pushNotifications = PushNotifications.getInstance()
    // pushNotifications.unsubscribeFromAllTopics().then(() => {
    //     console.log('Unsubscribe all topics OK')
    // }).catch((error) => {
    //     console.log('Error unsubscribing topics:', error)
    // })
}
const sendPushToFCM = async (n) => {
    // const pushNotifications = PushNotifications.getInstance()
    // const notification = {
    //    title: n.title,
    //    body: n.body,
    //    icon: n.img,
    //    // Otros parámetros opcionales
    // }
    // pushNotifications.send(notification).then(() => {
    //    console.log('MSG sent OK')
    // })
}
// const sendFcmMessage = async (o) => { // topic, title, body
//     const msg = JSON.stringify(buildMessage(o))
//     const accessToken = await getAccessToken()
//     const response = await fetch(fcmConfig.HOST + fcmConfig.PATH, {
//         method: 'POST',
//         body: msg,
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer ' + o.tokenKey // Reemplaza con tu token de autenticación
//         }
//     })
//     console.log('sendFcmMessage response: ', response)
//     return response
// }
// const sendMessage = async (dest, titulo, descripcion) => {
//     const message = {
//         title: titulo,
//         body: descripcion,
//         data: {},
//         topic: dest
//     }
//     try {
//         await getMessaging().send(message)
//         return true
//     } catch (error) {
//         return false
//     }
// }
/// //////////////////////////////////////////////////////////////////////////////////////////////////////

const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
}
const logout = async () => {
    return auth.signOut()
}
const register = async (name, email, password) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName: name })
    return user.uid
}
const addQuote = (quote) => {
    if (!auth.currentUser) {
        return alert('Not Authorized')
    }
    return db.doc(`usersX/${auth.currentUser.id}`).set({ quote })
}
const isInitialized = async () => {
    return new Promise((resolve) => {
        auth.onAuthStateChanged(() => {
            resolve(true)
        })
    })
}
const getCurrentUser = async () => {
    return auth.currentUser
}
const getCurrentUserQuote = async () => {
    const quote = await db
        .doc(`usersX/${auth.currentUser.uid}`)
        .get()
    return quote.get('quote')
}
const getCollection = async (colName) => {
    const colRef = collection(db, colName)
    const colSnapshot = await getDocs(colRef)
    const result = colSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    return result
}
const getCollectionFlex = async (colName, ops) => {
    let q
    let operator = '=='
    if (ops.op) operator = ops.op
    if (ops.field && ops.sortField) {
        q = query(collection(db, colName), where(ops.field, operator, ops.val), orderBy(ops.field, 'asc'), orderBy(ops.sortField, ops.sortDir))
    }
    if (ops.field && !ops.sortField) {
        q = query(collection(db, colName), where(ops.field, operator, ops.val))
    }
    if (!ops.field && ops.sortField) {
        q = query(collection(db, colName), orderBy(ops.sortField, ops.sortDir))
    }
    if (!ops.field && !ops.sortField) {
        q = query(collection(db, colName))
    }
    const querySnapshot = await getDocs(q)
    const result = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    return result
}
const getCollectionRef = (colName) => {
    const colRef = collection(db, colName)
    return colRef
}
const getDocument = async (col, d) => {
    const docRef = doc(db, col, d)
    const sn = await getDoc(docRef)
    const result = sn.data()
    return result
}
const addDocument = async (col, d) => {
    const colRef = collection(db, col)
    const docRef = await addDoc(colRef, d)
    return docRef
}
const setDocument = async (col, d, id) => {
    let docRef
    if (id) {
        const docRef = doc(db, col, id)
        await setDoc(docRef, d, { merge: true }).then(() => {
            console.log('Document has been added successfully')
        }).catch(error => {
            console.log(error)
        })
    } else {
        const ref = collection(db, col)
        removeUndefinedFields(d)
        await addDoc(ref, d)
    }
    return true
}
const emptyCollection = async (col) => {
    ui.actions.showLoading()
    const colRef = collection(db, col)
    const colSnapshot = await getDocs(colRef)
    const documents = colSnapshot.docs
    ui.actions.hideLoading()

    ui.actions.showLoading({
        type: 'progressCounter',
        color: 'red',
        total: documents.length,
        value: 0
    })
    let i = 0
    for (const d of documents) {
        await deleteDocument(col, d.id)
        // await sleep(5)
        ui.actions.setLoaderOps({
            type: 'progressCounter',
            color: 'red',
            total: documents.length,
            value: i++
        })
    }
    ui.actions.hideLoading()
}
const deleteCollection = async (col, batchSize) => {
    const colRef = collection(db, col)
    const q = query(collection(db, col), orderBy('__name__'))
    console.log('query:', q)
    // const query = colRef.orderBy('__name__').limit(batchSize) // collectionRef.orderBy('__name__').limit(batchSize)

    return new Promise((resolve, reject) => {
        deleteQueryBatch(q, resolve).catch(reject)
    })
}
const deleteDocument = async (col, id) => {
    const docRef = doc(db, col, id)
    await deleteDoc(docRef)
}
const uploadFile = (dest, f) => {
    const storageRef = ref(sto, dest)
    const uploadTask = uploadBytesResumable(storageRef, f)
    return uploadTask
}
const batchInsert = async (col, data) => {
    const batch = writeBatch(db)
    console.log('data len: ', data.length)
    const filteredData = data.filter(x => !evalUndefinedFields(x)) //  !!x['Fecha inicio'])
    console.log('data filtered len: ', filteredData.length)

    ui.actions.showLoading({
        type: 'progressCounter',
        color: 'blue',
        total: filteredData.length,
        value: 0
    })
    let i = 1
    for (const d of filteredData) {
        const docRef = doc(db, col, new Date().getTime())
        ui.actions.setLoaderOps({
            type: 'progressCounter',
            color: 'blue',
            total: filteredData.length,
            value: i++
        })
        batch.set(docRef, d) // batch.set(docRef, d) // batch.create(docRef, d)
    }
    await batch.commit()
    ui.actions.hideLoading()
}
const fb = {
    db,
    sto,
    auth,
    login,
    logout,
    register,
    addQuote,
    onSnapshot,
    getDownloadURL,
    uploadFile,
    deleteObject,
    isInitialized,
    getCurrentUser,
    getCurrentUserQuote,
    getCollection,
    getCollectionRef,
    getCollectionFlex,
    getDocument,
    setDocument,
    addDocument,
    emptyCollection,
    deleteDocument,
    deleteCollection,
    batchInsert,
    unsubscribePushAllTopics,
    subscribePushForNotifications,
    sendPushToFCM
}
export default fb

function buildOverrideMessage () {
    const fcmMessage = buildMessage({ topic: 'myTopic', title: 'myTitle', body: 'myBody' })
    const apnsOverride = {
        payload: {
            aps: {
                badge: 1
            }
        },
        headers: {
            'apns-priority': '10'
        }
    }

    const androidOverride = {
        notification: {
            click_action: 'android.intent.action.MAIN'
        }
    }

    fcmMessage.message.android = androidOverride
    fcmMessage.message.apns = apnsOverride

    return fcmMessage
}
function buildMessage (o) {
    return {
        message: {
            topic: o.topic,
            notification: {
                title: o.title,
                body: o.body,
                image: o.img
            }
        }
    }
}
async function deleteQueryBatch (query, resolve) {
    const snapshot = await query.get()
    const batchSize = snapshot.size
    if (batchSize === 0) { // When there are no documents left, we are done
        resolve()
        return
    }
    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
    })
    await batch.commit()

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(query, resolve)
    })
}
function removeUndefinedFields (data) {
    for (const key in data) {
        if (data[key] === undefined) {
            delete data[key]
        }
    }
    return data
}
function evalUndefinedFields (doc) {
    let flag = false
    for (const key in doc) {
        if (doc[key] === undefined) { flag = true }
    }
    return flag
}
async function addPushListeners () {
    // await PushNotifications.addListener('registration', token => {
    //    console.info('Registration token: ', token.value)
    // })
    // await PushNotifications.addListener('registrationError', err => {
    //    console.error('Registration error: ', err.error)
    // })
    // await PushNotifications.addListener('pushNotificationReceived', notification => {
    //    console.log('Push notification received: ', notification)
    // })
    // await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
    //    console.log('Push notification action performed', notification.actionId, notification.inputValue)
    // })

}
async function subscribePushToTopic (topic) {
    // const pn = pushNotifications.getInstance()
    // const subscription = await pn.subscribeToTopic(topic)

    // console.log("Subscription ID:", subscription.subscriptionId)
    // console.log("Expiration Time:", subscription.expirationTime)
    // console.log("Topic:", subscription.topic)

}
// function getAccessToken() {
//     return new Promise((resolve, reject) => {
//         const jwtClient = new google.auth.JWT(
//             fcmConfig.key.client_email,
//             null,
//             fcmConfig.key.private_key,
//             fcmConfig.SCOPES,
//             null
//         )
//         jwtClient.authorize((err, tokens) => {
//             if (err) {
//                 reject(err)
//                 return
//             }
//             resolve(tokens.access_token)
//         })
//     })
// }
// async function getDeliveredNotifications() {
//     const notificationList = await PushNotifications.getDeliveredNotifications()
//     console.log('delivered notifications', notificationList)
// }
// async function subscribeToTopic(topic, authToken) {
//     try {
//         const result = await PushNotifications.register()
//         if (result && result.token) {
//             const response = await fetch(`https://iid.googleapis.com/iid/v1/${result.token}/rel/topics/${topic}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': 'key=' + authToken // Reemplaza con tu token de autenticación
//                 }
//             })

//             if (response.ok) {
//                 console.log('Suscripción exitosa al tema')
//                 return true
//             } else {
//                 console.error('Error al suscribirse al tema')
//                 return false
//             }
//         }
//     } catch (error) {
//         console.error('Error al registrar el dispositivo para notificaciones', error)
//         return false
//     }
// }
// async function getFCMToken(vapid) {
//     // CRA => 'BP6nPflTuZhSgdqiyDaPMLxYy3o2gvcMM_oUl1NFP - CkMIgnAiXfOKeOhrNbjhCUOKVNEosPR4U9j2t_NSLhjy4'
//     const token = await getToken(messaging, { vapidKey: vapid })
//     console.log('new token:', token)
//     return token
// }
// const fcmConfig = {}
// function initFCM(srvAcc) {
//     fcmConfig['key'] = srvAcc // ('../placeholders/service-account.json')
//     fcmConfig['HOST'] = 'fcm.googleapis.com'
//     fcmConfig['PATH'] = '/v1/projects/' + cfg.projectId + '/messages:send'
//     const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'
//     fcmConfig['SCOPES'] = [MESSAGING_SCOPE]
// }
async function sleep (tout) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, tout)
    })
}
